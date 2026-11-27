import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import type { NextApiRequest } from 'next'
import { isLocalTokenFormat, verifyLocalSessionToken, GUEST_USER_ID } from './localAuthStore'
import {
  isSupabaseConfigured,
  safeSupabaseAnonKey,
  safeSupabaseUrl,
  supabase,
} from './supabaseClient'

export { isSupabaseConfigured, safeSupabaseAnonKey, safeSupabaseUrl, supabase }

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const rawSupabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export function isServiceRoleConfigured(): boolean {
  return !!(
    rawSupabaseUrl &&
    rawSupabaseUrl !== 'your_supabase_url' &&
    rawSupabaseServiceKey &&
    rawSupabaseServiceKey !== 'your_supabase_service_role_key'
  )
}

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

export function extractAuthToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim()
  }
  if (req.cookies?.['sb-access-token']) {
    return req.cookies['sb-access-token']
  }
  return null
}

/** True when a caller sent an explicit session/bearer credential other than the guest sandbox marker. */
export function hasExplicitCredential(req: NextApiRequest): boolean {
  const token = extractAuthToken(req)
  return Boolean(token && token !== 'guest-session-token')
}

// Helper to extract the authenticated user from Next.js API requests
export async function getServerUser(req: NextApiRequest): Promise<User | null> {
  try {
    const token = extractAuthToken(req)

    if (!token || token.startsWith('guest-')) {
      return null
    }

    // Verify signed local session tokens when running in local mode
    if (!isServiceRoleConfigured()) {
      if (!isLocalTokenFormat(token)) {
        return null
      }
      const localUser = verifyLocalSessionToken(token)
      if (!localUser) return null
      return {
        id: localUser.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: localUser.email,
        created_at: localUser.created_at,
        app_metadata: { provider: 'local' },
        user_metadata: { full_name: localUser.name },
      } as unknown as User
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
  } catch {
    // Fallback to guest
  }

  return {
    id: GUEST_USER_ID,
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
