-- Create setup costs table
CREATE TABLE IF NOT EXISTS public.setup_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_analysis_id UUID NOT NULL REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  renovation_items JSONB DEFAULT '[]',
  furnishing_items JSONB DEFAULT '[]',
  design_inspirations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_analysis_id)
);

-- Enable Row Level Security
ALTER TABLE public.setup_costs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "setup_costs_select_own"
  ON public.setup_costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = setup_costs.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "setup_costs_insert_own"
  ON public.setup_costs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = setup_costs.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "setup_costs_update_own"
  ON public.setup_costs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = setup_costs.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "setup_costs_delete_own"
  ON public.setup_costs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = setup_costs.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_setup_costs_property_id ON public.setup_costs(property_analysis_id);
