-- Create company portfolio table
CREATE TABLE IF NOT EXISTS public.company_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_analysis_id UUID NOT NULL REFERENCES public.property_analyses(id) ON DELETE CASCADE,
  portfolio_properties JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_analysis_id)
);

-- Enable Row Level Security
ALTER TABLE public.company_portfolio ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "company_portfolio_select_own"
  ON public.company_portfolio FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = company_portfolio.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "company_portfolio_insert_own"
  ON public.company_portfolio FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = company_portfolio.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "company_portfolio_update_own"
  ON public.company_portfolio FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = company_portfolio.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "company_portfolio_delete_own"
  ON public.company_portfolio FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.property_analyses
      WHERE property_analyses.id = company_portfolio.property_analysis_id
      AND property_analyses.user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_company_portfolio_property_id ON public.company_portfolio(property_analysis_id);
