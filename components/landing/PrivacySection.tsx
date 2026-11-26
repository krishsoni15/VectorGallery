import React, { useState } from 'react'
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Github,
  HardDrive,
  Server,
  ShieldCheck,
  Star,
  Terminal,
} from 'lucide-react'
import {
  VG_COMPONENTS,
  VG_TYPOGRAPHY,
} from '@/components/landing/design-system'
import { MotionReveal } from '@/components/landing/motion'
import {
  CONTRIBUTING_URL,
  ISSUES_URL,
  LICENSE_URL,
  REPO_URL,
  SECURITY_DOC_URL,
} from '@/components/landing/tokens'
import {
  Container,
  SecondaryButton,
  Section,
  SectionHeading,
  TextLink,
} from '@/components/landing/ui'
import { cn } from '@/lib/utils'

export interface GitHubRepoStats {
  stars: number | null
  forks: number | null
  issues: number | null
  license: string
  language: string
  live: boolean
}

const DEFAULT_GITHUB_STATS: GitHubRepoStats = {
  stars: null,
  forks: null,
  issues: null,
  license: 'Apache-2.0',
  language: 'TypeScript + Dart',
  live: false,
}

const ARCHITECTURAL_BENEFITS = [
  {
    icon: HardDrive,
    title: 'Storage choice',
    description:
      'Switch cleanly via STORAGE_PROVIDER between local disk (public/uploads/), private Supabase Storage buckets with signed URLs, or Cloudflare R2.',
  },
  {
    icon: Server,
    title: 'Self-hosting ready',
    description:
      'Start locally in seconds with npm run dev and zero external database, or pair PostgreSQL pgvector and the background worker whenever you scale.',
  },
  {
    icon: ShieldCheck,
    title: 'Open source & honest privacy',
    description:
      'Apache-2.0 licensed. Optional BYOK AI keys are encrypted at rest with AES-256-GCM over TLS 1.3; server-side OCR and indexing run on plaintext (we never claim zero-knowledge E2EE).',
  },
]

const SETUP_TABS = [
  {
    id: 'web',
    label: 'Web App',
    command: `git clone https://github.com/krishsoni15/VectorGallery.git
cd VectorGallery
npm install
cp .env.example .env.local
npm run dev`,
    note: 'Runs locally on http://localhost:3000 with LocalStorageDriver — zero external database required.',
  },
  {
    id: 'worker',
    label: 'Worker',
    command: `# Configure PostgreSQL + pgvector in .env.local
npm run worker`,
    note: 'Processes dual OCR extraction, document chunking, and optional BYOK embeddings asynchronously.',
  },
  {
    id: 'mobile',
    label: 'Mobile',
    command: `cd mobile
flutter pub get
flutter run --dart-define=API_URL=http://YOUR_LOCAL_IP:3000`,
    note: 'Pairs the non-destructive Flutter Android backup companion with your server over Wi-Fi.',
  },
] as const

