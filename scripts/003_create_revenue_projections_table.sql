-- Create revenue_projections table
CREATE TABLE IF NOT EXISTS public.revenue_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_analysis_id UUID NOT NULL REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  base_adr NUMERIC(10, 2) NOT NULL DEFAULT 350,
  monthly_occupancy JSONB NOT NULL DEFAULT '{}',
  monthly_multipliers JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_analysis_id)
);

-- Enable Row Level Security
ALTER TABLE public.revenue_projections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own revenue projections"
  ON public.revenue_projections FOR SELECT
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own revenue projections"
  ON public.revenue_projections FOR INSERT
  WITH CHECK (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own revenue projections"
  ON public.revenue_projections FOR UPDATE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own revenue projections"
  ON public.revenue_projections FOR DELETE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_revenue_projections_analysis_id ON public.revenue_projections(property_analysis_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_revenue_projections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER revenue_projections_updated_at
  BEFORE UPDATE ON public.revenue_projections
  FOR EACH ROW
  EXECUTE FUNCTION update_revenue_projections_updated_at();
