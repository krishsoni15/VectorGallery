import { IStorageDriver } from './types'
import { LocalStorageDriver } from './localStorage'
import { SupabaseStorageDriver } from './supabaseStorage'
import { isServiceRoleConfigured } from '../supabase'

let storageInstance: IStorageDriver | null = null

export function getStorageDriver(): IStorageDriver {
  if (storageInstance) return storageInstance

  const requestedProvider = (process.env.STORAGE_DRIVER || process.env.STORAGE_PROVIDER || '').toLowerCase()
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'documents'

  if (requestedProvider === 'local') {
    storageInstance = new LocalStorageDriver()
    return storageInstance
  }

  if (requestedProvider === 'supabase' || (!requestedProvider && isServiceRoleConfigured())) {
    try {
      storageInstance = new SupabaseStorageDriver(bucketName)
      return storageInstance
    } catch (e) {
      console.warn('[Storage] Supabase storage unavailable, falling back to local storage driver:', e)
      storageInstance = new LocalStorageDriver()
      return storageInstance
    }
  }

  // Default to local storage driver for zero-cost / offline resilience
  storageInstance = new LocalStorageDriver()
  return storageInstance
}

export * from './types'
export { LocalStorageDriver } from './localStorage'
export { SupabaseStorageDriver } from './supabaseStorage'

