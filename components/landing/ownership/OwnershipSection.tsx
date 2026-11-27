import React, { useState } from 'react'
import { Check, ChevronDown, Copy, ExternalLink, Github, Star, Terminal } from 'lucide-react'
import { VG_COMPONENTS } from '@/components/landing/design-system'
import { MotionReveal } from '@/components/landing/motion'
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
    summary: 'Save originals directly on your computer disk with JSON metadata—works offline out of the box.',
    detail: 'DATA_DIR=./data · STORAGE_DRIVER=local',
  },
  {
    id: 'supabase',
    label: 'Supabase Storage',
    summary: 'Private per-user object buckets with signed temporary URLs and isolated metadata permissions.',
    detail: 'STORAGE_DRIVER=supabase · Row-level isolation',
  },
  {
    id: 'r2',
    label: 'Cloudflare R2',
    summary: 'Zero-egress S3-compatible private bucket hosted under your own account credentials.',
    detail: 'STORAGE_DRIVER=r2 · Private S3 credentials',
  },
] as const

const SETUP_TABS = [
  {
    id: 'web',
    label: 'Web Vault',
    command: `git clone https://github.com/krishsoni15/VectorGallery.git
cd VectorGallery
npm install
cp .env.example .env.local
npm run dev`,
    note: 'Starts cleanly at http://localhost:3000 without requiring external API keys.',
  },
  {
    id: 'worker',
    label: 'OCR Worker',
    command: `npm run worker`,
    note: 'Processes OCR text extraction, document chunks, and optional BYOK semantic embeddings.',
  },
  {
    id: 'mobile',
    label: 'Android App',
    command: `cd mobile
flutter pub get
flutter run --dart-define=API_URL=http://YOUR_LAN_IP:3000`,
    note: 'Syncs camera captures directly to your own VectorGallery instance.',
  },
] as const

/**
 * Chapter 06 — Ownership & Open-Source Architecture.
 * Clear, honest storage control with matte metal & glass aesthetic and zero unverified claims.
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
      <Container wide>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Manifesto & Open Source Proof */}
          <MotionReveal className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#131715] text-[#101211] dark:text-[#CFFF49] border border-[var(--vg-border)]">
                  06 · Ownership
                </span>
                <span className="text-[12.5px] text-[var(--vg-ink-2)]">Apache-2.0 Open Source</span>
              </div>

              <h2
                className="font-display font-bold tracking-[-0.04em] leading-[1.02] text-[#101211] dark:text-[#F3F5F1]"
                style={{ fontSize: 'clamp(2.1rem, 4.4vw, 4rem)' }}
              >
                Your world. Your rules.
              </h2>

              <p className="mt-4 text-[16px] leading-[1.65] text-[var(--vg-ink-2)] max-w-xl">
                Every photograph, PDF, and note remains yours. Run VectorGallery locally on your own disk without external AI accounts, or plug in your own storage buckets and optional Gemini, Groq, Cohere, or OpenAI keys when ready.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[var(--vg-border)]">
                <p className="font-display text-[15px] font-bold text-[#101211] dark:text-[#F3F5F1]">
                  Zero Required API Keys
                </p>
                <p className="mt-1 text-[13px] text-[var(--vg-ink-2)] leading-relaxed">
                  Uploads, duplicate skipping, timelines, OCR text detection, and offline keyword recall work completely offline.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[var(--vg-border)]">
                <p className="font-display text-[15px] font-bold text-[#101211] dark:text-[#F3F5F1]">
                  Auditable Every Line
                </p>
                <p className="mt-1 text-[13px] text-[var(--vg-ink-2)] leading-relaxed">
                  Full TypeScript web app, Node worker, and Dart Android code inspected openly on GitHub.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <SecondaryButton href={REPO_URL} external>
                <Github className="w-4 h-4" />
                <span>Inspect Source on GitHub</span>
                {showStars && (
                  <span className="inline-flex items-center gap-1 ml-1 pl-2 border-l border-[var(--vg-border)] font-mono text-[12px]">
                    <Star className="w-3 h-3 text-[#087F5B] dark:text-[#CFFF49]" />
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
                <span>Self-host setup</span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', showCli && 'rotate-180')} />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 pt-2 text-[13px]">
              <TextLink href={LICENSE_URL} external>
                Apache-2.0 License <ExternalLink className="w-3 h-3" />
              </TextLink>
              <TextLink href={SECURITY_DOC_URL} external>
                Security Guide <ExternalLink className="w-3 h-3" />
              </TextLink>
              <TextLink href={CONTRIBUTING_URL} external>
                Contributing <ExternalLink className="w-3 h-3" />
              </TextLink>
              <TextLink href={ISSUES_URL} external>
                Issue Tracker <ExternalLink className="w-3 h-3" />
              </TextLink>
            </div>
          </MotionReveal>

          {/* Right Metallic Storage Switcher & Collapsible CLI Drawer */}
          <MotionReveal delay={0.08} className="lg:col-span-6 space-y-4">
            <div className="rounded-3xl border border-[var(--vg-border-strong)] bg-[#FFFFFF] dark:bg-[#131715] p-6 shadow-[var(--vg-shadow-card)]">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--vg-ink-2)] mb-3">
                Choose Where Originals Live
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
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
                          ? 'bg-[#101211] text-[#F3F5F1] border-[#101211] dark:bg-[#CFFF49] dark:text-[#090B0A] dark:border-[#CFFF49] font-semibold'
                          : 'bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border-[var(--vg-border)] hover:text-[#101211] dark:hover:text-[#F3F5F1]'
                      )}
                    >
                      {target.label}
                    </button>
                  )
                })}
              </div>

              <div className="p-5 rounded-2xl bg-[#F2F3F0] dark:bg-[#090B0A] border border-[var(--vg-border)] space-y-2.5">
                <p className="font-display text-[17px] font-bold text-[#101211] dark:text-[#F3F5F1]">
                  {currentStorage.label}
                </p>
                <p className="text-[14px] text-[var(--vg-ink-2)] leading-relaxed">
                  {currentStorage.summary}
                </p>
                <div className="pt-2">
                  <span className="inline-block font-mono text-[11.5px] px-3 py-1 rounded-md bg-[#FFFFFF] dark:bg-[#131715] border border-[var(--vg-border)] text-[#087F5B] dark:text-[#CFFF49]">
                    {currentStorage.detail}
                  </span>
                </div>
              </div>
            </div>

            {showCli && (
              <div className="rounded-3xl border border-white/[0.12] bg-[#090B0A] text-[#F3F5F1] p-5 shadow-xl">
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
                            ? 'bg-[#CFFF49] text-[#090B0A] font-semibold'
                            : 'text-[#9AA69E] hover:text-[#F3F5F1]'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={copyCommand}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-[11.5px] font-mono text-[#F3F5F1]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#CFFF49]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <pre className="mt-4 font-mono text-[12.5px] leading-relaxed text-[#E6ECE7] overflow-x-auto">
                  <code>{currentSetup.command}</code>
                </pre>
                <p className="mt-3 text-[12px] text-[#9AA69E]">{currentSetup.note}</p>
              </div>
            )}
          </MotionReveal>
        </div>
      </Container>
    </Section>
  )
}

