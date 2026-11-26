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
import { APK_EXPECTED_SHA256, RELEASES_URL } from '@/components/landing/tokens'
import { cn } from '@/lib/utils'

const INSTALL_STEPS = [
  {
    step: '01',
    title: 'Download the Android APK',
    description:
      'Tap "Download anyway" if your Android browser shows a standard prompt for direct package downloads.',
  },
  {
    step: '02',
    title: 'Allow install & launch',
    description:
      'Open the downloaded APK file cleanly and allow package installation from your browser source.',
  },
  {
    step: '03',
    title: 'Sync camera roll over Wi-Fi or Cloud',
    description:
      'Background sync hashes files with SHA-256 before transfer and queues offline via SQLite with non-destructive reads.',
  },
]

export default function InstallPage() {
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
          content="Download the VectorGallery Flutter Android companion app via verified direct APK or live Wi-Fi QR scan."
        />
      </Head>

      <div className="vg-shell min-h-screen bg-[var(--vg-bg)] text-[var(--vg-ink)] flex flex-col overflow-x-clip selection:bg-[#397BEE]/20">
        <SiteHeader />

        <main className="relative flex-1 px-5 sm:px-8 py-12 sm:py-20 overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 inset-x-0 h-[540px] bg-[radial-gradient(ellipse_75%_55%_at_60%_20%,rgba(57,123,238,0.16),transparent_72%)] dark:bg-[radial-gradient(ellipse_75%_55%_at_60%_20%,rgba(96,165,250,0.2),transparent_72%)]"
          />

          <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-12 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0.92, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#2563EB] dark:text-[#7DB8FF]">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Flutter Companion · v2.0.0+1</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-[-0.03em] leading-[1.02]">
                VectorGallery{' '}
                <span className="text-[#397BEE] dark:text-[#60A5FA]">
                  in your pocket.
                </span>
              </h1>

              <p className="text-[16px] text-[var(--vg-ink-2)] leading-relaxed max-w-lg">
                Automatic non-destructive mobile backup, SHA-256 deduplication, SQLite offline queueing, Wi-Fi-only gating, and instant memory search across your vault.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {hasLocalApk ? (
                  <button
                    type="button"
                    onClick={triggerDownload}
                    className="vg-blue-cta inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] font-semibold text-[14px] shadow-[0_10px_28px_-8px_rgba(37,99,235,0.45)] transition-all active:scale-[0.98]"
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
                    className="vg-blue-cta inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] font-semibold text-[14px] shadow-[0_10px_28px_-8px_rgba(37,99,235,0.45)] transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download from GitHub Releases</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl text-[14px] font-semibold bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[var(--vg-ink)] hover:border-[#397BEE]/45 transition-all shadow-sm"
                >
                  <span>Open Web Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Verified Checksum */}
              <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-[var(--vg-ink)]">
                    SHA-256 Checksum Verification
                  </span>
                  <button
                    type="button"
                    onClick={copySha}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
                  >
                    {copiedSha ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSha ? 'Copied SHA-256' : 'Copy SHA-256'}</span>
                  </button>
                </div>
                <p className="font-mono text-[11px] break-all text-[var(--vg-ink-2)] bg-[var(--vg-surface-2)] px-3 py-2 rounded-xl border border-[var(--vg-border)]">
                  {APK_EXPECTED_SHA256}
                </p>
                <p className="text-[11.5px] text-[var(--vg-ink-3)]">
                  Distributed directly via APK & Flutter source build (not listed on Google Play or App Store).
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
                            ? 'text-[#2563EB] dark:text-[#60A5FA] font-semibold'
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
                  <Wifi className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" /> Direct Wi-Fi LAN Sync
                </span>
                <a
                  href={RELEASES_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
                >
                  <span>GitHub Releases</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>

            {/* Right Column: Soft Blue Framed Handset + QR */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center gap-10">
              <motion.div
                initial={{ opacity: 0.96, y: 8 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="w-[264px] rounded-[38px] p-2.5 bg-gradient-to-b from-[#17243A] to-[#090F1C] shadow-[var(--vg-shadow-hero)] ring-1 ring-white/15 shrink-0"
              >
                <div className="rounded-[30px] overflow-hidden bg-[#090F1C] relative h-[460px] flex flex-col justify-between p-4">
                  <div className="relative z-10 flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <img src="/vectorgallery-icon.svg" alt="VectorGallery" className="w-5 h-5 rounded-md" />
                      <span className="text-xs font-semibold text-[#F1F5FF]">VectorGallery</span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#1C3150] text-[#93C5FD]">
                      READY
                    </span>
                  </div>
                  <div className="relative z-10 rounded-2xl overflow-hidden h-52 shadow-lg">
                    <img
                      src="/landing/photos/mountain-pass.webp"
                      alt="Curated mountain photograph synced cleanly"
                      className="w-full h-full object-cover"
                    />
                    <div className="vg-photo-caption absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#090F1C]/88 to-transparent">
                      <span className="text-[9px] font-mono text-[#93C5FD]">SYNCED · SHA-256</span>
                      <p className="text-xs font-medium text-[#F1F5FF]">Non-Destructive Backup</p>
                    </div>
                  </div>
                  <div className="relative z-10 rounded-full bg-[#111B2D]/90 border border-white/10 px-4 py-2 flex items-center justify-between text-[11px] text-[#F1F5FF]">
                    <span className="text-[#93C5FD]">Wi-Fi Guard</span>
                    <span className="font-mono text-[#94A3B8]">v2.0.0</span>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-3 text-center sm:text-left">
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--vg-ink-2)] block">
                  Scan on phone
                </span>
                <LiveQrCode path="/install" size={140} />
                <p className="text-[12px] text-[var(--vg-ink-2)] max-w-[200px]">
                  Open Android camera on the same Wi-Fi to open this page and download directly.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MotionConfig>
  )
}
