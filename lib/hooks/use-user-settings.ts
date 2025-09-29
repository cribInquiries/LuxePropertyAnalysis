"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

export interface UserSettings {
  id: string
  theme: "light" | "dark" | "system"
  currency: string
  language: string
  notifications_enabled: boolean
  email_notifications: boolean
  analysis_preferences: Record<string, any>
  created_at: string
  updated_at: string
}

const defaultSettings: Partial<UserSettings> = {
  theme: "light",
  currency: "USD",
  language: "en",
  notifications_enabled: true,
  email_notifications: true,
  analysis_preferences: {},
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const supabase = mounted ? createClient() : null

  // Load user settings
  const loadSettings = async () => {
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

      const { data, error: fetchError } = await supabase.from("user_settings").select("*").eq("id", user.id).single()

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          // No settings found, create default settings
          await createDefaultSettings(user.id)
        } else {
          throw fetchError
        }
      } else {
        setSettings(data)
      }
    } catch (err) {
      console.error("Error loading settings:", err)
      setError(err instanceof Error ? err.message : "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  // Create default settings for new user
  const createDefaultSettings = async (userId: string) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .insert({
          id: userId,
          ...defaultSettings,
        })
        .select()
        .single()

      if (error) throw error
      setSettings(data)
    } catch (err) {
      console.error("Error creating default settings:", err)
      setError(err instanceof Error ? err.message : "Failed to create settings")
    }
  }

  // Update settings
  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!supabase) return

    try {
      if (!settings) return

      const { data, error } = await supabase
        .from("user_settings")
        .update(updates)
        .eq("id", settings.id)
        .select()
        .single()

      if (error) throw error

      setSettings(data)
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully",
      })

      return data
    } catch (err) {
      console.error("Error updating settings:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update settings"
      setError(errorMessage)
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  // Update analysis preferences
  const updateAnalysisPreferences = async (preferences: Record<string, any>) => {
    return updateSettings({
      analysis_preferences: {
        ...settings?.analysis_preferences,
        ...preferences,
      },
    })
  }

  useEffect(() => {
    if (mounted) {
      loadSettings()
    }
  }, [mounted])

  return {
    settings,
    loading,
    error,
    updateSettings,
    updateAnalysisPreferences,
    refreshSettings: loadSettings,
  }
}
