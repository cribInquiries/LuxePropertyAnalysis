-- Create maintenance_breakdown table
CREATE TABLE IF NOT EXISTS public.maintenance_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_analysis_id UUID NOT NULL REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  total_area NUMERIC(10, 2) NOT NULL DEFAULT 250,
  bedrooms INTEGER NOT NULL DEFAULT 4,
  has_pool BOOLEAN NOT NULL DEFAULT true,
  has_garden BOOLEAN NOT NULL DEFAULT true,
  general_repair_rate NUMERIC(10, 2) NOT NULL DEFAULT 8,
  hvac_maintenance_rate NUMERIC(10, 2) NOT NULL DEFAULT 4,
  pool_chemicals_cost NUMERIC(10, 2) NOT NULL DEFAULT 1800,
  pool_equipment_maintenance NUMERIC(10, 2) NOT NULL DEFAULT 1200,
  garden_water_cost NUMERIC(10, 2) NOT NULL DEFAULT 800,
  landscaping_cost NUMERIC(10, 2) NOT NULL DEFAULT 2400,
  cleaning_cost_per_bedroom NUMERIC(10, 2) NOT NULL DEFAULT 45,
  linen_service_per_bedroom NUMERIC(10, 2) NOT NULL DEFAULT 35,
  operational_costs_per_stay NUMERIC(10, 2) NOT NULL DEFAULT 85,
  average_stays_per_year INTEGER NOT NULL DEFAULT 120,
  luxury_multiplier NUMERIC(10, 2) NOT NULL DEFAULT 1.3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_analysis_id)
);

-- Enable Row Level Security
ALTER TABLE public.maintenance_breakdown ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own maintenance breakdown"
  ON public.maintenance_breakdown FOR SELECT
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own maintenance breakdown"
  ON public.maintenance_breakdown FOR INSERT
  WITH CHECK (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own maintenance breakdown"
  ON public.maintenance_breakdown FOR UPDATE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own maintenance breakdown"
  ON public.maintenance_breakdown FOR DELETE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_maintenance_breakdown_analysis_id ON public.maintenance_breakdown(property_analysis_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_maintenance_breakdown_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintenance_breakdown_updated_at
  BEFORE UPDATE ON public.maintenance_breakdown
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_breakdown_updated_at();
