import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  Download,
  FolderOpen,
  Home,
  MessageSquare,
  QrCode,
  Search,
  Settings,
  Wifi,
} from 'lucide-react'
import { VG_COMPONENTS } from '@/components/landing/design-system'
import { SplitTextReveal } from '@/components/landing/motion/LivingMotionPrimitives'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'
import { APK_EXPECTED_SHA256 } from '@/components/landing/tokens'
import { Container, Section } from '@/components/landing/ui'
import { cn } from '@/lib/utils'

interface MobileCrossDeviceSectionProps {
  apkSizeLabel?: string
}

type FlutterTabId = 'home' | 'files' | 'ai' | 'search' | 'settings'
type SyncStage = 'capture' | 'queue' | 'library' | 'searchable'

const FLUTTER_TABS: Array<{ id: FlutterTabId; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'ai', label: 'Recall', icon: MessageSquare },
]

const SYNC_STAGES: Array<{ id: SyncStage; label: string; caption: string; phoneTab: FlutterTabId }> = [
  { id: 'capture', label: 'Capture', caption: 'Photograph or scan a ticket on Android.', phoneTab: 'home' },
  { id: 'queue', label: 'Queue', caption: 'Queued automatically over Wi-Fi without touching originals.', phoneTab: 'files' },
  { id: 'library', label: 'Desktop library', caption: 'Lands directly inside your desktop timeline.', phoneTab: 'home' },
  { id: 'searchable', label: 'Searchable', caption: 'Optical text becomes ready for natural lookup.', phoneTab: 'search' },
]

/**
 * Unified Shared Cross-Device Stage:
 * Connects a realistic sculpted titanium Android bezel to a desktop vault frame
 * via an aligned horizontal luminance conduit showing live capture-to-desktop flow.
 */
