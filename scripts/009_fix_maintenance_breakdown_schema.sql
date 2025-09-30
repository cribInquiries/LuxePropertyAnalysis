-- Update maintenance_breakdown table to match actual schema
ALTER TABLE public.maintenance_breakdown
ADD COLUMN IF NOT EXISTS property_class TEXT DEFAULT 'luxury';

-- Remove has_garden column if it exists (not in actual DB schema)
-- Note: Commenting this out to avoid data loss if column has data
-- ALTER TABLE public.maintenance_breakdown DROP COLUMN IF EXISTS has_garden;

-- Create index for property_class for filtering
CREATE INDEX IF NOT EXISTS idx_maintenance_breakdown_property_class ON public.maintenance_breakdown(property_class);
