-- Create property images table for storing image metadata
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_analysis_id UUID REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  upload_status VARCHAR(20) DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "property_images_select_own" ON public.property_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "property_images_insert_own" ON public.property_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "property_images_update_own" ON public.property_images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "property_images_delete_own" ON public.property_images
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_property_images_updated_at
  BEFORE UPDATE ON public.property_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_property_images_user_id ON public.property_images(user_id);
CREATE INDEX idx_property_images_property_analysis_id ON public.property_images(property_analysis_id);
