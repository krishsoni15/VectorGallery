import type { NextApiRequest, NextApiResponse } from 'next'
import { isSupabaseConfigured, isServiceRoleConfigured } from '@/lib/supabase'
import { getStorageDriver } from '@/lib/storage'
import { isProviderAvailable } from '@/lib/providers'
import { getLocalKeys } from '@/lib/credentialResolver'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const storage = getStorageDriver()
  const localKeys = getLocalKeys()

  const health = {
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      configured: isServiceRoleConfigured(),
      clientConfigured: isSupabaseConfigured(),
    },
    storage: {
      driver: process.env.STORAGE_DRIVER || (isServiceRoleConfigured() ? 'supabase' : 'local'),
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

