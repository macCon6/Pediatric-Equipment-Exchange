drop policy "Admin and PT can create distributions" on "public"."distributions";

drop policy "Allow update if reserved_by (PT)" on "public"."distributions";

drop policy "Authenticated user can view distributions" on "public"."distributions";

drop policy "Volunteer and admin can always update" on "public"."distributions";

drop policy "Authenticated users can add equipment" on "public"."equipment";

drop policy "Authenticated users can update equipment" on "public"."equipment";

drop policy "Enable read access for all users" on "public"."equipment";

drop policy "Admin can create users" on "public"."profiles";

drop policy "Admin can delete users" on "public"."profiles";

drop policy "Admin can update user profiles" on "public"."profiles";

drop policy "Admin can view users" on "public"."profiles";

drop policy "Users can update their own profiles" on "public"."profiles";

drop policy "Admin and PT can create recipient" on "public"."recipient";

drop policy "Authenticated user can view recipient" on "public"."recipient";

alter table "public"."profiles" alter column "role" drop default;

alter type "public"."role" rename to "role__old_version_to_be_dropped";

create type "public"."role" as enum ('therapist', 'volunteer', 'admin');

alter table "public"."profiles" alter column role type "public"."role" using role::text::"public"."role";

alter table "public"."profiles" alter column "role" set default 'volunteer'::public.role;

drop type "public"."role__old_version_to_be_dropped";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_therapist()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'therapist'
  );
$function$
;


  create policy "Admin and therapist can create distributions"
  on "public"."distributions"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin() OR public.is_therapist()));



  create policy "Admin can edit distributions in case of emergency"
  on "public"."distributions"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "Authenticated users can view distributions"
  on "public"."distributions"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Anyone can view equipment"
  on "public"."equipment"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Authenticated users with valid role can add equipment"
  on "public"."equipment"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin() OR public.is_therapist() OR public.is_volunteer()));



  create policy "Authenticated users with valid role can update equipment"
  on "public"."equipment"
  as permissive
  for update
  to authenticated
using ((public.is_admin() OR public.is_therapist() OR public.is_volunteer()))
with check ((public.is_admin() OR public.is_therapist() OR public.is_volunteer()));



  create policy "Admin has full access to profiles to do anything"
  on "public"."profiles"
  as permissive
  for all
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "Users can update their own profile, if role isn't changed"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((id = ( SELECT auth.uid() AS uid)))
with check (((id = ( SELECT auth.uid() AS uid)) AND (role = ( SELECT profiles_1.role
   FROM public.profiles profiles_1
  WHERE (profiles_1.id = auth.uid())))));



  create policy "Admin and therapist can create recipient"
  on "public"."recipient"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin() OR public.is_therapist()));



  create policy "Authenticated users can view recipients"
  on "public"."recipient"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Admins can update waiver templates"
  on "public"."waiver_templates"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



