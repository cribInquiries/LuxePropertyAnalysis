// Database type definitions for Supabase tables

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface PropertyAnalysis {
  id: string
  user_id: string
  property_name: string
  client_name: string | null
  address: string | null
  background_image: string | null
  status: "draft" | "completed" | "archived"
  is_favorite: boolean
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PurchaseMotivation {
  id: string
  property_analysis_id: string
  purchase_price: number | null
  total_deposit: number | null
  loan_amount: number | null
  interest_rate: number | null
  loan_term: number | null
  investment_goals: string[] | null
  location: string | null
  created_at: string
  updated_at: string
}

export interface RevenueProjection {
  id: string
  property_analysis_id: string
  base_adr: number | null
  monthly_multipliers: Record<string, number> | null
  monthly_occupancy: Record<string, number> | null
  comparable_properties: Array<{
    name: string
    adr: number
    occupancy: number
  }> | null
  created_at: string
  updated_at: string
}

export interface MaintenanceBreakdown {
  id: string
  property_analysis_id: string
  total_area: number | null
  bedrooms: number | null
  has_pool: boolean
  property_class: "Standard" | "Luxury"
  general_repair_rate: number | null
  hvac_maintenance_rate: number | null
  luxury_multiplier: number | null
  cleaning_cost_per_bedroom: number | null
  linen_service_per_bedroom: number | null
  pool_chemicals_cost: number | null
  pool_equipment_maintenance: number | null
  garden_water_cost: number | null
  landscaping_cost: number | null
  operational_costs_per_stay: number | null
  average_stays_per_year: number | null
  created_at: string
  updated_at: string
}

export interface SetupCosts {
  id: string
  property_analysis_id: string
  renovation_items: Array<{
    category: string
    item: string
    cost: number
  }> | null
  furnishing_items: Array<{
    category: string
    item: string
    cost: number
  }> | null
  design_inspirations: Array<{
    title: string
    image_url: string
    description: string
  }> | null
  created_at: string
  updated_at: string
}

export interface ValueMaximization {
  id: string
  property_analysis_id: string
  value_addons: Array<{
    category: string
    item: string
    cost: number
    revenue_impact: number
  }> | null
  created_at: string
  updated_at: string
}

export interface CompanyPortfolio {
  id: string
  property_analysis_id: string
  portfolio_properties: Array<{
    name: string
    location: string
    image_url: string
    description: string
  }> | null
  created_at: string
  updated_at: string
}
