-- Create value_maximization table
CREATE TABLE IF NOT EXISTS public.value_maximization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_analysis_id UUID NOT NULL REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  strategies JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_analysis_id)
);

-- Enable Row Level Security
ALTER TABLE public.value_maximization ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own value maximization"
  ON public.value_maximization FOR SELECT
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own value maximization"
  ON public.value_maximization FOR INSERT
  WITH CHECK (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own value maximization"
  ON public.value_maximization FOR UPDATE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own value maximization"
  ON public.value_maximization FOR DELETE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_value_maximization_analysis_id ON public.value_maximization(property_analysis_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_value_maximization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER value_maximization_updated_at
  BEFORE UPDATE ON public.value_maximization
  FOR EACH ROW
  EXECUTE FUNCTION update_value_maximization_updated_at();
