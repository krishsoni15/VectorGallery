import React, { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, Copy, ExternalLink, FolderLock, Github, Globe, Laptop, Star, Terminal } from 'lucide-react'
import { VG_COMPONENTS } from '@/components/landing/design-system'
import { SplitTextReveal } from '@/components/landing/motion/LivingMotionPrimitives'
import {
  CONTRIBUTING_URL,
  ISSUES_URL,
  LICENSE_URL,
  REPO_URL,
  SECURITY_DOC_URL,
} from '@/components/landing/tokens'
import { Container, SecondaryButton, Section, TextLink } from '@/components/landing/ui'
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

const STORAGE_TARGETS = [
  {
    id: 'local',
    label: 'Local Folder',
    summary: 'Save originals directly on your computer disk alongside local JSON metadata—runs offline out of the box.',
    config: 'DATA_DIR=./data · STORAGE_DRIVER=local',
  },
  {
    id: 'supabase',
    label: 'Supabase Storage',
    summary: 'Private per-user storage buckets with signed temporary URLs and database row-level isolation.',
    config: 'STORAGE_DRIVER=supabase · Isolated per user',
  },
  {
    id: 'r2',
    label: 'Cloudflare R2',
    summary: 'S3-compatible private object storage under credentials you own and rotate anytime.',
    config: 'STORAGE_DRIVER=r2 · Own S3 credentials',
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
    note: 'Starts cleanly at http://localhost:3000 without requiring external AI keys.',
  },
  {
    id: 'worker',
    label: 'Worker',
    command: `npm run worker`,
    note: 'Extracts document text, chunks notes, and runs optional BYOK semantic embeddings.',
  },
  {
    id: 'mobile',
    label: 'Android',
    command: `cd mobile
flutter pub get
flutter run --dart-define=API_URL=http://YOUR_LAN_IP:3000`,
    note: 'Connects directly to your personal Web Vault instance.',
  },
] as const

/**
 * Ownership & Open Source Section ("Yours. By design."):
 * Sculptural translucent enclosure flow diagramming Your device -> Your storage -> Your access,
 * accurate claims (no fabricated zero-knowledge/E2E claims), and verified repository actions.
 */
