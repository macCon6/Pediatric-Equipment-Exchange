create type "public"."user_role" as enum ('physical_therapist', 'volunteer');


  create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "role" public.user_role not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;

alter table "public"."equipment" drop column "image_url";

alter table "public"."equipment" add column "color" text;

alter table "public"."equipment" add column "condition" text;

alter table "public"."equipment" add column "draft" boolean;

alter table "public"."equipment" add column "image_urls" text[];

alter table "public"."equipment" add column "subcategory" text;

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_equipment(equipment_name text, equipment_category text, equipment_description text, equipment_size text, donor_name text, image text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
    INSERT INTO equipment (
        name,
        category,
        description,
        size,
        donor,
        image_url,
        status
    )
    VALUES (
        equipment_name,
        equipment_category,
        equipment_description,
        equipment_size,
        donor_name,
        image,
        'Processing'
    );
END;$function$
;

CREATE OR REPLACE FUNCTION public.allocate_equipment(equipment_id integer, recipient_id integer, staff text, condition text, notes text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN

    INSERT INTO distributions (
        equipment_id,
        recipient_id,
        distribution_date,
        staff_member,
        condition_at_distribution,
        notes
    )
    VALUES (
        equipment_id,
        recipient_id,
        CURRENT_DATE,
        staff,
        condition,
        notes
    );

    UPDATE equipment
    SET status = 'Allocated'
    WHERE id = equipment_id;

END;$function$
;

CREATE OR REPLACE FUNCTION public.mark_equipment_available(equipment_id integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
    UPDATE equipment
    SET status = 'Available'
    WHERE id = equipment_id;
END;$function$
;

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


  create policy "Users can update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = id));



  create policy "Users can view their own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((( SELECT auth.uid() AS uid) = id));



