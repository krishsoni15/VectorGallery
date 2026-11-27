import React, { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  CheckCircle,
  Command,
  FolderHeart,
  Key,
  Search,
  ShieldCheck,
  Smartphone,
  UploadCloud,
  Zap,
  ArrowRight,
  Wand2,
} from 'lucide-react'

export interface UserGuideViewProps {
  inApp?: boolean
  onNavigateTab?: (tab: 'home' | 'photos' | 'collections' | 'assistant' | 'settings') => void
  onOpenUpload?: () => void
  onOpenSearch?: () => void
}

interface GuideStep {
  id: string
  number: string
  title: string
  tagline: string
  icon: React.ComponentType<{ className?: string }>
  summary: string
  steps: string[]
  tip: string
  actionLabel?: string
  actionTab?: 'home' | 'photos' | 'collections' | 'assistant' | 'settings'
  actionHref?: string
}

const GUIDE_CHAPTERS: GuideStep[] = [
  {
    id: 'start',
    number: '01',
    title: 'Account & Private Vault Isolation',
    tagline: 'Create an account for your personal encrypted archive',
    icon: ShieldCheck,
    summary:
      'Every signed-in account gets its own isolated vault folder, custom albums, search history, chat threads, and encrypted personal AI keys. Local Sandbox mode works immediately on this device without signing up.',
    steps: [
      'Click Get started (/signup) to register with your name, email, and password.',
      'Your session stays active across browser refreshes and syncs cleanly when you sign out and switch accounts.',
      'Use Settings → Account to update your display name, or Privacy & Security to permanently purge your vault at any time.',
    ],
    tip: 'Prefer zero setup? Choose "Continue in Local Sandbox" on the sign-in screen to test locally on this machine.',
    actionLabel: 'Open Account & Security',
    actionTab: 'settings',
    actionHref: '/signup',
  },
  {
    id: 'upload',
    number: '02',
    title: 'Upload & Optical OCR Ingestion',
    tagline: 'Capture photos, screenshots, receipts, PDFs & notes',
    icon: UploadCloud,
    summary:
      'Every file is hashed with SHA-256 to prevent duplicates, extracted cleanly (OCR for receipts/screenshots + PDF/DOCX/TXT parsing), split into semantic chunks, and indexed into vector embeddings automatically.',
    steps: [
      'Click Upload in the top bar (or press Cmd/Ctrl + U) and drop an image, PDF, spreadsheet, or note.',
      'VectorGallery automatically extracts visible receipt amounts, dates, handwritten lines, and headings.',
      'Click any tile in Photos or Overview to open the Google-Photos-style Lightbox with OCR inspection and Filmstrip navigation.',
    ],
    tip: 'Press Left/Right arrow keys inside any photo preview to glide across your timeline seamlessly.',
    actionLabel: 'Upload a File',
  },
  {
    id: 'search',
    number: '03',
    title: 'Hybrid Semantic Search (Cmd + K)',
    tagline: 'Find files by meaning, not exact filename',
    icon: Search,
    summary:
      'Combine natural-language semantic vectors with exact keyword/filename matching across your extracted OCR text, summaries, and documents.',
    steps: [
      'Press Cmd/Ctrl + K anywhere inside the workspace or click the top search bar.',
      'Ask naturally — for example: "Kyoto train seat", "tuition receipt", or "deadline notes".',
      'Filter instantly by All, Photos, Documents, Screenshots, or Videos and click any result to preview its source snippet.',
    ],
    tip: 'Exact numbers, invoice IDs, and rare terms boost automatically via hybrid lexical + cosine matching.',
    actionLabel: 'Try Search Now',
  },
  {
    id: 'assistant',
    number: '04',
    title: 'Grounded AI Assistant & Personal Keys',
    tagline: 'Synthesize answers with clickable source citations',
    icon: Zap,
    summary:
      'Ask cross-document questions in AI Assistant. Answers stream in real time with verified file citations, never inventing files you have not stored.',
    steps: [
      'Switch to Assistant and choose your preferred model provider (Gemini, Groq, OpenAI, or Cohere).',
      'Add optional personal API keys in Settings → AI Intelligence (encrypted at rest using AES-256-GCM per user) or use active system defaults.',
      'Open any file and click "Ask AI" to focus conversation strictly on that document or photo.',
    ],
    tip: 'System-default Gemini/Groq works out of the box when configured; your personal key overrides defaults privately per account.',
    actionLabel: 'Open AI Assistant',
    actionTab: 'assistant',
    actionHref: '/account',
  },
  {
    id: 'organize',
    number: '05',
    title: 'Photos Timeline, Albums & Favorites',
    tagline: 'Classy date-grouped media gallery & custom collections',
    icon: FolderHeart,
    summary:
      'Browse photos chronologically by day like Google Photos, filter Camera vs Screenshots vs Celebrations, star favorites, and curate persistent custom collections.',
    steps: [
      'Open Photos to browse edge-to-edge thumbnails grouped chronologically with hover selection checkboxes.',
      'Click the day checkmark pill to batch-select an entire day to Star or Move to Trash.',
      'Open Collections → New Album to create a custom album and attach specific photos or documents via Add Files.',
    ],
    tip: 'Trashed items remain recoverable in Trash until you choose Delete Permanently.',
    actionLabel: 'Open Photos Timeline',
    actionTab: 'photos',
  },
  {
    id: 'mobile',
    number: '06',
    title: 'Android App & Companion Sync',
    tagline: 'Automatic non-destructive Wi-Fi backup from your phone',
    icon: Smartphone,
    summary:
      'Install the VectorGallery Android companion APK from /install, point it to your server host URL, and sign in with your VectorGallery account so camera roll backups appear directly in your web library.',
    steps: [
      'Open /install on desktop (scan QR) or Android to download and verify the signed APK.',
      'In the Android app Settings tab, sign into your account and configure Host Server URL (e.g., your local Wi-Fi IP or cloud URL).',
      'Use Test Connection and tap Backup to enqueue Camera, Screenshots, or specific folders with SHA-256 deduplication.',
    ],
    tip: 'Your original photos never leave your phone — VectorGallery performs read-only non-destructive backup.',
    actionLabel: 'Open Android Installer',
    actionHref: '/install',
  },
]

