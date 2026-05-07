CREATE UNIQUE INDEX equipment_barcode_value_key ON public.equipment USING btree (barcode_value);

alter table "public"."equipment" add constraint "equipment_barcode_value_key" UNIQUE using index "equipment_barcode_value_key";


