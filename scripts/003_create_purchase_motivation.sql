-- Create purchase motivation table for financial data and investment goals
CREATE TABLE IF NOT EXISTS public.purchase_motivation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_analysis_id UUID NOT NULL REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  purchase_price NUMERIC(12,2),
  total_deposit NUMERIC(12,2),
  loan_amount NUMERIC(12,2),
  interest_rate NUMERIC(5,2),
  loan_term INTEGER,
  investment_goals TEXT[],
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_analysis_id)
);

-- Enable Row Level Security
ALTER TABLE public.purchase_motivation ENABLE ROW LEVEL SECURITY;

-- Create policies (access through property_analyses ownership)
CREATE POLICY "purchase_motivation_select_own"
  ON public.purchase_motivation FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = purchase_motivation.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "purchase_motivation_insert_own"
  ON public.purchase_motivation FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = purchase_motivation.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "purchase_motivation_update_own"
  ON public.purchase_motivation FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = purchase_motivation.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "purchase_motivation_delete_own"
  ON public.purchase_motivation FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = purchase_motivation.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_purchase_motivation_property_id ON public.purchase_motivation(property_analysis_id);
