import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { NextApiRequest } from 'next'

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const rawSupabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Safe fallbacks to prevent `@supabase/supabase-js` from crashing static build evaluation
const safeSupabaseUrl = (rawSupabaseUrl && rawSupabaseUrl !== 'your_supabase_url') 
  ? rawSupabaseUrl 
  : 'https://placeholder.supabase.co'
const safeSupabaseAnonKey = (rawSupabaseAnonKey && rawSupabaseAnonKey !== 'your_supabase_anon_key') 
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

export function isServiceRoleConfigured(): boolean {
  return !!(
    rawSupabaseUrl &&
    rawSupabaseUrl !== 'your_supabase_url' &&
    rawSupabaseServiceKey &&
    rawSupabaseServiceKey !== 'your_supabase_service_role_key'
  )
}

// Client-side browser Supabase instance
export const supabase: SupabaseClient = createClient(
  safeSupabaseUrl,
  safeSupabaseAnonKey
)

// Server-side admin Supabase instance (bypasses RLS for backend operations)
export const getAdminSupabase = (): SupabaseClient => {
  if (!isServiceRoleConfigured()) {
    // If not configured, return safe client instead of crashing build
    return createClient(safeSupabaseUrl, safeSupabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return createClient(rawSupabaseUrl, rawSupabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// Helper to extract the authenticated user from Next.js API requests
export async function getServerUser(req: NextApiRequest) {
  try {
    const authHeader = req.headers.authorization
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (req.cookies['sb-access-token']) {
      token = req.cookies['sb-access-token']
    }

    if (!token || token.startsWith('guest-') || token.startsWith('local-')) {
      return null
    }

    if (!isServiceRoleConfigured() && !isSupabaseConfigured()) {
      return null
    }

    const adminSupabase = getAdminSupabase()
    const { data: { user }, error } = await adminSupabase.auth.getUser(token)

    if (error || !user) {
      return null
    }

    return user
  } catch (err) {
    console.error('[VectorGallery] Error verifying server user:', err)
    return null
  }
}

export interface ServerUserInfo {
  id: string
  email: string
  name: string
  isGuest: boolean
}

export async function getServerUserInfo(req: NextApiRequest): Promise<ServerUserInfo> {
  try {
    const user = await getServerUser(req)
    if (user && user.email) {
      return {
        id: user.id,
        email: user.email.toLowerCase(),
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
        isGuest: false,
      }
    }
  } catch (e) {
    // Fallback to guest
  }

  return {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'guest@vectorgallery.app',
    name: 'Guest User',
    isGuest: true,
  }
}

export function getUserTag(email: string): string {
  return `[usr:${email.trim().toLowerCase()}]`
}

export function formatProjectForUser(project: any, userEmail: string) {
  if (!project) return project
  const tag = getUserTag(userEmail)
  let cleanName = project.name || 'Workspace'
  if (cleanName.startsWith(tag)) {
    cleanName = cleanName.substring(tag.length).trim()
  } else if (cleanName.startsWith('[usr:')) {
    cleanName = cleanName.replace(/^\[usr:[^\]]+\]\s*/, '')
  }
  return {
    ...project,
    name: cleanName || 'Workspace',
    user_email: userEmail,
  }
}
