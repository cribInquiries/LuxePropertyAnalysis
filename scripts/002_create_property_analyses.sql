-- Create main property analyses table
CREATE TABLE IF NOT EXISTS public.property_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  client_name TEXT,
  address TEXT,
  background_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.property_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "property_analyses_select_own"
  ON public.property_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "property_analyses_insert_own"
  ON public.property_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "property_analyses_update_own"
  ON public.property_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "property_analyses_delete_own"
  ON public.property_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_property_analyses_user_id ON public.property_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_property_analyses_created_at ON public.property_analyses(created_at DESC);
