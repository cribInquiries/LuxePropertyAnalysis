-- Create purchase_motivation table
CREATE TABLE IF NOT EXISTS public.purchase_motivation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_analysis_id UUID NOT NULL REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  investment_goals TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  location TEXT NOT NULL DEFAULT 'Adelaide Hills, SA',
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 850000,
  total_deposit NUMERIC(12, 2) NOT NULL DEFAULT 170000,
  loan_amount NUMERIC(12, 2) NOT NULL DEFAULT 680000,
  interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 6.5,
  loan_term INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_analysis_id)
);

-- Enable Row Level Security
ALTER TABLE public.purchase_motivation ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own purchase motivation"
  ON public.purchase_motivation FOR SELECT
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own purchase motivation"
  ON public.purchase_motivation FOR INSERT
  WITH CHECK (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own purchase motivation"
  ON public.purchase_motivation FOR UPDATE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own purchase motivation"
  ON public.purchase_motivation FOR DELETE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_purchase_motivation_analysis_id ON public.purchase_motivation(property_analysis_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_purchase_motivation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchase_motivation_updated_at
  BEFORE UPDATE ON public.purchase_motivation
  FOR EACH ROW
  EXECUTE FUNCTION update_purchase_motivation_updated_at();
