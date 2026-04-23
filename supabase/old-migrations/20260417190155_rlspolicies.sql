create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;


create function public.is_volunteer()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'volunteer'
  );
$$;


create function public.is_pt()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'physical_therapist'
  );
$$;



create policy "Admin and PT can create distributions"
on "public"."distributions"
as PERMISSIVE
for INSERT
to authenticated
with check (
  (is_admin() OR is_pt())
);


create policy "Admin can delete distributions"
on "public"."distributions"
as PERMISSIVE
for DELETE
to authenticated
using (
  is_admin()
);


create policy "Authenticated user can view distributions"
on "public"."distributions"
as PERMISSIVE
for SELECT
to authenticated
using (
    true
);


create policy "Allow update if reserved_by (PT)"
on "public"."distributions"
as PERMISSIVE
for UPDATE
to authenticated
using (
  (reserved_by = auth.uid())
) with check (
  true
);


create policy "Volunteer and admin can always update"
on "public"."distributions"
as PERMISSIVE
for UPDATE
to authenticated
using (
  (is_admin() OR is_volunteer())
) with check (
  true
);


create policy "Admin can delete equipment"
on "public"."equipment"
as PERMISSIVE
for DELETE
to authenticated
using (
  is_admin()
);


create policy "Authenticated users can add equipment"
on "public"."equipment"
as PERMISSIVE
for INSERT
to authenticated
with check (
  true
);


create policy "Authenticated users can update equipment"
on "public"."equipment"
as PERMISSIVE
for UPDATE
to authenticated
using (
  true
) with check (
  true
);


create policy "Admin can create users"
on "public"."profiles"
as PERMISSIVE
for INSERT
to authenticated
with check (
    is_admin()
);



create policy "Admin can delete users"
on "public"."profiles"
as PERMISSIVE
for DELETE
to authenticated
using (
    is_admin()
);


create policy "Admin can view users"
on "public"."profiles"
as PERMISSIVE
for SELECT
to authenticated
using (
    is_admin()
);


create policy "Users can view their own profile"
on "public"."profiles"
as PERMISSIVE
for SELECT
to authenticated
using (
    (id = auth.uid())
);


create policy "Users can update their own profiles"
on "public"."profiles"
as PERMISSIVE
for UPDATE
to authenticated
using (
    (id = auth.uid())
) with check (
    (id = auth.uid())
);


create policy "Admin can update user profiles"
on "public"."profiles"
as PERMISSIVE
for UPDATE
to authenticated
using (
    is_admin()
) with check (
    is_admin()
);