import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardContent } from "./dashboard-content"

export default async function PropertyAnalysisPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get or create property analysis for this user
  let propertyAnalysisId: string

  const { data: existingAnalysis } = await supabase
    .from("property_analyses")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (existingAnalysis) {
    propertyAnalysisId = existingAnalysis.id
  } else {
    const { data: newAnalysis, error } = await supabase
      .from("property_analyses")
      .insert({
        user_id: user.id,
        property_name: "My Property Analysis",
      })
      .select("id")
      .single()

    if (error || !newAnalysis) {
      throw new Error("Failed to create property analysis")
    }

    propertyAnalysisId = newAnalysis.id
  }

  return (
    <>
      <DashboardNav />
      <DashboardContent propertyAnalysisId={propertyAnalysisId} />
    </>
  )
}
