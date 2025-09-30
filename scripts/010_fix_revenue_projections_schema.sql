-- Update revenue_projections table to match actual schema
ALTER TABLE public.revenue_projections
ADD COLUMN IF NOT EXISTS comparable_properties JSONB DEFAULT '[]';

-- Create GIN index for comparable_properties JSONB searches
CREATE INDEX IF NOT EXISTS idx_revenue_projections_comparable ON public.revenue_projections USING GIN(comparable_properties);
