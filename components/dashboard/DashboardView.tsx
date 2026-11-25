import React from 'react'
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
  Star,
  Clock,
  ArrowRight,
  CheckCircle,
  File,
  AlertCircle,
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
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const categoryCards = [
    { label: 'Photos', count: stats.counts.photos, icon: ImageIcon, color: 'text-rose-400', bg: 'bg-rose-500/10', tab: 'photos' },
    { label: 'Screenshots', count: stats.counts.screenshots, icon: Camera, color: 'text-emerald-400', bg: 'bg-emerald-500/10', tab: 'photos' },
    { label: 'Documents', count: stats.counts.documents, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', tab: 'documents' },
    { label: 'Videos', count: stats.counts.videos, icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/10', tab: 'videos' },
    { label: 'Audio', count: stats.counts.audio, icon: Music, color: 'text-pink-400', bg: 'bg-pink-500/10', tab: 'audio' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl 2xl:max-w-[1800px] w-full mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* ─── 1. Welcome & Hero Search Section ─── */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950/20 via-zinc-900/40 to-transparent border border-white/[0.08] p-6 md:p-8 overflow-hidden backdrop-blur-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Zap className="w-3.5 h-3.5" /> VectorGallery Digital Memory
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {getGreeting()}, {userName}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your personal cloud is synced and active. Ask questions in natural language, retrieve screenshots, and browse all your memories.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] text-sm font-medium text-white transition-all shadow-sm group"
            >
              <Search className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Ask VectorGallery anything...</span>
              <kbd className="text-[11px] bg-black/40 px-2 py-0.5 rounded font-mono text-zinc-400 ml-2">⌘K</kbd>
            </button>

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition-all shadow-[0_0_16px_rgba(16,185,129,0.25)]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Files</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-emerald-500/[0.05] to-transparent pointer-events-none" />
      </div>

      {/* ─── 2. Storage Overview & Backup Health ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Storage Card */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-[#0E1015]/70 border border-white/[0.07] backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <HardDrive className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Storage Overview</h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              {stats.storage.formatted_used} of {stats.storage.formatted_quota} ({stats.storage.percent_used}%)
            </span>
          </div>

          {/* Apple iCloud / Google One Style Stacked Multi-Segment Storage Bar */}
          <div className="w-full h-3 rounded-full bg-zinc-800/90 overflow-hidden flex items-center p-0.5 gap-0.5 border border-white/[0.04]">
            {(stats.storage.category_bytes?.photos || 0) > 0 && (
              <div
                title={`Photos: ${stats.storage.formatted_category_bytes?.photos || '0 B'}`}
                style={{ width: `${Math.max(2, ((stats.storage.category_bytes?.photos || 0) / (stats.storage.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                className="h-full bg-rose-500 rounded-full transition-all duration-700 hover:brightness-110"
              />
            )}
            {(stats.storage.category_bytes?.screenshots || 0) > 0 && (
              <div
                title={`Screenshots: ${stats.storage.formatted_category_bytes?.screenshots || '0 B'}`}
                style={{ width: `${Math.max(1.5, ((stats.storage.category_bytes?.screenshots || 0) / (stats.storage.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                className="h-full bg-emerald-400 rounded-full transition-all duration-700 hover:brightness-110"
              />
            )}
            {(stats.storage.category_bytes?.documents || 0) > 0 && (
              <div
                title={`Documents: ${stats.storage.formatted_category_bytes?.documents || '0 B'}`}
                style={{ width: `${Math.max(1.5, ((stats.storage.category_bytes?.documents || 0) / (stats.storage.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                className="h-full bg-blue-500 rounded-full transition-all duration-700 hover:brightness-110"
              />
            )}
            <div className="flex-1 h-full bg-zinc-800/50 rounded-full" />
          </div>

          {/* Interactive Segment Pills Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-400 pt-1">
            <button
              onClick={() => onNavigateTab('photos')}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span>Photos: {stats.storage.formatted_category_bytes?.photos || '0 B'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('photos')}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span>Screenshots: {stats.storage.formatted_category_bytes?.screenshots || '0 B'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('documents')}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span>Docs: {stats.storage.formatted_category_bytes?.documents || '0 B'}</span>
            </button>
            <span className="flex items-center gap-1.5 text-zinc-500 ml-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 shrink-0" />
              <span>Free Space: {stats.storage.formatted_quota}</span>
            </span>
          </div>

          {/* Category breakdown counts */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {categoryCards.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.label}
                  onClick={() => onNavigateTab(cat.tab)}
                  className="flex flex-col p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-1.5 rounded-md ${cat.bg} ${cat.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                  </div>
                  <span className="text-xs text-zinc-400">{cat.label}</span>
                  <span className="text-sm font-bold text-zinc-100 font-mono">{cat.count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Backup Health Card */}
        <div className="p-5 rounded-2xl bg-[#0E1015]/70 border border-white/[0.07] backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Backup Health</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Sync
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/[0.04]">
              <span>Connected Devices</span>
              <span className="font-semibold text-zinc-200">
                {stats.backup_health.connected_devices} Registered
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/[0.04]">
              <span>Last Backup</span>
              <span className="text-zinc-300 font-mono text-[11px]">
                {stats.backup_health.last_sync_at
                  ? new Date(stats.backup_health.last_sync_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Just now'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Automatic Deduplication</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" /> SHA-256 Active
              </span>
            </div>

            <div className="pt-2">
              <Link
                href="/install"
                className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Install Mobile App (Scan QR)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Recent Activity & Quick Access ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Recent Files & Memories
          </h3>
          <button
            onClick={() => onNavigateTab('documents')}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium"
          >
            View all files <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {stats.recent_files.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center space-y-3 bg-[#0E1015]/40">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-zinc-200">No files uploaded yet</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Start by uploading PDF documents, photos, invoices, or screenshots to build your digital memory.
            </p>
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors"
            >
              Upload First File
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
            {stats.recent_files.map((file: any) => {
              const isMedia = file.category === 'photos' || file.category === 'screenshots' || file.thumbnail_url

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file)}
                  className="group relative rounded-2xl p-2.5 bg-[#0E1015]/70 hover:bg-white/[0.05] border border-white/[0.06] hover:border-emerald-500/40 transition-all cursor-pointer space-y-2 backdrop-blur-sm shadow-sm hover:shadow-xl"
                >
                  <div className="relative aspect-square rounded-xl bg-zinc-900/60 flex items-center justify-center overflow-hidden border border-white/[0.04]">
                    {isMedia && file.thumbnail_url ? (
                      <img
                        src={file.thumbnail_url}
                        alt={file.original_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <FileText className="w-8 h-8 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                    )}

                    {/* Google Photos Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-[10px] text-white font-medium truncate">
                        Click to view
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5 px-1">
                    <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">
                      {file.original_name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span className="capitalize">{file.category}</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
