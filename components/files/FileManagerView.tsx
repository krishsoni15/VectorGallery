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
  const [brokenThumbs, setBrokenThumbs] = useState<Record<string, boolean>>({})

  const isRenderableImage = (file: any) =>
    Boolean(file?.thumbnail_url) &&
    (file.category === 'photos' ||
      file.category === 'screenshots' ||
      file.mime_type?.startsWith('image/') ||
      /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(file.original_name || ''))

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
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DDE2DC] dark:border-white/[0.08]">
        {/* Left: Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#626B64] dark:text-[#9AA69E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Filter ${activeCategory}...`}
            className="w-full bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.10] rounded-full pl-9 pr-4 py-2 text-xs text-[#101211] dark:text-[#F3F5F1] placeholder-[#626B64] dark:placeholder-[#7B867F] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#CFFF49] transition-colors"
          />
        </div>

        {/* Right: View mode, Sort, Bulk actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Select All */}
          <button
            onClick={selectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] dark:bg-[#131715] hover:border-[#101211]/35 dark:hover:border-white/[0.2] text-xs text-[#101211] dark:text-[#F3F5F1] transition-colors border border-[#DDE2DC] dark:border-white/[0.10]"
          >
            {selectedIds.length === sortedFiles.length && sortedFiles.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49]" />
            ) : (
              <Square className="w-3.5 h-3.5 text-[#626B64] dark:text-[#9AA69E]" />
            )}
            <span>{selectedIds.length > 0 ? `${selectedIds.length} Selected` : 'Select All'}</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center rounded-full bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.10] p-0.5 text-xs text-[#555E58] dark:text-[#9AA69E]">
            <button
              onClick={() => {
                if (sortBy === 'date') setSortAsc(!sortAsc)
                else { setSortBy('date'); setSortAsc(false) }
              }}
              className={`px-3 py-1 rounded-full transition-colors ${
                sortBy === 'date' ? 'bg-[#101211] text-[#F3F5F1] dark:bg-[#CFFF49]/20 dark:text-[#CFFF49] font-semibold' : 'hover:text-[#101211] dark:hover:text-[#F3F5F1]'
              }`}
            >
              Date
            </button>
            <button
              onClick={() => {
                if (sortBy === 'name') setSortAsc(!sortAsc)
                else { setSortBy('name'); setSortAsc(true) }
              }}
              className={`px-3 py-1 rounded-full transition-colors ${
                sortBy === 'name' ? 'bg-[#101211] text-[#F3F5F1] dark:bg-[#CFFF49]/20 dark:text-[#CFFF49] font-semibold' : 'hover:text-[#101211] dark:hover:text-[#F3F5F1]'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => {
                if (sortBy === 'size') setSortAsc(!sortAsc)
                else { setSortBy('size'); setSortAsc(false) }
              }}
              className={`px-3 py-1 rounded-full transition-colors ${
                sortBy === 'size' ? 'bg-[#101211] text-[#F3F5F1] dark:bg-[#CFFF49]/20 dark:text-[#CFFF49] font-semibold' : 'hover:text-[#101211] dark:hover:text-[#F3F5F1]'
              }`}
            >
              Size
            </button>
          </div>

          {/* Grid / List Switch */}
          <div className="flex items-center rounded-full bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.10] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'grid' ? 'bg-[#101211] text-[#F3F5F1] dark:bg-[#CFFF49]/20 dark:text-[#CFFF49]' : 'text-[#626B64] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'list' ? 'bg-[#101211] text-[#F3F5F1] dark:bg-[#CFFF49]/20 dark:text-[#CFFF49]' : 'text-[#626B64] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Photos Album Filter Row ─── */}
      {isPhotosMode && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all' as const, label: 'All Photos', count: files.length },
              {
                id: 'wishes' as const,
                label: 'Celebrations',
                count: files.filter(isWishPhoto).length,
              },
              {
                id: 'screenshots' as const,
                label: 'Screenshots',
                count: files.filter((f) => f.category === 'screenshots' || f.original_name.toLowerCase().includes('screenshot')).length,
              },
              {
                id: 'favorites' as const,
                label: 'Favorites',
                count: files.filter((f) => !!f.is_favorite).length,
              },
            ].map((pill) => {
              const active = photoAlbum === pill.id
              return (
                <button
                  key={pill.id}
                  onClick={() => setPhotoAlbum(pill.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 shrink-0 border ${
                    active
                      ? 'bg-[#101211] text-[#F3F5F1] border-[#101211] dark:bg-[#CFFF49] dark:text-[#101211] dark:border-[#CFFF49] font-semibold'
                      : 'bg-[#FFFFFF] dark:bg-[#131715] text-[#555E58] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1] border-[#DDE2DC] dark:border-white/[0.10]'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      active
                        ? 'bg-white/15 text-[#D4FF54] dark:bg-[#101211]/12 dark:text-[#101211]'
                        : 'bg-[#F2F3F0] dark:bg-white/[0.08] text-[#626B64] dark:text-[#9AA69E]'
                    }`}
                  >
                    {pill.count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[#555E58] dark:text-[#9AA69E] pt-1">
            <span className="font-semibold text-[#101211] dark:text-[#F3F5F1] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-[#CFFF49]" />
              Library Timeline
            </span>
            <span className="text-[11px] font-mono text-[#626B64] dark:text-[#9AA69E]">
              {filteredFiles.length} item{filteredFiles.length !== 1 ? 's' : ''} · Indexed
            </span>
          </div>
        </div>
      )}

      {/* ─── Bulk Action Banner ─── */}
      {selectedIds.length > 0 && onBulkAction && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#087F5B]/35 dark:border-[#CFFF49]/35 text-xs text-[#101211] dark:text-[#F3F5F1] animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#087F5B] dark:bg-[#CFFF49]" />
            <span>{selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected</span>
          </div>

          <div className="flex items-center gap-2">
            {!isTrashView && (
              <>
                <button
                  onClick={() => onBulkAction('favorite', selectedIds)}
                  className="px-3 py-1 rounded-full bg-[#F2F3F0] dark:bg-white/[0.08] hover:bg-[#E7E9E5] dark:hover:bg-white/[0.14] transition-colors"
                >
                  Favorite
                </button>
                <button
                  onClick={() => {
                    onBulkAction('trash', selectedIds)
                    setSelectedIds([])
                  }}
                  className="px-3 py-1 rounded-full bg-[#F2F3F0] dark:bg-white/[0.08] hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
                  className="px-3 py-1 rounded-full bg-[#101211] dark:bg-[#CFFF49] text-[#F3F5F1] dark:text-[#101211] font-semibold transition-colors"
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
                  className="px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 font-semibold transition-colors text-white"
                >
                  Delete Permanently
                </button>
              </>
            )}

            <button
              onClick={() => setSelectedIds([])}
              className="text-[#626B64] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1] ml-1"
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
            <div key={i} className="h-44 rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : sortedFiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#C7CEC6] dark:border-white/[0.12] p-12 text-center space-y-3 bg-[#FFFFFF] dark:bg-[#131715]">
          <div className="w-12 h-12 rounded-full bg-[#F2F3F0] dark:bg-white/[0.06] text-[#626B64] dark:text-[#9AA69E] flex items-center justify-center mx-auto">
            {isTrashView ? <Trash2 className="w-6 h-6" /> : <Folder className="w-6 h-6" />}
          </div>
          <p className="text-sm font-semibold text-[#101211] dark:text-[#F3F5F1]">
            {isTrashView ? 'Trash is empty' : `No files in ${activeCategory}`}
          </p>
          <p className="text-xs text-[#626B64] dark:text-[#9AA69E] max-w-sm mx-auto">
            {isTrashView
              ? 'Files you delete will appear here and can be restored or permanently removed.'
              : 'Uploaded files and mobile backups matching this category will appear here.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        isPhotosMode ? (
          /* Timeline Date Grouped Gallery */
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
                  <div className="flex items-center justify-between group/header select-none">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={toggleSelectDay}
                        title={allDaySelected ? 'Deselect day' : 'Select all photos from this day'}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          allDaySelected
                            ? 'bg-[#101211] dark:bg-[#CFFF49] text-[#F3F5F1] dark:text-[#101211] shadow-sm scale-105'
                            : 'bg-[#FFFFFF] dark:bg-white/[0.06] hover:bg-[#E7E9E5] dark:hover:bg-white/[0.14] border border-[#DDE2DC] dark:border-white/20 text-transparent hover:text-[#101211] dark:hover:text-white/80 opacity-0 group-hover/header:opacity-100'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <h3 className="text-sm font-semibold text-[#101211] dark:text-[#F3F5F1] flex items-center gap-2">
                        <span>{group.label}</span>
                        {group.location && (
                          <span className="text-xs font-normal text-[#626B64] dark:text-[#9AA69E]">
                            · {group.location}
                          </span>
                        )}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#626B64] dark:text-[#9AA69E]">
                      {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Responsive Gallery Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2.5 sm:gap-3.5">
                    {group.items.map((file) => {
                      const isSelected = selectedIds.includes(file.id)
                      const isVideo = file.category === 'videos' || file.mime_type?.startsWith('video/')

                      return (
                        <div
                          key={file.id}
                          onClick={() => onSelectFile(file)}
                          className={`group relative rounded-2xl overflow-hidden aspect-square bg-[#E7E9E5] dark:bg-[#131715] border transition-all cursor-pointer shadow-sm select-none hover:shadow-md ${
                            isSelected
                              ? 'border-[#087F5B] dark:border-[#CFFF49] ring-2 ring-[#087F5B]/40 dark:ring-[#CFFF49]/50 scale-[0.98]'
                              : 'border-[#DDE2DC] dark:border-white/[0.08] hover:border-[#101211]/40 dark:hover:border-[#CFFF49]/50'
                          }`}
                        >
                          {(() => {
                            const thumbKey = String(file.thumbnail_url || file.id)
                            const canRenderImg = isRenderableImage(file) && !brokenThumbs[thumbKey]
                            if (canRenderImg) {
                              return (
                                <img
                                  src={file.thumbnail_url}
                                  alt={file.original_name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                  loading="lazy"
                                  onError={() =>
                                    setBrokenThumbs((prev) => ({ ...prev, [thumbKey]: true }))
                                  }
                                />
                              )
                            }
                            const FallbackIcon = getFileIcon(file)
                            return (
                              <div className="w-full h-full flex items-center justify-center bg-[#FFFFFF] dark:bg-[#131715]">
                                <FallbackIcon className="w-8 h-8 text-[#626B64] dark:text-[#9AA69E]" />
                              </div>
                            )
                          })()}

                          {/* Vignette Gradients */}
                          <div className="photo-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 opacity-60 group-hover:opacity-90 transition-opacity" />

                          {/* Top Actions: Select & Video Badge / Favorite */}
                          <div className="photo-overlay absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                            <button
                              onClick={(e) => toggleSelect(file.id, e)}
                              title={isSelected ? 'Deselect' : 'Select'}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${
                                isSelected
                                  ? 'bg-[#CFFF49] text-[#101211] shadow-md scale-105'
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
                                      : 'bg-black/40 text-white/75 hover:text-amber-400 opacity-0 group-hover:opacity-100'
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

                          {/* Bottom Info */}
                          <div className="photo-overlay absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-end justify-between">
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-semibold text-white truncate drop-shadow-sm">
                                {file.original_name}
                              </p>
                              <p className="text-[10px] text-zinc-200 font-mono drop-shadow-sm">
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
                                className="p-1.5 rounded-lg bg-black/60 hover:bg-[#CFFF49] text-white hover:text-[#101211] transition-colors"
                              >
                                <Share2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDownloadFile(file)
                                }}
                                title="Download photo"
                                className="p-1.5 rounded-lg bg-black/60 hover:bg-[#CFFF49] text-white hover:text-[#101211] transition-colors"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedFiles.map((file) => {
              const Icon = getFileIcon(file)
              const isSelected = selectedIds.includes(file.id)

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file)}
                  className={`group relative rounded-2xl p-3 bg-[#FFFFFF] dark:bg-[#131715] border transition-all cursor-pointer space-y-2.5 select-none shadow-sm ${
                    isSelected
                      ? 'border-[#087F5B] dark:border-[#CFFF49] ring-2 ring-[#087F5B]/30 dark:ring-[#CFFF49]/35'
                      : 'border-[#DDE2DC] dark:border-white/[0.08] hover:border-[#101211]/40 dark:hover:border-[#CFFF49]/45'
                  }`}
                >
                  {/* Thumbnail Preview Area */}
                  <div className="relative h-32 rounded-xl bg-[#F2F3F0] dark:bg-[#090B0A] overflow-hidden flex items-center justify-center border border-[#DDE2DC] dark:border-white/[0.05]">
                    {(() => {
                      const thumbKey = String(file.thumbnail_url || file.id)
                      const canRenderImg = isRenderableImage(file) && !brokenThumbs[thumbKey]
                      return canRenderImg ? (
                        <img
                          src={file.thumbnail_url}
                          alt={file.original_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() =>
                            setBrokenThumbs((prev) => ({ ...prev, [thumbKey]: true }))
                          }
                        />
                      ) : (
                        <Icon className="w-9 h-9 text-[#555E58] dark:text-[#9AA69E] group-hover:text-[#087F5B] dark:group-hover:text-[#CFFF49] transition-colors" />
                      )
                    })()}

                    {/* Top action badges */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isTrashView && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite(file.id, file.is_favorite)
                          }}
                          className="p-1 rounded-md bg-black/60 hover:bg-black/80 text-white hover:text-amber-400 transition-colors"
                        >
                          <Star className={`w-3.5 h-3.5 ${file.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      )}
                      <button
                        onClick={(e) => toggleSelect(file.id, e)}
                        className="p-1 rounded-md bg-black/60 hover:bg-black/80 text-white transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#CFFF49]" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#101211] dark:text-[#F3F5F1] truncate group-hover:text-[#087F5B] dark:group-hover:text-[#CFFF49] transition-colors">
                      {file.original_name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#626B64] dark:text-[#9AA69E] font-mono">
                      <span>{formatSize(file.size_bytes)}</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="pt-1.5 flex items-center justify-between border-t border-[#DDE2DC] dark:border-white/[0.06] text-[#626B64] dark:text-[#9AA69E]">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownloadFile(file)
                        }}
                        title="Download"
                        className="p-1 rounded hover:text-[#101211] dark:hover:text-[#F3F5F1] hover:bg-[#F2F3F0] dark:hover:bg-white/[0.06] transition-colors"
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
                          className="p-1 rounded hover:text-[#101211] dark:hover:text-[#F3F5F1] hover:bg-[#F2F3F0] dark:hover:bg-white/[0.06] transition-colors"
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
                            className="p-1 rounded text-[#087F5B] dark:text-[#CFFF49] hover:bg-[#087F5B]/10 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onPermanentDelete(file.id)
                            }}
                            title="Delete Permanently"
                            className="p-1 rounded text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
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
                          className="p-1 rounded hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
        <div className="rounded-2xl border border-[#DDE2DC] dark:border-white/[0.08] bg-[#FFFFFF] dark:bg-[#131715] overflow-hidden divide-y divide-[#DDE2DC] dark:divide-white/[0.06] shadow-sm">
          {sortedFiles.map((file) => {
            const Icon = getFileIcon(file)
            const isSelected = selectedIds.includes(file.id)

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file)}
                className={`flex items-center justify-between px-4 py-3 hover:bg-[#F2F3F0] dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-xs select-none ${
                  isSelected ? 'bg-[#087F5B]/[0.06] dark:bg-[#CFFF49]/[0.08]' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={(e) => toggleSelect(file.id, e)} className="text-[#626B64] dark:text-[#9AA69E]">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#087F5B] dark:text-[#CFFF49]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="p-2 rounded-lg bg-[#F2F3F0] dark:bg-white/[0.05] text-[#087F5B] dark:text-[#CFFF49] shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-[#101211] dark:text-[#F3F5F1] truncate">
                      {file.original_name}
                    </p>
                    <p className="text-[10px] text-[#626B64] dark:text-[#9AA69E] capitalize">{file.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 text-[#555E58] dark:text-[#9AA69E] font-mono text-[11px] shrink-0">
                  <span className="hidden sm:inline">{formatSize(file.size_bytes)}</span>
                  <span className="hidden md:inline">{new Date(file.created_at).toLocaleDateString()}</span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDownloadFile(file)
                      }}
                      className="p-1.5 rounded-lg hover:text-[#101211] dark:hover:text-[#F3F5F1] transition-colors"
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
                          className="p-1.5 rounded-lg text-[#087F5B] dark:text-[#CFFF49] hover:bg-[#087F5B]/10 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onPermanentDelete(file.id)
                          }}
                          className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
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
                        className="p-1.5 rounded-lg hover:text-red-600 dark:hover:text-red-400 transition-colors"
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

