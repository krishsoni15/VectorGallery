import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, isSupabaseConfigured, isServiceRoleConfigured } from '@/lib/supabase'
import { getStorageDriver } from '@/lib/storage'
import { isProviderAvailable } from '@/lib/providers'
import { getLocalKeys } from '@/lib/credentialResolver'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  getStorageDriver()
  const localKeys = getLocalKeys()
  const dbConfigured = isServiceRoleConfigured()

  // Lightweight 1-row Postgres heartbeat prevents Supabase Free Tier from auto-pausing on keepalive pings
  let dbReachable = !dbConfigured
  let dbSchemaError: string | null = null
  if (dbConfigured) {
    try {
      const supabase = getAdminSupabase()
      const { error } = await supabase.from('files').select('id').limit(1)
      dbReachable = !error
      if (error) dbSchemaError = error.message
    } catch (e: any) {
      dbReachable = false
      dbSchemaError = e?.message || 'Unreachable'
    }
  }

  const health = {
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      configured: dbConfigured,
      clientConfigured: isSupabaseConfigured(),
      reachable: dbReachable,
      schemaReady: dbConfigured ? dbReachable : true,
      ...(dbSchemaError ? { notice: dbSchemaError } : {}),
    },
    storage: {
      driver: process.env.STORAGE_DRIVER || (dbConfigured ? 'supabase' : 'local'),
      ready: true,
    },
    aiProviders: {
      gemini: isProviderAvailable('GEMINI_API_KEY') || Boolean(localKeys['gemini']),
      groq: isProviderAvailable('GROQ_API_KEY') || Boolean(localKeys['groq']),
      cohere: isProviderAvailable('COHERE_API_KEY') || Boolean(localKeys['cohere']),
      openai: isProviderAvailable('OPENAI_API_KEY') || Boolean(localKeys['openai']),
    },
    memory: {
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  }

  return res.status(200).json(health)
}
