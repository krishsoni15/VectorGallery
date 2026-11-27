import React from 'react'
import Head from 'next/head'
import { SiteHeader } from '@/components/SiteHeader'
import { VG_LAYOUT } from '@/components/landing/design-system'
import { CompactFaqAndFooter } from '@/components/landing/footer/LivingMatterClosing'
import { UserGuideView } from '@/components/guide/UserGuideView'
import { cn } from '@/lib/utils'

export default function GuidePage() {
  return (
    <div className="vg-shell min-h-screen flex flex-col bg-[var(--vg-bg)] text-[var(--vg-ink)] selection:bg-[#087F5B]/20 dark:selection:bg-[#CDFF45]/25">
      <Head>
        <title>User Guide — How to use VectorGallery</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Step-by-step guide to VectorGallery: account creation, photo & OCR document uploads, semantic search, grounded AI chat, API keys, and Android sync."
        />
      </Head>

      <SiteHeader />

      <main className={cn(VG_LAYOUT.containers.wide, 'flex-1 py-10 sm:py-14')}>
        <UserGuideView inApp={false} />
      </main>

      <CompactFaqAndFooter />
    </div>
  )
}

