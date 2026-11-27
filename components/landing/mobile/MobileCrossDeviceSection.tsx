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
  { id: 'ai', label: 'AI Chat', icon: MessageSquare },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const SYNC_STAGES: Array<{ id: SyncStage; label: string; caption: string }> = [
  { id: 'capture', label: 'Capture', caption: 'Photograph or scan a ticket on Android.' },
  { id: 'queue', label: 'Queue', caption: 'Queued automatically over Wi-Fi without touching originals.' },
  { id: 'library', label: 'Desktop library', caption: 'Lands directly inside your desktop timeline.' },
  { id: 'searchable', label: 'Searchable', caption: 'Optical text becomes ready for natural lookup.' },
]

/**
 * Unified Shared Cross-Device Stage:
 * Connects a realistic sculpted titanium Android bezel to a desktop vault frame
 * via a flowing luminance conduit showing live capture-to-desktop flow.
 */
export function MobileCrossDeviceSection({ apkSizeLabel = '107.8 MB' }: MobileCrossDeviceSectionProps) {
  const reduced = useReducedMotion()
  const [phoneTab, setPhoneTab] = useState<FlutterTabId>('home')
  const [syncStage, setSyncStage] = useState<SyncStage>('library')
  const [wifiOnly, setWifiOnly] = useState(true)

  const stageIdx = SYNC_STAGES.findIndex((s) => s.id === syncStage)

  return (
    <Section id="mobile" surface="default" ariaLabel="Android companion capture and cross-device sync">
      <Container wide className="scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Narrative & Real Download / Install Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-[13px] font-medium text-[#087F5B] dark:text-[#46D6A4] mb-3">
                Android Companion App
              </p>

              <SplitTextReveal
                as="h2"
                text="Capture here. Find it anywhere."
                className="font-display font-bold tracking-[-0.04em] leading-[1.03] text-[#101211] dark:text-[#F4F6F2]"
                style={{ fontSize: 'clamp(2.2rem, 4.2vw, 4.25rem)' }}
              />

              <p className="mt-4 text-[16px] sm:text-[17px] leading-[1.6] text-[var(--vg-ink-2)]">
                Your Android memories, automatically backed up to the storage you choose. Keep every camera photo and receipt on your phone untouched while browsing effortlessly on desktop.
              </p>
            </div>

            {/* Clean Step Conduit Switcher (replaces card wall) */}
            <div className="space-y-3 border-l-2 border-[var(--vg-border)] pl-4">
              <div className="flex flex-wrap gap-1.5">
                {SYNC_STAGES.map((stage, i) => {
                  const active = stage.id === syncStage
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setSyncStage(stage.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors',
                        active
                          ? 'bg-[#101211] text-[#F4F6F2] border-[#101211] dark:bg-[#CDFF45] dark:text-[#090B0D] dark:border-[#CDFF45] font-semibold'
                          : 'bg-[var(--vg-surface)] text-[var(--vg-ink-2)] border-[var(--vg-border)] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
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

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="/vectorgallery.apk"
                download
                className={VG_COMPONENTS.buttons.limePill}
              >
                <Download className="w-4 h-4" />
                <span>Download Android ({apkSizeLabel})</span>
              </a>

              <Link href="/install" className={VG_COMPONENTS.buttons.secondary}>
                <QrCode className="w-4 h-4" />
                <span>Installation Guide</span>
              </Link>
            </div>

            {/* Compact Disclosed Technical Verification Details */}
            <details className="group text-[12px] text-[var(--vg-ink-2)]">
              <summary className="inline-flex items-center gap-1.5 cursor-pointer hover:text-[var(--vg-ink)] list-none select-none font-medium">
                <span>Technical package &amp; verification details</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2.5 p-3.5 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)] space-y-1 font-mono text-[11px] break-all">
                <p>SHA-256: {APK_EXPECTED_SHA256}</p>
                <p className="text-[var(--vg-ink-2)]">
                  Direct open-source release APK · Read-only media access · Local SQLite upload queue with duplicate skipping.
                </p>
              </div>
            </details>
          </div>

          {/* Right Realistic Shared Hardware Studio Stage */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-[2.2rem] border border-[var(--vg-border-strong)] bg-gradient-to-br from-[#FFFFFF] via-[#F4F5F2] to-[#E3E8EA]/80 dark:from-[#151A1D] dark:via-[#111416] dark:to-[#090B0D] p-6 sm:p-9 shadow-[var(--vg-shadow-hero)] overflow-hidden">
              {/* Atmospheric studio floor light */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-45 dark:opacity-25 bg-[radial-gradient(circle,rgba(205,255,69,0.28),transparent_70%)]"
              />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Realistic Sculpted Titanium Android Bezel */}
                <div className="relative w-full max-w-[280px] rounded-[2.5rem] p-[7px] bg-gradient-to-b from-[#D5DCDE] via-[#9EA9AE] to-[#7D878C] dark:from-[#3A4146] dark:via-[#22272A] dark:to-[#131618] shadow-[0_28px_60px_-18px_rgba(16,18,17,0.45)] shrink-0">
                  <div className="rounded-[2.1rem] bg-[#101211] p-1.5">
                    <div className="relative rounded-[1.8rem] bg-[#F4F5F2] dark:bg-[#090B0D] overflow-hidden flex flex-col min-h-[430px]">
                      {/* Camera Punch-Hole & Status */}
                      <div className="pt-2.5 pb-1 px-5 flex items-center justify-between text-[10px] font-medium text-[var(--vg-ink-2)]">
                        <span>09:41</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#101211] ring-1 ring-white/10" aria-hidden="true" />
                        <span>Wi-Fi</span>
                      </div>

                      {/* Top App Bar */}
                      <div className="px-4 pb-2.5 flex items-center justify-between border-b border-[var(--vg-border)] bg-[#FFFFFF] dark:bg-[#111416]">
                        <span className="font-display text-[13px] font-bold text-[#101211] dark:text-[#F4F6F2]">
                          VectorGallery
                        </span>
                        <button
                          type="button"
                          onClick={() => setWifiOnly((w) => !w)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
                            wifiOnly
                              ? 'bg-[#CDFF45] text-[#101211] border-[#101211]/10 font-semibold'
                              : 'bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border-[var(--vg-border)]'
                          )}
                        >
                          <Wifi className="w-2.5 h-2.5" />
                          <span>{wifiOnly ? 'Wi-Fi' : 'Any'}</span>
                        </button>
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

                        {(phoneTab === 'ai' || phoneTab === 'search' || phoneTab === 'settings') && (
                          <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111416] border border-[var(--vg-border)] space-y-2">
                            <p className="text-[11px] font-semibold text-[#087F5B] dark:text-[#CDFF45]">
                              {phoneTab === 'ai'
                                ? 'Assistant Query'
                                : phoneTab === 'search'
                                  ? 'Instant Search'
                                  : 'Sync Preferences'}
                            </p>
                            <p className="text-[12px] text-[#101211] dark:text-[#F4F6F2] leading-relaxed">
                              {phoneTab === 'ai'
                                ? 'Ask across every document, ticket, or photo synchronized from your device.'
                                : phoneTab === 'search'
                                  ? 'Seat 14A departs Marseille St Charles at 08:40.'
                                  : 'Backs up camera roll folders automatically when plugged into Wi-Fi.'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Mobile Nav Tabs */}
                      <div className="grid grid-cols-5 border-t border-[var(--vg-border)] bg-[#FFFFFF] dark:bg-[#111416] px-1 py-2">
                        {FLUTTER_TABS.map((t) => {
                          const Icon = t.icon
                          const active = phoneTab === t.id
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setPhoneTab(t.id)}
                              className={cn(
                                'flex flex-col items-center gap-0.5 text-[9.5px] font-medium py-0.5 transition-colors',
                                active ? 'text-[#087F5B] dark:text-[#CDFF45]' : 'text-[var(--vg-ink-2)]'
                              )}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{t.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Optical Sync Path -> Desktop Workspace Result */}
                <div className="flex-1 w-full space-y-4">
                  <div className="relative h-8 flex items-center">
                    <svg
                      viewBox="0 0 260 28"
                      fill="none"
                      aria-hidden="true"
                      className="w-full h-7 overflow-visible"
                    >
                      <path
                        d="M 4 14 Q 130 2 256 14"
                        stroke="currentColor"
                        className="text-[#BCC5C8] dark:text-white/20"
                        strokeWidth="1.5"
                      />
                      {!reduced && (
                        <motion.circle
                          r="4"
                          fill="#CDFF45"
                          initial={{ cx: 12, cy: 13 }}
                          animate={{ cx: [12, 130, 248], cy: [13, 8, 13] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                    </svg>
                  </div>

                  {/* Desktop Vault Arrival Window */}
                  <div className="rounded-2xl border border-[var(--vg-border-strong)] bg-[#FFFFFF] dark:bg-[#111416] overflow-hidden shadow-xl">
                    <div className="px-4 py-2.5 border-b border-[var(--vg-border)] flex items-center justify-between bg-[#F4F5F2]/80 dark:bg-[#090B0D]">
                      <span className="text-[11.5px] font-medium text-[var(--vg-ink-2)]">
                        Desktop Vault · Library View
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#CDFF45] text-[#101211]">
                        {syncStage === 'searchable' ? 'Searchable' : 'Synchronized'}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                      <div className="w-full sm:w-40 aspect-[4/3] rounded-xl overflow-hidden border border-[var(--vg-border)] shrink-0">
                        <img
                          src="/landing/photos/aura-ticket-coastal.webp"
                          alt="Desktop library preview showing Coastal Line Seat 14A boarding pass"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <p className="font-mono text-[12px] font-semibold text-[#101211] dark:text-[#F4F6F2] truncate">
                          coastal_line_seat_14a.jpg
                        </p>
                        <p className="text-[13px] text-[var(--vg-ink-2)] leading-relaxed">
                          Available across your desktop workspace with optical text detection—no cables or manual imports.
                        </p>
                      </div>
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
