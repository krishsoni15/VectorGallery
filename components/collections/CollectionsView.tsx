import React, { useState, useMemo } from 'react'
import {
  FolderHeart,
  Camera,
  Star,
  CreditCard,
  HardDrive,
  Briefcase,
  GraduationCap,
  Plane,
  Copy,
  Plus,
  ArrowRight,
  Folder,
  ArrowLeft,
  Share2,
  Check,
  FileText,
} from 'lucide-react'

interface CollectionsViewProps {
  collections: any[]
  files?: any[]
  onSelectFile?: (file: any) => void
  onToggleFavorite?: (fileId: string, currentStatus: boolean) => void
  onDownloadFile?: (file: any) => void
  onCreateCollection?: () => void
}

/** Filters active vault files matching smart or custom collection criteria. */
function resolveCollectionFiles(col: any, files: any[]): any[] {
  if (!files || files.length === 0) return []

  if (col.id === 'smart-diwali' || col.type === 'diwali') {
    return files.filter(
      (f) =>
        !f.is_trashed &&
        /diwali|new year|varshabhinandan|greeting|festive|wishes|nutan/i.test(
          (f.original_name || '') + ' ' + (f.extracted_text || '') + ' ' + (f.metadata?.summary || '')
        )
    )
  }

  if (col.id === 'smart-screenshots' || col.type === 'screenshots') {
    return files.filter((f) => !f.is_trashed && f.category === 'screenshots')
  }

  if (col.id === 'smart-important' || col.type === 'important') {
    return files.filter((f) => !f.is_trashed && f.is_favorite)
  }

  if (col.id === 'smart-bills' || col.type === 'bills') {
    return files.filter(
      (f) =>
        !f.is_trashed &&
        /receipt|bill|invoice|pricing|tax|payment|gst/i.test(
          (f.original_name || '') + ' ' + (f.extracted_text || '')
        )
    )
  }

  if (col.id === 'smart-large-files' || col.type === 'large_files') {
    return files.filter((f) => !f.is_trashed && f.size_bytes >= 20971520)
  }

  return files.filter((f) => !f.is_trashed).slice(0, 8)
}

function resolveCoverImage(col: any, colFiles: any[]): string | null {
  if (col.cover_image) return col.cover_image

  const imageFile = colFiles.find(
    (f) =>
      f.thumbnail_url ||
      f.category === 'photos' ||
      f.category === 'screenshots' ||
      /\.(jpg|jpeg|png|webp|gif)$/i.test(f.original_name || '')
  )

  return imageFile ? imageFile.thumbnail_url || null : null
}

