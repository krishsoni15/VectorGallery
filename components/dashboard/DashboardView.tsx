import React, { useState } from 'react'
import Link from 'next/link'
import {
  HardDrive,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Camera,
  UploadCloud,
  Search,
  Zap,
  Smartphone,
  Clock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

interface DashboardViewProps {
  stats: {
    storage: {
      total_bytes_used: number
      total_bytes_quota: number
      formatted_used: string
      formatted_quota: string
      percent_used: number
      category_bytes?: {
        photos: number
        screenshots: number
        documents: number
        videos: number
        audio: number
      }
      formatted_category_bytes?: {
        photos: string
        screenshots: string
        documents: string
        videos: string
        audio: string
      }
    }
    counts: {
      total_files: number
      photos: number
      videos: number
      documents: number
      audio: number
      screenshots: number
    }
    backup_health: {
      connected_devices: number
      last_sync_at: string | null
      sync_status: string
    }
    recent_files: any[]
  }
  userName: string
  onOpenSearch: () => void
  onOpenUpload: () => void
  onNavigateTab: (tab: any) => void
  onSelectFile: (file: any) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  userName,
  onOpenSearch,
  onOpenUpload,
  onNavigateTab,
  onSelectFile,
}) => {
  const [brokenThumbs, setBrokenThumbs] = useState<Record<string, boolean>>({})

  const isRenderableImage = (file: any) =>
    Boolean(file?.thumbnail_url) &&
    (file.category === 'photos' ||
      file.category === 'screenshots' ||
      file.mime_type?.startsWith('image/') ||
      /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(file.original_name || file.name || ''))

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const categoryItems = [
    { label: 'Photos', count: stats.counts.photos, icon: ImageIcon, dot: 'bg-rose-500', tab: 'photos' },
    { label: 'Screenshots', count: stats.counts.screenshots, icon: Camera, dot: 'bg-emerald-400', tab: 'photos' },
    { label: 'Documents', count: stats.counts.documents, icon: FileText, dot: 'bg-blue-500', tab: 'documents' },
    { label: 'Videos', count: stats.counts.videos, icon: Video, dot: 'bg-purple-500', tab: 'videos' },
    { label: 'Audio', count: stats.counts.audio, icon: Music, dot: 'bg-pink-500', tab: 'audio' },
  ]

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-7xl 2xl:max-w-[1800px] w-full mx-auto space-y-10 animate-fadeIn">
      {/* ─── 1. Open Editorial Welcome Band (Zero Heavy Box) ─── */}
      <div className="relative pb-8 border-b border-white/[0.08] flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>VectorGallery Vault</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white">
            {getGreeting()},{' '}
            <span className="font-serif italic font-normal text-emerald-300">
              {userName}
            </span>
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your personal archive is synchronized. Ask questions across your documents, optical OCR captures, or browse your camera timeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-sm font-medium text-white transition-all group"
          >
            <Search className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Ask vault anything...</span>
            <kbd className="text-[11px] bg-black/40 px-2 py-0.5 rounded-full font-mono text-zinc-400 ml-1">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition-all shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Files</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Unified Telemetry Strip (Hairline Divided, Not Nested Cards) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b border-white/[0.08]">
        {/* Storage & Typographic Category Breakdown */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Archive Storage</span>
            </div>
            <span className="text-xs text-zinc-300 font-mono">
              {stats.storage.formatted_used} / {stats.storage.formatted_quota} ({stats.storage.percent_used}%)
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-zinc-800/90 overflow-hidden flex items-center p-0.5 gap-0.5">
            {(stats.storage.category_bytes?.photos || 0) > 0 && (
              <div
                title={`Photos: ${stats.storage.formatted_category_bytes?.photos || '0 B'}`}
                style={{ width: `${Math.max(2, ((stats.storage.category_bytes?.photos || 0) / (stats.storage.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                className="h-full bg-rose-500 rounded-full transition-all duration-700"
              />
            )}
            {(stats.storage.category_bytes?.screenshots || 0) > 0 && (
              <div
                title={`Screenshots: ${stats.storage.formatted_category_bytes?.screenshots || '0 B'}`}
                style={{ width: `${Math.max(1.5, ((stats.storage.category_bytes?.screenshots || 0) / (stats.storage.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
              />
            )}
            {(stats.storage.category_bytes?.documents || 0) > 0 && (
              <div
                title={`Documents: ${stats.storage.formatted_category_bytes?.documents || '0 B'}`}
                style={{ width: `${Math.max(1.5, ((stats.storage.category_bytes?.documents || 0) / (stats.storage.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
              />
            )}
            <div className="flex-1 h-full bg-zinc-800/50 rounded-full" />
          </div>

          {/* Inline Category Specs instead of 5 little box cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
            {categoryItems.map((cat) => (
              <button
                key={cat.label}
                onClick={() => onNavigateTab(cat.tab)}
                className="group text-left py-1.5 border-l-2 border-white/[0.08] hover:border-emerald-400 pl-3 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 group-hover:text-zinc-200">
                  <span className={`w-2 h-2 rounded-full ${cat.dot}`} />
                  <span>{cat.label}</span>
                </div>
                <p className="text-lg font-semibold text-zinc-100 font-mono mt-0.5">
                  {cat.count}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Android Sync Telemetry Column */}
        <div className="lg:col-span-4 lg:pl-8 lg:border-l border-white/[0.08] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Android Sync
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Devices</span>
              <span className="font-medium text-zinc-200">
                {stats.backup_health.connected_devices} Registered
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Last Backup</span>
              <span className="font-mono text-zinc-300">
                {stats.backup_health.last_sync_at
                  ? new Date(stats.backup_health.last_sync_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Just now'}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Deduplication</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
                <CheckCircle className="w-3.5 h-3.5" /> SHA-256
              </span>
            </div>
          </div>

          <Link
            href="/install"
            className="inline-flex items-center justify-between py-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors border-t border-white/[0.06] pt-3"
          >
            <span>Install or Pair Android App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── 3. Edge-to-Edge Borderless Recent Memories ─── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Recent Memories
          </h3>
          <button
            onClick={() => onNavigateTab('documents')}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium"
          >
            View all files <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {stats.recent_files.length === 0 ? (
          <div className="py-16 text-center space-y-3 border-y border-dashed border-white/[0.08]">
            <UploadCloud className="w-6 h-6 text-emerald-400 mx-auto opacity-85" />
            <p className="text-sm font-medium text-zinc-200">No files uploaded yet</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Upload photos, screenshots, or invoices to begin building your searchable memory archive.
            </p>
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors"
            >
              Upload First File
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {stats.recent_files.map((file: any) => {
              const displayName = file.original_name || file.name || 'Vault memory'
              const thumbKey = String(file.thumbnail_url || file.id)
              const canRenderImg = isRenderableImage(file) && !brokenThumbs[thumbKey]

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file)}
                  className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-zinc-900/70 border border-white/[0.08] cursor-pointer"
                >
                  {canRenderImg ? (
                    <>
                      <img
                        src={file.thumbnail_url}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                        onError={() =>
                          setBrokenThumbs((prev) => ({ ...prev, [thumbKey]: true }))
                        }
                      />
                      {/* Clean Photo Scrim Overlay */}
                      <div className="photo-overlay absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                        <p className="text-[11px] font-medium text-[#FFFFFF] truncate">
                          {displayName}
                        </p>
                        <p className="text-[9px] text-[#D4D4D8]/80 font-mono">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="vm-doc-fallback w-full h-full flex flex-col justify-between p-3 bg-gradient-to-br from-[#14211B] to-[#0B1410]">
                      <div className="flex-1 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-emerald-400/85 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <div className="pt-2 border-t border-white/[0.06]">
                        <p className="text-[11px] font-medium text-zinc-100 truncate">
                          {displayName}
                        </p>
                        <p className="text-[9px] text-zinc-400 font-mono">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
