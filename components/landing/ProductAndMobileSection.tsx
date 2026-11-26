import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  CheckCircle2,
  Cloud,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileText,
  FolderHeart,
  HardDrive,
  Laptop,
  Maximize2,
  MessageSquare,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Tablet,
  Wifi,
  X,
} from 'lucide-react'
import { LiveQrCode } from '@/components/LiveQrCode'
import { cn } from '@/lib/utils'
import { MotionReveal } from './motion'
import { APK_EXPECTED_SHA256, RELEASES_URL } from './tokens'
import { BrowserFrame, Container, PrimaryButton, Section, SectionHeading, TextLink } from './ui'

type WorkspaceTab =
  | 'Dashboard'
  | 'Photos'
  | 'Files'
  | 'AI Search'
  | 'Assistant'
  | 'Collections'
  | 'Storage'
  | 'Mobile backup'

const WORKSPACE_TABS: Array<{
  id: WorkspaceTab
  title: string
  summary: string
  metrics: string
  photo: string
  caption: string
  lines: Array<{ label: string; detail: string }>
}> = [
  {
    id: 'Dashboard',
    title: 'Unified Library Overview',
    summary: 'Monitor indexed photos, documents, storage driver health, and recent Android sync batches in one glance.',
    metrics: 'Local Disk / pgvector Ready · SHA-256 Verified',
    photo: '/landing/photos/lake-morning.webp',
    caption: 'Recent Library · Highland Travel & Studio Files',
    lines: [
      { label: 'Highland_Pass_Horizon.webp', detail: 'Photos · Indexed · 4.2 MB' },
      { label: 'university_admission_letter_2026.pdf', detail: 'Documents · Page 1 Parsed · 1.1 MB' },
      { label: 'aws_ec2_pricing_console.png', detail: 'Screenshots · Dual OCR Extracted · 640 KB' },
    ],
  },
  {
    id: 'Photos',
    title: 'Calmed Chronological Photo Timeline',
    summary: 'Inspect camera roll moments in clean natural light with metadata tags, favorites, and zero UI clutter.',
    metrics: 'PNG, JPG, WEBP, GIF, BMP, HEIC',
    photo: '/landing/photos/mountain-pass.webp',
    caption: 'Highland Pass Morning · 35mm f/2.8',
    lines: [
      { label: 'Nordic_Summit_Trail.webp', detail: 'Album: Travel Archive · Nov 10' },
      { label: 'Misty_Pine_Valley.webp', detail: 'HEIC Synced · Verified Unique' },
      { label: 'Sunday_Pour_Over.webp', detail: 'Personal Roll · Favorited' },
    ],
  },
  {
    id: 'Files',
    title: 'All Saved Formats In One Workspace',
    summary: 'Preview PDFs, DOCX specifications, spreadsheets, Markdown notes, audio recordings, and video archives without switching apps.',
    metrics: '50 MB per request · Forbidden executable filter',
    photo: '/landing/photos/workspace-journal.webp',
    caption: 'Architecture Notes & Project Documents',
    lines: [
      { label: 'project_requirements_v2_spec.docx', detail: 'XML Extracted · 310 KB' },
      { label: 'docker_compose_architecture.md', detail: 'Markdown Indexed · 18 KB' },
      { label: 'q4_budget_breakdown.xlsx', detail: 'Headers & Rows Parsed · 94 KB' },
    ],
  },
  {
    id: 'AI Search',
    title: 'Hybrid Semantic + Optical Recall',
    summary: 'Ask natural questions across filenames, EXIF tags, PDF passages, and embedded OCR captures.',
    metrics: 'Gemini / Cohere / OpenAI or Offline Unicode',
    photo: '/landing/photos/studio-desk.webp',
    caption: 'Query: "Find the screenshot with AWS pricing"',
    lines: [
      { label: 'aws_ec2_pricing_console.png', detail: 'Matched: c6i.large $0.085/hr · t3.medium $0.0416/hr' },
      { label: 'studio_supplies_receipt_oct.pdf', detail: 'Matched: Total Paid $138.67 (Page 1)' },
      { label: 'university_admission_letter_2026.pdf', detail: 'Matched: Enrollment Verification #AD-4092' },
    ],
  },
  {
    id: 'Assistant',
    title: 'Grounded Citations Over Your Vault',
    summary: 'Ask follow-up questions with optional BYOK chat models while every claim cites exact retrieved source chunks.',
    metrics: 'Gemini · Groq · Cohere · OpenAI (BYOK)',
    photo: '/landing/photos/outdoor-reader.webp',
    caption: 'Grounded Chat · Source Attribution Enabled',
    lines: [
      { label: 'Prompt: Summarize Docker compose setup', detail: 'Grounded in docker_compose_architecture.md §2' },
      { label: 'Citation [1]: Multi-stage alpine image', detail: 'Non-root background worker loop verified' },
      { label: 'Fallback mode: No API key required', detail: 'Returns direct matching passages cleanly' },
    ],
  },
  {
    id: 'Collections',
    title: 'Curated Folders, Albums & Favorites',
    summary: 'Group memories across devices with instant soft-trash protection, bulk organization, and signed file downloads.',
    metrics: 'Favorites · Collections · Recoverable Trash',
    photo: '/landing/photos/valley-reflection.webp',
    caption: 'Collection: Autumn Expeditions & Study',
    lines: [
      { label: 'Travel & Mountain Peaks', detail: '6 verified photographs · Zero duplicates' },
      { label: 'Official University Docs', detail: 'PDF & DOCX records · Fast filter' },
      { label: 'Engineering References', detail: 'Markdown & console OCR screenshots' },
    ],
  },
  {
    id: 'Storage',
    title: 'Pluggable Storage Drivers & Security',
    summary: 'Store assets locally on disk during development or point STORAGE_PROVIDER to private Supabase Storage or Cloudflare R2.',
    metrics: 'AES-256-GCM BYOK Keys · Row-Level Security',
    photo: '/landing/photos/stone-architecture.webp',
    caption: 'Driver: Local Disk / Private Object Bucket',
    lines: [
      { label: 'LocalStorageDriver', detail: 'public/uploads/ + data/local_files.json' },
      { label: 'Supabase Private Bucket', detail: 'TLS 1.3 + time-limited signed URLs' },
      { label: 'Security Transparency', detail: 'Plaintext server indexing (see SECURITY.md)' },
    ],
  },
  {
    id: 'Mobile backup',
    title: 'Non-Destructive Android Companion',
    summary: 'Configure camera/folder backup scopes, inspect the SQLite retry queue, and guard uploads behind Wi-Fi only.',
    metrics: 'Flutter Android App · v2.0.0+1 · ~107.8 MB',
    photo: '/landing/photos/coastal-cliffs.webp',
    caption: 'Android Sync Status · wifiOnly: Enabled',
    lines: [
      { label: 'SQLite upload_queue', detail: 'Persistent queue + exponential backoff (min 60s cap)' },
      { label: 'SHA-256 Pre-Flight', detail: 'Skips duplicate files before transfer begins' },
      { label: 'Read-Only Library Policy', detail: 'Never deletes original photos from your phone' },
    ],
  },
]

