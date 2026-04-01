alter table "public"."distributions" drop constraint "distributions_id_fkey";

alter table "public"."distributions" drop column "created_at";

alter table "public"."distributions" drop column "distribution_date";

alter table "public"."distributions" add column "allocated_at" timestamp with time zone;

alter table "public"."distributions" add column "reserved_at" timestamp with time zone not null default now();

alter table "public"."distributions" add column "returned_at" timestamp with time zone;

alter table "public"."distributions" add column "signed_waiver_url" text;

alter table "public"."distributions" add column "waiver_signed" boolean default false;

alter table "public"."distributions" alter column "staff_member" set data type uuid using "staff_member"::uuid;

alter table "public"."equipment" drop column "draft";

alter table "public"."equipment" drop column "image_urls";

alter table "public"."equipment" add column "image_url" text;

alter table "public"."equipment" alter column "category" drop not null;

alter table "public"."equipment" alter column "created_at" set not null;

alter table "public"."equipment" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."equipment" alter column "id" set default gen_random_uuid();

alter table "public"."equipment" alter column "id" drop identity;

alter table "public"."equipment" alter column "id" set data type uuid using "id"::uuid;

alter table "public"."equipment" alter column "status" set default '''available'''::text;

alter table "public"."profiles" alter column "id" set default gen_random_uuid();

alter table "public"."recipient" alter column "name" set not null;

alter table "public"."distributions" add constraint "distributions_staff_member_fkey" FOREIGN KEY (staff_member) REFERENCES public.profiles(id) not valid;

alter table "public"."distributions" validate constraint "distributions_staff_member_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- avoid duplicate inserts if a profile already exists
  INSERT INTO public.profiles (id, full_name, role)
  SELECT NEW.id,
         NEW.raw_user_meta_data->>'full_name',
         (NEW.raw_user_meta_data->>'role')::user_role
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = NEW.id);

  RETURN NEW;
END;
$function$
;


  create policy "Allow insert"
  on "public"."equipment"
  as permissive
  for insert
  to anon
with check (true);



  create policy "Enable read access for all users"
  on "public"."equipment"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


