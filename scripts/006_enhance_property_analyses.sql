-- Enhance the existing property_analyses table with additional fields
ALTER TABLE public.property_analyses 
ADD COLUMN IF NOT EXISTS analysis_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create updated_at trigger for property_analyses if it doesn't exist
CREATE TRIGGER update_property_analyses_updated_at
  BEFORE UPDATE ON public.property_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_analyses_user_id ON public.property_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_property_analyses_is_favorite ON public.property_analyses(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_property_analyses_status ON public.property_analyses(user_id, status);
CREATE INDEX IF NOT EXISTS idx_property_analyses_created_at ON public.property_analyses(user_id, created_at DESC);
