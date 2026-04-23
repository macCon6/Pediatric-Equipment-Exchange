CREATE POLICY "Allow authenticated users to upload equipment images"
ON storage.objects
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH check (bucket_id = 'equipment-images');

CREATE OR REPLACE FUNCTION _has_permission(
    p_distribution_id uuid,
    p_user_id uuid,
    p_role text,
    p_action text
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE

v_reserved_by uuid;
    
BEGIN
    -- Check who reserved if action is cancelling/updating a reservation
    IF p_action IN ('cancel_reservation', 'update_waiver_fields') THEN
        SELECT reserved_by INTO v_reserved_by
        FROM distributions
        WHERE id = p_distribution_id;
    END IF;

    CASE p_action
    
        WHEN 'reserve_item' THEN
            IF NOT (p_role = 'admin' OR p_role = 'physical_therapist') THEN 
                RAISE EXCEPTION 'Only admin and PT can reserve equipment'
                USING ERRCODE = '42501';  -- http 403 Permission denied error
            END IF;
            
        WHEN 'cancel_reservation' THEN
            IF NOT (p_role = 'admin' OR (p_role = 'physical_therapist' AND p_user_id = v_reserved_by)) THEN 
                RAISE EXCEPTION 'Only admin or PT who reserved can cancel this reservation'
                USING ERRCODE = '42501';
            END IF;
    
        WHEN 'update_waiver_fields' THEN 
            IF NOT (p_role = 'admin' OR (p_role = 'physical_therapist' AND p_user_id = v_reserved_by)) THEN 
                RAISE EXCEPTION 'Only admin or PT who reserved can mark waiver as signed'
                USING ERRCODE = '42501';
            END IF;

        WHEN 'return_item' THEN
            IF NOT (p_role = 'admin' OR p_role = 'volunteer') THEN 
                RAISE EXCEPTION 'Only admin and volunteer can return equipment'
                USING ERRCODE = '42501';
            END IF;

        WHEN 'allocate_item' THEN  
            IF NOT (p_role = 'admin' OR p_role = 'volunteer') THEN 
                RAISE EXCEPTION 'Only admin and volunteer can allocate equipment'
                USING ERRCODE = '42501';
            END IF;

        ELSE 
            RAISE EXCEPTION 'Invalid action'
            USING ERRCODE = 'P0001';

    END CASE;
END;
$$;

-- Only allow this function to be called from another function
REVOKE EXECUTE ON FUNCTION _has_permission FROM anon, authenticated;

CREATE OR REPLACE FUNCTION update_status(
    p_distribution_id uuid,
    p_equipment_id uuid,
    p_target_status text,
    p_user_id uuid,
    p_role text,
    p_reservation_data jsonb DEFAULT NULL,
    p_template_id uuid DEFAULT NULL,
    p_waiver_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$

DECLARE

v_current_status text;
v_reserved_by uuid;
v_distribution distributions%ROWTYPE; -- So the relevant distribution row only needs to be fetched once
    
BEGIN

    IF p_distribution_id IS NOT NULL THEN 
        -- Check distribution exists, fetch its row
        SELECT * INTO v_distribution
        FROM distributions
        WHERE id = p_distribution_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION
            'Distribution % does not exist', p_distribution_id
            USING ERRCODE = 'P0002'; -- http 404 not found
        END IF;

        -- Check distribution equipment_id field matches this equipment id
        IF v_distribution.equipment_id <> p_equipment_id THEN
            RAISE EXCEPTION 'Distribution % does not belong to equipment % (actual equipment: %)',
            v_distribution.id, p_equipment_id, v_distribution.equipment_id
            USING ERRCODE = 'P0001'; -- http 400 bad request error
        END IF;

    END IF;

    -- Grab current status from equipment table and lock it for this update
    SELECT status INTO v_current_status
    FROM equipment
    WHERE id = p_equipment_id
    FOR UPDATE;

    -- IN PROCESSING -> AVAILABLE (anyone)
    IF v_current_status = 'In Processing' THEN 

        IF p_target_status = 'Available' THEN -- Just change status
            UPDATE equipment
            SET status = 'Available'
            WHERE id = p_equipment_id;

        ELSE 
            RAISE EXCEPTION 'Cannot go from In Processing to %', p_target_status
            USING ERRCODE = 'P0001'; -- http 400 bad request error
        END IF;


    -- AVAILABLE -> IN PROCESSING (anyone)
    -- AVAILABLE -> RESERVED NEEDS SIGNATURE (pt and admin only)
    ELSIF v_current_status = 'Available' THEN 

        IF p_target_status = 'In Processing' THEN -- Just change status
            UPDATE equipment
            SET status = 'In Processing'
            WHERE id = p_equipment_id;

        ELSIF p_target_status = 'Reserved - Needs Signature' THEN 
        -- Reserve the item
            PERFORM _has_permission(v_distribution.id, p_user_id, p_role, 'reserve_item');

            -- Only gets here if the _has_permission didn't raise an exception
            PERFORM _reserve_item(p_equipment_id, p_user_id, p_reservation_data);

        ELSE 
            RAISE EXCEPTION 'Cannot go from Available to %', p_target_status
            USING ERRCODE = 'P0001';
        END IF;
    

    -- RESERVED NEEDS SIGNATURE -> AVAILABLE (admin or pt who reserved)
    -- RESERVED NEEDS SIGNATURE -> RESERVED READY FOR PICKUP (admin or pt who reserved)
    ELSIF v_current_status = 'Reserved - Needs Signature' THEN
        
        IF p_target_status = 'Available' THEN 
        -- Return the item (cancel reservation)
            PERFORM _has_permission(v_distribution.id, p_user_id, p_role, 'cancel_reservation');
            PERFORM _return_item(v_distribution.id, p_equipment_id, p_target_status, p_user_id);
        
        ELSIF p_target_status = 'Reserved - Ready for Pickup' THEN 
        -- Mark waiver as signed
            PERFORM _has_permission(v_distribution.id, p_user_id, p_role, 'update_waiver_fields');
            PERFORM _waiver_mark_ready(v_distribution.id, p_equipment_id, p_template_id, p_waiver_url, p_user_id);

        ELSE 
            RAISE EXCEPTION 'Cannot go from Reserved - Needs Signature to %', p_target_status
            USING ERRCODE = 'P0001';
        END IF;
    

    -- RESERVED READY FOR PICKUP -> AVAILABLE (admin & pt who reserved only)
    -- RESERVED READY FOR PICKUP -> ALLOCATED (admin & volunteer only)
    ELSIF v_current_status = 'Reserved - Ready for Pickup' THEN 
        
        IF p_target_status = 'Available' THEN 
        -- Return the item (cancel reservation)
            PERFORM _has_permission(v_distribution.id, p_user_id, p_role, 'cancel_reservation');
            PERFORM _return_item(p_distribution_id, p_equipment_id, p_target_status, p_user_id);
        
        ELSIF p_target_status = 'Allocated' THEN 
        -- Allocate the item 
            PERFORM _has_permission(v_distribution.id, p_user_id, p_role, 'allocate_item');
            PERFORM _allocate_item(v_distribution.id, p_equipment_id, p_user_id);

        ELSE 
            RAISE EXCEPTION 'Cannot go from Reserved - Ready for Pickup to %', p_target_status
            USING ERRCODE = 'P0001';
        END IF;
    

    -- ALLOCATED -> AVAILABLE (admin & volunteer only)
    -- ALLOCATED -> IN PROCESSING (admin & volunteer only)
    ELSIF v_current_status = 'Allocated' THEN 

        IF (p_target_status IN ('Available', 'In Processing')) THEN
        -- Return the item 
            PERFORM _has_permission(v_distribution.id, p_user_id, p_role, 'return_item');
            PERFORM _return_item(v_distribution.id, p_equipment_id, p_user_id);

        ELSE 
            RAISE EXCEPTION 'Cannot go from Allocated to %', p_target_status
            USING ERRCODE = 'P0001'; 
        END IF;
    
    ELSE 
        RAISE EXCEPTION 'Cannot go from % to %', v_current_status, p_target_status
        USING ERRCODE = 'P0001';
        
    END IF;

END;
$$;


CREATE OR REPLACE FUNCTION _reserve_item(
    p_equipment_id uuid,
    p_user_id uuid,
    p_reservation_data jsonb
) RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$

DECLARE v_recipient_id uuid;

BEGIN

    IF p_reservation_data IS NULL THEN 
        RAISE EXCEPTION 'Reservation data not found'
        USING ERRCODE = 'P0002'; -- http 404 not found
    END IF;

    -- Update the status in the equipment table
    UPDATE equipment
    SET status = 'Reserved - Needs Signature'
    WHERE id = p_equipment_id;
    
    -- Create an entry in the recipient table, get the id
    INSERT INTO recipient (name, contact_name, organization, email, phone, authorized_for_pickup) 
    VALUES (
        p_reservation_data->>'name',
        p_reservation_data->>'contact_name',
        p_reservation_data->>'organization',
        p_reservation_data->>'email',
        p_reservation_data->>'phone',
        p_reservation_data->>'authorized_for_pickup'
    )
    RETURNING id INTO v_recipient_id;

    -- Use the p_equipment_id & newly created recipient id to create entry in Distributions table
    INSERT INTO distributions (equipment_id, recipient_id, notes, reserved_by)
    VALUES (p_equipment_id, v_recipient_id, p_reservation_data->>'notes', p_user_id);
   
END;
$$;

-- Only allow this function to be called from another function
REVOKE EXECUTE ON FUNCTION _reserve_item FROM anon, authenticated;

CREATE OR REPLACE FUNCTION _waiver_mark_ready(
   p_distribution_id uuid,
   p_equipment_id uuid,
   p_template_id uuid,
   p_waiver_url text,
   p_user_id uuid
) 
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$

BEGIN

   UPDATE equipment
   SET status = 'Reserved - Ready for Pickup'
   WHERE id = p_equipment_id;

   INSERT INTO signed_waivers (
      distribution_id,
      template_id,
      signed_by,
      signed_at,
      waiver_url
   )
   VALUES (
      p_distribution_id,
      p_template_id,
      p_user_id,
      now(),
      p_waiver_url
   );

END;
$$;

DROP FUNCTION _allocate_item(uuid,uuid,uuid);

CREATE OR REPLACE FUNCTION _allocate_item(
    p_distribution_id uuid,
    p_equipment_id uuid,
    p_user_id uuid
) RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$

BEGIN

    -- Update the status in the equipment table
    UPDATE equipment
    SET status = 'Allocated'
    WHERE id = p_equipment_id;
    
   -- Mark allocated_at, allocated_by, conditoin_at_allocation
    UPDATE distributions
    SET allocated_at = now(), allocated_by = p_user_id, condition_at_allocation = (
        SELECT condition 
        FROM equipment 
        WHERE id = p_equipment_id
    )
    WHERE id = p_distribution_id;
   
END;
$$;

-- Only allow this function to be called from another function
REVOKE EXECUTE ON FUNCTION _allocate_item FROM anon, authenticated;


CREATE OR REPLACE FUNCTION _return_item(
   p_distribution_id uuid,
   p_equipment_id uuid,
   p_target_status text,
   p_user_id uuid
) RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$

BEGIN
    -- Update the status in the equipment table
    UPDATE equipment
    SET status = p_target_status -- Can be In Processing or Available
    WHERE id = p_equipment_id;
        
    -- Update returned_at & returned_by
    UPDATE distributions
    SET returned_at = now(), returned_by = p_user_id
    WHERE id = p_distribution_id;
   
END;
$$;

-- Only allow this function to be called from another function
REVOKE EXECUTE ON FUNCTION _return_item FROM anon, authenticated;



CREATE TABLE public.signed_waivers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    distribution_id uuid NOT NULL REFERENCES public.distributions(id) ON DELETE CASCADE,
    template_id uuid NOT NULL REFERENCES public.waiver_templates(id),

    signed_by uuid NOT NULL REFERENCES public.profiles(id),

    signed_at timestamptz NOT NULL DEFAULT now(),

    file_url text NOT NULL,

    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.signed_waivers
ADD CONSTRAINT signed_waivers_distribution_unique
UNIQUE (distribution_id);

ALTER TABLE public.distributions
DROP COLUMN IF EXISTS waiver_signed;

ALTER TABLE public.distributions
DROP COLUMN IF EXISTS waiver_url;

ALTER TABLE public.distributions
DROP COLUMN IF EXISTS signed_at;



CREATE POLICY "Authenticated users can read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'waivers'
);



CREATE POLICY "Authenticated user can view waiver templates" ON "public"."waiver_templates" FOR SELECT TO "authenticated" USING (true);
CREATE POLICY "Authenticated user can view signed waivers" ON "public"."signed_waivers" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Admin and PT can add signed waivers" ON "public"."signed_waivers" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin"() OR "public"."is_pt"()));

CREATE POLICY "Admin can add waiver template" ON "public"."waiver_templates" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin"()));

CREATE POLICY "Admin can delete signed waivers" ON "public"."signed_waivers" FOR DELETE TO "authenticated" USING ("public"."is_admin"());

CREATE POLICY "Admin can delete waiver templates" ON "public"."waiver_templates" FOR DELETE TO "authenticated" USING ("public"."is_admin"());