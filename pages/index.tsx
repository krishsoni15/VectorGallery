import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import {
  CommunityAndFormatsSection,
  type GitHubRepoStats,
} from '@/components/landing/CommunityAndFormatsSection'
import { EmotionalStorySection } from '@/components/landing/EmotionalStorySection'
import { FaqAndFooterSection } from '@/components/landing/FaqAndFooterSection'
import { FeatureBentoSection } from '@/components/landing/FeatureBentoSection'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksAndMemories } from '@/components/landing/HowItWorksAndMemories'
import { InteractiveSearchDemo } from '@/components/landing/InteractiveSearchDemo'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { ProductAndMobileSection } from '@/components/landing/ProductAndMobileSection'
import { ScrollMemoryStory } from '@/components/landing/ScrollMemoryStory'
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
    'Open-source Personal AI Cloud and Digital Memory Platform uniting private photo and file storage, optical OCR, document parsing, hybrid natural-language search, grounded AI citations, and non-destructive Android backup.',
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
    <div className="vg-shell min-h-screen flex flex-col selection:bg-[#397BEE]/20 selection:text-[#14233B] dark:selection:text-[#F1F5FF]">
      <Head>
        <title>VectorGallery — Personal AI Cloud & Digital Memory Vault</title>
        <meta
          name="description"
          content="Your digital life, beautifully connected. Open-source Personal AI Cloud combining private photo and document storage, OCR search, grounded AI answers, and non-destructive Android backup."
        />
        <meta property="og:title" content="VectorGallery — Personal AI Cloud & Digital Memory Vault" />
        <meta
          property="og:description"
          content="Open-source personal cloud storage, photo timeline, OCR screenshot intelligence, document indexing, and Flutter Android backup."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/brand/social-preview.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VectorGallery — Your Digital Memories, Beautifully Connected" />
        <meta
          name="twitter:description"
          content="Store photos, PDFs, screenshots & notes with natural-language search, grounded AI citations, and non-destructive Android Wi-Fi backup."
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
        <ScrollMemoryStory />
        <InteractiveSearchDemo />
        <EmotionalStorySection />
        <FeatureBentoSection />
        <HowItWorksAndMemories />
        <ProductAndMobileSection apkSizeLabel={apkSizeLabel} />
        <CommunityAndFormatsSection githubStats={githubStats} />
      </main>

      <FaqAndFooterSection apkSizeLabel={apkSizeLabel} />
    </div>
  )
}
