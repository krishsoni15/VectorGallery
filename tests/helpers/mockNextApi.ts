import type { NextApiRequest, NextApiResponse } from 'next'

export interface MockRequestOptions {
  method?: string
  body?: unknown
  query?: Record<string, string | string[]>
  headers?: Record<string, string>
  cookies?: Record<string, string>
}

export interface MockApiHarness {
  req: NextApiRequest
  res: NextApiResponse
  getStatus: () => number
  getData: () => any
  getHeaders: () => Record<string, string>
  getWrittenChunks: () => string[]
  isEnded: () => boolean
}

/** Creates an isolated mock Next.js API request/response pair for handler integration tests. */
export function createMockReqRes(options: MockRequestOptions = {}): MockApiHarness {
  const req: Partial<NextApiRequest> = {
    method: options.method || 'GET',
    body: options.body ?? {},
    query: options.query ?? {},
    headers: options.headers ?? {},
    cookies: options.cookies ?? {},
    socket: { remoteAddress: '127.0.0.1' } as NextApiRequest['socket'],
  }

  let statusCode = 200
  let responseData: any = null
  const headersSent: Record<string, string> = {}
  let ended = false
  const writtenChunks: string[] = []

  const res: Partial<NextApiResponse> = {
    status: (code: number) => {
      statusCode = code
      return res as NextApiResponse
    },
    setHeader: (name: string, value: string | string[]) => {
      headersSent[name] = Array.isArray(value) ? value.join(', ') : value
      return res as NextApiResponse
    },
    json: (data: any) => {
      responseData = data
      ended = true
      return res as NextApiResponse
    },
    send: (data: any) => {
      responseData = data
      ended = true
      return res as NextApiResponse
    },
    write: (chunk: any) => {
      writtenChunks.push(chunk.toString())
      return true
    },
    end: () => {
      ended = true
      return res as NextApiResponse
    },
  }

  return {
    req: req as NextApiRequest,
    res: res as NextApiResponse,
    getStatus: () => statusCode,
    getData: () => responseData,
    getHeaders: () => headersSent,
    getWrittenChunks: () => writtenChunks,
    isEnded: () => ended,
  }
}

