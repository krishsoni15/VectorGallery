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
    { label: 'Photos', count: stats.counts.photos, icon: ImageIcon, dot: 'bg-[#101211] dark:bg-[#F3F5F1]', tab: 'photos' },
    { label: 'Screenshots', count: stats.counts.screenshots, icon: Camera, dot: 'bg-[#C8F73E] dark:bg-[#CFFF49]', tab: 'photos' },
    { label: 'Documents', count: stats.counts.documents, icon: FileText, dot: 'bg-[#087F5B] dark:bg-[#39D9A0]', tab: 'documents' },
    { label: 'Videos', count: stats.counts.videos, icon: Video, dot: 'bg-[#626B64] dark:bg-[#9AA69E]', tab: 'videos' },
    { label: 'Audio', count: stats.counts.audio, icon: Music, dot: 'bg-[#A8B3B2] dark:bg-[#626B64]', tab: 'audio' },
  ]

  return (
    <div className="p-4 sm:p-8 lg:p-10 max-w-7xl 2xl:max-w-[1800px] w-full mx-auto space-y-8 sm:space-y-10 animate-fadeIn">
      {/* ─── 1. Minimal Living Matter Welcome Band ─── */}
      <div className="relative pb-7 border-b border-[#DDE2DC] dark:border-white/[0.08] flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[#555E58] dark:text-[#9AA69E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-[#CFFF49]" />
            <span>VectorGallery Vault</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl xl:text-[2.6rem] font-bold tracking-[-0.036em] leading-[1.06] text-[#101211] dark:text-[#F3F5F1]">
            {getGreeting()},{' '}
            <span className="text-[#555E58] dark:text-[#9AA69E] font-semibold">
              {userName}
            </span>
          </h2>
          <p className="text-sm sm:text-[15px] text-[#555E58] dark:text-[#9AA69E] leading-relaxed">
            Your personal archive is synchronized. Ask questions across your documents, OCR screenshots, or camera timeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#FFFFFF] dark:bg-[#131715] hover:border-[#101211]/35 dark:hover:border-white/[0.2] border border-[#DDE2DC] dark:border-white/[0.10] text-xs sm:text-sm font-medium text-[#101211] dark:text-[#F3F5F1] transition-colors group shadow-sm"
          >
            <Search className="w-4 h-4 text-[#626B64] dark:text-[#9AA69E] group-hover:text-[#087F5B] dark:group-hover:text-[#CFFF49] transition-colors" />
            <span>Ask vault anything...</span>
            <kbd className="text-[10.5px] bg-[#F2F3F0] dark:bg-white/[0.06] border border-[#DDE2DC] dark:border-white/[0.10] px-2 py-0.5 rounded-full font-mono text-[#626B64] dark:text-[#9AA69E] ml-1">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => onNavigateTab('assistant')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#101211] hover:bg-[#232825] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-xs sm:text-sm font-medium text-[#F3F5F1] transition-colors"
          >
            <Zap className="w-4 h-4 text-[#D4FF54] dark:text-[#CFFF49]" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Clean Telemetry Strip (Liquid Silver / Carbon Surface) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 pb-7 border-b border-[#DDE2DC] dark:border-white/[0.08]">
        {/* Storage & Typographic Category Breakdown */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#555E58] dark:text-[#9AA69E]">
              <HardDrive className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49]" />
              <span>Archive Storage</span>
            </div>
            <span className="text-xs text-[#101211] dark:text-[#F3F5F1] font-mono">
              {stats.storage.formatted_used} / {stats.storage.formatted_quota} ({stats.storage.percent_used}%)
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#E7E9E5] dark:bg-white/[0.08] overflow-hidden flex items-center p-0.5 gap-0.5">
            {(stats.storage.category_bytes?.photos || 0) > 0 && (
              <div
                title={`Photos: ${stats.storage.formatted_category_bytes?.photos || '0 B'}`}
                style={{ width: `${Math.max(2, ((stats.storage.category_bytes?.photos || 0) / (stats.storage.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                className="h-full bg-[#101211] dark:bg-[#F3F5F1] rounded-full transition-all duration-700"
              />
            )}
            {(stats.storage.category_bytes?.screenshots || 0) > 0 && (
              <div
                title={`Screenshots: ${stats.storage.formatted_category_bytes?.screenshots || '0 B'}`}
                style={{ width: `${Math.max(1.5, ((stats.storage.category_bytes?.screenshots || 0) / (stats.storage.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                className="h-full bg-[#C8F73E] dark:bg-[#CFFF49] rounded-full transition-all duration-700"
              />
            )}
            {(stats.storage.category_bytes?.documents || 0) > 0 && (
              <div
                title={`Documents: ${stats.storage.formatted_category_bytes?.documents || '0 B'}`}
                style={{ width: `${Math.max(1.5, ((stats.storage.category_bytes?.documents || 0) / (stats.storage.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                className="h-full bg-[#087F5B] dark:bg-[#39D9A0] rounded-full transition-all duration-700"
              />
            )}
            <div className="flex-1 h-full bg-transparent rounded-full" />
          </div>

          {/* Minimal Typographic Category Spec Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-1">
            {categoryItems.map((cat) => (
              <button
                key={cat.label}
                onClick={() => onNavigateTab(cat.tab)}
                className="group text-left py-1.5 border-l-2 border-[#DDE2DC] dark:border-white/[0.10] hover:border-[#101211] dark:hover:border-[#CFFF49] pl-3 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs text-[#555E58] dark:text-[#9AA69E] group-hover:text-[#101211] dark:group-hover:text-[#F3F5F1]">
                  <span className={`w-2 h-2 rounded-full ${cat.dot}`} />
                  <span>{cat.label}</span>
                </div>
                <p className="text-lg font-semibold text-[#101211] dark:text-[#F3F5F1] font-mono mt-0.5">
                  {cat.count}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Android Sync Telemetry Column */}
        <div className="lg:col-span-4 lg:pl-8 lg:border-l border-[#DDE2DC] dark:border-white/[0.08] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#555E58] dark:text-[#9AA69E]">
              <Smartphone className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49]" />
              Android Sync
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#087F5B] dark:text-[#39D9A0] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-[#39D9A0]" /> Live
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[#555E58] dark:text-[#9AA69E]">
              <span>Devices</span>
              <span className="font-medium text-[#101211] dark:text-[#F3F5F1]">
                {stats.backup_health.connected_devices} Registered
              </span>
            </div>
            <div className="flex items-center justify-between text-[#555E58] dark:text-[#9AA69E]">
              <span>Last Backup</span>
              <span className="font-mono text-[#101211] dark:text-[#F3F5F1]">
                {stats.backup_health.last_sync_at
                  ? new Date(stats.backup_health.last_sync_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Just now'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#555E58] dark:text-[#9AA69E]">
              <span>Deduplication</span>
              <span className="inline-flex items-center gap-1 text-[#087F5B] dark:text-[#39D9A0] font-mono">
                <CheckCircle className="w-3.5 h-3.5" /> SHA-256
              </span>
            </div>
          </div>

          <Link
            href="/install"
            className="inline-flex items-center justify-between py-2 text-xs font-medium text-[#101211] dark:text-[#F3F5F1] hover:text-[#087F5B] dark:hover:text-[#CFFF49] transition-colors border-t border-[#DDE2DC] dark:border-white/[0.08] pt-3"
          >
            <span>Install or Pair Android App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── 3. Clean Editorial Recent Memories Grid ─── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#101211] dark:text-[#F3F5F1] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#087F5B] dark:text-[#CFFF49]" /> Recent Memories
          </h3>
          <button
            onClick={() => onNavigateTab('recent')}
            className="text-xs text-[#555E58] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#CFFF49] transition-colors flex items-center gap-1 font-medium"
          >
            View all files <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {stats.recent_files.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-dashed border-[#C7CEC6] dark:border-white/[0.12]">
            <UploadCloud className="w-6 h-6 text-[#087F5B] dark:text-[#CFFF49] mx-auto" />
            <p className="text-sm font-medium text-[#101211] dark:text-[#F3F5F1]">No files uploaded yet</p>
            <p className="text-xs text-[#626B64] dark:text-[#9AA69E] max-w-sm mx-auto">
              Upload photos, screenshots, or invoices to begin building your searchable memory archive.
            </p>
            <button
              onClick={onOpenUpload}
              className="vg-cta-lime inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] text-xs font-semibold text-[#101211] transition-colors"
            >
              Upload First File
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3.5">
            {stats.recent_files.map((file: any) => {
              const displayName = file.original_name || file.name || 'Vault memory'
              const thumbKey = String(file.thumbnail_url || file.id)
              const canRenderImg = isRenderableImage(file) && !brokenThumbs[thumbKey]

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file)}
                  className="group rounded-2xl overflow-hidden bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] hover:border-[#101211]/40 dark:hover:border-[#CFFF49]/45 transition-all cursor-pointer flex flex-col shadow-[0_6px_20px_-14px_rgba(16,18,17,0.12)] dark:shadow-none"
                >
                  {canRenderImg ? (
                    <>
                      <div className="relative aspect-square w-full overflow-hidden bg-[#E7E9E5] dark:bg-[#090B0A]">
                        <img
                          src={file.thumbnail_url}
                          alt={displayName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                          onError={() =>
                            setBrokenThumbs((prev) => ({ ...prev, [thumbKey]: true }))
                          }
                        />
                      </div>
                      <div className="px-2.5 py-2 border-t border-[#DDE2DC] dark:border-white/[0.06]">
                        <p className="text-[11px] font-medium text-[#101211] dark:text-[#F3F5F1] truncate">
                          {displayName}
                        </p>
                        <p className="text-[9.5px] text-[#626B64] dark:text-[#9AA69E] font-mono mt-0.5">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full min-h-[172px] flex flex-col justify-between p-3 bg-[#FFFFFF] dark:bg-[#131715]">
                      <div className="flex-1 rounded-xl bg-[#F2F3F0] dark:bg-[#090B0A] flex items-center justify-center mb-2">
                        <FileText className="w-7 h-7 text-[#555E58] dark:text-[#9AA69E] group-hover:text-[#087F5B] dark:group-hover:text-[#CFFF49] group-hover:scale-110 transition-all" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[#101211] dark:text-[#F3F5F1] truncate">
                          {displayName}
                        </p>
                        <p className="text-[9.5px] text-[#626B64] dark:text-[#9AA69E] font-mono mt-0.5">
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
