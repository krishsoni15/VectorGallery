import { describe, it, expect, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import signupHandler from '../../pages/api/auth/signup'
import loginHandler from '../../pages/api/auth/login'
import sessionHandler from '../../pages/api/auth/session'
import userHandler from '../../pages/api/auth/user'
import providerKeysHandler from '../../pages/api/auth/provider-keys'
import profileHandler from '../../pages/api/v2/auth/profile'
import uploadHandler from '../../pages/api/v2/files/upload'
import filesListHandler from '../../pages/api/v2/files/index'
import fileDetailHandler from '../../pages/api/v2/files/[id]'
import restoreHandler from '../../pages/api/v2/files/restore'
import copyHandler from '../../pages/api/v2/files/[id]/copy'
import searchHandler from '../../pages/api/v2/search/index'
import searchHistoryHandler from '../../pages/api/v2/search/history'
import collectionsHandler from '../../pages/api/v2/collections/index'
import collectionFilesHandler from '../../pages/api/v2/collections/[id]/files'
import conversationsHandler from '../../pages/api/v2/conversations/index'
import conversationDetailHandler from '../../pages/api/v2/conversations/[id]'
import chatHandler from '../../pages/api/v2/chat/index'
import proxyHandler from '../../pages/api/proxy'
import testApisHandler from '../../pages/api/test-apis'
import vectorSearchHandler from '../../pages/api/vector-search'
import { createMockReqRes } from '../helpers/mockNextApi'

describe('End-to-End Auth, Persistence, RAG & Security Isolation', () => {
  const unique = Date.now()
  const emailA = `vitest-a-${unique}@example.com`
  const emailB = `vitest-b-${unique}@example.com`
  const password = 'SecurePassword123!'

  let tokenA = ''
  let userIdA = ''
  let tokenB = ''
  let uploadedFileIdA = ''
  let copiedFileIdA = ''
  let uploadedStorageUrlA = ''
  let collectionIdA = ''
  let conversationIdA = ''

  afterAll(async () => {
    // Purge User A & User B via authenticated DELETE /api/v2/auth/profile
    for (const token of [tokenA, tokenB]) {
      if (!token) continue
      const { req, res } = createMockReqRes({
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      })
      await profileHandler(req, res).catch(() => {})
    }
    if (uploadedStorageUrlA?.startsWith('/uploads/')) {
      try {
        const p = path.join(process.cwd(), 'public', 'uploads', uploadedStorageUrlA.replace('/uploads/', ''))
        if (fs.existsSync(p)) fs.unlinkSync(p)
      } catch {}
    }
  })

  it('registers users cleanly, enforces duplicate check & scrypt login, and rejects tampered tokens', async () => {
    // 1. Signup User A
    const signupA = createMockReqRes({
      method: 'POST',
      body: { email: emailA, password, name: 'Alice Tester' },
    })
    await signupHandler(signupA.req, signupA.res)
    expect(signupA.getStatus()).toBe(201)
    tokenA = signupA.getData()?.session?.access_token
    userIdA = signupA.getData()?.user?.id
    expect(tokenA).toMatch(/^vg_local_/)

    // 2. Duplicate signup rejected
    const dup = createMockReqRes({
      method: 'POST',
      body: { email: emailA, password, name: 'Alice Dup' },
    })
    await signupHandler(dup.req, dup.res)
    expect(dup.getStatus()).toBe(409)

    // 3. Wrong password rejected
    const badLogin = createMockReqRes({
      method: 'POST',
      body: { email: emailA, password: 'WrongPassword!' },
    })
    await loginHandler(badLogin.req, badLogin.res)
    expect(badLogin.getStatus()).toBe(401)

    // 4. Valid login returns signed token
    const goodLogin = createMockReqRes({
      method: 'POST',
      body: { email: emailA, password },
    })
    await loginHandler(goodLogin.req, goodLogin.res)
    expect(goodLogin.getStatus()).toBe(200)
    expect(goodLogin.getData()?.user?.id).toBe(userIdA)

    // 5. Session hydration validates token
    const sess = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
    })
    await sessionHandler(sess.req, sess.res)
    expect(sess.getStatus()).toBe(200)
    expect(sess.getData()?.user?.email).toBe(emailA)

    // 6. Signup User B for cross-user isolation tests
    const signupB = createMockReqRes({
      method: 'POST',
      body: { email: emailB, password, name: 'Bob Tester' },
    })
    await signupHandler(signupB.req, signupB.res)
    expect(signupB.getStatus()).toBe(201)
    tokenB = signupB.getData()?.session?.access_token
    expect(tokenB).toMatch(/^vg_local_/)
  })

  it('rejects unauthenticated or forged requests on auth, key, diagnostic, proxy & RAG endpoints', async () => {
    const forged = { authorization: 'Bearer vg_local_forged.invalidsignature' }

    const u1 = createMockReqRes({ method: 'GET' })
    await userHandler(u1.req, u1.res)
    expect(u1.getStatus()).toBe(401)

    const pk = createMockReqRes({ method: 'POST', body: { provider: 'openai', apiKey: 'sk-test-123456' } })
    await providerKeysHandler(pk.req, pk.res)
    expect(pk.getStatus()).toBe(401)

    const ta = createMockReqRes({ method: 'GET' })
    await testApisHandler(ta.req, ta.res)
    expect(ta.getStatus()).toBe(401)

    const px = createMockReqRes({ method: 'GET', query: { url: 'http://127.0.0.1:3000/' } })
    await proxyHandler(px.req, px.res)
    expect(px.getStatus()).toBe(401)

    const forgedFiles = createMockReqRes({ method: 'GET', headers: forged })
    await filesListHandler(forgedFiles.req, forgedFiles.res)
    expect(forgedFiles.getStatus()).toBe(401)

    const forgedChat = createMockReqRes({ method: 'POST', headers: forged, body: { query: 'test' } })
    await chatHandler(forgedChat.req, forgedChat.res)
    expect(forgedChat.getStatus()).toBe(401)

    const forgedVec = createMockReqRes({ method: 'POST', headers: forged, body: { prompt: 'hi', projectId: 'x' } })
    await vectorSearchHandler(forgedVec.req, forgedVec.res)
    expect(forgedVec.getStatus()).toBe(401)

    // Signed-in SSRF attempt against localhost must return 403
    const ssrf = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
      query: { url: 'http://127.0.0.1:3000/api/health' },
    })
    await proxyHandler(ssrf.req, ssrf.res)
    expect(ssrf.getStatus()).toBe(403)
  })

  it('persists profile settings and per-user encrypted API keys without leaking across users', async () => {
    const putProf = createMockReqRes({
      method: 'PUT',
      headers: { authorization: `Bearer ${tokenA}` },
      body: {
        full_name: 'Alice Updated',
        theme: 'light',
        backup_settings: { auto_backup: false, wifi_only: true, categories: ['documents'] },
      },
    })
    await profileHandler(putProf.req, putProf.res)
    expect(putProf.getStatus()).toBe(200)

    const getProf = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
    })
    await profileHandler(getProf.req, getProf.res)
    expect(getProf.getStatus()).toBe(200)
    expect(getProf.getData()?.profile?.full_name).toBe('Alice Updated')
    expect(getProf.getData()?.profile?.theme).toBe('light')
    expect(getProf.getData()?.profile?.backup_settings?.auto_backup).toBe(false)

    // Save User A personal OpenAI key (no process.env leak to User B!)
    const saveKey = createMockReqRes({
      method: 'POST',
      headers: { authorization: `Bearer ${tokenA}` },
      body: { provider: 'openai', apiKey: 'sk-alice-secret-key-9876' },
    })
    await providerKeysHandler(saveKey.req, saveKey.res)
    expect(saveKey.getStatus()).toBe(200)

    const statusA = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
    })
    await userHandler(statusA.req, statusA.res)
    expect(statusA.getStatus()).toBe(200)
    expect(statusA.getData()?.providerKeys?.openai?.source).toBe('personal')
    expect(statusA.getData()?.providerKeys?.openai?.key_last4).toBe('9876')

    const statusB = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenB}` },
    })
    await userHandler(statusB.req, statusB.res)
    expect(statusB.getStatus()).toBe(200)
    expect(statusB.getData()?.providerKeys?.openai?.configured).toBe(false)

    // Delete User A personal key & verify removal persists
    const delKey = createMockReqRes({
      method: 'DELETE',
      headers: { authorization: `Bearer ${tokenA}` },
      body: { provider: 'openai' },
    })
    await providerKeysHandler(delKey.req, delKey.res)
    expect(delKey.getStatus()).toBe(200)

    const statusAAfter = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
    })
    await userHandler(statusAAfter.req, statusAAfter.res)
    expect(statusAAfter.getData()?.providerKeys?.openai?.source).not.toBe('personal')
  })

  it('persists uploads, search schema, collections, trash/restore, copy, and RAG conversations per user', async () => {
    const docBody = `Quantum Photonic Vault Note ${unique}. Total Budget: $4,250. Owner: Alice Tester.`
    const uploadA = createMockReqRes({
      method: 'POST',
      headers: { authorization: `Bearer ${tokenA}` },
      body: {
        filename: `photonic_budget_${unique}.txt`,
        mimeType: 'text/plain',
        base64: Buffer.from(docBody).toString('base64'),
      },
    })
    await uploadHandler(uploadA.req, uploadA.res)
    expect(uploadA.getStatus()).toBe(200)
    uploadedFileIdA = uploadA.getData()?.file?.fileId
    uploadedStorageUrlA = uploadA.getData()?.file?.storageUrl
    expect(uploadA.getData()?.file?.chunksIndexed).toBeGreaterThan(0)

    // User B search must NOT return User A's file
    const searchB = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenB}` },
      query: { q: `Quantum Photonic ${unique}` },
    })
    await searchHandler(searchB.req, searchB.res)
    expect(searchB.getStatus()).toBe(200)
    expect(searchB.getData()?.results).toHaveLength(0)

    // User A search returns unified schema keys expected by AISearchModal
    const searchA = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
      query: { q: `Quantum Photonic ${unique}` },
    })
    await searchHandler(searchA.req, searchA.res)
    expect(searchA.getStatus()).toBe(200)
    const firstResult = searchA.getData()?.results?.[0]
    expect(firstResult?.file_id).toBe(uploadedFileIdA)
    expect(firstResult?.file_name).toContain(`photonic_budget_${unique}`)
    expect(typeof firstResult?.snippet).toBe('string')
    expect(typeof firstResult?.relevance_score).toBe('number')
    expect(typeof firstResult?.why_matched).toBe('string')

    // Search history persists per user
    await searchHistoryHandler(
      createMockReqRes({
        method: 'POST',
        headers: { authorization: `Bearer ${tokenA}` },
        body: { query: 'Quantum Photonic', result_count: 1 },
      }).req,
      createMockReqRes().res
    )
    const histA = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
    })
    await searchHistoryHandler(histA.req, histA.res)
    expect(histA.getData()?.history?.some((h: any) => h.query === 'Quantum Photonic')).toBe(true)

    // User B cannot read or trash User A's file
    const sneakB = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenB}` },
      query: { id: uploadedFileIdA },
    })
    await fileDetailHandler(sneakB.req, sneakB.res)
    expect(sneakB.getStatus()).toBe(404)

    // Trash + persistent Restore for User A
    const trashRes = createMockReqRes({
      method: 'DELETE',
      headers: { authorization: `Bearer ${tokenA}` },
      query: { id: uploadedFileIdA },
    })
    await fileDetailHandler(trashRes.req, trashRes.res)
    expect(trashRes.getStatus()).toBe(200)

    const restoreRes = createMockReqRes({
      method: 'POST',
      headers: { authorization: `Bearer ${tokenA}` },
      body: { file_ids: [uploadedFileIdA] },
    })
    await restoreHandler(restoreRes.req, restoreRes.res)
    expect(restoreRes.getStatus()).toBe(200)
    expect(restoreRes.getData()?.restored_count).toBe(1)

    const checkRestored = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
      query: { id: uploadedFileIdA },
    })
    await fileDetailHandler(checkRestored.req, checkRestored.res)
    expect(checkRestored.getData()?.file?.is_trashed).toBe(false)

    // Copy file persists
    const copyRes = createMockReqRes({
      method: 'POST',
      headers: { authorization: `Bearer ${tokenA}` },
      query: { id: uploadedFileIdA },
    })
    await copyHandler(copyRes.req, copyRes.res)
    expect(copyRes.getStatus()).toBe(201)
    copiedFileIdA = copyRes.getData()?.file?.id
    expect(copyRes.getData()?.file?.original_name).toContain('(Copy)')

    // Create custom collection + add/list files
    const createCol = createMockReqRes({
      method: 'POST',
      headers: { authorization: `Bearer ${tokenA}` },
      body: { name: 'Photonic Budget Album', description: 'Private project files' },
    })
    await collectionsHandler(createCol.req, createCol.res)
    expect(createCol.getStatus()).toBe(201)
    collectionIdA = createCol.getData()?.collection?.id

    const addColFile = createMockReqRes({
      method: 'POST',
      headers: { authorization: `Bearer ${tokenA}` },
      query: { id: collectionIdA },
      body: { file_ids: [uploadedFileIdA] },
    })
    await collectionFilesHandler(addColFile.req, addColFile.res)
    expect(addColFile.getStatus()).toBe(200)

    const listColFiles = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
      query: { id: collectionIdA },
    })
    await collectionFilesHandler(listColFiles.req, listColFiles.res)
    expect(listColFiles.getData()?.files?.map((f: any) => f.id)).toContain(uploadedFileIdA)
    expect(listColFiles.getData()?.files?.map((f: any) => f.id)).not.toContain(copiedFileIdA)

    // Create conversation + stream RAG response + verify persisted messages & citations
    const createConv = createMockReqRes({
      method: 'POST',
      headers: { authorization: `Bearer ${tokenA}` },
      body: { title: 'Photonic Budget Check' },
    })
    await conversationsHandler(createConv.req, createConv.res)
    expect(createConv.getStatus()).toBe(201)
    conversationIdA = createConv.getData()?.conversation?.id

    const ragChat = createMockReqRes({
      method: 'POST',
      headers: { authorization: `Bearer ${tokenA}` },
      body: {
        query: 'What is the total budget in the Quantum Photonic note?',
        conversationId: conversationIdA,
        selectedFileIds: [uploadedFileIdA],
      },
    })
    await chatHandler(ragChat.req, ragChat.res)
    const sseOutput = ragChat.getWrittenChunks().join('')
    expect(sseOutput).toContain('"type":"done"')
    expect(sseOutput).toContain('"type":"citations"')
    expect(sseOutput).toContain(`photonic_budget_${unique}`)

    const getConv = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
      query: { id: conversationIdA },
    })
    await conversationDetailHandler(getConv.req, getConv.res)
    expect(getConv.getStatus()).toBe(200)
    expect(getConv.getData()?.messages?.length).toBeGreaterThanOrEqual(2)
  }, 20000)
})
