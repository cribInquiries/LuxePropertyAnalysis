-- Create property analyses table for storing user's property analysis data
create table if not exists public.property_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Updated to match hook expectations with address, notes, favorites, tags, status
  address text not null,
  purchase_price numeric(12,2),
  analysis_data jsonb default '{}',
  notes text,
  is_favorite boolean default false,
  tags text[] default '{}',
  status text default 'draft' check (status in ('draft', 'completed', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.property_analyses enable row level security;

-- Create policies for property_analyses table
create policy "property_analyses_select_own"
  on public.property_analyses for select
  using (auth.uid() = user_id);

create policy "property_analyses_insert_own"
  on public.property_analyses for insert
  with check (auth.uid() = user_id);

create policy "property_analyses_update_own"
  on public.property_analyses for update
  using (auth.uid() = user_id);

create policy "property_analyses_delete_own"
  on public.property_analyses for delete
  using (auth.uid() = user_id);

-- Create index for better query performance
create index if not exists property_analyses_user_id_idx on public.property_analyses(user_id);
create index if not exists property_analyses_created_at_idx on public.property_analyses(created_at desc);

-- Added trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_analyses_updated_at
  BEFORE UPDATE ON public.property_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