const SHORTCUTS = [
  { keys: 'Cmd / Ctrl + K', desc: 'Open natural-language search modal' },
  { keys: 'Cmd / Ctrl + U', desc: 'Open quick file upload dialog' },
  { keys: '← / →', desc: 'Previous or next file inside Lightbox preview' },
  { keys: 'Esc', desc: 'Close active preview or search overlay' },
]

export const UserGuideView: React.FC<UserGuideViewProps> = ({
  inApp = false,
  onNavigateTab,
  onOpenUpload,
  onOpenSearch,
}) => {
  const [activeId, setActiveId] = useState<string>('start')
  const activeChapter = GUIDE_CHAPTERS.find((c) => c.id === activeId) || GUIDE_CHAPTERS[0]

  const handleAction = (chapter: GuideStep) => {
    if (chapter.id === 'upload' && onOpenUpload) {
      onOpenUpload()
      return
    }
    if (chapter.id === 'search' && onOpenSearch) {
      onOpenSearch()
      return
    }
    if (inApp && chapter.actionTab && onNavigateTab) {
      onNavigateTab(chapter.actionTab)
    }
  }

  return (
    <div className={inApp ? 'p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn' : 'space-y-8'}>
      {/* Header Band */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#DDE2DC] dark:border-white/[0.08]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[#087F5B] dark:text-[#CDFF45] font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>VectorGallery User Guide</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.035em] text-[#101211] dark:text-[#F4F6F2]">
            How to use VectorGallery
          </h1>
          <p className="text-xs sm:text-sm text-[#555E58] dark:text-[#A4AEA9] max-w-2xl leading-relaxed">
            Everything you need to capture memories, search visually via OCR, chat with grounded citations, and pair Android backup cleanly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/install"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFFFFF] dark:bg-[#191D20] border border-[#DBE0DA] dark:border-white/[0.10] text-xs font-medium text-[#101211] dark:text-[#F4F6F2] hover:border-[#087F5B]/40 dark:hover:border-[#CDFF45]/40 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CDFF45]" />
            <span>Android APK</span>
          </Link>
          {!inApp && (
            <Link
              href="/signup"
              className="vg-cta-lime inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CDFF45] text-[#101211] text-xs font-semibold shadow-sm"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Main Split Reader Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Navigation Pills */}
        <div className="lg:col-span-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#111416] border border-[#DBE0DA] dark:border-white/[0.08] p-2 space-y-1 shadow-sm">
          {GUIDE_CHAPTERS.map((chap) => {
            const Icon = chap.icon
            const isActive = chap.id === activeChapter.id
            return (
              <button
                key={chap.id}
                type="button"
                onClick={() => setActiveId(chap.id)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#101211] text-[#F4F6F2] dark:bg-[#CDFF45] dark:text-[#090B0D]'
                    : 'text-[#555E58] dark:text-[#A4AEA9] hover:bg-[#F2F3F0] dark:hover:bg-white/[0.05] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
                }`}
              >
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ${
                    isActive
                      ? 'bg-white/15 text-[#CDFF45] dark:bg-[#090B0D]/15 dark:text-[#090B0D]'
                      : 'bg-[#F2F3F0] dark:bg-white/[0.06] text-[#606961] dark:text-[#A4AEA9]'
                  }`}
                >
                  {chap.number}
                </span>
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-[#CDFF45] dark:text-[#090B0D]'
                      : 'text-[#087F5B] dark:text-[#46D6A4]'
                  }`}
                />
                <span className="text-xs font-semibold truncate">{chap.title}</span>
              </button>
            )
          })}
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-8 rounded-2xl bg-[#FFFFFF] dark:bg-[#111416] border border-[#DBE0DA] dark:border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-sm">
          <div className="space-y-2 pb-4 border-b border-[#DBE0DA] dark:border-white/[0.08]">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#087F5B] dark:text-[#CDFF45]">
              <span>Step {activeChapter.number}</span>
              <span>·</span>
              <span>{activeChapter.tagline}</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#101211] dark:text-[#F4F6F2] tracking-[-0.025em]">
              {activeChapter.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#555E58] dark:text-[#A4AEA9] leading-relaxed">
              {activeChapter.summary}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#606961] dark:text-[#A4AEA9]">
              Step-by-Step Workflow
            </h3>
            <div className="space-y-2.5">
              {activeChapter.steps.map((stepText, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F4F5F2] dark:bg-[#191D20] border border-[#DBE0DA] dark:border-white/[0.06]"
                >
                  <CheckCircle className="w-4 h-4 text-[#087F5B] dark:text-[#46D6A4] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-[13px] text-[#101211] dark:text-[#F4F6F2] leading-relaxed">
                    {stepText}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#087F5B]/[0.07] dark:bg-[#CDFF45]/[0.08] border border-[#087F5B]/20 dark:border-[#CDFF45]/25 flex items-start gap-3">
            <Wand2 className="w-4 h-4 text-[#087F5B] dark:text-[#CDFF45] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#087F5B] dark:text-[#CDFF45] font-semibold">
                Pro Tip
              </p>
              <p className="text-xs text-[#101211] dark:text-[#F4F6F2] leading-relaxed">
                {activeChapter.tip}
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            {activeChapter.actionHref && (!inApp || !activeChapter.actionTab) ? (
              <Link
                href={activeChapter.actionHref}
                className="vg-cta-lime inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CDFF45] text-[#101211] text-xs font-semibold shadow-sm"
              >
                <span>{activeChapter.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : activeChapter.actionLabel ? (
              <button
                type="button"
                onClick={() => handleAction(activeChapter)}
                className="vg-cta-lime inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CDFF45] text-[#101211] text-xs font-semibold shadow-sm"
              >
                <span>{activeChapter.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2 text-xs text-[#606961] dark:text-[#A4AEA9]">
              <Key className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#46D6A4]" />
              <span>Local &amp; Cloud Sync Compatible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Strip */}
      <div className="rounded-2xl bg-[#FFFFFF] dark:bg-[#111416] border border-[#DBE0DA] dark:border-white/[0.08] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#606961] dark:text-[#A4AEA9] mb-4">
          <Command className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CDFF45]" />
          <span>Keyboard Shortcuts</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SHORTCUTS.map((sc) => (
            <div
              key={sc.keys}
              className="p-3 rounded-xl bg-[#F4F5F2] dark:bg-[#191D20] border border-[#DBE0DA] dark:border-white/[0.06] space-y-1"
            >
              <kbd className="inline-block px-2 py-0.5 rounded-md bg-[#FFFFFF] dark:bg-[#090B0D] border border-[#DBE0DA] dark:border-white/[0.12] font-mono text-[11px] font-semibold text-[#101211] dark:text-[#CDFF45]">
                {sc.keys}
              </kbd>
              <p className="text-[11.5px] text-[#555E58] dark:text-[#A4AEA9]">{sc.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

