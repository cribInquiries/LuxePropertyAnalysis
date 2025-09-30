-- Enable Row Level Security on all tables
ALTER TABLE property_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_motivation ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_maximization ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_portfolio ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own property analyses" ON property_analyses;
DROP POLICY IF EXISTS "Users can insert their own property analyses" ON property_analyses;
DROP POLICY IF EXISTS "Users can update their own property analyses" ON property_analyses;
DROP POLICY IF EXISTS "Users can delete their own property analyses" ON property_analyses;

DROP POLICY IF EXISTS "Users can view their own property hero" ON property_hero;
DROP POLICY IF EXISTS "Users can insert their own property hero" ON property_hero;
DROP POLICY IF EXISTS "Users can update their own property hero" ON property_hero;
DROP POLICY IF EXISTS "Users can delete their own property hero" ON property_hero;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own revenue projections" ON revenue_projections;
DROP POLICY IF EXISTS "Users can insert their own revenue projections" ON revenue_projections;
DROP POLICY IF EXISTS "Users can update their own revenue projections" ON revenue_projections;
DROP POLICY IF EXISTS "Users can delete their own revenue projections" ON revenue_projections;

DROP POLICY IF EXISTS "Users can view their own maintenance breakdown" ON maintenance_breakdown;
DROP POLICY IF EXISTS "Users can insert their own maintenance breakdown" ON maintenance_breakdown;
DROP POLICY IF EXISTS "Users can update their own maintenance breakdown" ON maintenance_breakdown;
DROP POLICY IF EXISTS "Users can delete their own maintenance breakdown" ON maintenance_breakdown;

DROP POLICY IF EXISTS "Users can view their own purchase motivation" ON purchase_motivation;
DROP POLICY IF EXISTS "Users can insert their own purchase motivation" ON purchase_motivation;
DROP POLICY IF EXISTS "Users can update their own purchase motivation" ON purchase_motivation;
DROP POLICY IF EXISTS "Users can delete their own purchase motivation" ON purchase_motivation;

DROP POLICY IF EXISTS "Users can view their own setup costs" ON setup_costs;
DROP POLICY IF EXISTS "Users can insert their own setup costs" ON setup_costs;
DROP POLICY IF EXISTS "Users can update their own setup costs" ON setup_costs;
DROP POLICY IF EXISTS "Users can delete their own setup costs" ON setup_costs;

DROP POLICY IF EXISTS "Users can view their own value maximization" ON value_maximization;
DROP POLICY IF EXISTS "Users can insert their own value maximization" ON value_maximization;
DROP POLICY IF EXISTS "Users can update their own value maximization" ON value_maximization;
DROP POLICY IF EXISTS "Users can delete their own value maximization" ON value_maximization;

DROP POLICY IF EXISTS "Users can view their own saved properties" ON saved_properties;
DROP POLICY IF EXISTS "Users can insert their own saved properties" ON saved_properties;
DROP POLICY IF EXISTS "Users can update their own saved properties" ON saved_properties;
DROP POLICY IF EXISTS "Users can delete their own saved properties" ON saved_properties;

DROP POLICY IF EXISTS "Users can view their own activity log" ON user_activity_log;
DROP POLICY IF EXISTS "Users can insert their own activity log" ON user_activity_log;

DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

DROP POLICY IF EXISTS "Users can view their own company portfolio" ON company_portfolio;
DROP POLICY IF EXISTS "Users can insert their own company portfolio" ON company_portfolio;
DROP POLICY IF EXISTS "Users can update their own company portfolio" ON company_portfolio;
DROP POLICY IF EXISTS "Users can delete their own company portfolio" ON company_portfolio;

-- Property Analyses Policies
CREATE POLICY "Users can view their own property analyses"
  ON property_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own property analyses"
  ON property_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property analyses"
  ON property_analyses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own property analyses"
  ON property_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Property Hero Policies
CREATE POLICY "Users can view their own property hero"
  ON property_hero FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can insert their own property hero"
  ON property_hero FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can update their own property hero"
  ON property_hero FOR UPDATE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can delete their own property hero"
  ON property_hero FOR DELETE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Revenue Projections Policies
CREATE POLICY "Users can view their own revenue projections"
  ON revenue_projections FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can insert their own revenue projections"
  ON revenue_projections FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can update their own revenue projections"
  ON revenue_projections FOR UPDATE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can delete their own revenue projections"
  ON revenue_projections FOR DELETE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

-- Maintenance Breakdown Policies
CREATE POLICY "Users can view their own maintenance breakdown"
  ON maintenance_breakdown FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can insert their own maintenance breakdown"
  ON maintenance_breakdown FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can update their own maintenance breakdown"
  ON maintenance_breakdown FOR UPDATE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can delete their own maintenance breakdown"
  ON maintenance_breakdown FOR DELETE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

-- Purchase Motivation Policies
CREATE POLICY "Users can view their own purchase motivation"
  ON purchase_motivation FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can insert their own purchase motivation"
  ON purchase_motivation FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can update their own purchase motivation"
  ON purchase_motivation FOR UPDATE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can delete their own purchase motivation"
  ON purchase_motivation FOR DELETE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

-- Setup Costs Policies
CREATE POLICY "Users can view their own setup costs"
  ON setup_costs FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can insert their own setup costs"
  ON setup_costs FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can update their own setup costs"
  ON setup_costs FOR UPDATE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can delete their own setup costs"
  ON setup_costs FOR DELETE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

-- Value Maximization Policies
CREATE POLICY "Users can view their own value maximization"
  ON value_maximization FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can insert their own value maximization"
  ON value_maximization FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can update their own value maximization"
  ON value_maximization FOR UPDATE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can delete their own value maximization"
  ON value_maximization FOR DELETE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

-- Saved Properties Policies
CREATE POLICY "Users can view their own saved properties"
  ON saved_properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved properties"
  ON saved_properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved properties"
  ON saved_properties FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved properties"
  ON saved_properties FOR DELETE
  USING (auth.uid() = user_id);

-- User Activity Log Policies
CREATE POLICY "Users can view their own activity log"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity log"
  ON user_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Settings Policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Company Portfolio Policies
CREATE POLICY "Users can view their own company portfolio"
  ON company_portfolio FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can insert their own company portfolio"
  ON company_portfolio FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can update their own company portfolio"
  ON company_portfolio FOR UPDATE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );

CREATE POLICY "Users can delete their own company portfolio"
  ON company_portfolio FOR DELETE
  USING (
    auth.uid() = (
      SELECT user_id FROM property_analyses WHERE id = property_analysis_id
    )
  );
