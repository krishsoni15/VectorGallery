import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { VG_COMPONENTS, VG_SPHERE_THEME_SPEC } from '@/components/landing/design-system'
import { LivingAuraCanvas } from '@/components/landing/shaders/LivingAuraCanvas'
import { useAuth } from '@/lib/AuthContext'

export default function Custom404() {
  const { user } = useAuth()
  return (
    <div className="vg-shell min-h-screen flex flex-col bg-[var(--vg-bg)] text-[var(--vg-ink)] selection:bg-[#087F5B]/20 dark:selection:bg-[#CDFF45]/25">
      <Head>
        <title>Page not found — VectorGallery</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <SiteHeader />

      <main className="relative flex-1 flex items-center justify-center overflow-hidden px-6 py-16">
        <LivingAuraCanvas
          variant="auto"
          intensity={0.78}
          className="absolute inset-0 z-0 pointer-events-none"
        />

        <div className="relative z-10 max-w-lg w-full text-center space-y-6">
          <div className="w-28 h-28 mx-auto">
            <img
              src={VG_SPHERE_THEME_SPEC.heroVideoPoster}
              alt="VectorGallery Memory Sphere"
              className="w-full h-full object-contain scale-105"
            />
          </div>

          <div className="space-y-3">
            <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-[#087F5B] dark:text-[#CDFF45]">
              404 · Route Missing
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.04em] text-[#101211] dark:text-[#F4F6F2]">
              Nothing stored here.
            </h1>
            <p className="text-[15.5px] leading-relaxed text-[var(--vg-ink-2)] max-w-md mx-auto">
              This address isn&rsquo;t part of your vault. Return to the landing overview or jump straight into your workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/" className={VG_COMPONENTS.buttons.limePill}>
              <ArrowLeft className="w-4 h-4" />
              <span>Return home</span>
            </Link>
            <Link href={user ? '/app' : '/signup'} className={VG_COMPONENTS.buttons.secondary}>
              <span>{user ? 'Open Web Vault' : 'Get started'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
