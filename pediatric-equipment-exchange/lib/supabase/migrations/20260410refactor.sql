drop table waiver_templates cascade;

create table waiver_templates (
  id uuid primary key default gen_random_uuid(),

  created_at timestamp with time zone default now(),

  version int not null default 1,
  is_active boolean not null default false,

  template_url text not null,

  layout jsonb not null default '{}'::jsonb
);

update public.equipment set location = 'None Entered' where location is null;
update public.equipment set barcode_number = -1 where barcode_number is null;

alter table public.equipment
alter column location set not null;

alter table public.equipment
alter column barcode_number set not null;
update public.equipment set status = 'Missing' where status = null

drop table distributions cascade;

create table distributions (
  id uuid primary key default gen_random_uuid(),

  equipment_id uuid not null references equipment(id) on delete cascade,
  recipient_id uuid not null references recipient(id),

  reserved_by uuid not null references profiles(id),
  allocated_by uuid references profiles(id),
  returned_by uuid references profiles(id),

  reserved_at timestamp with time zone not null default now(),
  allocated_at timestamp with time zone,
  returned_at timestamp with time zone,

  status text not null default 'reserved_needs_signature',

  waiver_signed boolean not null default false,
  waiver_url text,
  signed_at timestamp with time zone,

  condition_at_allocation text,
  notes text
); 