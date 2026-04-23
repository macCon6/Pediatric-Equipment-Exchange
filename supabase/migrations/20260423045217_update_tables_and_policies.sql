drop policy "Admin and PT can add signed waivers" on "public"."signed_waivers";

drop policy "Admin can delete signed waivers" on "public"."signed_waivers";

drop policy "Authenticated user can view signed waivers" on "public"."signed_waivers";

revoke delete on table "public"."signed_waivers" from "anon";

revoke insert on table "public"."signed_waivers" from "anon";

revoke references on table "public"."signed_waivers" from "anon";

revoke select on table "public"."signed_waivers" from "anon";

revoke trigger on table "public"."signed_waivers" from "anon";

revoke truncate on table "public"."signed_waivers" from "anon";

revoke update on table "public"."signed_waivers" from "anon";

revoke delete on table "public"."signed_waivers" from "authenticated";

revoke insert on table "public"."signed_waivers" from "authenticated";

revoke references on table "public"."signed_waivers" from "authenticated";

revoke select on table "public"."signed_waivers" from "authenticated";

revoke trigger on table "public"."signed_waivers" from "authenticated";

revoke truncate on table "public"."signed_waivers" from "authenticated";

revoke update on table "public"."signed_waivers" from "authenticated";

revoke delete on table "public"."signed_waivers" from "service_role";

revoke insert on table "public"."signed_waivers" from "service_role";

revoke references on table "public"."signed_waivers" from "service_role";

revoke select on table "public"."signed_waivers" from "service_role";

revoke trigger on table "public"."signed_waivers" from "service_role";

revoke truncate on table "public"."signed_waivers" from "service_role";

revoke update on table "public"."signed_waivers" from "service_role";

alter table "public"."signed_waivers" drop constraint "signed_waivers_distribution_id_fkey";

alter table "public"."signed_waivers" drop constraint "signed_waivers_distribution_unique";

alter table "public"."signed_waivers" drop constraint "signed_waivers_signed_by_fkey";

alter table "public"."signed_waivers" drop constraint "signed_waivers_template_id_fkey";

drop function if exists "public"."update_status"(p_distribution_id uuid, p_equipment_id uuid, p_target_status text, p_user_id uuid, p_role text, p_reservation_data jsonb, p_template_id uuid, p_waiver_url text);

alter table "public"."signed_waivers" drop constraint "signed_waivers_pkey";

drop index if exists "public"."signed_waivers_distribution_unique";

drop index if exists "public"."signed_waivers_pkey";

drop table "public"."signed_waivers";


  create table "public"."clinics" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."clinics" enable row level security;

alter table "public"."distributions" add column "cancellation_reason" text;

alter table "public"."distributions" add column "cancelled_at" timestamp with time zone;

alter table "public"."distributions" add column "cancelled_by" uuid;

alter table "public"."distributions" add column "signed_at" timestamp with time zone;

alter table "public"."distributions" add column "signed_by" uuid;

alter table "public"."distributions" add column "signed_waiver_url" text;

alter table "public"."distributions" add column "waiver_template_id" uuid;

alter table "public"."equipment" alter column "image_urls" set not null;

alter table "public"."equipment" alter column "size" set not null;

alter table "public"."recipient" drop column "organization";

alter table "public"."recipient" add column "clinic_id" uuid not null;

alter table "public"."recipient" alter column "contact_name" set not null;

alter table "public"."recipient" alter column "email" set not null;

alter table "public"."recipient" alter column "phone" set not null;

alter table "public"."waiver_templates" drop column "layout";

alter table "public"."waiver_templates" alter column "created_at" set not null;

CREATE UNIQUE INDEX clinics_name_key ON public.clinics USING btree (name);

CREATE UNIQUE INDEX clinics_pkey ON public.clinics USING btree (id);

CREATE INDEX distributions_cancelled_by_idx ON public.distributions USING btree (cancelled_by);

CREATE INDEX distributions_signed_at_idx ON public.distributions USING btree (signed_at);

CREATE INDEX distributions_signed_by_idx ON public.distributions USING btree (signed_by);

CREATE INDEX equipment_status_idx ON public.equipment USING btree (status);

CREATE INDEX recipient_clinic_id_idx ON public.recipient USING btree (clinic_id);

alter table "public"."clinics" add constraint "clinics_pkey" PRIMARY KEY using index "clinics_pkey";

alter table "public"."clinics" add constraint "clinics_name_key" UNIQUE using index "clinics_name_key";

alter table "public"."distributions" add constraint "distributions_cancelled_by_fkey" FOREIGN KEY (cancelled_by) REFERENCES public.profiles(id) not valid;

alter table "public"."distributions" validate constraint "distributions_cancelled_by_fkey";

alter table "public"."distributions" add constraint "distributions_signed_by_fkey" FOREIGN KEY (signed_by) REFERENCES public.profiles(id) not valid;

alter table "public"."distributions" validate constraint "distributions_signed_by_fkey";

alter table "public"."distributions" add constraint "distributions_waiver_template_id_fkey" FOREIGN KEY (waiver_template_id) REFERENCES public.waiver_templates(id) not valid;

alter table "public"."distributions" validate constraint "distributions_waiver_template_id_fkey";

alter table "public"."recipient" add constraint "recipient_clinic_id_fkey" FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) not valid;

alter table "public"."recipient" validate constraint "recipient_clinic_id_fkey";

grant delete on table "public"."clinics" to "anon";

grant insert on table "public"."clinics" to "anon";

grant references on table "public"."clinics" to "anon";

grant select on table "public"."clinics" to "anon";

grant trigger on table "public"."clinics" to "anon";

grant truncate on table "public"."clinics" to "anon";

grant update on table "public"."clinics" to "anon";

grant delete on table "public"."clinics" to "authenticated";

grant insert on table "public"."clinics" to "authenticated";

grant references on table "public"."clinics" to "authenticated";

grant select on table "public"."clinics" to "authenticated";

grant trigger on table "public"."clinics" to "authenticated";

grant truncate on table "public"."clinics" to "authenticated";

grant update on table "public"."clinics" to "authenticated";

grant delete on table "public"."clinics" to "service_role";

grant insert on table "public"."clinics" to "service_role";

grant references on table "public"."clinics" to "service_role";

grant select on table "public"."clinics" to "service_role";

grant trigger on table "public"."clinics" to "service_role";

grant truncate on table "public"."clinics" to "service_role";

grant update on table "public"."clinics" to "service_role";


  create policy "Admin and therapist can add clinics"
  on "public"."clinics"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin() OR public.is_therapist()));



  create policy "Admin can delete clinics"
  on "public"."clinics"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "Admin can update clinics"
  on "public"."clinics"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "Authenticated user can view clinics"
  on "public"."clinics"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Admins and therapists can upload signed waivers"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'signed-waivers'::text) AND (public.is_admin() OR public.is_therapist())));



  create policy "Admins can delete equipment images"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'equipment-images'::text) AND public.is_admin()));



  create policy "Admins can delete signed waivers"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'signed-waivers'::text) AND public.is_admin()));



  create policy "Admins can delete waiver templates"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'waiver-templates'::text) AND public.is_admin()));



  create policy "Admins can upload waiver templates"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'waiver-templates'::text) AND public.is_admin()));



  create policy "Authenticated with role can upload equipment images"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'equipment-images'::text) AND (public.is_admin() OR public.is_therapist() OR public.is_volunteer())));