export function MobileCrossDeviceSection({ apkSizeLabel = '23.1 MB' }: MobileCrossDeviceSectionProps) {
  const reduced = useReducedMotion()
  const [syncStage, setSyncStage] = useState<SyncStage>('library')

  const stageIdx = SYNC_STAGES.findIndex((s) => s.id === syncStage)
  const phoneTab = SYNC_STAGES[stageIdx]?.phoneTab ?? 'home'

  return (
    <Section id="mobile" surface="default" ariaLabel="Android companion capture and cross-device sync" className="py-20 sm:py-24">
      <Container wide className="scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Narrative & Clean Single-Focus Download Action */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-[13px] font-medium text-[#087F5B] dark:text-[#46D6A4] mb-2.5">
                Android Companion App
              </p>

              <SplitTextReveal
                as="h2"
                text="Capture here. Find it anywhere."
                className="font-display font-bold tracking-[-0.04em] leading-[1.03] text-[#101211] dark:text-[#F4F6F2]"
                style={{ fontSize: 'clamp(2.1rem, 4.1vw, 4.1rem)' }}
              />

              <p className="mt-3.5 text-[15.5px] sm:text-[16.5px] leading-[1.6] text-[var(--vg-ink-2)]">
                Your Android camera roll and scans back up automatically over Wi-Fi without ever touching the originals on your phone.
              </p>
            </div>

            {/* Clean Minimalist 4-Step Segmented Pipeline */}
            <div className="space-y-3 border-l-2 border-[var(--vg-border)] pl-4">
              <div className="inline-flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]">
                {SYNC_STAGES.map((stage, i) => {
                  const active = stage.id === syncStage
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setSyncStage(stage.id)}
                      className={cn(
                        'px-3 py-1 rounded-xl text-[12px] font-medium transition-colors',
                        active
                          ? 'bg-[#FFFFFF] dark:bg-[#111416] text-[#101211] dark:text-[#CDFF45] shadow-sm font-semibold'
                          : 'text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
                      )}
                    >
                      {i + 1}. {stage.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-[13.5px] text-[var(--vg-ink)] font-medium">
                {SYNC_STAGES[stageIdx]?.caption}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href="/vectorgallery.apk"
                download
                className={VG_COMPONENTS.buttons.limePill}
              >
                <Download className="w-4 h-4" />
                <span>Download Android ({apkSizeLabel})</span>
              </a>

              <Link
                href="/install"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#CDFF45] transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>Installation guide &rarr;</span>
              </Link>
            </div>

            {/* Compact Disclosed Technical Verification Details */}
            <details className="group text-[12px] text-[var(--vg-ink-2)]">
              <summary className="inline-flex items-center gap-1.5 cursor-pointer hover:text-[var(--vg-ink)] list-none select-none font-medium">
                <span>Technical package &amp; SHA-256 verification</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2.5 p-3.5 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)] space-y-1 font-mono text-[11px] break-all">
                <p>SHA-256: {APK_EXPECTED_SHA256}</p>
                <p className="text-[var(--vg-ink-2)]">
                  Signed open-source APK · Read-only media access · Local SQLite upload queue with duplicate skipping.
                </p>
              </div>
            </details>
          </div>

          {/* Right Realistic Shared Hardware Studio Stage */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-[2.2rem] border border-[var(--vg-border-strong)] bg-gradient-to-br from-[#FFFFFF] via-[#F4F5F2] to-[#E3E8EA]/80 dark:from-[#151A1D] dark:via-[#111416] dark:to-[#090B0D] p-5 sm:p-8 shadow-[var(--vg-shadow-hero)] overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-45 dark:opacity-25 bg-[radial-gradient(circle,rgba(205,255,69,0.28),transparent_70%)]"
              />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-5">
                {/* Realistic Sculpted Titanium Android Bezel */}
                <div className="relative w-full max-w-[265px] rounded-[2.4rem] p-[7px] bg-gradient-to-b from-[#D5DCDE] via-[#9EA9AE] to-[#7D878C] dark:from-[#3A4146] dark:via-[#22272A] dark:to-[#131618] shadow-[0_28px_60px_-18px_rgba(16,18,17,0.45)] shrink-0">
                  <div className="rounded-[2rem] bg-[#101211] p-1.5">
                    <div className="relative rounded-[1.7rem] bg-[#F4F5F2] dark:bg-[#090B0D] overflow-hidden flex flex-col min-h-[410px]">
                      {/* Camera Punch-Hole & Status */}
                      <div className="pt-2.5 pb-1 px-5 flex items-center justify-between text-[10px] font-medium text-[var(--vg-ink-2)]">
                        <span>09:41</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#101211] ring-1 ring-white/10" aria-hidden="true" />
                        <span>Wi-Fi</span>
                      </div>

                      {/* Top App Bar (calm status badge, no noisy toggle button) */}
                      <div className="px-4 pb-2.5 flex items-center justify-between border-b border-[var(--vg-border)] bg-[#FFFFFF] dark:bg-[#111416]">
                        <span className="font-display text-[13px] font-bold text-[#101211] dark:text-[#F4F6F2]">
                          VectorGallery
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#CDFF45] text-[#101211]">
                          <Wifi className="w-2.5 h-2.5" />
                          <span>Auto sync</span>
                        </span>
                      </div>

                      {/* Phone Viewport Screen Content */}
                      <div className="flex-1 p-3.5 space-y-3">
                        {phoneTab === 'home' && (
                          <>
                            <div className="p-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#111416] border border-[var(--vg-border)]">
                              <div className="flex items-center justify-between text-[11px] font-medium text-[#101211] dark:text-[#F4F6F2]">
                                <span>
                                  {syncStage === 'capture'
                                    ? 'New capture detected'
                                    : syncStage === 'queue'
                                      ? 'Queued over Wi-Fi'
                                      : 'Backed up cleanly'}
                                </span>
                                <span className="text-[10px] font-semibold text-[#087F5B] dark:text-[#46D6A4]">
                                  Read-only
                                </span>
                              </div>
                              <div className="mt-2 h-1.5 rounded-full bg-[#E9EDE8] dark:bg-[#191D20] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#087F5B] dark:bg-[#CDFF45] transition-all duration-300"
                                  style={{ width: `${(stageIdx + 1) * 25}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="aspect-square rounded-xl overflow-hidden border border-[var(--vg-border)]">
                                <img
                                  src="/landing/photos/aura-family-morning.webp"
                                  alt="Kitchen pears phone roll capture"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="aspect-square rounded-xl overflow-hidden border border-[#087F5B]/50 dark:border-[#CDFF45]/60 ring-1 ring-[#CDFF45]/35">
                                <img
                                  src="/landing/photos/aura-ticket-coastal.webp"
                                  alt="Captured Coastal Line train pass ready for sync"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {phoneTab === 'files' && (
                          <div className="space-y-2">
                            {[
                              { name: 'coastal_line_seat_14a.jpg', status: 'Synced' },
                              { name: 'project_deadline_notes.webp', status: 'Synced' },
                              { name: 'terrace_toast_sep19.webp', status: 'Indexed' },
                            ].map((f) => (
                              <div
                                key={f.name}
                                className="p-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111416] border border-[var(--vg-border)] flex items-center justify-between gap-2"
                              >
                                <span className="font-mono text-[10px] text-[#101211] dark:text-[#F4F6F2] truncate">
                                  {f.name}
                                </span>
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#087F5B] dark:text-[#46D6A4]">
                                  <Check className="w-2.5 h-2.5" />
                                  {f.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {phoneTab === 'search' && (
                          <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111416] border border-[var(--vg-border)] space-y-2">
                            <p className="text-[11px] font-semibold text-[#087F5B] dark:text-[#CDFF45]">
                              Instant Search Ready
                            </p>
                            <p className="text-[12px] text-[#101211] dark:text-[#F4F6F2] leading-relaxed">
                              Seat 14A departs Marseille St Charles at 08:40 — matched by OCR across phone and desktop.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Quiet Mobile Status Strip (synced with step pipeline) */}
                      <div className="grid grid-cols-4 border-t border-[var(--vg-border)] bg-[#FFFFFF] dark:bg-[#111416] px-1 py-2">
                        {FLUTTER_TABS.map((t) => {
                          const Icon = t.icon
                          const active = phoneTab === t.id
                          return (
                            <div
                              key={t.id}
                              className={cn(
                                'flex flex-col items-center gap-0.5 text-[9.5px] font-medium py-0.5',
                                active ? 'text-[#087F5B] dark:text-[#CDFF45]' : 'text-[var(--vg-ink-2)]'
                              )}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{t.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aligned Horizontal Optical Sync Conduit */}
                <div className="hidden md:flex flex-col items-center justify-center w-14 xl:w-20 shrink-0" aria-hidden="true">
                  <svg viewBox="0 0 80 20" fill="none" className="w-full h-5 overflow-visible">
                    <line
                      x1="2"
                      y1="10"
                      x2="78"
                      y2="10"
                      stroke="currentColor"
                      className="text-[#BCC5C8] dark:text-white/25"
                      strokeWidth="1.5"
                      strokeDasharray="3 4"
                    />
                    {!reduced && (
                      <motion.circle
                        r="3.5"
                        fill="#CDFF45"
                        initial={{ cx: 6, cy: 10 }}
                        animate={{ cx: [6, 74], cy: 10 }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                  </svg>
                  <span className="font-mono text-[9.5px] text-[var(--vg-ink-2)] mt-1">Wi-Fi</span>
                </div>

                {/* Desktop Vault Arrival Window */}
                <div className="flex-1 w-full rounded-2xl border border-[var(--vg-border-strong)] bg-[#FFFFFF] dark:bg-[#111416] overflow-hidden shadow-xl">
                  <div className="px-4 py-2.5 border-b border-[var(--vg-border)] flex items-center justify-between bg-[#F4F5F2]/80 dark:bg-[#090B0D]">
                    <span className="text-[11.5px] font-medium text-[var(--vg-ink-2)]">
                      Desktop Vault · Library View
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#CDFF45] text-[#101211]">
                      {syncStage === 'searchable' ? 'Searchable' : 'Synchronized'}
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-[var(--vg-border)]">
                      <img
                        src="/landing/photos/aura-ticket-coastal.webp"
                        alt="Desktop library preview showing Coastal Line Seat 14A boarding pass"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="font-mono text-[12px] font-semibold text-[#101211] dark:text-[#F4F6F2] truncate">
                        coastal_line_seat_14a.jpg
                      </p>
                      <p className="text-[12.5px] text-[var(--vg-ink-2)] leading-relaxed">
                        Synced cleanly across desktop and mobile with optical text extraction ready.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
