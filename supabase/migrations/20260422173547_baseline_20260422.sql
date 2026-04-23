


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."role" AS ENUM (
    'physical_therapist',
    'volunteer',
    'admin'
);


ALTER TYPE "public"."role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_allocate_item"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."_allocate_item"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_has_permission"("p_distribution_id" "uuid", "p_user_id" "uuid", "p_role" "text", "p_action" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."_has_permission"("p_distribution_id" "uuid", "p_user_id" "uuid", "p_role" "text", "p_action" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_reserve_item"("p_equipment_id" "uuid", "p_user_id" "uuid", "p_reservation_data" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."_reserve_item"("p_equipment_id" "uuid", "p_user_id" "uuid", "p_reservation_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_return_item"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_target_status" "text", "p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."_return_item"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_target_status" "text", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_waiver_mark_ready"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_template_id" "uuid", "p_waiver_url" "text", "p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."_waiver_mark_ready"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_template_id" "uuid", "p_waiver_url" "text", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_pt"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'physical_therapist'
  );
$$;


ALTER FUNCTION "public"."is_pt"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_volunteer"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'volunteer'
  );
$$;


ALTER FUNCTION "public"."is_volunteer"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_status"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_target_status" "text", "p_user_id" "uuid", "p_role" "text", "p_reservation_data" "jsonb" DEFAULT NULL::"jsonb", "p_template_id" "uuid" DEFAULT NULL::"uuid", "p_waiver_url" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
            PERFORM _return_item(v_distribution.id, p_equipment_id, p_target_status, p_user_id);

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


ALTER FUNCTION "public"."update_status"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_target_status" "text", "p_user_id" "uuid", "p_role" "text", "p_reservation_data" "jsonb", "p_template_id" "uuid", "p_waiver_url" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."distributions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "equipment_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "reserved_by" "uuid" NOT NULL,
    "allocated_by" "uuid",
    "returned_by" "uuid",
    "reserved_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "allocated_at" timestamp with time zone,
    "returned_at" timestamp with time zone,
    "condition_at_allocation" "text",
    "notes" "text"
);


ALTER TABLE "public"."distributions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."equipment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "subcategory" "text",
    "condition" "text" NOT NULL,
    "status" "text" DEFAULT ''::"text" NOT NULL,
    "description" "text",
    "size" "text",
    "color" "text",
    "donor" "text",
    "image_urls" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "location" "text" NOT NULL,
    "barcode_value" "text" NOT NULL
);


ALTER TABLE "public"."equipment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "username" "text",
    "role" "public"."role" DEFAULT 'volunteer'::"public"."role" NOT NULL,
    "email" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recipient" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "contact_name" "text",
    "organization" "text",
    "email" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "authorized_for_pickup" "text" NOT NULL
);


ALTER TABLE "public"."recipient" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."signed_waivers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "distribution_id" "uuid" NOT NULL,
    "template_id" "uuid" NOT NULL,
    "signed_by" "uuid" NOT NULL,
    "signed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "waiver_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."signed_waivers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."waiver_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "version" integer DEFAULT 1 NOT NULL,
    "is_active" boolean DEFAULT false NOT NULL,
    "template_url" "text" NOT NULL,
    "layout" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."waiver_templates" OWNER TO "postgres";


ALTER TABLE ONLY "public"."distributions"
    ADD CONSTRAINT "distributions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."equipment"
    ADD CONSTRAINT "equipment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."recipient"
    ADD CONSTRAINT "recipient2_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signed_waivers"
    ADD CONSTRAINT "signed_waivers_distribution_unique" UNIQUE ("distribution_id");



ALTER TABLE ONLY "public"."signed_waivers"
    ADD CONSTRAINT "signed_waivers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."waiver_templates"
    ADD CONSTRAINT "waiver_templates_pkey" PRIMARY KEY ("id");



CREATE INDEX "distributions_allocated_by_idx" ON "public"."distributions" USING "btree" ("allocated_by");



CREATE INDEX "distributions_equipment_id_idx" ON "public"."distributions" USING "btree" ("equipment_id");



CREATE INDEX "distributions_recipient_id_idx" ON "public"."distributions" USING "btree" ("recipient_id");



CREATE INDEX "distributions_reserved_by_idx" ON "public"."distributions" USING "btree" ("reserved_by");



CREATE INDEX "distributions_returned_by_idx" ON "public"."distributions" USING "btree" ("returned_by");



