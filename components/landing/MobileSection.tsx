import React, { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  Cloud,
  Copy,
  Download,
  ExternalLink,
  FolderOpen,
  Home,
  Laptop,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Wifi,
} from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { cn } from '@/lib/utils'
import {
  VG_COMPONENTS,
  VG_LAYOUT,
  VG_MOTION,
  VG_TYPOGRAPHY,
} from './design-system'
import { MotionReveal } from './motion'
import { APK_EXPECTED_SHA256, RELEASES_URL } from './tokens'

type FlutterTab = 'home' | 'files' | 'chat' | 'search' | 'settings'

const HUMAN_BENEFITS = [
  {
    title: 'Back up automatically',
    detail: 'New camera shots and screenshots queue quietly whenever you are on Wi-Fi.',
  },
  {
    title: 'Keep your originals',
    detail: 'Read-only on your phone gallery — organizing or removing items in your vault never touches local photos.',
  },
  {
    title: 'Avoid duplicate uploads',
    detail: 'Already-backed-up memories are recognized and skipped automatically before any transfer begins.',
  },
  {
    title: 'Find your files from connected devices',
    detail: 'Moments captured on the move appear cleanly inside your desktop and tablet workspace.',
  },
] as const

const FLUTTER_TABS: Array<{
  id: FlutterTab
  label: string
  icon: typeof Home
}> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const CONTINUITY_STEPS = [
  { label: 'Phone', sub: 'Captured on camera' },
  { label: 'Queue', sub: 'Waits for Wi-Fi' },
  { label: 'Private Cloud', sub: 'Stored safely' },
  { label: 'Desktop', sub: 'Ready to search' },
] as const

