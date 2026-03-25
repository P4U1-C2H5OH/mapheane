-- Allow anyone to upload payment proofs (checkout is pre-auth)
create policy "Anyone can upload payment proof"
  on storage.objects for insert
  with check (bucket_id = 'payment-proofs');

-- Only admin can view payment proofs
create policy "Admin can view payment proofs"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
