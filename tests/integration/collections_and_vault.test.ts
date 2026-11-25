import { describe, it, expect } from 'vitest'
import collectionsHandler from '../../pages/api/v2/collections/index'
import collectionFilesHandler from '../../pages/api/v2/collections/[id]/files'
import dashboardStatsHandler from '../../pages/api/v2/dashboard/stats'
import filesListHandler from '../../pages/api/v2/files/index'
import { createMockReqRes } from '../helpers/mockNextApi'

describe('Collections, Files Listing & Dashboard Telemetry APIs', () => {
  it('returns curated smart collections including festive album', async () => {
    const { req, res, getStatus, getData } = createMockReqRes({ method: 'GET' })
    await collectionsHandler(req, res)

    expect(getStatus()).toBe(200)
    const collections = getData()?.collections || []
    expect(collections.some((c: any) => c.id === 'smart-diwali')).toBe(true)
    expect(collections.some((c: any) => c.id === 'smart-screenshots')).toBe(true)
  })

  it('resolves smart collection files without failing in local mode', async () => {
    const { req, res, getStatus, getData } = createMockReqRes({
      method: 'GET',
      query: { id: 'smart-diwali' },
    })
    await collectionFilesHandler(req, res)

    expect(getStatus()).toBe(200)
    expect(Array.isArray(getData()?.files)).toBe(true)
  })

  it('lists vault files with category filtering', async () => {
    const { req, res, getStatus, getData } = createMockReqRes({
      method: 'GET',
      query: { category: 'photos', is_trashed: 'false' },
    })
    await filesListHandler(req, res)

    expect(getStatus()).toBe(200)
    const files = getData()?.files || []
    expect(Array.isArray(files)).toBe(true)
    for (const f of files) {
      expect(f.is_trashed).toBe(false)
    }
  })

  it('aggregates storage quota, category counts, and backup health on dashboard stats', async () => {
    const { req, res, getStatus, getData } = createMockReqRes({ method: 'GET' })
    await dashboardStatsHandler(req, res)

    expect(getStatus()).toBe(200)
    const stats = getData()
    expect(stats?.storage?.total_bytes_quota).toBeGreaterThan(0)
    expect(typeof stats?.counts?.total_files).toBe('number')
    expect(stats?.backup_health).toBeDefined()
  })
})

