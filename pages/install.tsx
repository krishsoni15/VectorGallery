import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion, MotionConfig } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  Smartphone,
  Wifi,
} from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { LiveQrCode } from '@/components/LiveQrCode'
import { VG_COMPONENTS, VG_LAYOUT } from '@/components/landing/design-system'
import { LivingAuraCanvas } from '@/components/landing/shaders/LivingAuraCanvas'
import { APK_EXPECTED_SHA256, RELEASES_URL } from '@/components/landing/tokens'
import { useAuth } from '@/lib/AuthContext'
import { cn } from '@/lib/utils'

const INSTALL_STEPS = [
  {
    step: '01',
    title: 'Download the Android APK',
    description:
      'Tap "Download anyway" if your Android browser shows a standard confirmation prompt for direct app downloads.',
  },
  {
    step: '02',
    title: 'Allow install & launch',
    description:
      'Open the downloaded APK file and allow package installation from your browser source.',
  },
  {
    step: '03',
    title: 'Back up gently over Wi-Fi',
    description:
      'Photos and screenshots sync automatically without duplicates and never touch the originals on your phone.',
  },
]

export default function InstallPage() {
  const { user } = useAuth()
  const [downloadStarted, setDownloadStarted] = useState(false)
  const [hasLocalApk, setHasLocalApk] = useState<boolean>(true)
  const [apkSizeMb, setApkSizeMb] = useState<string>('107.8 MB')
  const [activeStep, setActiveStep] = useState<string>('01')
  const [copiedSha, setCopiedSha] = useState(false)

  const apkUrl = '/vectorgallery.apk'

  useEffect(() => {
    let active = true
    fetch(apkUrl, { method: 'HEAD' })
      .then((res) => {
        if (!active) return
        if (res.ok) {
          setHasLocalApk(true)
          const bytes = Number(res.headers.get('content-length') || 0)
          if (bytes > 0) setApkSizeMb(`${(bytes / (1024 * 1024)).toFixed(1)} MB`)
        } else {
          setHasLocalApk(false)
        }
      })
      .catch(() => {
        if (active) setHasLocalApk(false)
      })
    return () => {
      active = false
    }
  }, [])

  const triggerDownload = () => {
    setDownloadStarted(true)
    const link = document.createElement('a')
    link.href = apkUrl
    link.download = 'VectorGallery-v2.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copySha = async () => {
    try {
      await navigator.clipboard.writeText(APK_EXPECTED_SHA256)
      setCopiedSha(true)
      setTimeout(() => setCopiedSha(false), 1800)
    } catch {
      // Clipboard blocked
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <Head>
        <title>Download Android App — VectorGallery</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Download the VectorGallery Android companion app via verified direct APK or QR scan."
        />
      </Head>

      <div className="vg-shell min-h-screen bg-[var(--vg-bg)] text-[var(--vg-ink)] flex flex-col overflow-x-clip selection:bg-[#087F5B]/20 dark:selection:bg-[#CFFF49]/25">
        <SiteHeader />

        <main className="relative flex-1 py-10 sm:py-14 lg:py-16 overflow-hidden flex items-center">
          <LivingAuraCanvas
            variant="auto"
            intensity={0.78}
            className="absolute inset-0 z-0 pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[44%] z-[1] bg-gradient-to-b from-[#F4F5F2] via-[#F4F5F2]/80 to-transparent dark:from-[#090B0D] dark:via-[#090B0D]/80 dark:to-transparent"
          />

          <div className={cn(VG_LAYOUT.containers.wide, 'relative z-10 grid lg:grid-cols-12 gap-12 xl:gap-16 items-center')}>
            <motion.div
              initial={{ opacity: 0.92, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#111416] border border-[var(--vg-border)] text-[12px] font-mono uppercase tracking-[0.12em] text-[#087F5B] dark:text-[#CDFF45]">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android Companion · v2.0.0</span>
              </div>

              <h1
                className="font-display font-bold tracking-[-0.04em] leading-[1.0] text-[var(--vg-ink)]"
                style={{ fontSize: 'clamp(2.45rem, 5vw, 4.75rem)', textWrap: 'balance' }}
              >
                VectorGallery in your{'\u00A0'}pocket.
              </h1>

              <p className="text-[16px] sm:text-[17.5px] text-[var(--vg-ink-2)] leading-relaxed max-w-xl">
                Automatic Wi-Fi backup that skips duplicates, keeps originals safe on your phone, and brings every memory straight to your desktop library.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                {hasLocalApk ? (
                  <button
                    type="button"
                    onClick={triggerDownload}
                    className={cn(VG_COMPONENTS.buttons.limePill, 'px-7')}
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {downloadStarted
                        ? 'Downloading VectorGallery APK...'
                        : `Download APK (${apkSizeMb})`}
                    </span>
                  </button>
                ) : (
                  <a
                    href={RELEASES_URL}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(VG_COMPONENTS.buttons.limePill, 'px-7')}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download from GitHub Releases</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <Link
                  href={user ? '/app' : '/signup'}
                  className={VG_COMPONENTS.buttons.secondary}
                >
                  <span>{user ? 'Open Web Workspace' : 'Get started'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Verified Checksum */}
              <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-4 space-y-2 shadow-[var(--vg-shadow-card)]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-[var(--vg-ink)]">
                    SHA-256 Checksum Verification
                  </span>
                  <button
                    type="button"
                    onClick={copySha}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#087F5B] dark:text-[#58D6A8] hover:underline"
                  >
                    {copiedSha ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSha ? 'Copied SHA-256' : 'Copy SHA-256'}</span>
                  </button>
                </div>
                <p className="font-mono text-[11px] break-all text-[var(--vg-ink-2)] bg-[var(--vg-surface-2)] px-3 py-2 rounded-xl border border-[var(--vg-border)]">
                  {APK_EXPECTED_SHA256}
                </p>
                <p className="text-[11.5px] text-[var(--vg-ink-3)]">
                  Distributed directly via signed APK &amp; open-source Flutter build (not listed on Google Play or App Store).
                </p>
              </div>

              <div className="pt-2 divide-y divide-[var(--vg-border)] border-y border-[var(--vg-border)]">
                {INSTALL_STEPS.map((item) => {
                  const selected = activeStep === item.step
                  return (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => setActiveStep(item.step)}
                      className="w-full py-4 text-left flex items-start gap-4 group transition-colors"
                    >
                      <span
                        className={cn(
                          'text-[12px] font-mono pt-0.5 transition-colors',
                          selected
                            ? 'text-[#087F5B] dark:text-[#58D6A8] font-semibold'
                            : 'text-[var(--vg-ink-3)]'
                        )}
                      >
                        {item.step}
                      </span>
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold text-[var(--vg-ink)]">
                          {item.title}
                        </p>
                        {selected && (
                          <p className="text-[13px] text-[var(--vg-ink-2)] mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-wrap items-center gap-5 text-[12px] text-[var(--vg-ink-2)]">
                <span className="inline-flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#58D6A8]" /> Wi-Fi only backup supported
                </span>
                <a
                  href={RELEASES_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#087F5B] dark:hover:text-[#58D6A8] transition-colors"
                >
                  <span>GitHub Releases</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <Link
                  href="/guide"
                  className="inline-flex items-center gap-1 hover:text-[#087F5B] dark:hover:text-[#58D6A8] transition-colors"
                >
                  <span>User Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Obsidian Hardware Handset + Smart QR */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center gap-10">
              <motion.div
                initial={{ opacity: 0.96, y: 8 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="w-[264px] rounded-[38px] p-2.5 bg-gradient-to-b from-[#252A26] to-[#0B0D0C] shadow-[var(--vg-shadow-hero)] ring-1 ring-white/15 shrink-0"
              >
                <div className="rounded-[30px] overflow-hidden bg-[#0B0D0C] relative h-[460px] flex flex-col justify-between p-4">
                  <div className="relative z-10 flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <img src="/vectorgallery-icon.svg" alt="VectorGallery" className="w-5 h-5 rounded-md" />
                      <span className="text-xs font-semibold text-[#F2F3EF]">VectorGallery</span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#171A18] text-[#58D6A8] border border-[#58D6A8]/25">
                      READY
                    </span>
                  </div>
                  <div className="relative z-10 rounded-2xl overflow-hidden h-52 shadow-lg border border-white/10">
                    <img
                      src="/landing/photos/aura-personal-travel.webp"
                      alt="Personal travel film photograph synced from Android"
                      className="w-full h-full object-cover"
                    />
                    <div className="vg-photo-caption absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#0B0D0C]/90 to-transparent">
                      <span className="text-[9px] font-mono text-[#58D6A8]">SYNCED · SHA-256</span>
                      <p className="text-xs font-medium text-[#F2F3EF]">Originals Stay Safe</p>
                    </div>
                  </div>
                  <div className="relative z-10 rounded-full bg-[#131614]/95 border border-white/10 px-4 py-2 flex items-center justify-between text-[11px] text-[#F2F3EF]">
                    <span className="text-[#58D6A8]">Wi-Fi Guard</span>
                    <span className="font-mono text-[#A3ADA5]">v2.0.0</span>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-3 text-center sm:text-left">
                <span className="text-[12px] font-medium text-[var(--vg-ink-2)] block">
                  Scan on phone
                </span>
                <LiveQrCode path="/install" size={140} />
                <p className="text-[12px] text-[var(--vg-ink-2)] max-w-[230px]">
                  Scan with your Android camera to open the installer on your phone.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MotionConfig>
  )
}
