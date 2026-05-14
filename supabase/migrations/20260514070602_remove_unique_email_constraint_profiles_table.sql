alter table "public"."profiles" drop constraint "unique_email";

drop index if exists "public"."unique_email";

CREATE UNIQUE INDEX unique_email_active ON public.profiles USING btree (email) WHERE (deleted_at IS NULL);