export function PrivacySection({
  githubStats = DEFAULT_GITHUB_STATS,
}: {
  githubStats?: GitHubRepoStats
}) {
  const [setupTab, setSetupTab] = useState<'web' | 'worker' | 'mobile'>('web')
  const [copiedCmd, setCopiedCmd] = useState(false)

  const currentSetup = SETUP_TABS.find((tab) => tab.id === setupTab) || SETUP_TABS[0]

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
    <Section id="privacy" surface="secondary" ariaLabel="Privacy and open source architecture">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Headline + 3 Clean Architectural Benefits */}
          <MotionReveal className="lg:col-span-6 space-y-8">
            <SectionHeading
              eyebrow="Open Source · Apache-2.0"
              title={
                <>
                  Your memories{' '}
                  <em className={VG_TYPOGRAPHY.editorialWordClass}>belong</em>{' '}
                  to{'\u00A0'}you.
                </>
              }
              subtitle="Open source under Apache-2.0. Self-host locally on your own machine or bring your own storage bucket and AI keys — never locked into our cloud."
            />

            <div className="space-y-5 pt-2">
              {ARCHITECTURAL_BENEFITS.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 pb-5 border-b border-[var(--vg-border)] last:border-b-0 last:pb-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[var(--vg-brand)] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display text-[17px] font-bold text-[var(--vg-ink)]">
                        {item.title}
                      </h3>
                      <p className="text-[14px] leading-relaxed text-[var(--vg-ink-2)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <TextLink href={SECURITY_DOC_URL} external>
                <span>Read docs/SECURITY.md</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </TextLink>
              <span className="text-[var(--vg-border-strong)]" aria-hidden="true">
                ·
              </span>
              <span className={VG_COMPONENTS.badges.mint}>
                <Code2 className="w-3.5 h-3.5" />
                {githubStats.license || 'Apache-2.0'} License
              </span>
            </div>
          </MotionReveal>

          {/* Right Column: Self-Host Quickstart Terminal + Compact GitHub Repo Card */}
          <MotionReveal delay={0.08} className="lg:col-span-6 space-y-5 scroll-mt-24" id="developers">
            <div className={cn(VG_COMPONENTS.cards.surface, 'overflow-hidden')}>
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
                          'px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
                          active ? VG_COMPONENTS.buttons.tabActive : VG_COMPONENTS.buttons.tabIdle
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
                  className={cn(VG_COMPONENTS.buttons.secondarySm, 'h-8 px-3 text-[11.5px]')}
                >
                  {copiedCmd ? (
                    <Check className="w-3.5 h-3.5 text-[var(--vg-brand)]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <pre className={VG_COMPONENTS.inputs.codeBlock}>
                  <code>{currentSetup.command}</code>
                </pre>
                <div className="flex items-start gap-2.5 text-[13px] text-[var(--vg-ink-2)]">
                  <Terminal className="w-4 h-4 text-[var(--vg-brand)] mt-0.5 shrink-0" />
                  <span>{currentSetup.note}</span>
                </div>
              </div>
            </div>

            {/* Compact GitHub Repo Stats Card (/api/github-stats) */}
            <div className={cn(VG_COMPONENTS.cards.surface, 'p-5 sm:p-6 space-y-4')}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-[14.5px] font-bold text-[var(--vg-ink)]">
                  <Github className="w-4 h-4 text-[var(--vg-brand)]" />
                  <span>krishsoni15/VectorGallery</span>
                </div>
                <a
                  href={LICENSE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={VG_COMPONENTS.badges.mint}
                >
                  {githubStats.license || 'Apache-2.0'}
                </a>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]">
                  <p className="text-[11px] text-[var(--vg-ink-muted)]">Stars</p>
                  <p className="font-display text-[17px] font-bold text-[var(--vg-ink)] inline-flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-[var(--vg-brand)]" />
                    {githubStats.live && githubStats.stars !== null ? githubStats.stars : 'GitHub'}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]">
                  <p className="text-[11px] text-[var(--vg-ink-muted)]">Forks</p>
                  <p className="font-display text-[17px] font-bold text-[var(--vg-ink)] mt-0.5">
                    {githubStats.live && githubStats.forks !== null ? githubStats.forks : 'Open'}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]">
                  <p className="text-[11px] text-[var(--vg-ink-muted)]">Stack</p>
                  <p className="font-display text-[14px] font-bold text-[var(--vg-ink)] truncate mt-1">
                    {githubStats.language}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <SecondaryButton href={REPO_URL} external className="h-9 px-4 text-[12.5px]">
                  <Github className="w-3.5 h-3.5" />
                  <span>View Repository</span>
                </SecondaryButton>
                <SecondaryButton href={ISSUES_URL} external className="h-9 px-4 text-[12.5px]">
                  <span>Issues</span>
                </SecondaryButton>
                <SecondaryButton href={CONTRIBUTING_URL} external className="h-9 px-4 text-[12.5px]">
                  <span>Contribute</span>
                </SecondaryButton>
              </div>
            </div>
          </MotionReveal>
        </div>
      </Container>
    </Section>
  )
}
