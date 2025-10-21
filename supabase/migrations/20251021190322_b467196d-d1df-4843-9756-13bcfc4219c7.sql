-- Add user_id to products table to link products to users
alter table public.products
add column user_id uuid references auth.users(id) on delete cascade;

-- Add status column to products
alter table public.products
add column status text default 'active' check (status in ('active', 'blocked'));

-- Add support fields
alter table public.products
add column support_name text,
add column support_email text;

-- Update RLS policies for products to be user-specific
drop policy if exists "Enable read access for all users" on public.products;
drop policy if exists "Enable insert for all users" on public.products;
drop policy if exists "Enable update for all users" on public.products;
drop policy if exists "Enable delete for all users" on public.products;

-- Create new RLS policies for products
create policy "Users can view their own products"
  on public.products
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own products"
  on public.products
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own products"
  on public.products
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own products"
  on public.products
  for delete
  using (auth.uid() = user_id);

-- Create storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage policies for product images
create policy "Users can view product images"
  on storage.objects
  for select
  using (bucket_id = 'product-images');

create policy "Users can upload their own product images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'product-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own product images"
  on storage.objects
  for update
  using (
    bucket_id = 'product-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own product images"
  on storage.objects
  for delete
  using (
    bucket_id = 'product-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );