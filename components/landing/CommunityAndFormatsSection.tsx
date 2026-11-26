import React, { useState } from 'react'
import {
  Check,
  Code2,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Github,
  HardDrive,
  Lock,
  Server,
  Shield,
  ShieldCheck,
  Star,
  Terminal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MotionReveal, StaggerGrid, StaggerTile } from './motion'
import {
  CONTRIBUTING_URL,
  ISSUES_URL,
  LICENSE_URL,
  REPO_URL,
  SECURITY_DOC_URL,
  SUPPORTED_FORMAT_GROUPS,
  USE_CASE_ITEMS,
} from './tokens'
import { Container, SecondaryButton, Section, SectionHeading, TextLink } from './ui'

export interface GitHubRepoStats {
  stars: number | null
  forks: number | null
  issues: number | null
  license: string
  language: string
  live: boolean
}

const SETUP_TABS = [
  {
    id: 'web',
    label: 'Web App (Next.js)',
    command: `git clone https://github.com/krishsoni15/VectorGallery.git
cd VectorGallery
npm install
cp .env.example .env.local
npm run dev`,
    note: 'Starts immediately on http://localhost:3000 with LocalStorageDriver — zero external database required.',
  },
  {
    id: 'worker',
    label: 'Background Worker',
    command: `# Enable Supabase PostgreSQL + pgvector in .env.local
npm run worker`,
    note: 'Processes OCR extraction, document chunking, and optional BYOK embeddings asynchronously.',
  },
  {
    id: 'mobile',
    label: 'Mobile (Flutter)',
    command: `cd mobile
flutter pub get
flutter run --dart-define=API_URL=http://YOUR_LOCAL_IP:3000`,
    note: 'Connects the Android companion to your local VectorGallery web server on Wi-Fi.',
  },
] as const