export function MobileSection({
  apkSizeLabel = '107.8 MB',
}: {
  apkSizeLabel?: string
}) {
  const prefersReduced = useReducedMotion()
  const [activeTab, setActiveTab] = useState<FlutterTab>('home')
  const [showChecksum, setShowChecksum] = useState(false)
  const [copiedSha, setCopiedSha] = useState(false)

  const copySha = async () => {
    try {
      await navigator.clipboard.writeText(APK_EXPECTED_SHA256)
      setCopiedSha(true)
      setTimeout(() => setCopiedSha(false), 1800)
    } catch {
      // Clipboard unavailable in restricted context
    }
  }

  return (
    <section
      id="mobile"
      aria-label="Android companion application"
      className={cn(
        'relative overflow-hidden bg-[var(--vg-bg)]',
        VG_LAYOUT.sectionPadding.standard
      )}
    >
      <div className={VG_LAYOUT.containers.wide}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Copy, 4 Human Benefits, CTAs & Expandable Checksum */}
          <MotionReveal className="lg:col-span-5 space-y-6">
            <div
              className="inline-flex items-center gap-2 text-[var(--vg-ink-2)]"
              style={{
                fontSize: VG_TYPOGRAPHY.scale.kicker.fontSize,
                fontWeight: VG_TYPOGRAPHY.scale.kicker.fontWeight,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-[#58D6A8]" aria-hidden="true" />
              <span>Android Companion</span>
            </div>

            <h2
              className="font-display font-bold text-[var(--vg-ink)]"
              style={{
                fontSize: VG_TYPOGRAPHY.scale.h2.fontSize,
                lineHeight: VG_TYPOGRAPHY.scale.h2.lineHeight,
                letterSpacing: VG_TYPOGRAPHY.scale.h2.letterSpacing,
              }}
            >
              Your memories move with you.
            </h2>

            <p
              className="text-[var(--vg-ink-2)]"
              style={{
                fontSize: VG_TYPOGRAPHY.scale.lead.fontSize,
                lineHeight: VG_TYPOGRAPHY.scale.lead.lineHeight,
              }}
            >
              Back up your Android camera roll automatically over Wi-Fi without ever touching the
              originals on your phone — ready on desktop the moment you need them.
            </p>

            {/* 4 Human Benefits (Clean editorial list, no boxed cards) */}
            <ul className="space-y-3.5 pt-1">
              {HUMAN_BENEFITS.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-[#58D6A8] shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[14.5px] font-semibold text-[var(--vg-ink)]">
                      {benefit.title}
                    </p>
                    <p className="text-[13.5px] text-[var(--vg-ink-2)] leading-relaxed">
                      {benefit.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="/vectorgallery.apk"
                download="VectorGallery.apk"
                className={VG_COMPONENTS.buttons.primary}
              >
                <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Download for Android</span>
                <span className="ml-0.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/20 dark:bg-[#071912]/15">
                  ~{apkSizeLabel}
                </span>
              </a>

              <Link href="/install" className={VG_COMPONENTS.buttons.secondary}>
                <span>Installation guide</span>
              </Link>
            </div>

            {/* Compact Expandable SHA-256 Checksum Disclosure */}
            <div className="pt-1">
              <button
                type="button"
                aria-expanded={showChecksum}
                onClick={() => setShowChecksum((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)] rounded"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--vg-brand)]" aria-hidden="true" />
                <span>Verify APK checksum</span>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-200',
                    showChecksum && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </button>

              {showChecksum && (
                <div className="mt-3 p-4 rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-[var(--vg-ink)]">
                      Android v2.0.0+1 · SHA-256
                    </span>
                    <button
                      type="button"
                      onClick={copySha}
                      className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--vg-brand)] hover:underline"
                    >
                      {copiedSha ? (
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>{copiedSha ? 'Copied' : 'Copy checksum'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-[11px] break-all text-[var(--vg-ink-2)] bg-[var(--vg-surface)] px-3 py-2 rounded-xl border border-[var(--vg-border)] select-all">
                    {APK_EXPECTED_SHA256}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[var(--vg-ink-muted)]">
                    <span>Direct APK &amp; open-source build only (not on Google Play).</span>
                    <a
                      href={RELEASES_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[var(--vg-brand)] hover:underline"
                    >
                      <span>GitHub Releases</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </MotionReveal>

          {/* Right Column: Sculpted Dual-Hardware Story (Android Phone + Desktop Preview) */}
          <MotionReveal delay={0.08} className="lg:col-span-7 relative">
            {/* Subtle Ambient Studio Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 rounded-full opacity-60 dark:opacity-45 blur-3xl"
              style={{
                background:
                  'radial-gradient(ellipse 64% 58% at 50% 48%, rgba(166, 217, 208, 0.25), rgba(196, 237, 225, 0.14) 45%, transparent 74%)',
              }}
            />

            <div className="relative z-10 flex flex-col items-center lg:items-end gap-6">
              {/* Dual-Device Composition */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-5 sm:gap-0">
                {/* Sculpted Metallic-Bezel Android Phone */}
                <div className="relative z-20 w-[288px] sm:w-[296px] shrink-0">
                  {/* Side Metallic Volume & Power Keys */}
                  <span
                    aria-hidden="true"
                    className="hidden sm:block absolute -right-[3px] top-24 w-[3px] h-11 rounded-r bg-[#363D38] border-y border-r border-white/15"
                  />
                  <span
                    aria-hidden="true"
                    className="hidden sm:block absolute -right-[3px] top-40 w-[3px] h-7 rounded-r bg-[#363D38] border-y border-r border-white/15"
                  />

                  {/* Sculpted Metallic Titanium Bezel */}
                  <div className="p-[9px] rounded-[2.45rem] bg-gradient-to-b from-[#2B312D] via-[#171B18] to-[#0B0D0C] ring-1 ring-white/20 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.45)] dark:shadow-[0_36px_90px_-18px_rgba(0,0,0,0.85)]">
                    <div className="rounded-[1.9rem] overflow-hidden bg-[#090A0D] text-[#F4F5F7] border border-white/[0.08]">
                      {/* Android Status Bar + Punch-Hole Camera */}
                      <div className="px-5 pt-2.5 pb-1.5 flex items-center justify-between text-[10px] font-mono text-[#9AA0AC] bg-[#111318]">
                        <span>9:41</span>
                        <span
                          aria-hidden="true"
                          className="w-2.5 h-2.5 rounded-full bg-[#050608] ring-1 ring-white/15"
                        />
                        <svg
                          width="38"
                          height="10"
                          viewBox="0 0 38 10"
                          fill="none"
                          aria-hidden="true"
                          className="text-[#F4F5F7]"
                        >
                          <rect x="0" y="5" width="2" height="4" rx="0.6" fill="currentColor" opacity="0.5" />
                          <rect x="3" y="3.5" width="2" height="5.5" rx="0.6" fill="currentColor" opacity="0.75" />
                          <rect x="6" y="1.5" width="2" height="7.5" rx="0.6" fill="currentColor" />
                          <path
                            d="M14 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-2.5-2a3.6 3.6 0 0 1 5 0M10 4.2a5.8 5.8 0 0 1 8 0"
                            stroke="#58D6A8"
                            strokeWidth="1.15"
                            strokeLinecap="round"
                          />
                          <rect
                            x="22"
                            y="1.5"
                            width="13"
                            height="7"
                            rx="1.8"
                            stroke="currentColor"
                            strokeOpacity="0.55"
                            strokeWidth="1"
                          />
                          <rect x="23.5" y="3" width="9" height="4" rx="0.9" fill="#58D6A8" />
                        </svg>
                      </div>

                      {/* Real Flutter App Header */}
                      <div className="px-3.5 py-2.5 bg-[#111318] border-b border-white/[0.08] flex items-center justify-between">
                        <VectorGalleryLogo variant="on-dark" size="sm" />
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-medium bg-[#171A21] text-[#58D6A8] border border-[#58D6A8]/25">
                          <Wifi className="w-2.5 h-2.5" aria-hidden="true" />
                          <span>Wi-Fi</span>
                        </span>
                      </div>

                      {/* Flutter Screen Content matching mobile/lib/ */}
                      <div className="p-3 space-y-2.5 min-h-[304px] bg-[#090A0D]">
                        {activeTab === 'home' && (
                          <>
                            {/* VectorGallery Cloud Backup Sheet (from home_screen.dart) */}
                            <div className="p-3 rounded-2xl bg-[#111318] border border-white/[0.08] space-y-2.5">
                              <div className="flex items-center gap-2.5">
                                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#087F5B] to-[#58D6A8] flex items-center justify-center text-[#071912] shrink-0">
                                  <Cloud className="w-4 h-4" aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                  <p className="text-[11.5px] font-semibold text-[#F4F5F7] truncate">
                                    VectorGallery Cloud Backup
                                  </p>
                                  <p className="text-[10px] text-[#9AA0AC]">
                                    Wi-Fi connected · Originals untouched
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-xl overflow-hidden relative aspect-[16/10] border border-white/[0.08]">
                                <img
                                  src="/landing/photos/aura-personal-travel.webp"
                                  alt="Harbor walk photograph queuing and syncing in Flutter app"
                                  className="w-full h-full object-cover"
                                />
                                <div className="vg-photo-caption absolute inset-x-0 bottom-0 px-2.5 py-1.5 bg-gradient-to-t from-[#090A0D]/90 to-transparent flex items-center justify-between">
                                  <span className="text-[10px] font-mono">harbor_walk.webp</span>
                                  <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-[#171A21] text-[#58D6A8]">
                                    Syncing
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-[#9AA0AC]">
                                  <span>Uploading queue</span>
                                  <span className="font-mono text-[#58D6A8]">3 of 3 ready</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-[#171A21] overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-[#087F5B] to-[#58D6A8]"
                                    initial={prefersReduced ? { width: '94%' } : { width: '54%' }}
                                    animate={{ width: '94%' }}
                                    transition={{ duration: 1.1, ease: VG_MOTION.ease }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-xl overflow-hidden aspect-[4/3] border border-white/[0.08] relative">
                                <img
                                  src="/landing/photos/aura-family-morning.webp"
                                  alt="Family morning pears synced on Android"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="rounded-xl overflow-hidden aspect-[4/3] border border-white/[0.08] relative">
                                <img
                                  src="/landing/photos/aura-coastal-path.webp"
                                  alt="Coastal footpath photo synced on Android"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {activeTab === 'files' && (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-[#F4F5F7]">Synced Library</span>
                              <span className="text-[#58D6A8] text-[10px]">All backed up</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-xl overflow-hidden aspect-square border border-white/[0.08]">
                                <img
                                  src="/landing/photos/aura-personal-travel.webp"
                                  alt="Harbor walk memory"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="rounded-xl overflow-hidden aspect-square border border-white/[0.08]">
                                <img
                                  src="/landing/photos/aura-family-morning.webp"
                                  alt="Sunday kitchen morning memory"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="rounded-xl overflow-hidden aspect-square border border-white/[0.08]">
                                <img
                                  src="/landing/photos/aura-coastal-path.webp"
                                  alt="Coastal path memory"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="rounded-xl overflow-hidden aspect-square border border-white/[0.08]">
                                <img
                                  src="/landing/photos/aura-journal-desk.webp"
                                  alt="Handwritten journal spread"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'chat' && (
                          <div className="space-y-2.5">
                            <div className="p-2.5 rounded-xl bg-[#171A21] border border-white/[0.08] text-[11px] text-[#F4F5F7]">
                              “When did we take that harbor walk photo?”
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#111318] border border-[#58D6A8]/25 space-y-2">
                              <p className="text-[11px] text-[#D2D6DC] leading-relaxed">
                                Captured on <strong className="text-[#58D6A8]">August 4</strong> during
                                your coastal trip and backed up cleanly over Wi-Fi.
                              </p>
                              <div className="rounded-lg overflow-hidden aspect-[16/9]">
                                <img
                                  src="/landing/photos/aura-personal-travel.webp"
                                  alt="Harbor promenade photo cited in mobile AI chat"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'search' && (
                          <div className="space-y-2.5">
                            <div className="px-3 py-2 rounded-xl bg-[#171A21] border border-[#58D6A8]/35 flex items-center gap-2 text-[11px] text-[#F4F5F7]">
                              <Search className="w-3.5 h-3.5 text-[#58D6A8] shrink-0" aria-hidden="true" />
                              <span className="truncate">coastal footpath</span>
                            </div>
                            <div className="rounded-xl overflow-hidden aspect-[16/10] border border-white/[0.08]">
                              <img
                                src="/landing/photos/aura-coastal-path.webp"
                                alt="Coastal footpath matched in mobile search"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#111318] border border-white/[0.08]">
                              <p className="text-[11px] font-medium text-[#F4F5F7]">
                                chalk_cliff_footpath.webp
                              </p>
                              <p className="text-[10px] text-[#9AA0AC]">
                                Matched from your travel roll
                              </p>
                            </div>
                          </div>
                        )}

                        {activeTab === 'settings' && (
                          <div className="space-y-2">
                            <p className="text-[11px] font-semibold text-[#F4F5F7] mb-1">
                              Backup Preferences
                            </p>
                            {[
                              { label: 'Automatic backup', value: 'On' },
                              { label: 'Wi-Fi only', value: 'Enabled' },
                              { label: 'Keep phone originals', value: 'Always' },
                              { label: 'Skip duplicates', value: 'Active' },
                            ].map((row) => (
                              <div
                                key={row.label}
                                className="px-3 py-2 rounded-xl bg-[#111318] border border-white/[0.08] flex items-center justify-between text-[11px]"
                              >
                                <span className="text-[#D2D6DC]">{row.label}</span>
                                <span className="text-[#58D6A8] font-medium">{row.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Real 5-Tab Flutter BottomNavShell */}
                      <div className="px-1.5 py-2 bg-[#111318] border-t border-white/[0.08] grid grid-cols-5 gap-0.5">
                        {FLUTTER_TABS.map((tab) => {
                          const Icon = tab.icon
                          const active = activeTab === tab.id
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveTab(tab.id)}
                              className={cn(
                                'flex flex-col items-center gap-0.5 py-1 rounded-lg transition-colors',
                                active ? 'text-[#58D6A8]' : 'text-[#686E7B] hover:text-[#D2D6DC]'
                              )}
                            >
                              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                              <span className="text-[9px] font-medium leading-none">
                                {tab.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Android Gesture Bar */}
                      <div className="py-1.5 bg-[#090A0D] flex justify-center" aria-hidden="true">
                        <span className="w-16 h-1 rounded-full bg-white/20" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Luminous Emerald Stream -> Sleek Desktop Preview */}
                <div className="hidden sm:flex flex-col items-start sm:-ml-6 z-10 w-full max-w-[330px]">
                  {/* Animated Emerald Stream Bridge */}
                  <div className="w-full px-6 py-2 flex items-center gap-2" aria-hidden="true">
                    <span className="text-[10.5px] font-mono text-[var(--vg-ink-muted)] shrink-0">
                      Syncing
                    </span>
                    <svg viewBox="0 0 160 18" className="w-full h-4 overflow-visible">
                      <line
                        x1="0"
                        y1="9"
                        x2="160"
                        y2="9"
                        stroke="currentColor"
                        strokeOpacity="0.24"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        className="text-[var(--vg-brand)]"
                      />
                      {!prefersReduced ? (
                        <motion.circle
                          r="3.5"
                          cy="9"
                          fill="#58D6A8"
                          initial={{ cx: 4, opacity: 0.2 }}
                          animate={{ cx: [4, 80, 156], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      ) : (
                        <circle cx="80" cy="9" r="3.5" fill="#087F5B" />
                      )}
                    </svg>
                  </div>

                  {/* Sculpted Desktop Browser Frame */}
                  <div className="w-full rounded-2xl border border-[#E0E4DD] dark:border-white/[0.12] bg-[#FFFFFF] dark:bg-[#131614] shadow-[var(--vg-shadow-card)] overflow-hidden">
                    <div className="px-3.5 py-2.5 bg-[#F0F1EC] dark:bg-[#171A18] border-b border-[var(--vg-border)] flex items-center justify-between">
                      <div className="flex items-center gap-1.5" aria-hidden="true">
                        <span className="w-2 h-2 rounded-full bg-[#CBD2C7] dark:bg-white/20" />
                        <span className="w-2 h-2 rounded-full bg-[#CBD2C7] dark:bg-white/20" />
                        <span className="w-2 h-2 rounded-full bg-[#CBD2C7] dark:bg-white/20" />
                      </div>
                      <span className="text-[11px] font-medium text-[var(--vg-ink-2)] flex items-center gap-1.5">
                        <Laptop className="w-3 h-3 text-[var(--vg-brand)]" aria-hidden="true" />
                        <span>Desktop Library</span>
                      </span>
                    </div>

                    <div className="p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[var(--vg-ink)]">Just arrived</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C4EDE1]/65 text-[#066649] dark:bg-[#252A26] dark:text-[#58D6A8] font-medium">
                          From Phone
                        </span>
                      </div>

                      <div className="rounded-xl overflow-hidden aspect-[16/10] border border-[var(--vg-border)] relative">
                        <img
                          src="/landing/photos/aura-personal-travel.webp"
                          alt="Harbor walk memory appearing inside VectorGallery desktop library"
                          className="w-full h-full object-cover"
                        />
                        <div className="vg-photo-caption absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#0B0D0C]/75 text-[10px] font-mono">
                          harbor_walk.webp
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg overflow-hidden aspect-[4/3] border border-[var(--vg-border)]">
                          <img
                            src="/landing/photos/aura-family-morning.webp"
                            alt="Family kitchen pears synced to desktop"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="rounded-lg overflow-hidden aspect-[4/3] border border-[var(--vg-border)]">
                          <img
                            src="/landing/photos/aura-coastal-path.webp"
                            alt="Coastal footpath synced to desktop"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Continuity Strip: Phone -> Queue -> Private Cloud -> Desktop */}
              <div className="w-full rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] px-4 sm:px-6 py-4 shadow-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                  {CONTINUITY_STEPS.map((step, index) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#F0F1EC] dark:bg-[#171A18] border border-[var(--vg-border)] text-[11px] font-semibold text-[var(--vg-brand)] flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-[var(--vg-ink)] truncate">
                          {step.label}
                        </p>
                        <p className="text-[11px] text-[var(--vg-ink-muted)] truncate">
                          {step.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  )
}
