import React, { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Check,
  CheckCircle2,
  Cloud,
  Copy,
  Database,
  Download,
  ExternalLink,
  FolderCheck,
  QrCode,
  Search,
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

type DeviceTab = 'backup' | 'gallery' | 'recall'

const MOBILE_HIGHLIGHTS = [
  {
    icon: Wifi,
    title: 'Wi-Fi only backup',
    detail: 'Pauses off Wi-Fi and resumes automatically on your home network.',
  },
  {
    icon: ShieldCheck,
    title: 'Non-destructive sync',
    detail: 'Read-only on your phone gallery; vault actions never delete originals.',
  },
  {
    icon: Database,
    title: 'SHA-256 deduplication',
    detail: 'Pre-flight hash check skips duplicates via a persistent SQLite retry queue.',
  },
] as const

const DEVICE_TABS: Array<{ id: DeviceTab; label: string }> = [
  { id: 'backup', label: 'Backup Queue' },
  { id: 'gallery', label: 'Phone Gallery' },
  { id: 'recall', label: 'Mobile Recall' },
]

export function MobileSection({
  apkSizeLabel = '107.8 MB',
}: {
  apkSizeLabel?: string
}) {
  const prefersReduced = useReducedMotion()
  const [activeTab, setActiveTab] = useState<DeviceTab>('backup')
  const [copiedSha, setCopiedSha] = useState(false)

  const copySha = async () => {
    try {
      await navigator.clipboard.writeText(APK_EXPECTED_SHA256)
      setCopiedSha(true)
      setTimeout(() => setCopiedSha(false), 1800)
    } catch {
      // Clipboard unavailable in restricted browser contexts
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
      <div className={VG_LAYOUT.containers.standard}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Copy, APK Download, SHA-256 & 3 Core Mechanics */}
          <MotionReveal className="lg:col-span-6 space-y-6">
            <span className={VG_COMPONENTS.badges.sage}>
              <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Flutter Android Companion · v2.0.0+1</span>
            </span>

            <h2
              className="font-display font-bold tracking-[-0.03em] leading-[1.08] text-[var(--vg-ink)]"
              style={{
                fontSize: VG_TYPOGRAPHY.scale.h2.fontSize,
                lineHeight: VG_TYPOGRAPHY.scale.h2.lineHeight,
                letterSpacing: VG_TYPOGRAPHY.scale.h2.letterSpacing,
              }}
            >
              Your world,{' '}
              <em className={VG_TYPOGRAPHY.editorialWordClass}>wherever</em>{' '}
              you go.
            </h2>

            <p
              className="text-[var(--vg-ink-2)] max-w-xl"
              style={{
                fontSize: VG_TYPOGRAPHY.scale.lead.fontSize,
                lineHeight: VG_TYPOGRAPHY.scale.lead.lineHeight,
              }}
            >
              Automatic, non-destructive Android backup over Wi-Fi. Built in Flutter with a
              persistent SQLite retry queue and SHA-256 pre-check so phone originals stay untouched.
            </p>

            {/* Primary APK CTA + /install Guide */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="/vectorgallery.apk"
                download="VectorGallery.apk"
                className={VG_COMPONENTS.buttons.primary}
              >
                <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Download Android APK</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#FFFFFF]/15 dark:bg-[#061811]/15">
                  ~{apkSizeLabel}
                </span>
              </a>

              <Link href="/install" className={VG_COMPONENTS.buttons.secondary}>
                <QrCode className="w-4 h-4 text-[var(--vg-brand)]" aria-hidden="true" />
                <span>Install &amp; QR Guide</span>
              </Link>
            </div>

            {/* 3 Succinct Feature Highlights */}
            <ul className="space-y-3 pt-1">
              {MOBILE_HIGHLIGHTS.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.title} className="flex items-start gap-3.5">
                    <span className="w-8 h-8 rounded-xl bg-[var(--vg-surface-soft)] border border-[var(--vg-border)] flex items-center justify-center text-[var(--vg-brand)] shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--vg-ink)]">
                        {item.title}
                      </p>
                      <p className="text-[13px] text-[var(--vg-ink-2)] leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>

            {/* Verified SHA-256 Checksum & Honest Distribution */}
            <div className={cn(VG_COMPONENTS.cards.secondary, 'p-4 space-y-2.5')}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-[var(--vg-ink)]">
                  Verified APK SHA-256 Checksum
                </span>
                <button
                  type="button"
                  onClick={copySha}
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--vg-brand)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)] rounded"
                >
                  {copiedSha ? (
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{copiedSha ? 'SHA-256 Copied' : 'Copy SHA-256'}</span>
                </button>
              </div>
              <p className="font-mono text-[11px] break-all text-[var(--vg-ink-2)] bg-[var(--vg-surface)] px-3 py-2 rounded-xl border border-[var(--vg-border)] select-all">
                {APK_EXPECTED_SHA256}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--vg-ink-muted)]">
                <span>
                  Direct APK &amp; source build only (not published on Google Play or App Store).
                </span>
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
          </MotionReveal>

          {/* Right Column: Cinematic CSS/SVG Android Hardware Mockup + Phone-to-Cloud Flow */}
          <MotionReveal delay={0.08} className="lg:col-span-6 relative flex flex-col items-center">
            {/* Soft Sanctuary Mint/Jade Backdrop Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 rounded-full opacity-75 dark:opacity-55 blur-3xl"
              style={{
                background:
                  'radial-gradient(circle at 50% 48%, rgba(83, 217, 163, 0.22), rgba(184, 231, 212, 0.16) 45%, transparent 72%)',
              }}
            />

            {/* Screen Selector Pills */}
            <div
              role="tablist"
              aria-label="Flutter Android screen preview"
              className="relative z-10 inline-flex items-center gap-1.5 p-1 rounded-full border border-[var(--vg-border)] bg-[var(--vg-surface)]/95 backdrop-blur-md shadow-sm mb-5"
            >
              {DEVICE_TABS.map((tab) => {
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all',
                      active
                        ? 'bg-[#087F5B] text-[#FFFFFF] dark:bg-[#53D9A3] dark:text-[#061811] shadow-sm'
                        : 'text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)]'
                    )}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Animated Phone -> Cloud Transfer Bridge */}
            <div className="relative z-10 w-full max-w-[356px] mb-4 px-4 py-2.5 rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)]/90 backdrop-blur-md shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-7 h-7 rounded-lg bg-[#101914] border border-[#53D9A3]/30 flex items-center justify-center text-[#53D9A3]">
                  <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="text-[11px] font-mono text-[var(--vg-ink)]">DCIM</span>
              </div>

              {/* SVG Transfer Stream */}
              <div className="relative flex-1 h-6 flex items-center" aria-hidden="true">
                <svg viewBox="0 0 140 24" className="w-full h-6 overflow-visible">
                  <line
                    x1="4"
                    y1="12"
                    x2="136"
                    y2="12"
                    stroke="currentColor"
                    strokeOpacity="0.22"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="text-[var(--vg-brand)]"
                  />
                  {!prefersReduced && (
                    <motion.circle
                      r="3.5"
                      cy="12"
                      fill="#53D9A3"
                      initial={{ cx: 8, opacity: 0 }}
                      animate={{ cx: [8, 70, 132], opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                  {prefersReduced && (
                    <circle cx="70" cy="12" r="3.5" fill="#087F5B" />
                  )}
                </svg>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-[var(--vg-brand)]">Vault</span>
                <span className="w-7 h-7 rounded-lg bg-[var(--vg-surface-soft)] border border-[var(--vg-brand)]/25 flex items-center justify-center text-[var(--vg-brand)]">
                  <Cloud className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
            </div>

            {/* CSS/SVG Android Hardware Device Frame */}
            <div className="relative z-10 w-full max-w-[332px]">
              {/* Side Hardware Keys */}
              <span
                aria-hidden="true"
                className="hidden sm:block absolute -right-1.5 top-28 w-1 h-12 rounded-r bg-[#1C3329] border border-[#B8E7D4]/20"
              />
              <span
                aria-hidden="true"
                className="hidden sm:block absolute -right-1.5 top-44 w-1 h-8 rounded-r bg-[#1C3329] border border-[#B8E7D4]/20"
              />

              {/* Outer Bezel */}
              <div
                className={cn(
                  'p-[10px] bg-[#0B1612] border border-[#B8E7D4]/18',
                  VG_LAYOUT.radii.device,
                  VG_LAYOUT.shadows.hero
                )}
              >
                {/* Inner OLED Screen */}
                <div className="rounded-[1.7rem] overflow-hidden bg-[#080E0C] text-[#EFF7F3] border border-[#B8E7D4]/12">
                  {/* Realistic Android Status Bar + Punch-Hole Camera */}
                  <div className="px-5 pt-3 pb-2 flex items-center justify-between text-[10.5px] font-mono text-[#9CB6AA] bg-[#0B1410]">
                    <span>9:41</span>
                    {/* Punch-hole selfie camera */}
                    <span
                      aria-hidden="true"
                      className="w-3 h-3 rounded-full bg-[#040806] ring-1 ring-[#B8E7D4]/20 flex items-center justify-center"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#1C3329]" />
                    </span>
                    {/* SVG Signal / Wi-Fi / Battery */}
                    <svg
                      width="42"
                      height="11"
                      viewBox="0 0 42 11"
                      fill="none"
                      aria-hidden="true"
                      className="text-[#EFF7F3]"
                    >
                      <rect x="0" y="6" width="2" height="4" rx="0.6" fill="currentColor" opacity="0.55" />
                      <rect x="3.5" y="4" width="2" height="6" rx="0.6" fill="currentColor" opacity="0.75" />
                      <rect x="7" y="2" width="2" height="8" rx="0.6" fill="currentColor" />
                      <path
                        d="M15 8.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm-2.8-2.3a4 4 0 0 1 5.6 0M10.4 4.3a6.6 6.6 0 0 1 9.2 0"
                        stroke="#53D9A3"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <rect
                        x="25"
                        y="2"
                        width="14"
                        height="7.5"
                        rx="2"
                        stroke="currentColor"
                        strokeOpacity="0.55"
                        strokeWidth="1"
                      />
                      <rect x="26.5" y="3.5" width="9.5" height="4.5" rx="1" fill="#53D9A3" />
                      <rect x="39.5" y="4.3" width="1.5" height="3" rx="0.6" fill="currentColor" opacity="0.55" />
                    </svg>
                  </div>

                  {/* Flutter App Header */}
                  <div className="px-4 py-2.5 bg-[#101914] border-y border-[#B8E7D4]/10 flex items-center justify-between">
                    <VectorGalleryLogo variant="on-dark" size="sm" />
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1C3329] text-[#53D9A3] border border-[#53D9A3]/25">
                      <Wifi className="w-2.5 h-2.5" aria-hidden="true" />
                      <span>Wi-Fi Only</span>
                    </span>
                  </div>

                  {/* Active Flutter Screen Body */}
                  <div className="p-3.5 space-y-3 min-h-[332px] bg-[#080E0C]">
                    {activeTab === 'backup' && (
                      <>
                        <div className="rounded-2xl overflow-hidden relative aspect-[16/10] border border-[#B8E7D4]/15">
                          <img
                            src="/landing/photos/misty-pines.webp"
                            alt="Misty evergreen ridge synced in Android backup queue"
                            className="w-full h-full object-cover"
                          />
                          <div className="vg-photo-caption absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-[#080E0C]/90 via-[#080E0C]/45 to-transparent flex items-center justify-between">
                            <span className="text-[10.5px] font-mono">IMG_2026_PINES.webp</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1C3329]/90 text-[#53D9A3] border border-[#53D9A3]/30">
                              SHA-256 OK
                            </span>
                          </div>
                        </div>

                        {/* SQLite Queue Card */}
                        <div className="p-3 rounded-2xl bg-[#101914] border border-[#B8E7D4]/12 space-y-2">
                          <div className="flex items-center justify-between text-[11.5px]">
                            <span className="font-semibold text-[#EFF7F3]">SQLite Upload Queue</span>
                            <span className="font-mono text-[10.5px] text-[#53D9A3]">14 / 14 synced</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#1C3329] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-[#087F5B] to-[#53D9A3]"
                              initial={prefersReduced ? { width: '92%' } : { width: '58%' }}
                              animate={{ width: '92%' }}
                              transition={{ duration: 1.1, ease: VG_MOTION.ease }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10.5px] text-[#9CB6AA]">
                            <span>Folders: Camera, Screenshots</span>
                            <span>0 deleted locally</span>
                          </div>
                        </div>

                        {/* Secondary Synced Row */}
                        <div className="p-2.5 rounded-xl bg-[#111C17] border border-[#B8E7D4]/10 flex items-center gap-2.5">
                          <img
                            src="/landing/photos/lake-morning.webp"
                            alt="Morning lake canoe photo backed up non-destructively"
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11.5px] font-semibold text-[#EFF7F3] truncate">
                              Lake_Morning_Canoe.webp
                            </p>
                            <p className="text-[10px] text-[#9CB6AA] truncate">
                              Deduplicated · Read-only source
                            </p>
                          </div>
                          <FolderCheck className="w-4 h-4 text-[#53D9A3] shrink-0" aria-hidden="true" />
                        </div>
                      </>
                    )}

                    {activeTab === 'gallery' && (
                      <>
                        <div className="flex items-center justify-between text-[11px] text-[#9CB6AA]">
                          <span className="font-semibold text-[#EFF7F3]">Camera Roll · November</span>
                          <span className="font-mono text-[#53D9A3]">Non-Destructive</span>
                        </div>
                        <div className="rounded-2xl overflow-hidden relative aspect-[16/10] border border-[#B8E7D4]/15">
                          <img
                            src="/landing/photos/snow-expedition.webp"
                            alt="Alpine snow expedition tent featured in Android phone gallery"
                            className="w-full h-full object-cover"
                          />
                          <span className="vg-photo-caption absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#080E0C]/80 border border-[#B8E7D4]/20">
                            Alpine_Basecamp.webp · Backed Up
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="rounded-xl overflow-hidden aspect-[4/3] border border-[#B8E7D4]/12 relative">
                            <img
                              src="/landing/photos/lake-morning.webp"
                              alt="Morning canoe trip thumbnail"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="rounded-xl overflow-hidden aspect-[4/3] border border-[#B8E7D4]/12 relative">
                            <img
                              src="/landing/photos/misty-pines.webp"
                              alt="Misty pine forest thumbnail"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === 'recall' && (
                      <>
                        <div className="px-3 py-2 rounded-xl bg-[#101914] border border-[#53D9A3]/30 flex items-center gap-2 text-[11.5px] text-[#EFF7F3]">
                          <Search className="w-3.5 h-3.5 text-[#53D9A3] shrink-0" aria-hidden="true" />
                          <span className="truncate">“warm canyon sunset ridge”</span>
                        </div>
                        <div className="rounded-2xl overflow-hidden relative aspect-[16/10] border border-[#B8E7D4]/15">
                          <img
                            src="/landing/photos/canyon-dusk.webp"
                            alt="Golden canyon ridge at dusk matched by mobile recall"
                            className="w-full h-full object-cover"
                          />
                          <span className="vg-photo-caption absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1C3329]/90 text-[#53D9A3] border border-[#53D9A3]/30">
                            98% Match
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#111C17] border border-[#B8E7D4]/12 space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#53D9A3]">
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            <span>Grounded Recall</span>
                          </div>
                          <p className="text-[11px] text-[#9CB6AA] leading-snug">
                            Canyon_Dusk_Horizon.webp · Backed up from DCIM/Camera over Wi-Fi.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Flutter Bottom Navigation Bar */}
                  <div className="px-3 py-2 bg-[#101914] border-t border-[#B8E7D4]/10 grid grid-cols-3 gap-1 text-[10px]">
                    {DEVICE_TABS.map((tab) => {
                      const active = activeTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            'py-1.5 rounded-lg font-medium transition-colors',
                            active
                              ? 'bg-[#1C3329] text-[#53D9A3]'
                              : 'text-[#749184] hover:text-[#EFF7F3]'
                          )}
                        >
                          {tab.id === 'backup' ? 'Home' : tab.id === 'gallery' ? 'Files' : 'Search'}
                        </button>
                      )
                    })}
                  </div>

                  {/* Android Gesture Pill */}
                  <div className="py-2 bg-[#080E0C] flex justify-center" aria-hidden="true">
                    <span className="w-20 h-1 rounded-full bg-[#B8E7D4]/25" />
                  </div>
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  )
}
