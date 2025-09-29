import { createClient } from "@/lib/supabase/server"

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export async function getServerUser(): Promise<User | null> {
  const supabase = await createClient()

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

export async function getServerProfile(userId: string) {
  const supabase = await createClient()

  try {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()
    return profile
  } catch (error) {
    return null
  }
}
