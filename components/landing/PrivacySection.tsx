import React, { useState } from 'react'
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Github,
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

const STORAGE_CHOICES = [
  {
    id: 'local',
    label: 'Local Disk',
    detail: 'Stores originals directly in public/uploads/ with JSON metadata — zero external services needed.',
  },
  {
    id: 'supabase',
    label: 'Supabase Storage',
    detail: 'Private per-user storage buckets with time-limited signed URLs and row-level isolation.',
  },
  {
    id: 'r2',
    label: 'Cloudflare R2',
    detail: 'S3-compatible private object storage under your own bucket credentials.',
  },
] as const

const SETUP_TABS = [
  {
    id: 'web',
    label: 'Web App',
    command: `git clone https://github.com/krishsoni15/VectorGallery.git
cd VectorGallery
npm install
cp .env.example .env.local
npm run dev`,
    note: 'Runs locally on http://localhost:3000 with LocalStorageDriver.',
  },
  {
    id: 'worker',
    label: 'Worker',
    command: `# Configure PostgreSQL + pgvector in .env.local
npm run worker`,
    note: 'Runs OCR extraction, document chunking, and optional BYOK embeddings in the background.',
  },
  {
    id: 'mobile',
    label: 'Mobile',
    command: `cd mobile
flutter pub get
flutter run --dart-define=API_URL=http://YOUR_LOCAL_IP:3000`,
    note: 'Connects the Flutter Android companion to your server over local Wi-Fi.',
  },
] as const

/**
 * Chapter 05 — Personal means personal (Project Aura).
 * Asymmetric architectural split with zero 3-card grids, hidden zero-stars,
 * and an expandable "Under the hood" technical disclosure.
 */