ALTER TABLE ONLY "public"."distributions"
    ADD CONSTRAINT "distributions_allocated_by_fkey" FOREIGN KEY ("allocated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."distributions"
    ADD CONSTRAINT "distributions_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."distributions"
    ADD CONSTRAINT "distributions_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."recipient"("id");



ALTER TABLE ONLY "public"."distributions"
    ADD CONSTRAINT "distributions_reserved_by_fkey" FOREIGN KEY ("reserved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."distributions"
    ADD CONSTRAINT "distributions_returned_by_fkey" FOREIGN KEY ("returned_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."signed_waivers"
    ADD CONSTRAINT "signed_waivers_distribution_id_fkey" FOREIGN KEY ("distribution_id") REFERENCES "public"."distributions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."signed_waivers"
    ADD CONSTRAINT "signed_waivers_signed_by_fkey" FOREIGN KEY ("signed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."signed_waivers"
    ADD CONSTRAINT "signed_waivers_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."waiver_templates"("id");



CREATE POLICY "Admin and PT can add signed waivers" ON "public"."signed_waivers" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin"() OR "public"."is_pt"()));



CREATE POLICY "Admin and PT can create distributions" ON "public"."distributions" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin"() OR "public"."is_pt"()));



CREATE POLICY "Admin and PT can create recipient" ON "public"."recipient" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin"() OR "public"."is_pt"()));



CREATE POLICY "Admin can add waiver template" ON "public"."waiver_templates" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can create users" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can delete distributions" ON "public"."distributions" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete equipment" ON "public"."equipment" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete recipient" ON "public"."recipient" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete signed waivers" ON "public"."signed_waivers" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete users" ON "public"."profiles" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete waiver templates" ON "public"."waiver_templates" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can update recipient" ON "public"."recipient" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can update user profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can view users" ON "public"."profiles" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Allow update if reserved_by (PT)" ON "public"."distributions" FOR UPDATE TO "authenticated" USING (("reserved_by" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (true);



CREATE POLICY "Authenticated user can view distributions" ON "public"."distributions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated user can view recipient" ON "public"."recipient" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated user can view signed waivers" ON "public"."signed_waivers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated user can view waiver templates" ON "public"."waiver_templates" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can add equipment" ON "public"."equipment" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can update equipment" ON "public"."equipment" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."equipment" FOR SELECT USING (true);



CREATE POLICY "Users can update their own profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK ((("id" = ( SELECT "auth"."uid"() AS "uid")) AND ("role" = ( SELECT "profiles_1"."role"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Volunteer and admin can always update" ON "public"."distributions" FOR UPDATE TO "authenticated" USING (("public"."is_admin"() OR "public"."is_volunteer"())) WITH CHECK (true);



ALTER TABLE "public"."distributions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."equipment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recipient" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."signed_waivers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."waiver_templates" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."_allocate_item"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."_allocate_item"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_allocate_item"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."_has_permission"("p_distribution_id" "uuid", "p_user_id" "uuid", "p_role" "text", "p_action" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_reserve_item"("p_equipment_id" "uuid", "p_user_id" "uuid", "p_reservation_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."_return_item"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_target_status" "text", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."_waiver_mark_ready"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_template_id" "uuid", "p_waiver_url" "text", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."_waiver_mark_ready"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_template_id" "uuid", "p_waiver_url" "text", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_waiver_mark_ready"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_template_id" "uuid", "p_waiver_url" "text", "p_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_pt"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_pt"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_pt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_pt"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_volunteer"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_volunteer"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_volunteer"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_volunteer"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_status"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_target_status" "text", "p_user_id" "uuid", "p_role" "text", "p_reservation_data" "jsonb", "p_template_id" "uuid", "p_waiver_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_status"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_target_status" "text", "p_user_id" "uuid", "p_role" "text", "p_reservation_data" "jsonb", "p_template_id" "uuid", "p_waiver_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_status"("p_distribution_id" "uuid", "p_equipment_id" "uuid", "p_target_status" "text", "p_user_id" "uuid", "p_role" "text", "p_reservation_data" "jsonb", "p_template_id" "uuid", "p_waiver_url" "text") TO "service_role";



GRANT ALL ON TABLE "public"."distributions" TO "anon";
GRANT ALL ON TABLE "public"."distributions" TO "authenticated";
GRANT ALL ON TABLE "public"."distributions" TO "service_role";



GRANT ALL ON TABLE "public"."equipment" TO "anon";
GRANT ALL ON TABLE "public"."equipment" TO "authenticated";
GRANT ALL ON TABLE "public"."equipment" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."recipient" TO "anon";
GRANT ALL ON TABLE "public"."recipient" TO "authenticated";
GRANT ALL ON TABLE "public"."recipient" TO "service_role";



GRANT ALL ON TABLE "public"."signed_waivers" TO "anon";
GRANT ALL ON TABLE "public"."signed_waivers" TO "authenticated";
GRANT ALL ON TABLE "public"."signed_waivers" TO "service_role";



GRANT ALL ON TABLE "public"."waiver_templates" TO "anon";
GRANT ALL ON TABLE "public"."waiver_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."waiver_templates" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";