-- Create value maximization table
CREATE TABLE IF NOT EXISTS public.value_maximization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_analysis_id UUID NOT NULL REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  value_addons JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_analysis_id)
);

-- Enable Row Level Security
ALTER TABLE public.value_maximization ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "value_maximization_select_own"
  ON public.value_maximization FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = value_maximization.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "value_maximization_insert_own"
  ON public.value_maximization FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = value_maximization.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "value_maximization_update_own"
  ON public.value_maximization FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = value_maximization.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "value_maximization_delete_own"
  ON public.value_maximization FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = value_maximization.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_value_maximization_property_id ON public.value_maximization(property_analysis_id);
