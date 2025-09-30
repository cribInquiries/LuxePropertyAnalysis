-- Create property_hero table to store hero section data
CREATE TABLE IF NOT EXISTS public.property_hero (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_analysis_id UUID NOT NULL REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  address TEXT NOT NULL,
  background_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.property_hero ENABLE ROW LEVEL SECURITY;

-- Create policies for CRUD operations
CREATE POLICY "Users can view their own property hero data"
  ON public.property_hero FOR SELECT
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own property hero data"
  ON public.property_hero FOR INSERT
  WITH CHECK (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own property hero data"
  ON public.property_hero FOR UPDATE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own property hero data"
  ON public.property_hero FOR DELETE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_hero_analysis_id ON public.property_hero(property_analysis_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_property_hero_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_hero_updated_at
  BEFORE UPDATE ON public.property_hero
  FOR EACH ROW
  EXECUTE FUNCTION update_property_hero_updated_at();
