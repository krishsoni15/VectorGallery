import { createServerClient, serializeCookieHeader } from '@supabase/ssr'
import type { NextApiRequest, NextApiResponse } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-anon-key'

/** Creates a Pages-Router server Supabase SSR client backed by request/response cookies. */
export const createClient = (req: NextApiRequest, res: NextApiResponse) => {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return Object.entries(req.cookies || {}).map(([name, value]) => ({
          name,
          value: value ?? '',
        }))
      },
      setAll(cookiesToSet) {
        res.setHeader(
          'Set-Cookie',
          cookiesToSet.map(({ name, value, options }) =>
            serializeCookieHeader(name, value, options)
          )
        )
      },
    },
  })
}