export function OwnershipSection({
  githubStats = DEFAULT_GITHUB_STATS,
}: {
  githubStats?: GitHubRepoStats
}) {
  const [selectedStorage, setSelectedStorage] = useState<(typeof STORAGE_TARGETS)[number]['id']>('local')
  const [showCli, setShowCli] = useState(false)
  const [setupTab, setSetupTab] = useState<(typeof SETUP_TABS)[number]['id']>('web')
  const [copied, setCopied] = useState(false)

  const currentStorage = STORAGE_TARGETS.find((s) => s.id === selectedStorage) || STORAGE_TARGETS[0]
  const currentSetup = SETUP_TABS.find((t) => t.id === setupTab) || SETUP_TABS[0]
  const showStars = githubStats.live && typeof githubStats.stars === 'number' && githubStats.stars > 0

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(currentSetup.command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <Section id="privacy" surface="secondary" ariaLabel="Ownership, open source, and self-hosting">
      <Container wide className="scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Manifesto & Open Source Links */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-[13px] font-medium text-[#087F5B] dark:text-[#46D6A4] mb-3">
                Open Source &amp; Self-Hosted
              </p>

              <SplitTextReveal
                as="h2"
                text="Yours. By design."
                className="font-display font-bold tracking-[-0.04em] leading-[1.02] text-[#101211] dark:text-[#F4F6F2]"
                style={{ fontSize: 'clamp(2.2rem, 4.4vw, 4.65rem)' }}
              />

              <p className="mt-4 text-[16px] sm:text-[17.5px] leading-[1.65] text-[var(--vg-ink-2)] max-w-2xl">
                Every photograph, scanned document, and note remains yours. Run VectorGallery completely offline on your own disk, or pair configurable object storage and optional external AI keys on terms you audit yourself.
              </p>
            </div>

            {/* Clean Typographic Principles (no generic icon grid) */}
            <div className="divide-y divide-[var(--vg-border)] border-y border-[var(--vg-border)] text-[14px]">
              <div className="py-3.5 flex items-baseline justify-between gap-4">
                <span className="font-semibold text-[#101211] dark:text-[#F4F6F2]">Original file access</span>
                <span className="text-[var(--vg-ink-2)] text-right">Files stored unmodified in your configured driver</span>
              </div>
              <div className="py-3.5 flex items-baseline justify-between gap-4">
                <span className="font-semibold text-[#101211] dark:text-[#F4F6F2]">Optional external AI</span>
                <span className="text-[var(--vg-ink-2)] text-right">Works without AI API keys; connect Gemini, Groq, or OpenAI anytime</span>
              </div>
              <div className="py-3.5 flex items-baseline justify-between gap-4">
                <span className="font-semibold text-[#101211] dark:text-[#F4F6F2]">Source-code transparency</span>
                <span className="text-[var(--vg-ink-2)] text-right">Apache-2.0 TypeScript web app, worker, and Dart Android code</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <SecondaryButton href={REPO_URL} external>
                <Github className="w-4 h-4" />
                <span>Inspect on GitHub</span>
                {showStars && (
                  <span className="inline-flex items-center gap-1 ml-1 pl-2 border-l border-[var(--vg-border)] font-mono text-[12px]">
                    <Star className="w-3 h-3 text-[#087F5B] dark:text-[#CDFF45]" />
                    {githubStats.stars}
                  </span>
                )}
              </SecondaryButton>

              <button
                type="button"
                onClick={() => setShowCli((v) => !v)}
                aria-expanded={showCli}
                className={VG_COMPONENTS.buttons.ghost}
              >
                <Terminal className="w-4 h-4" />
                <span>Self-host CLI</span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', showCli && 'rotate-180')} />
              </button>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-[13px]">
              <TextLink href={LICENSE_URL} external>
                License <ExternalLink className="w-3 h-3" />
              </TextLink>
              <TextLink href={SECURITY_DOC_URL} external>
                Documentation <ExternalLink className="w-3 h-3" />
              </TextLink>
              <TextLink href={CONTRIBUTING_URL} external>
                Contribute <ExternalLink className="w-3 h-3" />
              </TextLink>
              <TextLink href={ISSUES_URL} external>
                Issues <ExternalLink className="w-3 h-3" />
              </TextLink>
              <Link href="/install" className="font-medium text-[#087F5B] dark:text-[#CDFF45] hover:underline">
                Installation →
              </Link>
            </div>
          </div>

          {/* Right Translucent Sculptural Containment Flow + Configurable Storage Switcher */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-[2rem] border border-[var(--vg-border-strong)] bg-[#FFFFFF]/88 dark:bg-[#111416]/90 backdrop-blur-2xl p-6 sm:p-7 shadow-[var(--vg-shadow-card)] overflow-hidden">
              {/* Controlled Path Flow Visualization: Your device -> Your storage -> Your access */}
              <div className="mb-6 pb-5 border-b border-[var(--vg-border)]">
                <p className="text-[12px] font-medium text-[var(--vg-ink-2)] mb-4">
                  Ownership Data Flow
                </p>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 items-center relative">
                  {[
                    { icon: Laptop, title: 'Your device', note: 'Camera roll & files' },
                    { icon: FolderLock, title: 'Your storage', note: currentStorage.label },
                    { icon: Globe, title: 'Your access', note: 'Direct browser & APK' },
                  ].map((node, i) => {
                    const Icon = node.icon
                    return (
                      <div
                        key={node.title}
                        className={cn(
                          'relative rounded-2xl p-3 sm:p-3.5 border text-center transition-colors',
                          i === 1
                            ? 'bg-[#F4F5F2] dark:bg-[#191D20] border-[#087F5B]/45 dark:border-[#CDFF45]/45'
                            : 'bg-[#FFFFFF] dark:bg-[#090B0D] border-[var(--vg-border)]'
                        )}
                      >
                        <Icon className="w-4 h-4 mx-auto mb-1.5 text-[#087F5B] dark:text-[#CDFF45]" />
                        <p className="text-[12px] sm:text-[13px] font-semibold text-[#101211] dark:text-[#F4F6F2]">
                          {node.title}
                        </p>
                        <p className="text-[10.5px] sm:text-[11px] text-[var(--vg-ink-2)] truncate">
                          {node.note}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <p className="text-[12px] font-medium text-[var(--vg-ink-2)] mb-3">
                Select Configurable Storage Target
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {STORAGE_TARGETS.map((target) => {
                  const active = selectedStorage === target.id
                  return (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setSelectedStorage(target.id)}
                      className={cn(
                        'px-4 py-2 rounded-full text-[13px] font-medium border transition-all',
                        active
                          ? 'bg-[#101211] text-[#F4F6F2] border-[#101211] dark:bg-[#CDFF45] dark:text-[#090B0D] dark:border-[#CDFF45] font-semibold'
                          : 'bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border-[var(--vg-border)] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
                      )}
                    >
                      {target.label}
                    </button>
                  )
                })}
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F5F2] dark:bg-[#090B0D] border border-[var(--vg-border)] space-y-2">
                <p className="font-display text-[16px] font-bold text-[#101211] dark:text-[#F4F6F2]">
                  {currentStorage.label}
                </p>
                <p className="text-[13.5px] text-[var(--vg-ink-2)] leading-relaxed">
                  {currentStorage.summary}
                </p>
                <div className="pt-1.5">
                  <span className="inline-block font-mono text-[11px] px-2.5 py-1 rounded-md bg-[#FFFFFF] dark:bg-[#111416] border border-[var(--vg-border)] text-[#087F5B] dark:text-[#CDFF45]">
                    {currentStorage.config}
                  </span>
                </div>
              </div>
            </div>

            {showCli && (
              <div className="rounded-3xl border border-white/[0.12] bg-[#090B0D] text-[#F4F6F2] p-5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.10]">
                  <div className="flex gap-1.5">
                    {SETUP_TABS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSetupTab(t.id)}
                        className={cn(
                          'px-3 py-1 rounded-full text-[12px] font-medium transition-colors',
                          setupTab === t.id
                            ? 'bg-[#CDFF45] text-[#090B0D] font-semibold'
                            : 'text-[#A4AEA9] hover:text-[#F4F6F2]'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={copyCommand}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-[11.5px] font-mono text-[#F4F6F2]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#CDFF45]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <pre className="mt-4 font-mono text-[12px] leading-relaxed text-[#E6ECE7] overflow-x-auto">
                  <code>{currentSetup.command}</code>
                </pre>
                <p className="mt-3 text-[12px] text-[#A4AEA9]">{currentSetup.note}</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  )
}
