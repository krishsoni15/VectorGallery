import type { NextApiRequest, NextApiResponse } from 'next'

export interface GitHubRepoStats {
  available: boolean
  stars: number | null
  forks: number | null
  openIssues: number | null
  license: string
  defaultBranch: string
  updatedAt: string | null
  url: string
}

let cachedStats: { data: GitHubRepoStats; expiresAt: number } | null = null
const CACHE_TTL_MS = 15 * 60 * 1000

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GitHubRepoStats>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end()
  }

  const now = Date.now()
  if (cachedStats && now < cachedStats.expiresAt) {
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800')
    return res.status(200).json(cachedStats.data)
  }

  const fallback: GitHubRepoStats = {
    available: false,
    stars: null,
    forks: null,
    openIssues: null,
    license: 'Apache-2.0',
    defaultBranch: 'main',
    updatedAt: null,
    url: 'https://github.com/krishsoni15/VectorGallery',
  }

  try {
    const response = await fetch(
      'https://api.github.com/repos/krishsoni15/VectorGallery',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'VectorGallery-Web',
        },
        signal: AbortSignal.timeout(4500),
      }
    )

    if (!response.ok) {
      return res.status(200).json(fallback)
    }

    const json = await response.json()
    const payload: GitHubRepoStats = {
      available: true,
      stars: typeof json.stargazers_count === 'number' ? json.stargazers_count : null,
      forks: typeof json.forks_count === 'number' ? json.forks_count : null,
      openIssues: typeof json.open_issues_count === 'number' ? json.open_issues_count : null,
      license: json.license?.spdx_id || 'Apache-2.0',
      defaultBranch: json.default_branch || 'main',
      updatedAt: json.pushed_at || null,
      url: json.html_url || 'https://github.com/krishsoni15/VectorGallery',
    }

    cachedStats = { data: payload, expiresAt: now + CACHE_TTL_MS }
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800')
    return res.status(200).json(payload)
  } catch {
    return res.status(200).json(fallback)
  }
}

