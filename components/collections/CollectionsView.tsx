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
  Trash2,
  X,
} from 'lucide-react'

interface CollectionsViewProps {
  collections: any[]
  files?: any[]
  onSelectFile?: (file: any) => void
  onToggleFavorite?: (fileId: string, currentStatus: boolean) => void
  onDownloadFile?: (file: any) => void
  onCreateCollection?: () => void
  onAddFilesToCollection?: (collectionId: string, fileIds: string[]) => Promise<void>
  onRemoveFileFromCollection?: (collectionId: string, fileId: string) => Promise<void>
  onDeleteCollection?: (collectionId: string) => Promise<void>
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

  const memberIds = new Set(Array.isArray(col.file_ids) ? col.file_ids : [])
  return files.filter((f) => !f.is_trashed && memberIds.has(f.id))
}

function isCollectionRenderableImage(f: any): boolean {
  return (
    Boolean(f?.thumbnail_url) &&
    (f.category === 'photos' ||
      f.category === 'screenshots' ||
      f.mime_type?.startsWith('image/') ||
      /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(f.original_name || ''))
  )
}

function resolveCoverImage(col: any, colFiles: any[]): string | null {
  if (col.cover_image) return col.cover_image
  const imageFile = colFiles.find((f) => isCollectionRenderableImage(f))
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
  onAddFilesToCollection,
  onRemoveFileFromCollection,
  onDeleteCollection,
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [copiedShare, setCopiedShare] = useState(false)
  const [brokenCovers, setBrokenCovers] = useState<Record<string, boolean>>({})
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickedIds, setPickedIds] = useState<string[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)

  const selectedCollection = useMemo(
    () => collections.find((c) => c.id === selectedCollectionId) || null,
    [collections, selectedCollectionId]
  )

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

  const activeAlbumFiles = useMemo(() => {
    if (!selectedCollection) return []
    return resolveCollectionFiles(selectedCollection, files)
  }, [selectedCollection, files])

  const availableFilesToAdd = useMemo(() => {
    const activeIds = new Set(activeAlbumFiles.map((f) => f.id))
    return files.filter((f) => !f.is_trashed && !activeIds.has(f.id))
  }, [files, activeAlbumFiles])

  // ─── 1. ALBUM DETAIL VIEW ───
  if (selectedCollection) {
    const Icon = getCollectionIcon(selectedCollection.type)

    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl 2xl:max-w-[1700px] mx-auto space-y-6 animate-fadeIn">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#DDE2DC] dark:border-white/[0.08]">
          <button
            onClick={() => {
              setSelectedCollectionId(null)
              setPickerOpen(false)
              setConfirmDelete(false)
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.10] hover:border-[#101211]/35 dark:hover:border-white/[0.2] text-xs font-semibold text-[#101211] dark:text-[#F3F5F1] transition-colors shadow-sm group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Albums</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {!selectedCollection.is_smart && onAddFilesToCollection && (
              <button
                onClick={() => {
                  setPickedIds([])
                  setPickerOpen((v) => !v)
                }}
                className="vg-cta-lime flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] text-xs font-semibold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Files</span>
              </button>
            )}

            <button
              onClick={() => handleShare(selectedCollection)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.10] hover:border-[#101211]/35 dark:hover:border-[#CFFF49]/40 text-xs font-medium text-[#101211] dark:text-[#F3F5F1] transition-colors shadow-sm"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49]" />
                  <span className="text-[#087F5B] dark:text-[#CFFF49]">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Album</span>
                </>
              )}
            </button>

            {!selectedCollection.is_smart && onDeleteCollection && (
              confirmDelete ? (
                <button
                  onClick={async () => {
                    await onDeleteCollection(selectedCollection.id)
                    setSelectedCollectionId(null)
                    setConfirmDelete(false)
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Album</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Inline File Picker for Custom Collection */}
        {pickerOpen && !selectedCollection.is_smart && onAddFilesToCollection && (
          <div className="rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.10] p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">
                Select files to add to &quot;{selectedCollection.name}&quot;
              </p>
              <button onClick={() => setPickerOpen(false)} className="text-[#626B64] hover:text-[#101211]">
                <X className="w-4 h-4" />
              </button>
            </div>
            {availableFilesToAdd.length === 0 ? (
              <p className="text-xs text-[#626B64] dark:text-[#9AA69E]">All active files are already in this collection.</p>
            ) : (
              <>
                <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {availableFilesToAdd.map((f) => {
                    const checked = pickedIds.includes(f.id)
                    return (
                      <label
                        key={f.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer ${
                          checked
                            ? 'border-[#087F5B] dark:border-[#CFFF49] bg-[#087F5B]/5 dark:bg-[#CFFF49]/10'
                            : 'border-[#DDE2DC] dark:border-white/[0.08]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setPickedIds((prev) =>
                              prev.includes(f.id) ? prev.filter((id) => id !== f.id) : [...prev, f.id]
                            )
                          }
                          className="accent-[#087F5B] dark:accent-[#CFFF49]"
                        />
                        <span className="truncate text-[#101211] dark:text-[#F3F5F1]">{f.original_name}</span>
                      </label>
                    )
                  })}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={pickedIds.length === 0}
                    onClick={async () => {
                      await onAddFilesToCollection(selectedCollection.id, pickedIds)
                      setPickedIds([])
                      setPickerOpen(false)
                    }}
                    className="vg-cta-lime px-4 py-1.5 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] text-xs font-semibold disabled:opacity-45"
                  >
                    Add {pickedIds.length > 0 ? `${pickedIds.length} ` : ''}Selected
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Album Header Banner */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] shadow-sm">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#F2F3F0] dark:bg-white/[0.06] text-[#087F5B] dark:text-[#CFFF49] border border-[#DDE2DC] dark:border-white/[0.10]">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[#087F5B] dark:text-[#CFFF49] font-semibold">
                  {selectedCollection.is_smart ? 'Smart Memory Album' : 'Custom Collection'}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#101211] dark:text-[#F3F5F1] tracking-[-0.03em]">
                {selectedCollection.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#555E58] dark:text-[#9AA69E] max-w-2xl leading-relaxed">
                {selectedCollection.description || 'Custom organized collection.'}
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <div className="inline-block px-3.5 py-1.5 rounded-full bg-[#F2F3F0] dark:bg-white/[0.06] border border-[#DDE2DC] dark:border-white/[0.10]">
                <span className="text-sm font-bold text-[#101211] dark:text-[#CFFF49] font-mono">
                  {activeAlbumFiles.length}
                </span>{' '}
                <span className="text-xs text-[#555E58] dark:text-[#9AA69E]">
                  {activeAlbumFiles.length === 1 ? 'file' : 'items'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Photos Grid in Album */}
        {activeAlbumFiles.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#FFFFFF] dark:bg-[#131715] border border-dashed border-[#C7CEC6] dark:border-white/[0.12] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F2F3F0] dark:bg-white/[0.06] border border-[#DDE2DC] dark:border-white/[0.10] text-[#087F5B] dark:text-[#CFFF49] flex items-center justify-center mx-auto">
              <FolderHeart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#101211] dark:text-[#F3F5F1]">No Items Found in this Album</h3>
            <p className="text-xs text-[#626B64] dark:text-[#9AA69E] max-w-sm mx-auto">
              {selectedCollection.is_smart
                ? 'Upload photos or files matching this album\u2019s criteria to automatically populate it.'
                : 'Click "Add Files" above to add items from your vault to this album.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {activeAlbumFiles.map((file) => {
              const canRenderImg = isCollectionRenderableImage(file) && !brokenCovers[String(file.id)]

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile && onSelectFile(file)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] hover:border-[#101211]/40 dark:hover:border-[#CFFF49]/50 cursor-pointer transition-all shadow-sm hover:shadow-lg"
                >
                  {canRenderImg ? (
                    <img
                      src={file.thumbnail_url}
                      alt={file.original_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() =>
                        setBrokenCovers((prev) => ({ ...prev, [String(file.id)]: true }))
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#FFFFFF] dark:bg-[#131715]">
                      <FileText className="w-8 h-8 text-[#087F5B] dark:text-[#CFFF49] mb-2" />
                      <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1] truncate w-full px-2">
                        {file.original_name}
                      </p>
                      <span className="text-[10px] text-[#626B64] dark:text-[#9AA69E] font-mono mt-1">
                        {(file.size_bytes / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  )}

                  <div className="photo-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-end gap-1.5">
                      {!selectedCollection.is_smart && onRemoveFileFromCollection && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemoveFileFromCollection(selectedCollection.id, file.id)
                          }}
                          title="Remove from album"
                          className="p-1.5 rounded-lg backdrop-blur-md bg-black/50 text-white/85 hover:text-rose-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
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

  // ─── 2. COLLECTIONS / ALBUMS OVERVIEW GRID ───
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl 2xl:max-w-[1700px] mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#DDE2DC] dark:border-white/[0.08]">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#101211] dark:text-[#F3F5F1] flex items-center gap-2.5 tracking-[-0.03em]">
            <FolderHeart className="w-5 h-5 text-[#087F5B] dark:text-[#CFFF49]" /> Albums &amp; Collections
          </h2>
          <p className="text-xs sm:text-sm text-[#555E58] dark:text-[#9AA69E] mt-1">
            Browse memory albums, screenshots, receipts, and custom collections.
          </p>
        </div>

        {onCreateCollection && (
          <button
            onClick={onCreateCollection}
            className="vg-cta-lime self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Album</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {collections.map((col) => {
          const colFiles = resolveCollectionFiles(col, files)
          const coverUrl = resolveCoverImage(col, colFiles)
          const Icon = getCollectionIcon(col.type)

          return (
            <div
              key={col.id}
              onClick={() => setSelectedCollectionId(col.id)}
              className="group flex flex-col rounded-2xl overflow-hidden bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] hover:border-[#101211]/40 dark:hover:border-[#CFFF49]/45 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E7E9E5] dark:bg-[#090B0A] flex items-center justify-center">
                {coverUrl && !brokenCovers[String(col.id)] ? (
                  <img
                    src={coverUrl}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() =>
                      setBrokenCovers((prev) => ({ ...prev, [String(col.id)]: true }))
                    }
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#F2F3F0] dark:bg-[#090B0A] p-4">
                    <Icon className="w-9 h-9 text-[#087F5B] dark:text-[#CFFF49] opacity-85 group-hover:scale-110 transition-transform" />
                  </div>
                )}

                <div className="photo-overlay absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="photo-overlay-pill p-2 rounded-xl bg-black/45 backdrop-blur-md text-[#CFFF49] border border-white/10 shadow-sm">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {col.is_smart && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-md text-[#CFFF49] border border-white/15 font-mono font-semibold">
                        Smart
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="photo-overlay-pill text-[11px] font-medium text-white px-2.5 py-0.5 rounded-full bg-black/55 backdrop-blur-md font-mono">
                      {colFiles.length} {colFiles.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#101211] dark:text-[#F3F5F1] group-hover:text-[#087F5B] dark:group-hover:text-[#CFFF49] transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-[#555E58] dark:text-[#9AA69E] line-clamp-2 leading-relaxed">
                    {col.description || 'Custom memory collection'}
                  </p>
                </div>

                <div className="pt-2.5 flex items-center justify-between text-xs font-semibold text-[#101211] dark:text-[#F3F5F1] group-hover:text-[#087F5B] dark:group-hover:text-[#CFFF49] border-t border-[#DDE2DC] dark:border-white/[0.06]">
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
