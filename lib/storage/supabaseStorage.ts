import type { SupabaseClient } from '@supabase/supabase-js'
import { getAdminSupabase, isServiceRoleConfigured } from '../supabase'
import { IStorageDriver, StorageUploadOptions, StorageUploadResult } from './types'

/**
 * Batch-signs private Supabase storage object keys into short-lived URLs for API responses.
 */
export async function signSupabaseFileUrls<
  T extends { storage_key?: string | null; thumbnail_url?: string | null }
>(supabase: SupabaseClient, files: T[], expiresInSeconds: number = 3600): Promise<T[]> {
  if (!isServiceRoleConfigured() || files.length === 0) return files
  const requested = (process.env.STORAGE_DRIVER || process.env.STORAGE_PROVIDER || 'supabase').toLowerCase()
  if (requested === 'local') return files

  const keys = files.map((f) => f.storage_key).filter((k): k is string => Boolean(k))
  if (keys.length === 0) return files

  try {
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'documents'
    const { data: signedList } = await supabase.storage
      .from(bucketName)
      .createSignedUrls(keys, expiresInSeconds)
    if (!Array.isArray(signedList)) return files

    const urlMap = new Map<string, string>()
    for (const item of signedList) {
      if (item?.path && item?.signedUrl) urlMap.set(item.path, item.signedUrl)
    }
    return files.map((f) => ({
      ...f,
      thumbnail_url: (f.storage_key && urlMap.get(f.storage_key)) || f.thumbnail_url,
    }))
  } catch {
    return files
  }
}

export class SupabaseStorageDriver implements IStorageDriver {
  private bucket: string

  constructor(bucket = 'documents') {
    this.bucket = bucket
  }

  async upload(key: string, data: Buffer | Uint8Array, options?: StorageUploadOptions): Promise<StorageUploadResult> {
    const supabase = getAdminSupabase()
    const safeKey = key.replace(/\.\./g, '').replace(/^\/+/, '')

    const { data: uploadData, error } = await supabase.storage
      .from(this.bucket)
      .upload(safeKey, data, {
        contentType: options?.contentType || 'application/octet-stream',
        upsert: options?.upsert ?? true,
      })

    if (error) {
      throw new Error(`Supabase storage upload error: ${error.message}`)
    }

    const { data: publicData } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(uploadData.path)

    return {
      path: uploadData.path,
      key: uploadData.path,
      url: publicData.publicUrl,
      sizeBytes: Buffer.byteLength(data),
    }
  }

  async download(key: string): Promise<Buffer> {
    const supabase = getAdminSupabase()
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .download(key)

    if (error || !data) {
      throw new Error(`Supabase storage download error: ${error?.message || 'File not found'}`)
    }

    const arrayBuffer = await data.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async delete(key: string | string[]): Promise<boolean> {
    const supabase = getAdminSupabase()
    const keys = Array.isArray(key) ? key : [key]
    const { error } = await supabase.storage.from(this.bucket).remove(keys)
    return !error
  }

  async getSignedUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    const supabase = getAdminSupabase()
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(key, expiresInSeconds)

    if (error || !data) {
      return this.getPublicUrl(key)
    }
    return data.signedUrl
  }

  getPublicUrl(key: string): string {
    const supabase = getAdminSupabase()
    const { data } = supabase.storage.from(this.bucket).getPublicUrl(key)
    return data.publicUrl
  }

  async exists(key: string): Promise<boolean> {
    try {
      const supabase = getAdminSupabase()
      const dir = key.includes('/') ? key.substring(0, key.lastIndexOf('/')) : ''
      const name = key.includes('/') ? key.substring(key.lastIndexOf('/') + 1) : key
      const { data, error } = await supabase.storage.from(this.bucket).list(dir, {
        search: name,
        limit: 1,
      })
      if (error || !data) return false
      return data.some(item => item.name === name)
    } catch {
      return false
    }
  }
}

