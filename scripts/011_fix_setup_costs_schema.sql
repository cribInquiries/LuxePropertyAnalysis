-- Update setup_costs table to match actual schema
-- Rename setup_items to match actual column names
ALTER TABLE public.setup_costs
ADD COLUMN IF NOT EXISTS furnishing_items JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS renovation_items JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS design_inspirations JSONB DEFAULT '[]';

-- Migrate data from setup_items if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'setup_costs' 
    AND column_name = 'setup_items'
  ) THEN
    -- Migrate existing data
    UPDATE public.setup_costs
    SET furnishing_items = setup_items
    WHERE setup_items IS NOT NULL AND setup_items != '[]'::jsonb;
    
    -- Drop old column
    ALTER TABLE public.setup_costs DROP COLUMN setup_items;
  END IF;
END $$;

-- Create GIN indexes for JSONB searches
CREATE INDEX IF NOT EXISTS idx_setup_costs_furnishing ON public.setup_costs USING GIN(furnishing_items);
CREATE INDEX IF NOT EXISTS idx_setup_costs_renovation ON public.setup_costs USING GIN(renovation_items);
CREATE INDEX IF NOT EXISTS idx_setup_costs_design ON public.setup_costs USING GIN(design_inspirations);
