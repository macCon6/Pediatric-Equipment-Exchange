drop policy "Users can view their own profile" on "public"."profiles";

alter table "public"."equipment" add column "deleted_at" timestamp with time zone;

alter table "public"."equipment" add column "deleted_by" uuid;

alter table "public"."equipment" add constraint "equipment_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."equipment" validate constraint "equipment_deleted_by_fkey";

create or replace view "public"."readable_distribution" as  SELECT d.id,
    d.equipment_id,
    d.reserved_by,
    e.name AS equipment_name,
    e.status AS equipment_status,
    e.deleted_at AS equipment_deleted_at,
    r.name AS recipient_name,
    r.contact_name,
    r.email AS contact_email,
    r.phone AS contact_phone,
    r.authorized_for_pickup,
    c.name AS clinic_name,
    reserved_staff.full_name AS reserved_by_name,
    allocated_staff.full_name AS allocated_by_name,
    returned_staff.full_name AS returned_by_name,
    cancelled_staff.full_name AS cancelled_by_name,
    signing_staff.full_name AS signed_by_name,
    deleted_by_staff.full_name AS equipment_deleted_by,
    d.reserved_at,
    d.returned_at,
    d.allocated_at,
    d.cancelled_at,
    d.cancellation_reason,
    d.notes AS therapist_notes,
    d.signed_at,
    d.signed_waiver_url,
    d.condition_at_allocation
   FROM (((((((((public.distributions d
     LEFT JOIN public.equipment e ON ((d.equipment_id = e.id)))
     LEFT JOIN public.recipient r ON ((d.recipient_id = r.id)))
     LEFT JOIN public.profiles reserved_staff ON ((d.reserved_by = reserved_staff.id)))
     LEFT JOIN public.profiles allocated_staff ON ((d.allocated_by = allocated_staff.id)))
     LEFT JOIN public.profiles returned_staff ON ((d.returned_by = returned_staff.id)))
     LEFT JOIN public.profiles cancelled_staff ON ((d.cancelled_by = cancelled_staff.id)))
     LEFT JOIN public.profiles signing_staff ON ((d.signed_by = signing_staff.id)))
     LEFT JOIN public.profiles deleted_by_staff ON ((e.deleted_by = deleted_by_staff.id)))
     LEFT JOIN public.clinics c ON ((r.clinic_id = c.id)));



  create policy "Authenticated users can view each other's profiles"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (true);



