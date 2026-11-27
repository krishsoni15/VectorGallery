import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const rawSupabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ''

// Safe fallbacks to prevent `@supabase/supabase-js` from crashing static build evaluation
export const safeSupabaseUrl =
  rawSupabaseUrl && rawSupabaseUrl !== 'your_supabase_url'
    ? rawSupabaseUrl
    : 'https://placeholder.supabase.co'

export const safeSupabaseAnonKey =
  rawSupabaseAnonKey && rawSupabaseAnonKey !== 'your_supabase_anon_key'
    ? rawSupabaseAnonKey
    : 'placeholder-anon-key'

export function isSupabaseConfigured(): boolean {
  return !!(
    rawSupabaseUrl &&
    rawSupabaseUrl !== 'your_supabase_url' &&
    rawSupabaseAnonKey &&
    rawSupabaseAnonKey !== 'your_supabase_anon_key'
  )
}

// Client-side browser Supabase instance (strictly browser-safe; zero Node built-ins)
export const supabase: SupabaseClient = createClient(
  safeSupabaseUrl,
  safeSupabaseAnonKey
)
