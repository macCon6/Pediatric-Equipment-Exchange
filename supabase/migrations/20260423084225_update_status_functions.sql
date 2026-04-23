drop function if exists "public"."_return_item"(p_distribution_id uuid, p_equipment_id uuid, p_target_status text, p_user_id uuid);

drop function if exists "public"."_waiver_mark_ready"(p_distribution_id uuid, p_equipment_id uuid, p_template_id uuid, p_waiver_url text, p_user_id uuid);

drop function if exists "public"."is_pt"();

drop index if exists "public"."distributions_signed_at_idx";

CREATE UNIQUE INDEX clinics_name_unique ON public.clinics USING btree (name);

CREATE UNIQUE INDEX one_active_distribution_per_equipment ON public.distributions USING btree (equipment_id) WHERE (returned_at IS NULL);

CREATE UNIQUE INDEX one_active_waiver_template ON public.waiver_templates USING btree (is_active) WHERE (is_active = true);

alter table "public"."clinics" add constraint "clinics_name_unique" UNIQUE using index "clinics_name_unique";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public._return_item(p_distribution_id uuid, p_equipment_id uuid, p_target_status text, p_current_status text, p_user_id uuid, p_cancellation_reason text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$

BEGIN
    -- Update the status in the equipment table
    UPDATE equipment
    SET status = p_target_status -- Can be In Processing or Available
    WHERE id = p_equipment_id;

    -- IF item is reserved, Update cancelled_at , cancelled_by and cancellation reason
    IF p_current_status IN ('Reserved - Needs Signature', 'Reserved - Ready for Pickup') THEN
        UPDATE distributions
        SET cancelled_at = now(), cancelled_by = p_user_id, cancellation_reason = p_cancellation_reason
        WHERE id = p_distribution_id;    
    END IF;

    -- Always Update returned_at & returned_by
    UPDATE distributions
    SET returned_at = now(), returned_by = p_user_id
    WHERE id = p_distribution_id;
   
END;
$function$
;

CREATE OR REPLACE FUNCTION public._waiver_mark_ready(p_distribution_id uuid, p_equipment_id uuid, p_waiver_template_id uuid, p_signed_waiver_url text, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$

BEGIN

   IF p_signed_waiver_url IS NULL THEN
      RAISE EXCEPTION 'No signed waiver found'
        USING ERRCODE = 'P0002'; -- http 404 not found
    END IF;

   UPDATE equipment
   SET status = 'Reserved - Ready for Pickup'
   WHERE id = p_equipment_id;

   UPDATE distributions
      SET signed_at = now(), 
      signed_by = p_user_id, 
      signed_waiver_url = p_signed_waiver_url, 
      waiver_template_id = p_waiver_template_id
      WHERE id = p_distribution_id;    

END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_status(p_distribution_id uuid, p_equipment_id uuid, p_target_status text, p_reservation_data jsonb DEFAULT NULL::jsonb, p_cancellation_reason text DEFAULT NULL::text, p_waiver_template_id uuid DEFAULT NULL::uuid, p_signed_waiver_url text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$

DECLARE

v_user_id uuid := auth.uid();
v_role public.role;
v_current_status text;
v_distribution distributions%ROWTYPE; -- So the relevant distribution row only needs to be fetched once
    
BEGIN

    -- get user role 
    SELECT role INTO v_role
    FROM profiles
    WHERE id = v_user_id;

    -- If applicable, check that the distribution from the distribution id parameter exists, and fetch its row
    IF p_distribution_id IS NOT NULL THEN 
        SELECT * INTO v_distribution
        FROM distributions
        WHERE id = p_distribution_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION
            'Distribution % does not exist', p_distribution_id
            USING ERRCODE = 'P0002'; -- http 404 not found
        END IF;

        -- Check distribution equipment_id field matches the equipment id parameter
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

    CASE
         -- IN PROCESSING -> AVAILABLE (anyone). Just mark available
        WHEN v_current_status = 'In Processing' AND p_target_status = 'Available' THEN
            UPDATE equipment 
            SET status = 'Available'
            WHERE id = p_equipment_id;
    
                    -- VALID TRANSITIONS FROM AVAILABLE --
        
        -- AVAILABLE -> IN PROCESSING (anyone). Just mark in processing
        WHEN v_current_status = 'Available' AND p_target_status = 'In Processing' THEN
            UPDATE equipment
            SET status = 'In Processing'
            WHERE id = p_equipment_id;

        -- AVAILABLE -> RESERVED NEEDS SIGNATURE (therapist and admin only). Reserve the item
        WHEN v_current_status = 'Available' AND p_target_status = 'Reserved - Needs Signature' THEN 
            -- Check if role has permission, and only reserves if _has_permission doesn't raise exception
            PERFORM _has_permission(v_distribution.id, v_user_id, v_role::text, 'reserve_item'::text);
            PERFORM _reserve_item(p_equipment_id, v_user_id, p_reservation_data);

                    -- VALID TRANSITIONS FROM RESERVED NEEDS SIGNATURE --

        -- RESERVED NEEDS SIGNATURE -> AVAILABLE (admin or therapist who reserved). Return the item (cancel reservation)
        WHEN v_current_status = 'Reserved - Needs Signature' AND p_target_status = 'Available' THEN
            PERFORM _has_permission(v_distribution.id, v_user_id, v_role::text, 'cancel_reservation'::text);
            PERFORM _return_item(p_distribution_id, p_equipment_id, p_target_status, v_current_status, v_user_id, p_cancellation_reason);
        
        -- RESERVED NEEDS SIGNATURE -> RESERVED READY FOR PICKUP (admin or therapist who reserved). Mark waiver as signed
        WHEN v_current_status = 'Reserved - Needs Signature' AND p_target_status = 'Reserved - Ready for Pickup' THEN
            PERFORM _has_permission(v_distribution.id, v_user_id, v_role::text, 'update_waiver_fields'::text);
            PERFORM _waiver_mark_ready(v_distribution.id, p_equipment_id, p_waiver_template_id, p_signed_waiver_url, v_user_id);
        
                    -- VALID TRANSITIONS FROM RESERVED READY FOR PICKUP --

        -- RESERVED READY FOR PICKUP -> AVAILABLE (admin & therapist who reserved only). Return the item (cancel reservation)
        WHEN v_current_status = 'Reserved - Ready for Pickup' AND p_target_status = 'Available' THEN 
            PERFORM _has_permission(v_distribution.id, v_user_id, v_role::text, 'cancel_reservation'::text);
           PERFORM _return_item(p_distribution_id, p_equipment_id, p_target_status, v_current_status, v_user_id, p_cancellation_reason);
    
        -- RESERVED READY FOR PICKUP -> ALLOCATED. Allocate the item
        WHEN v_current_status = 'Reserved - Ready for Pickup' AND p_target_status = 'Allocated' THEN 
            PERFORM _has_permission(v_distribution.id, v_user_id, v_role::text, 'allocate_item'::text);
            PERFORM _allocate_item(v_distribution.id, p_equipment_id, v_user_id);

                    -- VALID TRANSITIONS FROM ALLOCATED --
        
        -- ALLOCATED -> AVAILABLE OR IN PROCESSING. Return a ready item
        WHEN v_current_status = 'Allocated' AND (p_target_status IN ('Available', 'In Processing')) THEN 
            PERFORM _has_permission(v_distribution.id, v_user_id, v_role::text, 'return_item'::text);
            PERFORM _return_item(v_distribution.id, p_equipment_id, p_target_status, v_current_status, v_user_id);
        
        ELSE RAISE EXCEPTION 'Cannot go from % to %', v_current_status, p_target_status
        USING ERRCODE = 'P0001'; -- http 400 bad request error
        
    END CASE;

    -- send back the final status (never gets here if any of the transition functions raise exceptions)
    RETURN v_current_status;

END;
$function$
;

CREATE OR REPLACE FUNCTION public._allocate_item(p_distribution_id uuid, p_equipment_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$

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
$function$
;

CREATE OR REPLACE FUNCTION public._has_permission(p_distribution_id uuid, p_user_id uuid, p_role text, p_action text)
 RETURNS void
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
    
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
            IF NOT (p_role = 'admin' OR p_role = 'therapist') THEN 
                RAISE EXCEPTION 'Only admin and therapists can reserve equipment'
                USING ERRCODE = '42501';  -- http 403 Permission denied error
            END IF;
            
        WHEN 'cancel_reservation' THEN
            IF NOT (p_role = 'admin' OR (p_role = 'therapist' AND p_user_id = v_reserved_by)) THEN 
                RAISE EXCEPTION 'Only admin or therapist who reserved can cancel this reservation'
                USING ERRCODE = '42501';
            END IF;
    
        WHEN 'update_waiver_fields' THEN 
            IF NOT (p_role = 'admin' OR (p_role = 'therapist' AND p_user_id = v_reserved_by)) THEN 
                RAISE EXCEPTION 'Only admin or therapist who reserved can mark waiver as signed'
                USING ERRCODE = '42501';
            END IF;

        WHEN 'return_item', 'allocate_item' THEN
            IF NOT (p_role = 'admin' OR p_role = 'volunteer' OR p_role = 'therapist') THEN 
                RAISE EXCEPTION 'Invalid role, action not available'
                USING ERRCODE = '42501';
            END IF;

        ELSE 
            RAISE EXCEPTION 'Invalid action'
            USING ERRCODE = 'P0001';

    END CASE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public._reserve_item(p_equipment_id uuid, p_user_id uuid, p_reservation_data jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$

DECLARE 

v_recipient_id uuid;
v_clinic_id uuid;

BEGIN

    IF p_reservation_data IS NULL THEN 
        RAISE EXCEPTION 'Reservation data not found'
        USING ERRCODE = 'P0002'; -- http 404 not found
    END IF;

    -- Update the status in the equipment table
    UPDATE equipment
    SET status = 'Reserved - Needs Signature'
    WHERE id = p_equipment_id;

    -- Insert the clinic into clinic tables if it has a new name
    INSERT INTO clinics (name)
    VALUES (p_reservation_data->>'clinic')
    ON CONFLICT (name) DO NOTHING -- don't duplicate clinic names
    RETURNING id into v_clinic_id;
    
    -- Create an entry in the recipient table, adding in the new clinic id, and return the new recip id
    INSERT INTO recipient (name, contact_name, email, phone, authorized_for_pickup, clinic_id) 
    VALUES (
        p_reservation_data->>'name',
        p_reservation_data->>'contact_name',
        p_reservation_data->>'email',
        p_reservation_data->>'phone',
        p_reservation_data->>'authorized_for_pickup',
        v_clinic_id
    )
    RETURNING id INTO v_recipient_id;

    -- Use the p_equipment_id & newly created recipient id to create entry in Distributions table
    INSERT INTO distributions (equipment_id, recipient_id, notes, reserved_by)
    VALUES (p_equipment_id, v_recipient_id, p_reservation_data->>'notes', p_user_id);
   
END;
$function$
;

drop policy "Admins can delete equipment images" on "storage"."objects";

drop policy "Admins can delete signed waivers" on "storage"."objects";

drop policy "Admins can delete waiver templates" on "storage"."objects";


  create policy "Admins can delete equipment images"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'equipment-images'::text) AND public.is_admin()));



  create policy "Admins can delete signed waivers"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'signed-waivers'::text) AND public.is_admin()));



  create policy "Admins can delete waiver templates"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'waiver-templates'::text) AND public.is_admin()));



