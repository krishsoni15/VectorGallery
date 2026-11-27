import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { FaqAndFooterSection } from '@/components/landing/FaqAndFooterSection'
import { FinalInvitationSection } from '@/components/landing/FinalInvitationSection'
import { HeroSection } from '@/components/landing/HeroSection'
import { InteractiveSearchDemo } from '@/components/landing/InteractiveSearchDemo'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { MobileSection } from '@/components/landing/MobileSection'
import { MemoryUnfoldSection } from '@/components/landing/scroll-scenes/MemoryUnfoldSection'
import {
  PrivacySection,
  type GitHubRepoStats,
} from '@/components/landing/PrivacySection'
import { ProductShowcaseSection } from '@/components/landing/ProductShowcaseSection'
import { MotionProvider } from '@/components/landing/motion/MotionProvider'
import { REPO_URL } from '@/components/landing/tokens'

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'VectorGallery',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web, Android, Linux, macOS, Windows',
  license: 'https://opensource.org/licenses/Apache-2.0',
  codeRepository: REPO_URL,
  description:
    'Open-source Personal AI Cloud for your photographs, handwritten notes, receipts, and documents. Find what you remember, without remembering where you saved it.',
}

export default function HomePage() {
  const [githubStats, setGithubStats] = useState<GitHubRepoStats>({
    stars: null,
    forks: null,
    issues: null,
    license: 'Apache-2.0',
    language: 'TypeScript + Dart',
    live: false,
  })
  const [apkSizeLabel, setApkSizeLabel] = useState('107.8 MB')
  const [hasLocalApk, setHasLocalApk] = useState(true)

  useEffect(() => {
    let mounted = true

    fetch('/api/github-stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data) return
        setGithubStats({
          stars: typeof data.stars === 'number' ? data.stars : null,
          forks: typeof data.forks === 'number' ? data.forks : null,
          issues: typeof data.openIssues === 'number' ? data.openIssues : null,
          license: data.license || 'Apache-2.0',
          language: 'TypeScript + Dart',
          live: Boolean(data.available),
        })
      })
      .catch(() => {
        // Keep calm fallback metadata cleanly
      })

    fetch('/vectorgallery.apk', { method: 'HEAD' })
      .then((res) => {
        if (!mounted) return
        if (!res.ok) {
          setHasLocalApk(false)
          return
        }
        setHasLocalApk(true)
        const len = Number(res.headers.get('content-length') || 0)
        if (Number.isFinite(len) && len > 0) {
          setApkSizeLabel(`${(len / (1024 * 1024)).toFixed(1)} MB`)
        }
      })
      .catch(() => {
        // Fallback label remains unchanged
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <MotionProvider>
      <div className="vg-shell min-h-screen flex flex-col selection:bg-[#087F5B]/20 dark:selection:bg-[#46D6A4]/25 selection:text-[#101211] dark:selection:text-[#F4F6F2]">
        <Head>
          <title>VectorGallery — Everything you keep. Right where you need it.</title>
          <meta
            name="description"
            content="Find what you remember, without remembering where you saved it. An open-source personal cloud for your photos, notes, receipts, and Android camera roll."
          />
          <meta property="og:title" content="VectorGallery — Everything you keep. Right where you need it." />
          <meta
            property="og:description"
            content="Find what you remember, without remembering where you saved it. Private personal cloud storage with natural-language search and non-destructive Android backup."
          />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="/brand/social-preview.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="VectorGallery — Personal AI Cloud & Digital Memory Vault" />
          <meta
            name="twitter:description"
            content="Find what you remember, without remembering where you saved it. Photos, notes, documents, and Android backup in one quiet place."
          />
          <meta name="twitter:image" content="/brand/social-preview.png" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
          />
        </Head>

        <LandingNavbar
          stars={githubStats.live ? githubStats.stars : null}
          hasLocalApk={hasLocalApk}
        />

        <main id="main-content" className="flex-1">
          <HeroSection />
          <MemoryUnfoldSection />
          <InteractiveSearchDemo />
          <ProductShowcaseSection />
          <MobileSection apkSizeLabel={apkSizeLabel} />
          <PrivacySection githubStats={githubStats} />
          <FinalInvitationSection />
        </main>

        <FaqAndFooterSection />
      </div>
    </MotionProvider>
  )
}
