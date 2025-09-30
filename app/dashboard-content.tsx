"use client"

import dynamic from "next/dynamic"

const PropertyHero = dynamic(
  () => import("@/components/property-hero").then((mod) => ({ default: mod.PropertyHero })),
  { ssr: false },
)
const AnalysisOverview = dynamic(
  () => import("@/components/analysis-overview").then((mod) => ({ default: mod.AnalysisOverview })),
  { ssr: false },
)
const PurchaseMotivation = dynamic(
  () => import("@/components/purchase-motivation").then((mod) => ({ default: mod.PurchaseMotivation })),
  { ssr: false },
)
const RevenueProjections = dynamic(
  () => import("@/components/revenue-projections").then((mod) => ({ default: mod.RevenueProjections })),
  { ssr: false },
)
const MaintenanceBreakdown = dynamic(
  () => import("@/components/maintenance-breakdown").then((mod) => ({ default: mod.MaintenanceBreakdown })),
  { ssr: false },
)
const SetupCosts = dynamic(() => import("@/components/setup-costs").then((mod) => ({ default: mod.SetupCosts })), {
  ssr: false,
})
const ValueMaximization = dynamic(
  () => import("@/components/value-maximization").then((mod) => ({ default: mod.ValueMaximization })),
  { ssr: false },
)
const CompanyPortfolio = dynamic(
  () => import("@/components/company-portfolio").then((mod) => ({ default: mod.CompanyPortfolio })),
  { ssr: false },
)
const ContactSection = dynamic(
  () => import("@/components/contact-section").then((mod) => ({ default: mod.ContactSection })),
  { ssr: false },
)
const AnalyticsDashboard = dynamic(
  () => import("@/components/analytics-dashboard").then((mod) => ({ default: mod.AnalyticsDashboard })),
  { ssr: false },
)

interface DashboardContentProps {
  propertyAnalysisId: string
}

export function DashboardContent({ propertyAnalysisId }: DashboardContentProps) {
  return (
    <main className="min-h-screen md:ml-64">
      <PropertyHero propertyAnalysisId={propertyAnalysisId} />

      <AnalysisOverview />

      <PurchaseMotivation propertyAnalysisId={propertyAnalysisId} />

      <div id="revenue">
        <RevenueProjections />
      </div>

      <div id="maintenance">
        <MaintenanceBreakdown />
      </div>

      <div id="setup">
        <SetupCosts />
      </div>

      <div id="value">
        <ValueMaximization />
      </div>

      <div id="portfolio">
        <CompanyPortfolio />
      </div>

      <AnalyticsDashboard />

      <ContactSection />
    </main>
  )
}
