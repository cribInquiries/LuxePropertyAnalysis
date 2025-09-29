-- Create saved properties table for users to bookmark properties
create table if not exists public.saved_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_name text not null,
  property_address text,
  property_url text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.saved_properties enable row level security;

-- Create policies for saved_properties table
create policy "saved_properties_select_own"
  on public.saved_properties for select
  using (auth.uid() = user_id);

create policy "saved_properties_insert_own"
  on public.saved_properties for insert
  with check (auth.uid() = user_id);

create policy "saved_properties_update_own"
  on public.saved_properties for update
  using (auth.uid() = user_id);

create policy "saved_properties_delete_own"
  on public.saved_properties for delete
  using (auth.uid() = user_id);

-- Create index for better query performance
create index if not exists saved_properties_user_id_idx on public.saved_properties(user_id);
create index if not exists saved_properties_created_at_idx on public.saved_properties(created_at desc);
