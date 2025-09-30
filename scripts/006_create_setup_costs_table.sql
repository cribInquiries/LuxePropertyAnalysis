-- Create setup_costs table
CREATE TABLE IF NOT EXISTS public.setup_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_analysis_id UUID NOT NULL REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  setup_items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_analysis_id)
);

-- Enable Row Level Security
ALTER TABLE public.setup_costs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own setup costs"
  ON public.setup_costs FOR SELECT
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own setup costs"
  ON public.setup_costs FOR INSERT
  WITH CHECK (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own setup costs"
  ON public.setup_costs FOR UPDATE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own setup costs"
  ON public.setup_costs FOR DELETE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_setup_costs_analysis_id ON public.setup_costs(property_analysis_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_setup_costs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER setup_costs_updated_at
  BEFORE UPDATE ON public.setup_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_setup_costs_updated_at();