export function ProductAndMobileSection({
  apkSizeLabel = '107.8 MB',
}: {
  apkSizeLabel?: string
}) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('Dashboard')
  const [modalOpen, setModalOpen] = useState(false)
  const [copiedSha, setCopiedSha] = useState(false)
  const [activeNode, setActiveNode] = useState<'android' | 'core' | 'web'>('core')

  const currentTab = WORKSPACE_TABS.find((t) => t.id === activeTab) || WORKSPACE_TABS[0]

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen])

  const copySha = async () => {
    try {
      await navigator.clipboard.writeText(APK_EXPECTED_SHA256)
      setCopiedSha(true)
      setTimeout(() => setCopiedSha(false), 1800)
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <>
      {/* SECTION: Interactive Product Showcase */}
      <Section id="showcase" surface="soft" ariaLabel="Interactive product showcase">
        <Container>
          <MotionReveal>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Product Experience"
                title={
                  <>
                    Crafted for quiet focus across{' '}
                    <span className="text-[var(--vg-brand)] dark:text-[var(--vg-sky)]">
                      every screen
                    </span>
                  </>
                }
                subtitle="Explore all eight workspace views modeled from the live VectorGallery application using clean synthetic sample data."
              />

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="self-start lg:self-auto inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[13px] font-semibold text-[var(--vg-ink)] hover:border-[var(--vg-brand)] transition-colors shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[var(--vg-brand)]" />
                <span>Inspect Fullscreen Preview</span>
              </button>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08} className="mt-8">
            {/* Tab pills */}
            <div
              role="tablist"
              aria-label="Product showcase views"
              className="flex flex-wrap gap-2 mb-5"
            >
              {WORKSPACE_TABS.map((tab) => {
                const active = tab.id === activeTab
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'px-3.5 py-2 rounded-xl text-[12.5px] font-semibold transition-all border',
                      active
                        ? 'bg-[#2563EB] text-[#FFFFFF] border-[#2563EB] shadow-sm'
                        : 'bg-[var(--vg-surface)] text-[var(--vg-ink-2)] border-[var(--vg-border)] hover:text-[var(--vg-ink)]'
                    )}
                  >
                    {tab.id}
                  </button>
                )
              })}
            </div>

            <BrowserFrame
              title={`VectorGallery Workspace — ${currentTab.id}`}
              toolbarRight={
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--vg-surface-soft)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                  Synthetic Sample View
                </span>
              }
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
                {/* Left mockup sidebar */}
                <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[var(--vg-border)] bg-[var(--vg-surface-2)]/65 p-4 flex lg:flex-col gap-1.5 overflow-x-auto">
                  {WORKSPACE_TABS.slice(0, 6).map((item) => {
                    const active = item.id === activeTab
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          'px-3 py-2 rounded-xl text-left text-[12.5px] font-medium whitespace-nowrap transition-colors',
                          active
                            ? 'bg-[var(--vg-surface-soft)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)] font-semibold'
                            : 'text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)]'
                        )}
                      >
                        {item.id}
                      </button>
                    )
                  })}
                </div>

                {/* Main canvas */}
                <div className="lg:col-span-9 p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[var(--vg-surface)]">
                  <div className="md:col-span-7 space-y-4">
                    <div className="space-y-1.5">
                      <span className="font-mono text-[11px] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                        {currentTab.metrics}
                      </span>
                      <h3 className="font-display text-[22px] font-bold text-[var(--vg-ink)]">
                        {currentTab.title}
                      </h3>
                      <p className="text-[14px] leading-relaxed text-[var(--vg-ink-2)]">
                        {currentTab.summary}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {currentTab.lines.map((row) => (
                        <div
                          key={row.label}
                          className="p-3 rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-semibold text-[var(--vg-ink)] truncate">
                              {row.label}
                            </p>
                            <p className="text-[11.5px] text-[var(--vg-ink-2)] truncate">
                              {row.detail}
                            </p>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-[var(--vg-brand)] shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <div className="rounded-2xl overflow-hidden border border-[var(--vg-border)] bg-[var(--vg-surface-2)] shadow-sm">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={currentTab.photo}
                          alt={currentTab.caption}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 border-t border-[var(--vg-border)] flex items-center justify-between gap-2">
                        <span className="text-[11.5px] font-medium text-[var(--vg-ink)] truncate">
                          {currentTab.caption}
                        </span>
                        <Link
                          href="/app"
                          className="text-[11px] font-semibold text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)] hover:underline shrink-0"
                        >
                          Launch App
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </BrowserFrame>
          </MotionReveal>
        </Container>

        {/* Fullscreen Accessible Preview Modal */}
        {modalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${currentTab.title} preview`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#090F1C]/75 backdrop-blur-sm p-4"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="w-full max-w-4xl rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-[var(--vg-border)] flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                    {currentTab.metrics}
                  </p>
                  <h4 className="font-display text-[19px] font-bold text-[var(--vg-ink)]">
                    {currentTab.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  aria-label="Close fullscreen preview"
                  className="w-9 h-9 rounded-xl border border-[var(--vg-border)] flex items-center justify-center text-[var(--vg-ink)] hover:bg-[var(--vg-surface-2)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6 rounded-2xl overflow-hidden border border-[var(--vg-border)] aspect-[4/3]">
                  <img
                    src={currentTab.photo}
                    alt={currentTab.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:col-span-6 space-y-3">
                  <p className="text-[14px] leading-relaxed text-[var(--vg-ink-2)]">
                    {currentTab.summary}
                  </p>
                  {currentTab.lines.map((row) => (
                    <div
                      key={row.label}
                      className="p-3 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]"
                    >
                      <p className="text-[13px] font-semibold text-[var(--vg-ink)]">{row.label}</p>
                      <p className="text-[12px] text-[var(--vg-ink-2)]">{row.detail}</p>
                    </div>
                  ))}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <PrimaryButton href="/app" showArrow>
                      Open Live Workspace
                    </PrimaryButton>
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="h-12 px-5 rounded-xl border border-[var(--vg-border)] text-[14px] font-semibold text-[var(--vg-ink)] hover:bg-[var(--vg-surface-2)]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* SECTION: Mobile Companion Experience & Verified APK Download */}
      <Section id="mobile" surface="default" ariaLabel="Android companion application">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy & Verified Install Mechanics */}
            <MotionReveal className="lg:col-span-6 space-y-6">
              <SectionHeading
                eyebrow="Mobile Companion · Flutter Android"
                title={
                  <>
                    Your world,{' '}
                    <span className="text-[var(--vg-brand)] dark:text-[var(--vg-sky)]">
                      wherever you go.
                    </span>
                  </>
                }
                subtitle="Carry automatic, non-destructive Android backup in your pocket. Built with Flutter in mobile/ featuring folder selection, Wi-Fi-only gating, SQLite offline queueing, and SHA-256 deduplication."
              />

              <div className="flex flex-wrap items-center gap-3">
                <PrimaryButton href="/vectorgallery.apk" download="VectorGallery.apk">
                  <Download className="w-4 h-4" />
                  <span>Download Android APK ({apkSizeLabel})</span>
                </PrimaryButton>
                <Link
                  href="/install"
                  className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl text-[14px] font-semibold bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[var(--vg-ink)] hover:border-[var(--vg-brand)] transition-colors shadow-sm"
                >
                  <Smartphone className="w-4 h-4 text-[var(--vg-brand)]" />
                  <span>Install & QR Guide</span>
                </Link>
              </div>

              <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-[var(--vg-ink)]">
                    Android v2.0.0+1 · SHA-256 Checksum
                  </span>
                  <button
                    type="button"
                    onClick={copySha}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)] hover:underline"
                  >
                    {copiedSha ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSha ? 'SHA-256 Copied' : 'Copy SHA-256'}</span>
                  </button>
                </div>
                <p className="font-mono text-[11px] break-all text-[var(--vg-ink-2)] bg-[var(--vg-surface)] px-3 py-2 rounded-xl border border-[var(--vg-border)]">
                  {APK_EXPECTED_SHA256}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--vg-ink-2)]">
                  <span>
                    Direct APK & source build only (not published on Google Play or App Store).
                  </span>
                  <TextLink href={RELEASES_URL} external>
                    <span>GitHub Releases</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </TextLink>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <LiveQrCode path="/install" size={104} showCopy={false} />
                <div className="space-y-1">
                  <p className="text-[13.5px] font-semibold text-[var(--vg-ink)]">
                    Scan to install on Android over Wi-Fi
                  </p>
                  <p className="text-[12.5px] text-[var(--vg-ink-2)] max-w-xs">
                    Opens this server&apos;s <code className="font-mono text-[11px]">/install</code> page directly on your phone for one-tap APK sideloading.
                  </p>
                </div>
              </div>
            </MotionReveal>

            {/* Right Layered Phone Mockups */}
            <MotionReveal delay={0.1} className="lg:col-span-6 relative">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 items-center">
                {/* Phone 1: Backup Engine */}
                <div className="rounded-[2.2rem] p-2.5 bg-[#0F172A] border border-white/10 shadow-[var(--vg-shadow-hero)]">
                  <div className="rounded-[1.7rem] overflow-hidden bg-[var(--vg-surface)] border border-[var(--vg-border)]">
                    <div className="px-4 py-3 border-b border-[var(--vg-border)] flex items-center justify-between">
                      <span className="font-display text-[12px] font-bold text-[var(--vg-ink)]">
                        Backup Engine
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--vg-surface-soft)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                        <Wifi className="w-2.5 h-2.5" />
                        Wi-Fi Only
                      </span>
                    </div>
                    <div className="p-3 space-y-2.5">
                      <div className="rounded-xl overflow-hidden aspect-[4/3] relative">
                        <img
                          src="/landing/photos/lake-morning.webp"
                          alt="Synced morning lake photo on mobile"
                          className="w-full h-full object-cover"
                        />
                        <span className="vg-photo-caption absolute bottom-1.5 left-1.5 text-[10px] px-2 py-0.5 rounded-full bg-[#090F1C]/75">
                          DCIM · Queued
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] space-y-1">
                        <div className="flex justify-between text-[10.5px] font-semibold text-[var(--vg-ink)]">
                          <span>SQLite Queue</span>
                          <span className="text-[var(--vg-brand)]">SHA-256 OK</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--vg-surface-soft)] overflow-hidden">
                          <div className="h-full w-4/5 rounded-full bg-[#2563EB]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone 2: Mobile Recall */}
                <div className="rounded-[2.2rem] p-2.5 bg-[#0F172A] border border-white/10 shadow-[var(--vg-shadow-hero)] translate-y-6">
                  <div className="rounded-[1.7rem] overflow-hidden bg-[var(--vg-surface)] border border-[var(--vg-border)]">
                    <div className="px-4 py-3 border-b border-[var(--vg-border)] flex items-center justify-between">
                      <span className="font-display text-[12px] font-bold text-[var(--vg-ink)]">
                        Recall
                      </span>
                      <Search className="w-3.5 h-3.5 text-[var(--vg-brand)]" />
                    </div>
                    <div className="p-3 space-y-2.5">
                      <div className="px-2.5 py-1.5 rounded-lg bg-[var(--vg-surface-2)] border border-[var(--vg-border)] text-[10.5px] text-[var(--vg-ink)] truncate">
                        “mountain pass road”
                      </div>
                      <div className="rounded-xl overflow-hidden aspect-[4/3]">
                        <img
                          src="/landing/photos/mountain-pass.webp"
                          alt="Matched mountain pass photo inside Android app"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 rounded-xl bg-[var(--vg-surface-soft)]/70 border border-[var(--vg-brand)]/20 text-[10px] text-[var(--vg-ink)]">
                        Non-destructive backup preserves phone originals safely.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MotionReveal>
          </div>
        </Container>
      </Section>

      {/* SECTION: Cross-Device Ecosystem Visual */}
      <Section id="ecosystem" surface="secondary" ariaLabel="Cross-device ecosystem">
        <Container>
          <MotionReveal>
            <SectionHeading
              align="center"
              eyebrow="Seamless Synchronization"
              title={
                <>
                  One personal library flowing between{' '}
                  <span className="text-[var(--vg-brand)] dark:text-[var(--vg-sky)]">
                    phone, worker & browser
                  </span>
                </>
              }
              subtitle="Capture on Android, enrich documents in the background worker, and search immediately from your desktop or tablet."
            />
          </MotionReveal>

          <MotionReveal delay={0.1} className="mt-12">
            <div className="rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 sm:p-10 shadow-[var(--vg-shadow-card)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative">
                {[
                  {
                    id: 'android' as const,
                    title: 'Android Companion',
                    subtitle: 'Captures camera frames & screenshots cleanly over Wi-Fi',
                    icon: Smartphone,
                    meta: 'SQLite + FlutterSecureStorage',
                  },
                  {
                    id: 'core' as const,
                    title: 'VectorGallery Vault',
                    subtitle: 'Deduplicates hashes, runs dual OCR & writes pgvector embeddings',
                    icon: Server,
                    meta: 'Next.js API + Worker + Storage',
                  },
                  {
                    id: 'web' as const,
                    title: 'Desktop & Tablet Web',
                    subtitle: 'Browse memories, preview files, download originals & ask grounded AI',
                    icon: Laptop,
                    meta: 'Signed URLs + Responsive Workspace',
                  },
                ].map((node) => {
                  const Icon = node.icon
                  const active = activeNode === node.id
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setActiveNode(node.id)}
                      className={cn(
                        'p-6 rounded-2xl border text-left transition-all flex flex-col gap-3',
                        active
                          ? 'bg-[var(--vg-surface-soft)]/80 border-[var(--vg-brand)] shadow-sm'
                          : 'bg-[var(--vg-surface-2)] border-[var(--vg-border)] hover:border-[var(--vg-brand)]/40'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center',
                            active
                              ? 'bg-[#2563EB] text-[#FFFFFF]'
                              : 'bg-[var(--vg-surface)] text-[var(--vg-brand)]'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-[10.5px] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                          {node.meta}
                        </span>
                      </div>
                      <h3 className="font-display text-[18px] font-bold text-[var(--vg-ink)]">
                        {node.title}
                      </h3>
                      <p className="text-[13px] leading-relaxed text-[var(--vg-ink-2)]">
                        {node.subtitle}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </MotionReveal>
        </Container>
      </Section>
    </>
  )
}

