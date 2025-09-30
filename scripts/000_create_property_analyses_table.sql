-- Create property_analyses table as the parent table for all analysis data
CREATE TABLE IF NOT EXISTS public.property_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL DEFAULT 'My Property Analysis',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.property_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own property analyses"
  ON public.property_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own property analyses"
  ON public.property_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property analyses"
  ON public.property_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own property analyses"
  ON public.property_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_analyses_user_id ON public.property_analyses(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_property_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_analyses_updated_at
  BEFORE UPDATE ON public.property_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_property_analyses_updated_at();
