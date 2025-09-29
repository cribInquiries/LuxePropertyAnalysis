import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PropertyHero } from "@/components/property-hero"
import { AnalysisOverview } from "@/components/analysis-overview"
import { PurchaseMotivation } from "@/components/purchase-motivation"
import { RevenueProjections } from "@/components/revenue-projections"
import { MaintenanceBreakdown } from "@/components/maintenance-breakdown"
import { SetupCosts } from "@/components/setup-costs"
import { ValueMaximization } from "@/components/value-maximization"
import { CompanyPortfolio } from "@/components/company-portfolio"
import { ContactSection } from "@/components/contact-section"
import { UserNav } from "@/components/user-nav"

export default async function PropertyAnalysisPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const user = {
    id: data.user.id,
    email: data.user.email || "",
    name: profile?.display_name || data.user.email?.split("@")[0] || "",
  }

  return (
    <main className="min-h-screen">
      <UserNav user={user} />

      <PropertyHero />
      <AnalysisOverview />
      <PurchaseMotivation />
      <RevenueProjections />
      <MaintenanceBreakdown />
      <SetupCosts />
      <ValueMaximization />
      <CompanyPortfolio />
      <ContactSection />
    </main>
  )
}
