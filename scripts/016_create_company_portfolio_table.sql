-- Create company_portfolio table with proper foreign keys
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
CREATE POLICY "Users can view their own company portfolio"
  ON public.company_portfolio FOR SELECT
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own company portfolio"
  ON public.company_portfolio FOR INSERT
  WITH CHECK (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own company portfolio"
  ON public.company_portfolio FOR UPDATE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own company portfolio"
  ON public.company_portfolio FOR DELETE
  USING (
    property_analysis_id IN (
      SELECT id FROM public.property_analyses WHERE user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_company_portfolio_analysis_id ON public.company_portfolio(property_analysis_id);

-- Create GIN index for portfolio_properties JSONB searches
CREATE INDEX IF NOT EXISTS idx_company_portfolio_properties ON public.company_portfolio USING GIN(portfolio_properties);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_company_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER company_portfolio_updated_at
  BEFORE UPDATE ON public.company_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_company_portfolio_updated_at();
