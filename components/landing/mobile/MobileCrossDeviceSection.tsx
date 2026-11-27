import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Download,
  FolderOpen,
  Home,
  MessageSquare,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Wifi,
} from 'lucide-react'
import { VG_COMPONENTS } from '@/components/landing/design-system'
import { useClientReducedMotion } from '@/components/landing/motion/LivingMotionPrimitives'
import { MotionReveal } from '@/components/landing/motion'
import { APK_EXPECTED_SHA256 } from '@/components/landing/tokens'
import { Container, Section } from '@/components/landing/ui'
import { cn } from '@/lib/utils'

interface MobileCrossDeviceSectionProps {
  apkSizeLabel?: string
}

type FlutterTabId = 'home' | 'files' | 'ai' | 'search' | 'settings'

// Mirrors exact 5-tab navigation from mobile/lib/features/navigation/bottom_nav_shell.dart
const FLUTTER_TABS: Array<{ id: FlutterTabId; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'ai', label: 'AI Chat', icon: MessageSquare },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function MobileCrossDeviceSection({ apkSizeLabel = '107.8 MB' }: MobileCrossDeviceSectionProps) {
  const reduced = useClientReducedMotion()
  const [phoneTab, setPhoneTab] = useState<FlutterTabId>('home')
  const [wifiOnly, setWifiOnly] = useState(true)

  return (
    <Section id="mobile" surface="default" ariaLabel="Android mobile companion capture and sync">
      <Container wide>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Narrative + Direct APK & Install Actions */}
          <MotionReveal className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-[#E7E9E5] dark:bg-[#202522] text-[#101211] dark:text-[#CFFF49] border border-[var(--vg-border)]">
                  05 · Android Companion
                </span>
                <span className="text-[12.5px] text-[var(--vg-ink-2)]">Open-source APK</span>
              </div>

              <h2
                className="font-display font-bold tracking-[-0.04em] leading-[1.03] text-[#101211] dark:text-[#F3F5F1]"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.6rem)' }}
              >
                Capture here. Find it anywhere.
              </h2>

              <p className="mt-4 text-[16px] leading-[1.6] text-[var(--vg-ink-2)]">
                Snap a receipt, scan a notebook spread, or save a sunset roll on Android. VectorGallery backs up over Wi-Fi with SHA-256 duplicate protection and leaves every phone original untouched.
              </p>
            </div>

            {/* Interactive Flow Strip: Capture -> Queue -> Vault -> Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5">
              {[
                { step: '01 Capture', detail: 'Photos, screenshots & PDFs' },
                { step: '02 Queue', detail: 'SQLite retry + SHA-256 dedupe' },
                { step: '03 Vault', detail: 'Read-only phone source' },
                { step: '04 Desktop', detail: 'Searchable from web vault' },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-3.5 rounded-2xl border border-[var(--vg-border)] bg-[#FFFFFF] dark:bg-[#131715]"
                >
                  <p className="font-mono text-[11px] font-semibold text-[#087F5B] dark:text-[#CFFF49]">
                    {item.step}
                  </p>
                  <p className="text-[12.5px] font-medium text-[#101211] dark:text-[#F3F5F1] mt-1">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="/vectorgallery.apk"
                download
                className={VG_COMPONENTS.buttons.limePill}
              >
                <Download className="w-4 h-4" />
                <span>Download APK ({apkSizeLabel})</span>
              </a>

              <Link href="/install" className={VG_COMPONENTS.buttons.secondary}>
                <QrCode className="w-4 h-4" />
                <span>QR &amp; Install Guide</span>
              </Link>
            </div>

            <p className="font-mono text-[11.5px] text-[var(--vg-ink-2)] break-all">
              SHA-256: {APK_EXPECTED_SHA256.slice(0, 24)}... (Direct open-source APK · Not listed on Play Store)
            </p>
          </MotionReveal>

          {/* Right Realistic Cross-Device Visual: Flutter Android Phone -> Desktop Sync Result */}
          <MotionReveal delay={0.08} className="lg:col-span-7">
            <div className="relative rounded-[2rem] border border-[var(--vg-border-strong)] bg-[#E7E9E5]/65 dark:bg-[#131715] p-5 sm:p-8 shadow-[var(--vg-shadow-hero)] flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Android Device Frame */}
              <div className="w-full max-w-[290px] rounded-[2.2rem] p-2.5 bg-[#101211] border border-white/[0.14] shadow-2xl shrink-0">
                <div className="rounded-[1.75rem] bg-[#F2F3F0] dark:bg-[#090B0A] overflow-hidden flex flex-col min-h-[430px]">
                  {/* Top Bar */}
                  <div className="px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-[var(--vg-border)] bg-[#FFFFFF] dark:bg-[#131715]">
                    <span className="font-display text-[13px] font-bold text-[#101211] dark:text-[#F3F5F1]">
                      VectorGallery
                    </span>
                    <button
                      type="button"
                      onClick={() => setWifiOnly((w) => !w)}
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border',
                        wifiOnly
                          ? 'bg-[#D4FF54] text-[#101211] border-[#101211]/10'
                          : 'bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border-[var(--vg-border)]'
                      )}
                    >
                      <Wifi className="w-2.5 h-2.5" />
                      <span>{wifiOnly ? 'Wi-Fi Only' : 'Any Network'}</span>
                    </button>
                  </div>

                  {/* Active Mobile Body reflecting real Flutter companion state */}
                  <div className="flex-1 p-3.5 space-y-3">
                    {phoneTab === 'home' && (
                      <>
                        <div className="p-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[var(--vg-border)]">
                          <div className="flex items-center justify-between text-[11px] font-medium text-[#101211] dark:text-[#F3F5F1]">
                            <span>Cloud Backup Active</span>
                            <span className="font-mono text-[10px] text-[#087F5B] dark:text-[#CFFF49]">
                              Read-only
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 rounded-full bg-[#E7E9E5] dark:bg-[#202522] overflow-hidden">
                            <div className="h-full w-3/4 rounded-full bg-[#087F5B] dark:bg-[#CFFF49]" />
                          </div>
                          <p className="mt-1.5 text-[10.5px] text-[var(--vg-ink-2)]">
                            SHA-256 fingerprint skips duplicate uploads automatically.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="aspect-square rounded-xl overflow-hidden border border-[var(--vg-border)]">
                            <img
                              src="/landing/photos/aura-family-morning.webp"
                              alt="Recent kitchen pears capture"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="aspect-square rounded-xl overflow-hidden border border-[var(--vg-border)]">
                            <img
                              src="/landing/photos/aura-ticket-coastal.webp"
                              alt="Coastal Line Seat 14A ticket capture"
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
                          { name: 'sunday_kitchen_pears.webp', status: 'Synced' },
                          { name: 'architectural_spatial_flow.pdf', status: 'Indexed' },
                        ].map((f) => (
                          <div
                            key={f.name}
                            className="p-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#131715] border border-[var(--vg-border)] flex items-center justify-between gap-2"
                          >
                            <span className="font-mono text-[10.5px] text-[#101211] dark:text-[#F3F5F1] truncate">
                              {f.name}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-[#087F5B] dark:text-[#CFFF49]">
                              <Check className="w-2.5 h-2.5" />
                              {f.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {(phoneTab === 'ai' || phoneTab === 'search' || phoneTab === 'settings') && (
                      <div className="p-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[var(--vg-border)] space-y-2">
                        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#087F5B] dark:text-[#CFFF49]">
                          {phoneTab === 'ai'
                            ? 'Assistant Query'
                            : phoneTab === 'search'
                              ? 'Instant Lookup'
                              : 'Sync Rules'}
                        </p>
                        <p className="text-[12px] text-[#101211] dark:text-[#F3F5F1] leading-relaxed">
                          {phoneTab === 'ai'
                            ? 'Ask about receipts, tickets, or photos backed up from your phone gallery.'
                            : phoneTab === 'search'
                              ? 'Matched: Seat 14A departs Marseille St Charles at 08:40.'
                              : 'Connected to your private web server · Background Wi-Fi sync enabled.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Exact 5-Tab Flutter Bottom Nav */}
                  <div className="grid grid-cols-5 border-t border-[var(--vg-border)] bg-[#FFFFFF] dark:bg-[#131715] px-1 py-2">
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
                            active
                              ? 'text-[#087F5B] dark:text-[#CFFF49]'
                              : 'text-[var(--vg-ink-2)]'
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

              {/* Sync Conduit + Live Desktop Search Card */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#FFFFFF] dark:bg-[#202522] border border-[var(--vg-border)]">
                  <ShieldCheck className="w-4 h-4 text-[#087F5B] dark:text-[#CFFF49] shrink-0" />
                  <span className="font-mono text-[11.5px] text-[#101211] dark:text-[#F3F5F1]">
                    Auto-indexed over encrypted Wi-Fi transfer
                  </span>
                  {!reduced && (
                    <motion.span
                      aria-hidden="true"
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="ml-auto text-[#087F5B] dark:text-[#CFFF49]"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.span>
                  )}
                </div>

                {/* Desktop Arrival Card */}
                <div className="rounded-2xl border border-[var(--vg-border-strong)] bg-[#FFFFFF] dark:bg-[#090B0A] overflow-hidden shadow-md">
                  <div className="px-4 py-2.5 border-b border-[var(--vg-border)] flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[var(--vg-ink-2)]">
                      Desktop Library · Synced 2s ago
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#D4FF54] text-[#101211]">
                      OCR Indexed
                    </span>
                  </div>
                  <div className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-full sm:w-40 aspect-[4/3] rounded-xl overflow-hidden border border-[var(--vg-border)] shrink-0">
                      <img
                        src="/landing/photos/aura-ticket-coastal.webp"
                        alt="Boarding pass immediately searchable on desktop after Android sync"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <p className="font-mono text-[12px] font-semibold text-[#101211] dark:text-[#F3F5F1] truncate">
                        coastal_line_seat_14a.jpg
                      </p>
                      <p className="text-[13px] text-[var(--vg-ink-2)] leading-relaxed">
                        Now searchable on desktop from any browser tab—zero cable transfers or manual uploads.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </Container>
    </Section>
  )
}
