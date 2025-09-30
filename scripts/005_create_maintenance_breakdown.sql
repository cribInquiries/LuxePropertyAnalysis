-- Create maintenance breakdown table
CREATE TABLE IF NOT EXISTS public.maintenance_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_analysis_id UUID NOT NULL REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  total_area NUMERIC(10,2),
  bedrooms INTEGER,
  has_pool BOOLEAN DEFAULT false,
  property_class TEXT DEFAULT 'Standard' CHECK (property_class IN ('Standard', 'Luxury')),
  general_repair_rate NUMERIC(10,2),
  hvac_maintenance_rate NUMERIC(10,2),
  luxury_multiplier NUMERIC(5,2),
  cleaning_cost_per_bedroom NUMERIC(10,2),
  linen_service_per_bedroom NUMERIC(10,2),
  pool_chemicals_cost NUMERIC(10,2),
  pool_equipment_maintenance NUMERIC(10,2),
  garden_water_cost NUMERIC(10,2),
  landscaping_cost NUMERIC(10,2),
  operational_costs_per_stay NUMERIC(10,2),
  average_stays_per_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_analysis_id)
);

-- Enable Row Level Security
ALTER TABLE public.maintenance_breakdown ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "maintenance_breakdown_select_own"
  ON public.maintenance_breakdown FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = maintenance_breakdown.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "maintenance_breakdown_insert_own"
  ON public.maintenance_breakdown FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = maintenance_breakdown.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "maintenance_breakdown_update_own"
  ON public.maintenance_breakdown FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = maintenance_breakdown.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "maintenance_breakdown_delete_own"
  ON public.maintenance_breakdown FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = maintenance_breakdown.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_maintenance_breakdown_property_id ON public.maintenance_breakdown(property_analysis_id);
