alter table public.equipment
add column if not exists barcode_value text;

create unique index if not exists equipment_barcode_value_unique_idx
on public.equipment (barcode_value);
