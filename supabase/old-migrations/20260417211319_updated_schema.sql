


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
    "waiver_signed" boolean DEFAULT false NOT NULL,
    "waiver_url" "text",
    "signed_at" timestamp with time zone,
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



CREATE POLICY "Admin and PT can create distributions" ON "public"."distributions" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin"() OR "public"."is_pt"()));



CREATE POLICY "Admin and PT can create recipient" ON "public"."recipient" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin"() OR "public"."is_pt"()));



CREATE POLICY "Admin can create users" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can delete distributions" ON "public"."distributions" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete equipment" ON "public"."equipment" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete recipient" ON "public"."recipient" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete users" ON "public"."profiles" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can update recipient" ON "public"."recipient" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can update user profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can view users" ON "public"."profiles" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Allow update if reserved_by (PT)" ON "public"."distributions" FOR UPDATE TO "authenticated" USING (("reserved_by" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (true);



CREATE POLICY "Authenticated user can view distributions" ON "public"."distributions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated user can view recipient" ON "public"."recipient" FOR SELECT TO "authenticated" USING (true);



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


ALTER TABLE "public"."waiver_templates" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



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

INSERT INTO storage.buckets (id, name, public)
VALUES ('equipment-images', 'equipment-images', true)
ON conflict (id) do nothing;

INSERT INTO storage.buckets (id, name, public)
VALUES ('waivers', 'waivers', true)
ON conflict (id) do nothing;






