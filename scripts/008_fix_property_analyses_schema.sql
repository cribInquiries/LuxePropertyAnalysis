-- Update property_analyses table to match actual schema
ALTER TABLE public.property_analyses
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS analysis_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Drop the old property_name column if it exists and wasn't being used
-- (keeping it for now to avoid data loss, but noting the inconsistency)

-- Create index for favorite properties
CREATE INDEX IF NOT EXISTS idx_property_analyses_is_favorite ON public.property_analyses(user_id, is_favorite) WHERE is_favorite = true;

-- Create index for status
CREATE INDEX IF NOT EXISTS idx_property_analyses_status ON public.property_analyses(user_id, status);

-- Create GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_property_analyses_tags ON public.property_analyses USING GIN(tags);