function getCollectionIcon(type: string) {
  switch (type) {
    case 'diwali':
      return FolderHeart
    case 'screenshots':
      return Camera
    case 'important':
      return Star
    case 'bills':
      return CreditCard
    case 'large_files':
      return HardDrive
    case 'work':
      return Briefcase
    case 'college':
      return GraduationCap
    case 'travel':
      return Plane
    case 'duplicates':
      return Copy
    default:
      return Folder
  }
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections = [],
  files = [],
  onSelectFile,
  onToggleFavorite,
  onDownloadFile: _onDownloadFile,
  onCreateCollection,
}) => {
  const [selectedCollection, setSelectedCollection] = useState<any | null>(null)
  const [copiedShare, setCopiedShare] = useState(false)

  // Share collection handler
  const handleShare = async (col: any) => {
    const title = `${col.name} - VectorGallery Album`
    const url = typeof window !== 'undefined' ? window.location.href : ''

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: `Explore ${col.name} on VectorGallery Personal Cloud`, url })
        return
      } catch {}
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url)
        setCopiedShare(true)
        setTimeout(() => setCopiedShare(false), 2500)
      } catch {}
    }
  }

  // Active collection files when viewing album
  const activeAlbumFiles = useMemo(() => {
    if (!selectedCollection) return []
    return resolveCollectionFiles(selectedCollection, files)
  }, [selectedCollection, files])

  // ─── 1. ALBUM DETAIL VIEW (Interactive Google Photos Album) ───
  if (selectedCollection) {
    const Icon = getCollectionIcon(selectedCollection.type)
    const _coverUrl = resolveCoverImage(selectedCollection, activeAlbumFiles)

    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl 2xl:max-w-[1700px] mx-auto space-y-6 animate-fadeIn">
        {/* Top Sticky Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] dark:border-white/[0.08]">
          <button
            onClick={() => setSelectedCollection(null)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Albums</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShare(selectedCollection)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/30 text-xs font-medium text-zinc-300 hover:text-emerald-300 transition-all shadow-sm"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Album</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Album Header Banner */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-emerald-50 via-white to-teal-50/70 dark:from-emerald-950/40 dark:via-[#0E1015]/90 dark:to-[#0A0C10] border border-zinc-200 dark:border-white/[0.08] shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  {selectedCollection.is_smart ? 'Smart Memory Album' : 'Custom Collection'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {selectedCollection.name}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                {selectedCollection.description}
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <div className="inline-block px-3.5 py-1.5 rounded-2xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-md">
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {activeAlbumFiles.length}
                </span>{' '}
                <span className="text-xs text-zinc-300">
                  {activeAlbumFiles.length === 1 ? 'file' : 'items'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Photos Grid in Album */}
        {activeAlbumFiles.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <FolderHeart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-200">No Items Found in this Album</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Upload photos or files matching this album&apos;s tags to automatically populate this collection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {activeAlbumFiles.map((file) => {
              const isMedia =
                file.thumbnail_url ||
                file.category === 'photos' ||
                file.category === 'screenshots' ||
                /\.(jpg|jpeg|png|webp|gif)$/i.test(file.original_name || '')

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile && onSelectFile(file)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.08] hover:border-emerald-500/50 cursor-pointer transition-all shadow-md hover:shadow-xl hover:scale-[1.02]"
                >
                  {isMedia && file.thumbnail_url ? (
                    <img
                      src={file.thumbnail_url}
                      alt={file.original_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#13161F]">
                      <FileText className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
                      <p className="text-xs font-semibold text-zinc-200 truncate w-full px-2">
                        {file.original_name}
                      </p>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1">
                        {(file.size_bytes / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  )}

                  {/* Gradient Overlay & Details on Hover */}
                  <div className="photo-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-end">
                      {onToggleFavorite && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite(file.id, file.is_favorite)
                          }}
                          className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                            file.is_favorite
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-black/40 text-white/80 hover:text-white'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${file.is_favorite ? 'fill-amber-400' : ''}`} />
                        </button>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate drop-shadow-md">
                        {file.original_name}
                      </p>
                      <p className="text-[10px] text-zinc-300 truncate drop-shadow-sm font-mono mt-0.5">
                        {file.category || 'photo'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ─── 2. COLLECTIONS / ALBUMS OVERVIEW GRID (Google Photos Style) ───
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl 2xl:max-w-[1700px] mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <FolderHeart className="w-6 h-6 text-emerald-500" /> Albums & Collections
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Browse memory albums, festive greetings, recent screenshots, and custom collections.
          </p>
        </div>

        {onCreateCollection && (
          <button
            onClick={onCreateCollection}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-[0_0_14px_rgba(16,185,129,0.25)] hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>New Album</span>
          </button>
        )}
      </div>

      {/* Album Cards Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {collections.map((col) => {
          const colFiles = resolveCollectionFiles(col, files)
          const coverUrl = resolveCoverImage(col, colFiles)
          const Icon = getCollectionIcon(col.type)

          return (
            <div
              key={col.id}
              onClick={() => setSelectedCollection(col)}
              className="group flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-[#0E1015]/85 border border-zinc-200 dark:border-white/[0.08] hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:scale-[1.01] backdrop-blur-md"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-600/10 to-teal-500/10 p-4">
                    <Icon className="w-10 h-10 text-emerald-500 opacity-80 group-hover:scale-110 transition-transform" />
                  </div>
                )}

                {/* Gradient vignette & Count Pill */}
                <div className="photo-overlay absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="photo-overlay-pill p-2 rounded-xl bg-black/40 backdrop-blur-md text-emerald-400 border border-white/10 shadow-sm">
                      <Icon className="w-4 h-4" />
                    </div>
                    {col.is_smart && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/80 text-white font-mono font-bold shadow-sm">
                        Smart
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="photo-overlay-pill text-[11px] font-medium text-white/95 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md font-mono">
                      {colFiles.length} {colFiles.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {col.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-t border-zinc-100 dark:border-white/[0.05]">
                  <span>Explore album</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
