-- Add additional performance indexes across all tables

-- Property analyses - composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_property_analyses_user_created ON public.property_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_analyses_user_updated ON public.property_analyses(user_id, updated_at DESC);

-- Property hero - for quick lookups by address
CREATE INDEX IF NOT EXISTS idx_property_hero_address ON public.property_hero(address);

-- Purchase motivation - for filtering by price ranges
CREATE INDEX IF NOT EXISTS idx_purchase_motivation_price ON public.purchase_motivation(purchase_price);
CREATE INDEX IF NOT EXISTS idx_purchase_motivation_location ON public.purchase_motivation(location);

-- Maintenance breakdown - for filtering by property characteristics
CREATE INDEX IF NOT EXISTS idx_maintenance_breakdown_bedrooms ON public.maintenance_breakdown(bedrooms);
CREATE INDEX IF NOT EXISTS idx_maintenance_breakdown_pool ON public.maintenance_breakdown(has_pool);

-- Revenue projections - for ADR analysis
CREATE INDEX IF NOT EXISTS idx_revenue_projections_adr ON public.revenue_projections(base_adr);