export function PrivacySection({
  githubStats = DEFAULT_GITHUB_STATS,
}: {
  githubStats?: GitHubRepoStats
}) {
  const [underHoodOpen, setUnderHoodOpen] = useState(false)
  const [storageChoice, setStorageChoice] = useState<'local' | 'supabase' | 'r2'>('local')
  const [setupTab, setSetupTab] = useState<'web' | 'worker' | 'mobile'>('web')
  const [copiedCmd, setCopiedCmd] = useState(false)

  const activeStorage = STORAGE_CHOICES.find((s) => s.id === storageChoice) || STORAGE_CHOICES[0]
  const currentSetup = SETUP_TABS.find((t) => t.id === setupTab) || SETUP_TABS[0]
  const showStars =
    githubStats.live && typeof githubStats.stars === 'number' && githubStats.stars > 0

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
    <Section id="privacy" surface="secondary" ariaLabel="Privacy and ownership">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Human Commitments + GitHub Links + Expandable "Under the hood" */}
          <MotionReveal className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <h2
                className="font-display font-bold text-[var(--vg-ink)]"
                style={{
                  fontSize: VG_TYPOGRAPHY.scale.h2.fontSize,
                  lineHeight: VG_TYPOGRAPHY.scale.h2.lineHeight,
                  letterSpacing: VG_TYPOGRAPHY.scale.h2.letterSpacing,
                  textWrap: 'balance',
                }}
              >
                Personal means personal.
              </h2>
              <p className="font-display text-[20px] sm:text-[22px] font-semibold tracking-[-0.02em] text-[var(--vg-ink)]">
                Your memories. Your storage choices. Your control.
              </p>
              <p
                className="text-[var(--vg-ink-2)] max-w-xl"
                style={{
                  fontSize: VG_TYPOGRAPHY.scale.lead.fontSize,
                  lineHeight: VG_TYPOGRAPHY.scale.lead.lineHeight,
                }}
              >
                Keep everything on your own machine or choose your own private cloud storage. Open source under Apache-2.0, with zero lock-in.
              </p>
            </div>

            {/* Clean Hairline Commitments (NO 3-card grid) */}
            <div className="border-t border-[var(--vg-border)] divide-y divide-[var(--vg-border)]">
              <div className="py-4 flex items-baseline justify-between gap-4">
                <span className="font-semibold text-[15px] text-[var(--vg-ink)]">
                  Keep it at home or in your own bucket
                </span>
                <span className="text-[13.5px] text-[var(--vg-ink-2)] text-right">
                  Local disk, Supabase, or R2
                </span>
              </div>
              <div className="py-4 flex items-baseline justify-between gap-4">
                <span className="font-semibold text-[15px] text-[var(--vg-ink)]">
                  Originals stay yours forever
                </span>
                <span className="text-[13.5px] text-[var(--vg-ink-2)] text-right">
                  Unmodified downloads anytime
                </span>
              </div>
              <div className="py-4 flex items-baseline justify-between gap-4">
                <span className="font-semibold text-[15px] text-[var(--vg-ink)]">
                  Built completely in the open
                </span>
                <span className="text-[13.5px] text-[var(--vg-ink-2)] text-right">
                  {githubStats.license || 'Apache-2.0'} source code
                </span>
              </div>
            </div>

            {/* GitHub Links (Hide stars completely when 0 or null) */}
            <div className="flex flex-wrap items-center gap-3">
              <SecondaryButton href={REPO_URL} external className="h-11 px-5 text-[13.5px]">
                <Github className="w-4 h-4" />
                <span>{showStars ? 'Star on GitHub' : 'View on GitHub'}</span>
                {showStars && (
                  <span className="inline-flex items-center gap-1 pl-1.5 ml-0.5 border-l border-[var(--vg-border)] font-mono text-[12px] text-[var(--vg-brand)]">
                    <Star className="w-3 h-3 fill-current" />
                    {githubStats.stars}
                  </span>
                )}
              </SecondaryButton>
              <TextLink href={ISSUES_URL} external className="px-2">
                Issues
              </TextLink>
              <TextLink href={CONTRIBUTING_URL} external className="px-2">
                Contribute
              </TextLink>
              <TextLink href={LICENSE_URL} external className="px-2">
                Apache-2.0
              </TextLink>
            </div>

            {/* Expandable "Under the hood" Technical Disclosure */}
            <div
              id="developers"
              className="scroll-mt-24 rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] overflow-hidden"
            >
              <button
                type="button"
                aria-expanded={underHoodOpen}
                onClick={() => setUnderHoodOpen((prev) => !prev)}
                className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-[var(--vg-surface-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
              >
                <div>
                  <p className="text-[14.5px] font-semibold text-[var(--vg-ink)]">
                    Under the hood
                  </p>
                  <p className="text-[12.5px] text-[var(--vg-ink-2)]">
                    Storage drivers, self-hosting CLI, and transparent security architecture
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-[var(--vg-ink-2)] transition-transform duration-200 shrink-0',
                    underHoodOpen && 'rotate-180'
                  )}
                />
              </button>

              {underHoodOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-[var(--vg-border)] space-y-5">
                  {/* Storage Drivers */}
                  <div className="space-y-2.5">
                    <p className="text-[12px] font-medium text-[var(--vg-ink-muted)]">
                      STORAGE_PROVIDER options
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {STORAGE_CHOICES.map((choice) => {
                        const active = choice.id === storageChoice
                        return (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => setStorageChoice(choice.id)}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all',
                              active ? VG_COMPONENTS.buttons.tabActive : VG_COMPONENTS.buttons.tabIdle
                            )}
                          >
                            {choice.label}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[13px] leading-relaxed text-[var(--vg-ink-2)]">
                      {activeStorage.detail}
                    </p>
                  </div>

                  {/* Quickstart CLI */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
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
                                'px-3 py-1 rounded-full text-[12px] font-medium border transition-all',
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

                    <pre className={VG_COMPONENTS.inputs.codeBlock}>
                      <code>{currentSetup.command}</code>
                    </pre>
                    <p className="flex items-start gap-2 text-[12.5px] text-[var(--vg-ink-2)]">
                      <Terminal className="w-3.5 h-3.5 text-[var(--vg-brand)] mt-0.5 shrink-0" />
                      <span>{currentSetup.note}</span>
                    </p>
                  </div>

                  {/* Honest Security Disclosure */}
                  <div className="rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-[12.5px] leading-relaxed text-[var(--vg-ink-2)]">
                      Optional AI provider keys are encrypted with AES-256-GCM over TLS 1.3. Server OCR and text indexing run on plaintext so we do not claim zero-knowledge E2EE.
                    </p>
                    <TextLink href={SECURITY_DOC_URL} external className="text-[12.5px] shrink-0">
                      <span>SECURITY.md</span>
                      <ExternalLink className="w-3 h-3" />
                    </TextLink>
                  </div>
                </div>
              )}
            </div>
          </MotionReveal>

          {/* Right: Bespoke Layered Geometric Architectural Sanctuary Visual */}
          <MotionReveal delay={0.1} className="lg:col-span-6">
            <div className="relative rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-4 sm:p-6 shadow-[var(--vg-shadow-hero)] overflow-hidden">
              {/* Botanical Light Photographic Backdrop */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--vg-border)]">
                <img
                  src="/landing/photos/aura-botanical-light.webp"
                  alt="Ceramic vase with eucalyptus stems beside a sunlit glass window"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0C]/70 via-[#0B0D0C]/15 to-transparent" />

                {/* Layered Concentric Frosted Architectural Folds SVG */}
                <svg
                  viewBox="0 0 480 360"
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  <defs>
                    <linearGradient id="auraFoldPlaneA" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.34" />
                      <stop offset="100%" stopColor="#C4EDE1" stopOpacity="0.12" />
                    </linearGradient>
                    <linearGradient id="auraFoldPlaneB" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="#087F5B" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#A6D9D0" stopOpacity="0.08" />
                    </linearGradient>
                  </defs>

                  {/* Outer Sanctuary Fold */}
                  <polygon
                    points="64,54 240,300 416,54 348,54 240,214 132,54"
                    fill="url(#auraFoldPlaneA)"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="1.25"
                  />
                  {/* Inner Emerald Fold Plane */}
                  <polygon
                    points="126,76 240,248 354,76 306,76 240,180 174,76"
                    fill="url(#auraFoldPlaneB)"
                    stroke="rgba(196,237,225,0.55)"
                    strokeWidth="1.25"
                  />
                  {/* Fine Architectural Registration Lines */}
                  <line
                    x1="240"
                    y1="26"
                    x2="240"
                    y2="334"
                    stroke="rgba(255,255,255,0.28)"
                    strokeDasharray="3 5"
                    strokeWidth="1"
                  />
                  <circle
                    cx="240"
                    cy="214"
                    r="5"
                    fill="#58D6A8"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                </svg>

                {/* Clean Ownership Flow Strip */}
                <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-[#FFFFFF]/90 dark:bg-[#131614]/90 backdrop-blur-xl border border-[#E0E4DD] dark:border-white/[0.12] px-4 py-3 flex items-center justify-between gap-2 text-[12.5px] font-medium text-[var(--vg-ink)] shadow-sm">
                  <span>Your Device</span>
                  <span className="h-px flex-1 bg-[var(--vg-border-strong)]" aria-hidden="true" />
                  <span className="text-[var(--vg-brand)] font-semibold">Your Storage</span>
                  <span className="h-px flex-1 bg-[var(--vg-border-strong)]" aria-hidden="true" />
                  <span>Your Keys</span>
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </Container>
    </Section>
  )
}
