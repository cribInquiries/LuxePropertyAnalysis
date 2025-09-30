import { createClient } from "@/lib/supabase/client"

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export interface Profile {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export class SupabaseAuth {
  private static instance: SupabaseAuth

  static getInstance(): SupabaseAuth {
    if (!SupabaseAuth.instance) {
      SupabaseAuth.instance = new SupabaseAuth()
    }
    return SupabaseAuth.instance
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        // Get user profile
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: profile?.display_name || data.user.email?.split("@")[0],
          avatar_url: profile?.avatar_url,
        }

        return { user, error: null }
      }

      return { user: null, error: "Authentication failed" }
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : "An error occurred" }
    }
  }

  async signUp(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<{ user: User | null; error: string | null }> {
    const supabase = createClient()

    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboard`
          : process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "/dashboard"

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email.split("@")[0],
          },
        },
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: displayName || data.user.email?.split("@")[0],
        }

        return { user, error: null }
      }

      return { user: null, error: "Sign up failed" }
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : "An error occurred" }
    }
  }

  async signOut(): Promise<void> {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      // Get user profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      return {
        id: user.id,
        email: user.email!,
        name: profile?.display_name || user.email?.split("@")[0],
        avatar_url: profile?.avatar_url,
      }
    } catch (error) {
      return null
    }
  }
}

export const auth = SupabaseAuth.getInstance()
