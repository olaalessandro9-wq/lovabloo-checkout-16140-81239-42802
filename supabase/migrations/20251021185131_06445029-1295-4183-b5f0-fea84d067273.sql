-- Create enum for user roles
create type public.app_role as enum ('admin', 'user');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert profile
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  
  -- Assign default 'user' role
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$$;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- RLS Policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

create policy "Only admins can manage roles"
  on public.user_roles
  for all
  using (public.has_role(auth.uid(), 'admin'));

-- Update trigger for profiles
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();