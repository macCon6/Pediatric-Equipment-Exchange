-- Create storage buckets

insert into storage.buckets (id, name, public)
values 
('equipment-images', 'equipment-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values 
('waiver-templates', 'waiver-templates', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values 
('signed-waivers', 'signed-waivers', true)
on conflict (id) do nothing;



/* -- Create policies for buckets 

CREATE POLICY "Authenticated with role can upload equipment images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'equipment-images'
  AND (public.is_admin() OR public.is_therapist() OR public.is_volunteer())
);

CREATE POLICY "Admins can delete equipment images"
ON storage.objects
TO authenticated
FOR DELETE
USING (
  bucket_id = 'equipment-images'
  AND public.is_admin()
);

CREATE POLICY "Admins can upload waiver templates"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'waiver-templates'
  AND public.is_admin()
);

CREATE POLICY "Admins can delete waiver templates"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'waiver-templates'
  AND public.is_admin()
);

CREATE POLICY "Admins and therapists can upload signed waivers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'signed-waivers'
  AND (public.is_admin() OR public.is_therapist())
);


CREATE POLICY "Admins can delete signed waivers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'signed-waivers'
  AND public.is_admin()
); */