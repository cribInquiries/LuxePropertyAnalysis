-- Initialize the complete database schema for the Airbnb property analysis app
-- This script creates all necessary tables with proper RLS policies

-- 1. Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- 2. Create property_analyses table
CREATE TABLE IF NOT EXISTS public.property_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  purchase_price NUMERIC(12,2),
  analysis_data JSONB DEFAULT '{}',
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on property_analyses
ALTER TABLE public.property_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for property_analyses
DROP POLICY IF EXISTS "property_analyses_select_own" ON public.property_analyses;
DROP POLICY IF EXISTS "property_analyses_insert_own" ON public.property_analyses;
DROP POLICY IF EXISTS "property_analyses_update_own" ON public.property_analyses;
DROP POLICY IF EXISTS "property_analyses_delete_own" ON public.property_analyses;

CREATE POLICY "property_analyses_select_own" ON public.property_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "property_analyses_insert_own" ON public.property_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "property_analyses_update_own" ON public.property_analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "property_analyses_delete_own" ON public.property_analyses FOR DELETE USING (auth.uid() = user_id);

-- 3. Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  currency VARCHAR(3) DEFAULT 'USD',
  language VARCHAR(5) DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  analysis_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
DROP POLICY IF EXISTS "user_settings_select_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_insert_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_update_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_delete_own" ON public.user_settings;

CREATE POLICY "user_settings_select_own" ON public.user_settings FOR SELECT USING (auth.uid() = id);
CREATE POLICY "user_settings_insert_own" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "user_settings_update_own" ON public.user_settings FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "user_settings_delete_own" ON public.user_settings FOR DELETE USING (auth.uid() = id);

-- 4. Create user_activity_log table
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_activity_log
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_activity_log
DROP POLICY IF EXISTS "user_activity_log_select_own" ON public.user_activity_log;
DROP POLICY IF EXISTS "user_activity_log_insert_own" ON public.user_activity_log;

CREATE POLICY "user_activity_log_select_own" ON public.user_activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_activity_log_insert_own" ON public.user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create saved_properties table
CREATE TABLE IF NOT EXISTS public.saved_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  property_address TEXT,
  property_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on saved_properties
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_properties
DROP POLICY IF EXISTS "saved_properties_select_own" ON public.saved_properties;
DROP POLICY IF EXISTS "saved_properties_insert_own" ON public.saved_properties;
DROP POLICY IF EXISTS "saved_properties_update_own" ON public.saved_properties;
DROP POLICY IF EXISTS "saved_properties_delete_own" ON public.saved_properties;

CREATE POLICY "saved_properties_select_own" ON public.saved_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_properties_insert_own" ON public.saved_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_properties_update_own" ON public.saved_properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "saved_properties_delete_own" ON public.saved_properties FOR DELETE USING (auth.uid() = user_id);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_analyses_user_id ON public.property_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_property_analyses_created_at ON public.property_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_properties_user_id ON public.saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_created_at ON public.saved_properties(created_at DESC);

-- 7. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_property_analyses_updated_at ON public.property_analyses;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_analyses_updated_at
  BEFORE UPDATE ON public.property_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default user settings
  INSERT INTO public.user_settings (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 10. Create trigger to automatically create profile and settings on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 11. Create storage bucket for property images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- 12. Create storage policies for property images
DROP POLICY IF EXISTS "property_images_select" ON storage.objects;
DROP POLICY IF EXISTS "property_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "property_images_update" ON storage.objects;
DROP POLICY IF EXISTS "property_images_delete" ON storage.objects;

CREATE POLICY "property_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "property_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "property_images_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "property_images_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');
