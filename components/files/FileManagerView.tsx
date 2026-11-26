import React, { useState, useMemo } from 'react'
import {
  Grid,
  List,
  Filter,
  ArrowUpDown,
  Search,
  Star,
  Trash2,
  Download,
  MoreVertical,
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Camera,
  RotateCcw,
  CheckSquare,
  Square,
  Check,
  Eye,
  Edit2,
  Share2,
  Calendar,
  Play,
} from 'lucide-react'

interface FileManagerViewProps {
  files: any[]
  loading: boolean
  activeCategory: string
  isTrashView?: boolean
  onSelectFile: (file: any) => void
  onToggleFavorite: (fileId: string, currentStatus: boolean) => void
  onTrashFile: (fileId: string) => void
  onRestoreFile: (fileId: string) => void
  onPermanentDelete: (fileId: string) => void
  onRenameFile: (fileId: string, currentName: string) => void
  onDownloadFile: (file: any) => void
  onBulkAction?: (action: 'trash' | 'restore' | 'favorite' | 'unfavorite' | 'delete', selectedIds: string[]) => void
}

export const FileManagerView: React.FC<FileManagerViewProps> = ({
  files,
  loading,
  activeCategory,
  isTrashView = false,
  onSelectFile,
  onToggleFavorite,
  onTrashFile,
  onRestoreFile,
  onPermanentDelete,
  onRenameFile,
  onDownloadFile,
  onBulkAction,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [photoAlbum, setPhotoAlbum] = useState<'all' | 'wishes' | 'screenshots' | 'favorites'>('all')

  const isPhotosMode = activeCategory === 'photos'

  const isWishPhoto = (f: any) => {
    const text = `${f.original_name} ${f.extracted_text || ''} ${f.metadata?.summary || ''}`.toLowerCase()
    return /new\s*year|diwali|nutan|varshabhinandan|શુભકામના|દિવાળી|સાલ\s*મુબારક|sal\s*mubarak|greeting|wish/.test(text)
  }

  // Filter and Sort
  const filteredFiles = files.filter((f) => {
    if (isPhotosMode) {
      if (photoAlbum === 'wishes' && !isWishPhoto(f)) return false
      if (photoAlbum === 'screenshots' && !(f.category === 'screenshots' || f.original_name.toLowerCase().includes('screenshot'))) return false
      if (photoAlbum === 'favorites' && !f.is_favorite) return false
    }
    if (!searchTerm.trim()) return true
    return f.original_name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name') {
      return sortAsc
        ? a.original_name.localeCompare(b.original_name)
        : b.original_name.localeCompare(a.original_name)
    }
    if (sortBy === 'size') {
      return sortAsc ? (a.size_bytes || 0) - (b.size_bytes || 0) : (b.size_bytes || 0) - (a.size_bytes || 0)
    }
    // Default: date
    return sortAsc
      ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Google Photos Date & Thematic Extractor
  const getFileDateKey = (file: any): { key: string; label: string; location?: string } => {
    let date = new Date(file.created_at)
    const nameMatch = file.original_name?.match(/IMG-(\d{4})(\d{2})(\d{2})/) || file.original_name?.match(/Screenshot_(\d{4})-(\d{2})-(\d{2})/)
    if (nameMatch) {
      const [_, y, m, d] = nameMatch
      date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    }

    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()

    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    let label = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    if (isToday) label = `Today, ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
    else if (isYesterday) label = `Yesterday, ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`

    // Derive general media context label without hardcoding personal locations
    let location: string | undefined = undefined
    const lower = `${file.original_name} ${file.extracted_text || ''} ${file.metadata?.summary || ''}`.toLowerCase()
    if (file.category === 'screenshots' || lower.includes('screenshot')) {
      location = 'Mobile Screen Capture'
    } else if (file.category === 'documents' || /\.(pdf|docx?|txt|csv)$/i.test(file.original_name || '')) {
      location = 'Document Archive'
    } else if (file.category === 'videos' || file.mime_type?.startsWith('video/')) {
      location = 'Video Memory'
    } else if (isWishPhoto(file)) {
      location = 'Celebrations & Cards'
    }

    return { key, label, location }
  }

  // Group sorted files by timeline date (Google Photos Timeline)
  const groupedTimeline = useMemo(() => {
    const groups: { dateKey: string; label: string; location?: string; items: any[] }[] = []
    const map = new Map<string, { dateKey: string; label: string; location?: string; items: any[] }>()

    sortedFiles.forEach((file) => {
      const { key, label, location } = getFileDateKey(file)
      if (!map.has(key)) {
        const group = { dateKey: key, label, location, items: [] as any[] }
        map.set(key, group)
        groups.push(group)
      }
      map.get(key)!.items.push(file)
    })

    return groups
  }, [sortedFiles])

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === sortedFiles.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(sortedFiles.map((f) => f.id))
    }
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const getFileIcon = (file: any) => {
    if (file.category === 'photos' || file.category === 'screenshots') return ImageIcon
    if (file.category === 'videos') return Video
    if (file.category === 'audio') return Music
    return FileText
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl 2xl:max-w-[1900px] w-full mx-auto space-y-6 animate-fadeIn">
      {/* ─── Control Toolbar ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        {/* Left: Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Filter ${activeCategory}...`}
            className="w-full bg-[#14161C] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        {/* Right: View mode, Sort, Bulk actions */}
        <div className="flex items-center gap-2">
          {/* Select All */}
          <button
            onClick={selectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-300 transition-colors border border-white/[0.06]"
          >
            {selectedIds.length === sortedFiles.length && sortedFiles.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span>{selectedIds.length > 0 ? `${selectedIds.length} Selected` : 'Select All'}</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center rounded-lg bg-white/[0.04] border border-white/[0.06] p-0.5 text-xs text-zinc-300">
            <button
              onClick={() => {
                if (sortBy === 'date') setSortAsc(!sortAsc)
                else { setSortBy('date'); setSortAsc(false) }
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === 'date' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'hover:text-zinc-100'
              }`}
            >
              Date
            </button>
            <button
              onClick={() => {
                if (sortBy === 'name') setSortAsc(!sortAsc)
                else { setSortBy('name'); setSortAsc(true) }
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === 'name' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'hover:text-zinc-100'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => {
                if (sortBy === 'size') setSortAsc(!sortAsc)
                else { setSortBy('size'); setSortAsc(false) }
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === 'size' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'hover:text-zinc-100'
              }`}
            >
              Size
            </button>
          </div>

          {/* Grid / List Switch */}
          <div className="flex items-center rounded-lg bg-white/[0.04] border border-white/[0.06] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Google Photos Album Filter Row ─── */}
      {isPhotosMode && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setPhotoAlbum('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                photoAlbum === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.05]'
              }`}
            >
              <span>All Photos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08] text-zinc-300 font-mono">
                {files.length}
              </span>
            </button>

            <button
              onClick={() => setPhotoAlbum('wishes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                photoAlbum === 'wishes'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.05]'
              }`}
            >
              <span>✨ Celebrations &amp; Greetings</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                {files.filter(isWishPhoto).length}
              </span>
            </button>

            <button
              onClick={() => setPhotoAlbum('screenshots')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                photoAlbum === 'screenshots'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.05]'
              }`}
            >
              <span>📱 Screenshots</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08] text-zinc-300 font-mono">
                {files.filter((f) => f.category === 'screenshots' || f.original_name.toLowerCase().includes('screenshot')).length}
              </span>
            </button>

            <button
              onClick={() => setPhotoAlbum('favorites')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                photoAlbum === 'favorites'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.05]'
              }`}
            >
              <span>⭐ Favorites</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08] text-zinc-300 font-mono">
                {files.filter((f) => !!f.is_favorite).length}
              </span>
            </button>
          </div>

          {/* Timeline Date Header (Google Photos Style) */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              November 2026 • Library Timeline
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {filteredFiles.length} item{filteredFiles.length !== 1 ? 's' : ''} • Backed up & OCR indexed
            </span>
          </div>
        </div>
      )}

      {/* ─── Bulk Action Banner ─── */}
      {selectedIds.length > 0 && onBulkAction && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-white animate-fadeIn shadow-md">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected</span>
          </div>

          <div className="flex items-center gap-2">
            {!isTrashView && (
              <>
                <button
                  onClick={() => onBulkAction('favorite', selectedIds)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
                >
                  Favorite
                </button>
                <button
                  onClick={() => {
                    onBulkAction('trash', selectedIds)
                    setSelectedIds([])
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                  Move to Trash
                </button>
              </>
            )}

            {isTrashView && (
              <>
                <button
                  onClick={() => {
                    onBulkAction('restore', selectedIds)
                    setSelectedIds([])
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold transition-colors text-white"
                >
                  Restore Selected
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Permanently delete ${selectedIds.length} files?`)) {
                      onBulkAction('delete', selectedIds)
                      setSelectedIds([])
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 font-semibold transition-colors text-white"
                >
                  Delete Permanently
                </button>
              </>
            )}

            <button
              onClick={() => setSelectedIds([])}
              className="text-zinc-400 hover:text-zinc-200 ml-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ─── Files View (Grid or List) ─── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : sortedFiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center space-y-3 bg-[#0E1015]/30">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] text-zinc-500 flex items-center justify-center mx-auto">
            {isTrashView ? <Trash2 className="w-6 h-6" /> : <Folder className="w-6 h-6" />}
          </div>
          <p className="text-sm font-semibold text-zinc-200">
            {isTrashView ? 'Trash is empty' : `No files in ${activeCategory}`}
          </p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {isTrashView
              ? 'Files you delete will appear here and can be restored or permanently removed.'
              : 'Uploaded files and mobile backups matching this category will appear here.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        isPhotosMode ? (
          /* Google Photos Style Timeline Date Grouped Gallery */
          <div className="space-y-8">
            {groupedTimeline.map((group) => {
              const allDaySelected =
                group.items.length > 0 &&
                group.items.every((f) => selectedIds.includes(f.id))

              const toggleSelectDay = (e: React.MouseEvent) => {
                e.stopPropagation()
                const dayIds = group.items.map((f) => f.id)
                if (allDaySelected) {
                  setSelectedIds((prev) => prev.filter((id) => !dayIds.includes(id)))
                } else {
                  setSelectedIds((prev) => Array.from(new Set([...prev, ...dayIds])))
                }
              }

              return (
                <section key={group.dateKey} className="space-y-3">
                  {/* Google Photos Timeline Date Header */}
                  <div className="flex items-center justify-between group/header select-none">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={toggleSelectDay}
                        title={allDaySelected ? 'Deselect day' : 'Select all photos from this day'}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          allDaySelected
                            ? 'bg-emerald-500 text-white shadow-sm scale-105'
                            : 'bg-white/[0.05] hover:bg-white/[0.15] border border-white/20 text-transparent hover:text-white/80 opacity-0 group-hover/header:opacity-100'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                        <span>{group.label}</span>
                        {group.location && (
                          <span className="text-xs font-normal text-zinc-400">
                            • {group.location}
                          </span>
                        )}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Google Photos Responsive Fluid Gallery Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2.5 sm:gap-3.5">
                    {group.items.map((file) => {
                      const isSelected = selectedIds.includes(file.id)
                      const isVideo = file.category === 'videos' || file.mime_type?.startsWith('video/')

                      return (
                        <div
                          key={file.id}
                          onClick={() => onSelectFile(file)}
                          className={`group relative rounded-2xl overflow-hidden aspect-square bg-zinc-950/80 border transition-all cursor-pointer shadow-sm select-none hover:shadow-2xl ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-[0.98]'
                              : 'border-white/[0.08] hover:border-emerald-500/50'
                          }`}
                        >
                          {file.thumbnail_url ? (
                            <img
                              src={file.thumbnail_url}
                              alt={file.original_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                              <ImageIcon className="w-8 h-8 text-zinc-600" />
                            </div>
                          )}

                          {/* Vignette Gradients */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/35 opacity-60 group-hover:opacity-90 transition-opacity" />

                          {/* Top Actions: Select & Video Badge / Favorite */}
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                            <button
                              onClick={(e) => toggleSelect(file.id, e)}
                              title={isSelected ? 'Deselect' : 'Select'}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${
                                isSelected
                                  ? 'bg-emerald-500 text-white shadow-md scale-105'
                                  : 'bg-black/50 border border-white/70 text-transparent hover:text-white/80 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>

                            <div className="flex items-center gap-1.5">
                              {isVideo && (
                                <span className="photo-overlay-pill px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white flex items-center gap-1 font-mono">
                                  <Play className="w-2.5 h-2.5 fill-white" />
                                  <span>0:15</span>
                                </span>
                              )}

                              {!isTrashView && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onToggleFavorite(file.id, file.is_favorite)
                                  }}
                                  className={`photo-overlay-pill p-1.5 rounded-lg transition-colors backdrop-blur-md ${
                                    file.is_favorite
                                      ? 'bg-black/60 text-amber-400'
                                      : 'bg-black/40 text-white/70 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                                  }`}
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      file.is_favorite ? 'fill-amber-400' : ''
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Bottom Info: Title, Date, Share & Download */}
                          <div className="photo-overlay absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-end justify-between">
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-semibold text-white truncate drop-shadow-sm">
                                {file.original_name}
                              </p>
                              <p className="text-[10px] text-zinc-300 font-mono drop-shadow-sm">
                                {formatSize(file.size_bytes)}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (typeof navigator !== 'undefined' && navigator.share) {
                                    navigator.share({
                                      title: file.original_name,
                                      url: file.thumbnail_url,
                                    })
                                  } else {
                                    onDownloadFile(file)
                                  }
                                }}
                                title="Share photo"
                                className="p-1.5 rounded-lg bg-black/60 hover:bg-emerald-500 text-white transition-colors"
                              >
                                <Share2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDownloadFile(file)
                                }}
                                title="Download photo"
                                className="p-1.5 rounded-lg bg-black/60 hover:bg-emerald-500 text-white transition-colors"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          /* Standard Category Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedFiles.map((file) => {
              const Icon = getFileIcon(file)
              const isSelected = selectedIds.includes(file.id)

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file)}
                  className={`group relative rounded-2xl p-3 bg-[#0E1015]/80 hover:bg-white/[0.05] border transition-all cursor-pointer space-y-2 backdrop-blur-sm select-none ${
                    isSelected ? 'border-emerald-500 bg-emerald-500/[0.05]' : 'border-white/[0.07] hover:border-emerald-500/40'
                  }`}
                >
                  {/* Thumbnail Preview Area */}
                  <div className="relative h-32 rounded-xl bg-zinc-950/60 overflow-hidden flex items-center justify-center border border-white/[0.04]">
                    {file.thumbnail_url && (file.category === 'photos' || file.category === 'screenshots') ? (
                      <img
                        src={file.thumbnail_url}
                        alt={file.original_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Icon className="w-10 h-10 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                    )}

                    {/* Top action badges */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isTrashView && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite(file.id, file.is_favorite)
                          }}
                          className="p-1 rounded-md bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-amber-400 transition-colors"
                        >
                          <Star className={`w-3.5 h-3.5 ${file.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      )}
                      <button
                        onClick={(e) => toggleSelect(file.id, e)}
                        className="p-1 rounded-md bg-black/60 hover:bg-black/80 text-zinc-300 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">
                      {file.original_name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>{formatSize(file.size_bytes)}</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions row on hover */}
                  <div className="pt-1 flex items-center justify-between border-t border-white/[0.04] text-zinc-400">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownloadFile(file)
                        }}
                        title="Download"
                        className="p-1 rounded hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {!isTrashView && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRenameFile(file.id, file.original_name)
                          }}
                          title="Rename"
                          className="p-1 rounded hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      {isTrashView ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onRestoreFile(file.id)
                            }}
                            title="Restore"
                            className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onPermanentDelete(file.id)
                            }}
                            title="Delete Permanently"
                            className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onTrashFile(file.id)
                          }}
                          title="Move to Trash"
                          className="p-1 rounded hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* List View */
        <div className="rounded-2xl border border-white/[0.07] bg-[#0E1015]/80 overflow-hidden divide-y divide-white/[0.05]">
          {sortedFiles.map((file) => {
            const Icon = getFileIcon(file)
            const isSelected = selectedIds.includes(file.id)

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file)}
                className={`flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-xs select-none ${
                  isSelected ? 'bg-emerald-500/[0.05]' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={(e) => toggleSelect(file.id, e)} className="text-zinc-500">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="p-2 rounded-lg bg-white/[0.04] text-zinc-400 shrink-0">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-zinc-100 truncate hover:text-emerald-400 transition-colors">
                      {file.original_name}
                    </p>
                    <p className="text-[10px] text-zinc-500 capitalize">{file.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-zinc-400 font-mono text-[11px]">
                  <span>{formatSize(file.size_bytes)}</span>
                  <span>{new Date(file.created_at).toLocaleDateString()}</span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDownloadFile(file)
                      }}
                      className="p-1 rounded hover:text-zinc-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {isTrashView ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRestoreFile(file.id)
                          }}
                          className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onPermanentDelete(file.id)
                          }}
                          className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onTrashFile(file.id)
                        }}
                        className="p-1 rounded hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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

