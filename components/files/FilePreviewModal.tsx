import React, { useState, useEffect, useCallback } from 'react'
import {
  X,
  Download,
  Trash2,
  Star,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle,
  Copy,
  Check,
  MessageSquare,
  Zap,
  ExternalLink,
  Share2,
} from 'lucide-react'

interface FilePreviewModalProps {
  file: any | null
  filesList?: any[]
  onClose: () => void
  onToggleFavorite: (id: string, current: boolean) => void
  onTrash: (id: string) => void
  onDownload: (file: any) => void
  onNavigateFile?: (file: any) => void
  onOpenAssistantWithFile?: (file: any) => void
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  filesList = [],
  onClose,
  onToggleFavorite,
  onTrash,
  onDownload,
  onNavigateFile,
  onOpenAssistantWithFile,
}) => {
  const [showInfo, setShowInfo] = useState(true)
  const [copiedText, setCopiedText] = useState(false)
  const [brokenThumbs, setBrokenThumbs] = useState<Record<string, boolean>>({})

  const isRenderableImage = (item: any) =>
    Boolean(item?.thumbnail_url) &&
    (item.category === 'photos' ||
      item.category === 'screenshots' ||
      item.mime_type?.startsWith('image/') ||
      /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(item.original_name || ''))

  // Current file index in filesList
  const currentIndex = file && filesList.length > 0 ? filesList.findIndex((f) => f.id === file.id) : -1
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex !== -1 && currentIndex < filesList.length - 1

  const handlePrev = useCallback(() => {
    if (hasPrev && onNavigateFile) {
      onNavigateFile(filesList[currentIndex - 1])
    }
  }, [hasPrev, onNavigateFile, filesList, currentIndex])

  const handleNext = useCallback(() => {
    if (hasNext && onNavigateFile) {
      onNavigateFile(filesList[currentIndex + 1])
    }
  }, [hasNext, onNavigateFile, filesList, currentIndex])

  // Keyboard navigation: Left, Right, Escape
  useEffect(() => {
    if (!file) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [file, handlePrev, handleNext, onClose])

  if (!file) return null

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const isImage = isRenderableImage(file)
  const mainThumbKey = String(file.thumbnail_url || file.id)
  const canRenderMainImage = isImage && !brokenThumbs[mainThumbKey]
  const formattedDate = new Date(file.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const handleCopyOcr = () => {
    if (file.extracted_text) {
      navigator.clipboard.writeText(file.extracted_text)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fadeIn select-none">
      {/* ─── Top Control Bar (Google Photos Style) ─── */}
      <div className="absolute top-0 inset-x-0 h-16 px-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-zinc-300 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate max-w-sm sm:max-w-md">{file.original_name}</h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              {formattedDate} • {formatSize(file.size_bytes)}
              {currentIndex !== -1 && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-300">
                  {currentIndex + 1} of {filesList.length}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenAssistantWithFile && (
            <button
              onClick={() => onOpenAssistantWithFile(file)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all shadow-sm"
              title="Ask AI about this file"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          )}

          <button
            onClick={() => onToggleFavorite(file.id, file.is_favorite)}
            title="Favorite"
            className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-zinc-300 hover:text-amber-400 transition-colors"
          >
            <Star className={`w-4 h-4 ${file.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.share) {
                navigator.share({ title: file.original_name, url: file.thumbnail_url })
              } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(`${window.location.origin}${file.thumbnail_url || ''}`)
                alert('Photo link copied!')
              }
            }}
            title="Share"
            className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-zinc-300 hover:text-emerald-400 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDownload(file)}
            title="Download"
            className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-zinc-300 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            title="Toggle Info Drawer"
            className={`p-2 rounded-full transition-colors ${
              showInfo ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-white/[0.08] hover:bg-white/[0.16] text-zinc-300'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onTrash(file.id)
              onClose()
            }}
            title="Move to Trash"
            className="p-2 rounded-full bg-white/[0.08] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Main Content Viewport ─── */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden pt-16">
        {/* Left Arrow Button */}
        {hasPrev && (
          <button
            onClick={handlePrev}
            className="absolute left-4 z-30 p-3 rounded-full bg-black/60 hover:bg-black/80 border border-white/[0.1] text-zinc-200 hover:text-white hover:scale-110 transition-all shadow-xl"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Center Preview Display */}
        <div className={`relative flex items-center justify-center w-full h-full transition-all duration-300 ${showInfo ? 'pr-0 lg:pr-96' : ''}`}>
          {canRenderMainImage ? (
            <img
              src={file.thumbnail_url}
              alt={file.original_name}
              className="max-h-[82vh] max-w-[90vw] object-contain rounded-lg shadow-2xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
              onError={() =>
                setBrokenThumbs((prev) => ({ ...prev, [mainThumbKey]: true }))
              }
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-[#0F1117]/80 border border-white/[0.08] space-y-4 text-center max-w-md mx-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400">
                {isImage ? <ImageIcon className="w-12 h-12" /> : <FileText className="w-12 h-12" />}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{file.original_name}</h4>
                <p className="text-xs text-zinc-400 mt-1">{file.mime_type} • {formatSize(file.size_bytes)}</p>
              </div>
              <button
                onClick={() => onDownload(file)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-lg"
              >
                <Download className="w-4 h-4" /> Download File
              </button>
            </div>
          )}
        </div>

        {/* Right Arrow Button */}
        {hasNext && (
          <button
            onClick={handleNext}
            className={`absolute right-4 z-30 p-3 rounded-full bg-black/60 hover:bg-black/80 border border-white/[0.1] text-zinc-200 hover:text-white hover:scale-110 transition-all shadow-xl ${
              showInfo ? 'right-4 lg:right-[390px]' : 'right-4'
            }`}
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* ─── Bottom Filmstrip Thumbnail Carousel (Google Photos Style) ─── */}
        {filesList && filesList.length > 1 && (
          <div className={`absolute bottom-3 inset-x-0 z-30 flex items-center justify-center pointer-events-none transition-all duration-300 ${showInfo ? 'pr-0 lg:pr-96' : ''}`}>
            <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/[0.1] max-w-[92vw] sm:max-w-xl overflow-x-auto scrollbar-none shadow-2xl">
              {filesList.map((f, i) => {
                const isSelected = f.id === file.id
                const fThumbKey = String(f.thumbnail_url || f.id)
                const hasThumb = isRenderableImage(f) && !brokenThumbs[fThumbKey]
                return (
                  <button
                    key={f.id}
                    onClick={() => onNavigateFile && onNavigateFile(f)}
                    title={f.original_name}
                    className={`relative shrink-0 w-11 h-11 rounded-xl overflow-hidden transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-emerald-400 scale-110 shadow-lg brightness-110'
                        : 'opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {hasThumb ? (
                      <img
                        src={f.thumbnail_url}
                        alt={f.original_name}
                        className="w-full h-full object-cover"
                        onError={() =>
                          setBrokenThumbs((prev) => ({ ...prev, [fThumbKey]: true }))
                        }
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-mono">
                        {i + 1}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── Right Info Drawer ─── */}
        {showInfo && (
          <aside className="absolute right-0 top-16 bottom-0 w-full sm:w-96 bg-[#FFFFFF] dark:bg-[#131715] border-l border-[#DDE2DC] dark:border-white/[0.08] z-30 flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar animate-slideInRight shadow-2xl text-[#101211] dark:text-[#F3F5F1]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE2DC] dark:border-white/[0.08]">
              <span className="text-xs font-bold text-[#101211] dark:text-[#F3F5F1] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49]" /> File Details &amp; Memory
              </span>
              <button
                onClick={() => setShowInfo(false)}
                aria-label="Close file details"
                className="p-1.5 rounded-full text-[#626B64] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1] hover:bg-[#F2F3F0] dark:hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Ask AI CTA Card */}
            {onOpenAssistantWithFile && (
              <div className="p-4 rounded-2xl bg-[#F2F3F0] dark:bg-white/[0.04] border border-[#DDE2DC] dark:border-white/[0.08] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#087F5B] dark:text-[#CFFF49]">
                  <Zap className="w-3.5 h-3.5" /> AI Digital Memory
                </div>
                <p className="text-[11px] text-[#555E58] dark:text-[#9AA69E] leading-relaxed">
                  VectorGallery has indexed this file. Ask questions about text, dates, prices, or content.
                </p>
                <button
                  onClick={() => onOpenAssistantWithFile(file)}
                  className="vg-cta-lime w-full py-2 px-3 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Chat with this file
                </button>
              </div>
            )}

            {/* Extracted Text / OCR Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#101211] dark:text-[#F3F5F1] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49]" /> Extracted OCR Text
                </span>
                {file.extracted_text && (
                  <button
                    onClick={handleCopyOcr}
                    className="flex items-center gap-1 text-[11px] text-[#626B64] dark:text-[#9AA69E] hover:text-[#087F5B] dark:hover:text-[#CFFF49] transition-colors"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3 h-3 text-[#087F5B] dark:text-[#CFFF49]" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#F2F3F0] dark:bg-[#090B0A] border border-[#DDE2DC] dark:border-white/[0.08] text-xs text-[#101211] dark:text-[#F3F5F1] font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                {file.extracted_text || 'No text extracted from this file.'}
              </div>
            </div>

            {/* AI Summary */}
            {file.metadata?.summary && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#101211] dark:text-[#F3F5F1]">AI Visual Summary</span>
                <p className="text-xs text-[#555E58] dark:text-[#9AA69E] bg-[#F2F3F0] dark:bg-white/[0.03] p-3 rounded-xl border border-[#DDE2DC] dark:border-white/[0.06] leading-relaxed">
                  {file.metadata.summary}
                </p>
              </div>
            )}

            {/* Technical Metadata */}
            <div className="space-y-3 pt-2 border-t border-[#DDE2DC] dark:border-white/[0.08] text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#DDE2DC] dark:border-white/[0.05]">
                <span className="text-[#626B64] dark:text-[#9AA69E]">Category</span>
                <span className="font-semibold text-[#101211] dark:text-[#F3F5F1] capitalize">{file.category}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#DDE2DC] dark:border-white/[0.05]">
                <span className="text-[#626B64] dark:text-[#9AA69E]">MIME Type</span>
                <span className="font-mono text-[#101211] dark:text-[#F3F5F1] text-[11px]">{file.mime_type || 'image/jpeg'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#DDE2DC] dark:border-white/[0.05]">
                <span className="text-[#626B64] dark:text-[#9AA69E]">File Size</span>
                <span className="font-mono text-[#101211] dark:text-[#F3F5F1]">{formatSize(file.size_bytes)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#DDE2DC] dark:border-white/[0.05]">
                <span className="text-[#626B64] dark:text-[#9AA69E]">Uploaded</span>
                <span className="font-mono text-[#101211] dark:text-[#F3F5F1] text-[11px]">{new Date(file.created_at).toLocaleString()}</span>
              </div>
              <div className="py-1">
                <span className="text-[#626B64] dark:text-[#9AA69E] block mb-1">SHA-256 Hash</span>
                <span className="font-mono text-[10px] text-[#555E58] dark:text-[#9AA69E] break-all bg-[#F2F3F0] dark:bg-[#090B0A] p-2 rounded-lg border border-[#DDE2DC] dark:border-white/[0.06] block">
                  {file.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