export function CommunityAndFormatsSection({
  githubStats,
}: {
  githubStats: GitHubRepoStats
}) {
  const [setupTab, setSetupTab] = useState<'web' | 'worker' | 'mobile'>('web')
  const [copiedCmd, setCopiedCmd] = useState(false)

  const currentSetup = SETUP_TABS.find((t) => t.id === setupTab) || SETUP_TABS[0]

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(currentSetup.command)
      setCopiedCmd(true)
      setTimeout(() => setCopiedCmd(false), 1800)
    } catch {
      // Clipboard blocked
    }
  }

  return (
    <>
      {/* SECTION: Privacy & Data Ownership */}
      <Section id="privacy" surface="default" ariaLabel="Privacy and security architecture">
        <Container>
          <MotionReveal>
            <SectionHeading
              eyebrow="Privacy & Ownership"
              title={
                <>
                  Your memories{' '}
                  <span className="text-[var(--vg-brand)] dark:text-[var(--vg-sky)]">
                    belong to you.
                  </span>
                </>
              }
              subtitle="Designed for clear, verifiable ownership — with transparent security guarantees and zero vendor lock-in."
            />
          </MotionReveal>

          <StaggerGrid className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: HardDrive,
                title: 'Choose Your Storage Driver',
                desc: 'Keep files strictly on your own disk, in private Supabase Storage buckets with time-limited signed URLs, or in Cloudflare R2.',
              },
              {
                icon: Lock,
                title: 'AES-256-GCM BYOK Keys',
                desc: 'Optional provider keys (Gemini, Groq, Cohere, OpenAI) are encrypted at rest with AES-256-GCM before storage.',
              },
              {
                icon: ShieldCheck,
                title: 'Strict Row-Level Isolation',
                desc: 'Multi-user deployments enforce per-user isolation policies (auth.uid() = user_id) across files and indexed chunks.',
              },
              {
                icon: Shield,
                title: 'Zero Data Lock-In',
                desc: 'Download un-modified original assets at any time. No proprietary containers, hidden formats, or forced cloud accounts.',
              },
            ].map((card) => {
              const Icon = card.icon
              return (
                <StaggerTile key={card.title}>
                  <div className="h-full rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 shadow-[var(--vg-shadow-card)] space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--vg-surface-soft)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-[17px] font-bold text-[var(--vg-ink)]">
                      {card.title}
                    </h3>
                    <p className="text-[13.5px] leading-relaxed text-[var(--vg-ink-2)]">
                      {card.desc}
                    </p>
                  </div>
                </StaggerTile>
              )
            })}
          </StaggerGrid>

          <MotionReveal delay={0.12} className="mt-6">
            <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[13.5px] font-semibold text-[var(--vg-ink)]">
                  Transparent Architecture Note (from docs/SECURITY.md)
                </p>
                <p className="text-[13px] text-[var(--vg-ink-2)]">
                  VectorGallery protects traffic via TLS 1.3 and encrypts BYOK keys via AES-256-GCM, while processing server-side OCR and text indexing on plaintext so we do not claim zero-knowledge E2EE.
                </p>
              </div>
              <TextLink href={SECURITY_DOC_URL} external className="shrink-0">
                <span>Read SECURITY.md</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </TextLink>
            </div>
          </MotionReveal>
        </Container>
      </Section>

      {/* SECTION: Open Source & Quickstart Setup */}
      <Section id="open-source" surface="secondary" ariaLabel="Open source repository and setup">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Open-Source overview */}
            <MotionReveal className="lg:col-span-5 space-y-6">
              <SectionHeading
                eyebrow="Open Source · Apache-2.0"
                title={
                  <>
                    Your cloud.{' '}
                    <span className="text-[var(--vg-brand)] dark:text-[var(--vg-sky)]">
                      Your code. Your control.
                    </span>
                  </>
                }
                subtitle="Inspect every API route, SQL migration, OCR parser, and Flutter backup service directly on GitHub."
              />

              <div className="rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-5 shadow-[var(--vg-shadow-card)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-[14px] font-bold text-[var(--vg-ink)]">
                    <Github className="w-4 h-4 text-[var(--vg-brand)]" />
                    <span>krishsoni15/VectorGallery</span>
                  </div>
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--vg-surface-soft)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                    {githubStats.license}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]">
                    <p className="text-[11px] text-[var(--vg-ink-2)]">Stars</p>
                    <p className="font-display text-[18px] font-bold text-[var(--vg-ink)] inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[var(--vg-brand)]" />
                      {githubStats.live && githubStats.stars !== null ? githubStats.stars : 'Live'}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]">
                    <p className="text-[11px] text-[var(--vg-ink-2)]">Forks</p>
                    <p className="font-display text-[18px] font-bold text-[var(--vg-ink)]">
                      {githubStats.live && githubStats.forks !== null ? githubStats.forks : 'Repo'}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]">
                    <p className="text-[11px] text-[var(--vg-ink-2)]">Stack</p>
                    <p className="font-display text-[15px] font-bold text-[var(--vg-ink)] truncate">
                      {githubStats.language}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <SecondaryButton href={REPO_URL} external className="h-10 px-4 text-[13px]">
                    <Github className="w-4 h-4" />
                    <span>Star Repository</span>
                  </SecondaryButton>
                  <SecondaryButton href={ISSUES_URL} external className="h-10 px-4 text-[13px]">
                    <span>Issues</span>
                  </SecondaryButton>
                  <SecondaryButton href={CONTRIBUTING_URL} external className="h-10 px-4 text-[13px]">
                    <span>Contribute</span>
                  </SecondaryButton>
                </div>
              </div>
            </MotionReveal>

            {/* Right Self-Host Terminal Tabs */}
            <MotionReveal delay={0.1} className="lg:col-span-7 scroll-mt-24" id="developers">
              <div className="rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-hero)] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[var(--vg-border)] bg-[var(--vg-surface-2)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Self-host setup tabs">
                    {SETUP_TABS.map((tab) => {
                      const active = tab.id === setupTab
                      return (
                        <button
                          key={tab.id}
                          role="tab"
                          aria-selected={active}
                          type="button"
                          onClick={() => setSetupTab(tab.id)}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all',
                            active
                              ? 'bg-[#2563EB] text-[#FFFFFF] shadow-sm'
                              : 'text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)]'
                          )}
                        >
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={copyCommand}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[11.5px] font-semibold text-[var(--vg-ink)] hover:border-[var(--vg-brand)] transition-colors"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5 text-[var(--vg-brand)]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <pre className="p-5 rounded-2xl bg-[#090F1C] text-[#E2E8F0] font-mono text-[12.5px] leading-relaxed overflow-x-auto border border-white/10">
                    <code>{currentSetup.command}</code>
                  </pre>
                  <div className="flex items-start gap-2.5 text-[13px] text-[var(--vg-ink-2)]">
                    <Terminal className="w-4 h-4 text-[var(--vg-brand)] mt-0.5 shrink-0" />
                    <span>{currentSetup.note}</span>
                  </div>
                </div>
              </div>
            </MotionReveal>
          </div>
        </Container>
      </Section>

      {/* SECTION: Use Cases */}
      <Section id="use-cases" surface="default" ariaLabel="Real-world use cases">
        <Container>
          <MotionReveal>
            <SectionHeading
              eyebrow="Built For Real Lives"
              title="Every role keeps a different kind of memory"
              subtitle="See how students, engineers, creators, researchers, and everyday households search what they save."
            />
          </MotionReveal>

          <StaggerGrid className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASE_ITEMS.map((item) => (
              <StaggerTile key={item.role}>
                <div className="h-full rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] overflow-hidden shadow-[var(--vg-shadow-card)] flex flex-col">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img
                      src={item.photo}
                      alt={item.role}
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090F1C]/80 via-transparent to-transparent" />
                    <span className="vg-photo-caption absolute bottom-3 left-4 font-display text-[13px] font-semibold px-2.5 py-0.5 rounded-full bg-[#2563EB]">
                      {item.role}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <h3 className="font-display text-[18px] font-bold text-[var(--vg-ink)] leading-snug">
                      {item.headline}
                    </h3>
                    <div className="p-3 rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] space-y-1">
                      <p className="text-[11.5px] text-[var(--vg-ink-2)]">
                        Query: <span className="font-medium text-[var(--vg-ink)]">“{item.query}”</span>
                      </p>
                      <p className="font-mono text-[11px] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)] truncate">
                        {item.result}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerTile>
            ))}
          </StaggerGrid>
        </Container>
      </Section>

      {/* SECTION: Supported File Formats */}
      <Section id="formats" surface="soft" ariaLabel="Supported file formats">
        <Container>
          <MotionReveal>
            <SectionHeading
              eyebrow="Format Support & Extraction Scope"
              title="Honest clarity about every file you upload"
              subtitle="Clearly distinguishing formats inspected through OCR & full-text parsers from video and audio files stored cleanly with metadata."
            />
          </MotionReveal>

          <StaggerGrid className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SUPPORTED_FORMAT_GROUPS.map((group) => (
              <StaggerTile key={group.group}>
                <div className="h-full rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 shadow-[var(--vg-shadow-card)] flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-[18px] font-bold text-[var(--vg-ink)]">
                        {group.group}
                      </h3>
                      <span
                        className={cn(
                          'text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full',
                          group.badge === 'Stored + Metadata'
                            ? 'bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border border-[var(--vg-border)]'
                            : 'bg-[var(--vg-surface-soft)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]'
                        )}
                      >
                        {group.badge}
                      </span>
                    </div>
                    <p className="font-mono text-[11.5px] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                      {group.mode}
                    </p>
                    <p className="text-[13.5px] leading-relaxed text-[var(--vg-ink-2)]">
                      {group.note}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {group.formats.map((ext) => (
                      <span
                        key={ext}
                        className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--vg-surface-2)] text-[var(--vg-ink)] border border-[var(--vg-border)]"
                      >
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              </StaggerTile>
            ))}
          </StaggerGrid>
        </Container>
      </Section>
    </>
  )
}

