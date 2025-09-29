import { createClient } from "@/lib/supabase/client"

export class SupabaseStorageService {
  private supabase = createClient()

  async uploadImage(
    file: File,
    bucket = "property-images",
  ): Promise<{
    data: { path: string; publicUrl: string } | null
    error: Error | null
  }> {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${bucket}/${fileName}`

      const { data: uploadData, error: uploadError } = await this.supabase.storage.from(bucket).upload(filePath, file)

      if (uploadError) {
        return { data: null, error: uploadError }
      }

      const {
        data: { publicUrl },
      } = this.supabase.storage.from(bucket).getPublicUrl(filePath)

      return {
        data: {
          path: filePath,
          publicUrl,
        },
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      }
    }
  }

  async deleteImage(
    filePath: string,
    bucket = "property-images",
  ): Promise<{
    error: Error | null
  }> {
    try {
      const { error } = await this.supabase.storage.from(bucket).remove([filePath])

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async getImageUrl(filePath: string, bucket = "property-images"): Promise<string> {
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucket).getPublicUrl(filePath)

    return publicUrl
  }

  async listImages(folder = "", bucket = "property-images") {
    try {
      const { data, error } = await this.supabase.storage.from(bucket).list(folder)

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

export const storageService = new SupabaseStorageService()
