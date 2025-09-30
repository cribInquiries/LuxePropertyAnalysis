-- Create revenue projections table
CREATE TABLE IF NOT EXISTS public.revenue_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_analysis_id UUID NOT NULL REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  base_adr NUMERIC(10,2),
  monthly_multipliers JSONB DEFAULT '{}',
  monthly_occupancy JSONB DEFAULT '{}',
  comparable_properties JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_analysis_id)
);

-- Enable Row Level Security
ALTER TABLE public.revenue_projections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "revenue_projections_select_own"
  ON public.revenue_projections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = revenue_projections.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "revenue_projections_insert_own"
  ON public.revenue_projections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = revenue_projections.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "revenue_projections_update_own"
  ON public.revenue_projections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = revenue_projections.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "revenue_projections_delete_own"
  ON public.revenue_projections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = revenue_projections.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_revenue_projections_property_id ON public.revenue_projections(property_analysis_id);
