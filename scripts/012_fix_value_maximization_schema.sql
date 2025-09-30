-- Update value_maximization table to match actual schema
ALTER TABLE public.value_maximization
ADD COLUMN IF NOT EXISTS value_addons JSONB DEFAULT '[]';

-- Migrate data from strategies if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'value_maximization' 
    AND column_name = 'strategies'
  ) THEN
    -- Migrate existing data
    UPDATE public.value_maximization
    SET value_addons = strategies
    WHERE strategies IS NOT NULL AND strategies != '[]'::jsonb;
    
    -- Drop old column
    ALTER TABLE public.value_maximization DROP COLUMN strategies;
  END IF;
END $$;

-- Create GIN index for value_addons JSONB searches
CREATE INDEX IF NOT EXISTS idx_value_maximization_addons ON public.value_maximization USING GIN(value_addons);
