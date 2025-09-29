"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

export interface PropertyAnalysis {
  id: string
  user_id: string
  address: string
  purchase_price: number
  analysis_data: Record<string, any>
  notes?: string
  is_favorite: boolean
  tags: string[]
  status: "draft" | "completed" | "archived"
  created_at: string
  updated_at: string
}

export interface CreatePropertyAnalysisData {
  address: string
  purchase_price: number
  analysis_data?: Record<string, any>
  notes?: string
  tags?: string[]
  status?: "draft" | "completed"
}

export function usePropertyAnalysis() {
  const [analyses, setAnalyses] = useState<PropertyAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const supabase = mounted ? createClient() : null

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadAnalyses = async () => {
    if (!mounted || !supabase) return

    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("User not authenticated")
        return
      }

      const { data, error: fetchError } = await supabase
        .from("property_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setAnalyses(data || [])
    } catch (err) {
      console.error("Error loading analyses:", err)
      setError(err instanceof Error ? err.message : "Failed to load analyses")
    } finally {
      setLoading(false)
    }
  }

  const createAnalysis = async (data: CreatePropertyAnalysisData): Promise<PropertyAnalysis | null> => {
    if (!supabase) return null

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      const { data: newAnalysis, error } = await supabase
        .from("property_analyses")
        .insert({
          user_id: user.id,
          address: data.address,
          purchase_price: data.purchase_price,
          analysis_data: data.analysis_data || {},
          notes: data.notes,
          tags: data.tags || [],
          status: data.status || "draft",
        })
        .select()
        .single()

      if (error) throw error

      setAnalyses((prev) => [newAnalysis, ...prev])

      // Log activity
      await logActivity("create_analysis", "property_analysis", newAnalysis.id)

      toast({
        title: "Analysis created",
        description: "Property analysis saved successfully",
      })

      return newAnalysis
    } catch (err) {
      console.error("Error creating analysis:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create analysis"
      setError(errorMessage)
      toast({
        title: "Creation failed",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }

  const updateAnalysis = async (id: string, updates: Partial<PropertyAnalysis>): Promise<PropertyAnalysis | null> => {
    if (!supabase) return null

    try {
      const { data: updatedAnalysis, error } = await supabase
        .from("property_analyses")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      setAnalyses((prev) => prev.map((analysis) => (analysis.id === id ? updatedAnalysis : analysis)))

      // Log activity
      await logActivity("update_analysis", "property_analysis", id)

      toast({
        title: "Analysis updated",
        description: "Changes saved successfully",
      })

      return updatedAnalysis
    } catch (err) {
      console.error("Error updating analysis:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update analysis"
      setError(errorMessage)
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }

  const deleteAnalysis = async (id: string): Promise<boolean> => {
    if (!supabase) return false

    try {
      const { error } = await supabase.from("property_analyses").delete().eq("id", id)

      if (error) throw error

      setAnalyses((prev) => prev.filter((analysis) => analysis.id !== id))

      // Log activity
      await logActivity("delete_analysis", "property_analysis", id)

      toast({
        title: "Analysis deleted",
        description: "Property analysis removed successfully",
      })

      return true
    } catch (err) {
      console.error("Error deleting analysis:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete analysis"
      setError(errorMessage)
      toast({
        title: "Deletion failed",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }

  const toggleFavorite = async (id: string): Promise<boolean> => {
    if (!supabase) return false

    try {
      const analysis = analyses.find((a) => a.id === id)
      if (!analysis) return false

      const { data: updatedAnalysis, error } = await supabase
        .from("property_analyses")
        .update({ is_favorite: !analysis.is_favorite })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      setAnalyses((prev) => prev.map((a) => (a.id === id ? updatedAnalysis : a)))

      // Log activity
      await logActivity(analysis.is_favorite ? "unfavorite_analysis" : "favorite_analysis", "property_analysis", id)

      return true
    } catch (err) {
      console.error("Error toggling favorite:", err)
      return false
    }
  }

  const autoSaveAnalysis = async (id: string, analysisData: Record<string, any>) => {
    if (!supabase) return

    try {
      await supabase
        .from("property_analyses")
        .update({
          analysis_data: analysisData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      // Update local state without showing toast for auto-save
      setAnalyses((prev) =>
        prev.map((analysis) =>
          analysis.id === id
            ? { ...analysis, analysis_data: analysisData, updated_at: new Date().toISOString() }
            : analysis,
        ),
      )
    } catch (err) {
      console.error("Auto-save failed:", err)
    }
  }

  const logActivity = async (action: string, resourceType: string, resourceId: string) => {
    if (!supabase) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from("user_activity_log").insert({
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata: {},
      })
    } catch (err) {
      console.error("Failed to log activity:", err)
    }
  }

  const getAnalysisById = (id: string): PropertyAnalysis | undefined => {
    return analyses.find((analysis) => analysis.id === id)
  }

  const getFavoriteAnalyses = (): PropertyAnalysis[] => {
    return analyses.filter((analysis) => analysis.is_favorite)
  }

  const getAnalysesByStatus = (status: PropertyAnalysis["status"]): PropertyAnalysis[] => {
    return analyses.filter((analysis) => analysis.status === status)
  }

  const getAnalysesByTag = (tag: string): PropertyAnalysis[] => {
    return analyses.filter((analysis) => analysis.tags.includes(tag))
  }

  useEffect(() => {
    if (mounted) {
      loadAnalyses()
    }
  }, [mounted])

  return {
    analyses,
    loading,
    error,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis,
    toggleFavorite,
    autoSaveAnalysis,
    refreshAnalyses: loadAnalyses,
    getAnalysisById,
    getFavoriteAnalyses,
    getAnalysesByStatus,
    getAnalysesByTag,
  }
}
