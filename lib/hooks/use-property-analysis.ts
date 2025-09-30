"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

export interface PropertyAnalysis {
  id: string
  user_id: string
  property_name: string
  client_name?: string
  address?: string
  background_image?: string
  status: "draft" | "completed" | "archived"
  is_favorite: boolean
  tags: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreatePropertyAnalysisData {
  property_name: string
  client_name?: string
  address?: string
  background_image?: string
  notes?: string
  tags?: string[]
  status?: "draft" | "completed"
}

export function usePropertyAnalysis() {
  const [analyses, setAnalyses] = useState<PropertyAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadAnalyses = async () => {
    if (!mounted) return

    try {
      setLoading(true)
      const supabase = createClient()
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
    if (!mounted) return null

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      const { data: newAnalysis, error } = await supabase
        .from("property_analyses")
        .insert({
          user_id: user.id,
          property_name: data.property_name,
          client_name: data.client_name,
          address: data.address,
          background_image: data.background_image,
          notes: data.notes,
          tags: data.tags || [],
          status: data.status || "draft",
        })
        .select()
        .single()

      if (error) throw error

      setAnalyses((prev) => [newAnalysis, ...prev])

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
    if (!mounted) return null

    try {
      const supabase = createClient()
      const { data: updatedAnalysis, error } = await supabase
        .from("property_analyses")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      setAnalyses((prev) => prev.map((analysis) => (analysis.id === id ? updatedAnalysis : analysis)))

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
    if (!mounted) return false

    try {
      const supabase = createClient()
      const { error } = await supabase.from("property_analyses").delete().eq("id", id)

      if (error) throw error

      setAnalyses((prev) => prev.filter((analysis) => analysis.id !== id))

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
    if (!mounted) return false

    try {
      const supabase = createClient()
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

      return true
    } catch (err) {
      console.error("Error toggling favorite:", err)
      return false
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
    refreshAnalyses: loadAnalyses,
    getAnalysisById,
    getFavoriteAnalyses,
    getAnalysesByStatus,
    getAnalysesByTag,
  }
}
