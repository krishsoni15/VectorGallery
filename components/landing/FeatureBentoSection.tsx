import React, { useState } from 'react'
import {
  CheckCircle2,
  Cloud,
  Cpu,
  Database,
  Eye,
  FileSpreadsheet,
  FileText,
  FolderHeart,
  HardDrive,
  Layers,
  MessageSquare,
  Search,
  ShieldCheck,
  Smartphone,
  Wifi,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MotionReveal, StaggerGrid, StaggerTile } from './motion'
import { Container, Section, SectionHeading } from './ui'

export function FeatureBentoSection() {
  const [searchEngine, setSearchEngine] = useState<'hybrid' | 'offline'>('hybrid')
  const [storageDriver, setStorageDriver] = useState<'local' | 'supabase' | 'r2'>('local')

  return (
    <Section id="features" surface="default" ariaLabel="Core capabilities">
      <Container>
        <MotionReveal>
          <SectionHeading
            eyebrow="Core Capabilities"
            title={
              <>
                Eight engines working together to{' '}
                <span className="text-[var(--vg-brand)] dark:text-[var(--vg-sky)]">
                  keep every save findable
                </span>
              </>
            }
            subtitle="Designed around real files and calm retrieval — combining storage, optical OCR, document parsing, mobile sync, and optional BYOK intelligence in one cohesive workspace."
          />
        </MotionReveal>

        <StaggerGrid className="mt-12 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
          {/* 1. Intelligent AI Search (7 cols) */}
          <StaggerTile className="md:col-span-6 lg:col-span-7">
            <div className="h-full rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 sm:p-7 shadow-[var(--vg-shadow-card)] flex flex-col justify-between gap-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                    <Search className="w-4 h-4" />
                    <span>Intelligent AI Search</span>
                  </div>
                  <h3 className="font-display text-[22px] font-bold tracking-[-0.02em] text-[var(--vg-ink)]">
                    Search by meaning, visual memory, or exact text
                  </h3>
                  <p className="text-[14px] leading-relaxed text-[var(--vg-ink-2)]">
                    Runs hybrid keyword + PostgreSQL <code className="font-mono text-[12px]">pgvector</code> similarity when keys are enabled, or deterministic multilingual matching offline.
                  </p>
                </div>

                <div
                  role="group"
                  aria-label="Search engine mode preview"
                  className="inline-flex p-1 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]"
                >
                  {(['hybrid', 'offline'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSearchEngine(mode)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all',
                        searchEngine === mode
                          ? 'bg-[var(--vg-surface)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)] shadow-sm'
                          : 'text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)]'
                      )}
                    >
                      {mode === 'hybrid' ? 'pgvector Hybrid' : 'Offline Unicode'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-4 space-y-3">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)]">
                  <Search className="w-4 h-4 text-[var(--vg-brand)] shrink-0" />
                  <span className="text-[13px] font-medium text-[var(--vg-ink)] truncate">
                    studio desk notes from October kickoff
                  </span>
                  <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--vg-surface-soft)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)] shrink-0">
                    {searchEngine === 'hybrid' ? 'Cosine + FTS' : 'Unicode + Bigram'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)]">
                    <img
                      src="/landing/photos/workspace-journal.webp"
                      alt="Desk architecture journal photo preview"
                      className="w-14 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-[var(--vg-ink)] truncate">
                        Studio_Notes_Oct.webp
                      </p>
                      <p className="text-[11px] text-[var(--vg-ink-2)] truncate">
                        OCR: “Q4 schema milestone”
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)]">
                    <div className="w-14 h-12 rounded-lg bg-[var(--vg-surface-soft)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-[var(--vg-ink)] truncate">
                        project_requirements_v2_spec.docx
                      </p>
                      <p className="text-[11px] text-[var(--vg-ink-2)] truncate">
                        Chunk match · Paragraph 4
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </StaggerTile>

          {/* 2. Personal Cloud (5 cols) */}
          <StaggerTile className="md:col-span-6 lg:col-span-5">
            <div className="h-full rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 sm:p-7 shadow-[var(--vg-shadow-card)] flex flex-col justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                  <Cloud className="w-4 h-4" />
                  <span>Personal Cloud</span>
                </div>
                <h3 className="font-display text-[22px] font-bold tracking-[-0.02em] text-[var(--vg-ink)]">
                  Photos, files & collections in one calm space
                </h3>
                <p className="text-[14px] leading-relaxed text-[var(--vg-ink-2)]">
                  Switch seamlessly between local disk, private Supabase buckets, or Cloudflare R2 without changing how you browse.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'local' as const,
                    label: 'Local Disk Driver',
                    detail: 'public/uploads/ + data/local_files.json',
                    icon: HardDrive,
                  },
                  {
                    id: 'supabase' as const,
                    label: 'Supabase Storage',
                    detail: 'Private buckets + time-limited signed URLs',
                    icon: Database,
                  },
                  {
                    id: 'r2' as const,
                    label: 'Cloudflare R2 / S3',
                    detail: 'Zero-egress object storage driver',
                    icon: Cloud,
                  },
                ].map((driver) => {
                  const Icon = driver.icon
                  const active = storageDriver === driver.id
                  return (
                    <button
                      key={driver.id}
                      type="button"
                      onClick={() => setStorageDriver(driver.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all',
                        active
                          ? 'bg-[var(--vg-surface-soft)]/80 border-[var(--vg-brand)]/45 shadow-sm'
                          : 'bg-[var(--vg-surface-2)] border-[var(--vg-border)] hover:border-[var(--vg-brand)]/30'
                      )}
                    >
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                          active
                            ? 'bg-[#2563EB] text-[#FFFFFF]'
                            : 'bg-[var(--vg-surface)] text-[var(--vg-ink-2)]'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-[var(--vg-ink)] truncate">
                          {driver.label}
                        </p>
                        <p className="font-mono text-[11px] text-[var(--vg-ink-2)] truncate">
                          {driver.detail}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--vg-surface)] text-[var(--vg-ink-2)] border border-[var(--vg-border)] shrink-0">
                        50MB / file
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </StaggerTile>

          {/* 3. Automatic Mobile Backup (5 cols) */}
          <StaggerTile className="md:col-span-6 lg:col-span-5">
            <div className="h-full rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 sm:p-7 shadow-[var(--vg-shadow-card)] flex flex-col justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                  <Smartphone className="w-4 h-4" />
                  <span>Automatic Mobile Backup</span>
                </div>
                <h3 className="font-display text-[22px] font-bold tracking-[-0.02em] text-[var(--vg-ink)]">
                  Reliable SQLite queue over Wi-Fi
                </h3>
                <p className="text-[14px] leading-relaxed text-[var(--vg-ink-2)]">
                  Flutter backup engine watches camera roll, screenshots, and documents with SHA-256 pre-check and non-destructive reads.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-4 space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[var(--vg-ink)]">
                    <Wifi className="w-3.5 h-3.5 text-[var(--vg-brand)]" />
                    wifiOnly guard active
                  </span>
                  <span className="font-mono text-[11px] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                    SQLite upload_queue
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { src: '/landing/photos/lake-morning.webp', tag: 'Synced' },
                    { src: '/landing/photos/coffee-ritual.webp', tag: 'Synced' },
                    { src: '/landing/photos/mountain-pass.webp', tag: 'Verified' },
                  ].map((item) => (
                    <div key={item.src} className="relative rounded-xl overflow-hidden h-20 border border-[var(--vg-border)]">
                      <img src={item.src} alt="" className="w-full h-full object-cover" />
                      <span className="vg-photo-caption absolute inset-x-1 bottom-1 px-1.5 py-0.5 rounded bg-[#090F1C]/75 text-[10px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-[#7DB8FF]" />
                        {item.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </StaggerTile>

          {/* 4. Grounded AI Assistant (7 cols) */}
          <StaggerTile className="md:col-span-6 lg:col-span-7">
            <div className="h-full rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 sm:p-7 shadow-[var(--vg-shadow-card)] flex flex-col justify-between gap-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2 max-w-lg">
                  <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                    <MessageSquare className="w-4 h-4" />
                    <span>Grounded AI Assistant</span>
                  </div>
                  <h3 className="font-display text-[22px] font-bold tracking-[-0.02em] text-[var(--vg-ink)]">
                    Answers tied directly to your saved files
                  </h3>
                  <p className="text-[14px] leading-relaxed text-[var(--vg-ink-2)]">
                    Connect your preferred BYOK chat provider (Gemini, Groq, Cohere, or OpenAI) or inspect clean retrieved passages locally without any external AI call.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Gemini', 'Groq', 'Cohere', 'OpenAI'].map((provider) => (
                    <span
                      key={provider}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border border-[var(--vg-border)]"
                    >
                      {provider}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-4 space-y-3">
                <div className="flex justify-end">
                  <div className="px-3.5 py-2 rounded-2xl rounded-br-sm bg-[#2563EB] text-[#FFFFFF] text-[13px] font-medium max-w-md shadow-sm">
                    What upload limit and deduplication rule are defined in our v2 spec?
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[var(--vg-surface)] border border-[var(--vg-border)] space-y-2">
                  <p className="text-[13px] leading-relaxed text-[var(--vg-ink)]">
                    The specification sets a <span className="font-semibold">50 MB</span> upload bound per request and deduplicates identical binaries using SHA-256 content hashes before storage writes.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-lg bg-[var(--vg-surface-soft)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                      <FileText className="w-3 h-3" />
                      project_requirements_v2_spec.docx · Paragraph 4
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </StaggerTile>

          {/* 5. Screenshot Intelligence (4 cols) */}
          <StaggerTile className="md:col-span-2 lg:col-span-4">
            <div className="h-full rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 shadow-[var(--vg-shadow-card)] flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                  <Eye className="w-4 h-4" />
                  <span>Screenshot Intelligence</span>
                </div>
                <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-[var(--vg-ink)]">
                  OCR inside every capture
                </h3>
                <p className="text-[13.5px] leading-relaxed text-[var(--vg-ink-2)]">
                  Dual OCR classifies receipts, terminal screens, pricing tables, and handwritten desk notes automatically.
                </p>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-[var(--vg-border)] h-32">
                <img
                  src="/landing/photos/studio-desk.webp"
                  alt="Workspace screen capture example"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090F1C]/85 via-[#090F1C]/20 to-transparent" />
                <div className="vg-photo-caption absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px]">
                  <span className="font-mono">c6i.large · $0.085/hr</span>
                  <span className="px-2 py-0.5 rounded bg-[#2563EB] text-[#FFFFFF] font-medium text-[10px]">
                    OCR Hit
                  </span>
                </div>
              </div>
            </div>
          </StaggerTile>

          {/* 6. Document Intelligence (4 cols) */}
          <StaggerTile className="md:col-span-2 lg:col-span-4">
            <div className="h-full rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 shadow-[var(--vg-shadow-card)] flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Document Intelligence</span>
                </div>
                <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-[var(--vg-ink)]">
                  PDF, DOCX, sheets & Markdown
                </h3>
                <p className="text-[13.5px] leading-relaxed text-[var(--vg-ink-2)]">
                  Parses PDF pages, DOCX paragraphs, spreadsheet headers, CSV rows, and JSON keys into clean searchable chunks.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-3.5 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {['PDF', 'DOCX', 'XLSX', 'CSV', 'MD', 'JSON'].map((ext) => (
                    <span
                      key={ext}
                      className="font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded bg-[var(--vg-surface)] text-[var(--vg-ink)] border border-[var(--vg-border)]"
                    >
                      .{ext.toLowerCase()}
                    </span>
                  ))}
                </div>
                <p className="text-[11.5px] text-[var(--vg-ink-2)] truncate">
                  Extracted 12 chunks from university_admission_letter_2026.pdf
                </p>
              </div>
            </div>
          </StaggerTile>

          {/* 7. Local & Self-Hosted Operation (4 cols) */}
          <StaggerTile className="md:col-span-2 lg:col-span-4">
            <div className="h-full rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 shadow-[var(--vg-shadow-card)] flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                  <Cpu className="w-4 h-4" />
                  <span>Local & Self-Hosted</span>
                </div>
                <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-[var(--vg-ink)]">
                  Zero cloud lock-in by default
                </h3>
                <p className="text-[13.5px] leading-relaxed text-[var(--vg-ink-2)]">
                  Runs out of the box with local disk persistence, or pairs with your own PostgreSQL pgvector database and background worker.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-3.5 font-mono text-[11px] text-[var(--vg-ink-2)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--vg-ink)] font-semibold">STORAGE_PROVIDER</span>
                  <span className="text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                    local | supabase | r2
                  </span>
                </div>
                <div>npm run dev &amp;&amp; npm run worker</div>
              </div>
            </div>
          </StaggerTile>

          {/* 8. Smart Deduplication (12 cols compact horizontal banner) */}
          <StaggerTile className="md:col-span-6 lg:col-span-12">
            <div className="rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 sm:p-7 shadow-[var(--vg-shadow-card)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Smart Deduplication & Favorites</span>
                </div>
                <h3 className="font-display text-[21px] font-bold tracking-[-0.02em] text-[var(--vg-ink)]">
                  One canonical SHA-256 copy across web uploads and Android sync
                </h3>
                <p className="text-[14px] text-[var(--vg-ink-2)]">
                  Uploading the same camera frame or document twice resolves to a single verified binary hash while preserving collections, favorites, and soft-trash recovery.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]">
                  <Layers className="w-4 h-4 text-[var(--vg-brand)]" />
                  <span className="font-mono text-[12px] text-[var(--vg-ink)]">sha256:9f2c...81e4</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--vg-surface-soft)] border border-[var(--vg-brand)]/25">
                  <FolderHeart className="w-4 h-4 text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]" />
                  <span className="text-[12px] font-semibold text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                    Duplicates Prevented
                  </span>
                </div>
              </div>
            </div>
          </StaggerTile>
        </StaggerGrid>
      </Container>
    </Section>
  )
}
