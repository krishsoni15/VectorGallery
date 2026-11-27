import React, { useState, useRef } from 'react'
import {
  X,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadSuccess: () => void
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  const handleFileSelected = (file: File) => {
    setError(null)
    setSuccess(false)
    if (file.size > 50 * 1024 * 1024) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Limit is 50MB.`)
      return
    }
    setSelectedFile(file)
  }

  const handleClose = () => {
    if (uploading) return
    setSelectedFile(null)
    setError(null)
    setSuccess(false)
    setProgress(0)
    onClose()
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)
    setProgress(20)

    try {
      const reader = new FileReader()
      reader.onerror = () => {
        setError('Unable to read the selected file.')
        setUploading(false)
        setProgress(0)
      }
      reader.onload = async () => {
        try {
          const resultStr = String(reader.result || '')
          const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr
          setProgress(50)

          const res = await fetch('/api/v2/files/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: selectedFile.name,
              mimeType: selectedFile.type,
              base64: base64Data,
            }),
          })

          setProgress(90)
          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.error || 'Upload failed')
          }

          setProgress(100)
          setSuccess(true)
          setTimeout(() => {
            onUploadSuccess()
            setSelectedFile(null)
            setUploading(false)
            setSuccess(false)
            setProgress(0)
            onClose()
          }, 700)
        } catch (err: any) {
          setError(err.message || 'Upload failed')
          setUploading(false)
          setProgress(0)
        }
      }
      reader.readAsDataURL(selectedFile)
    } catch (err: any) {
      setError(err.message || 'File read error')
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101211]/45 dark:bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.12] p-6 shadow-2xl space-y-5 text-[#101211] dark:text-[#F3F5F1]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#DDE2DC] dark:border-white/[0.08]">
          <h3 className="text-sm font-bold text-[#101211] dark:text-[#F3F5F1] flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#087F5B] dark:text-[#CFFF49]" /> Upload to VectorGallery
          </h3>
          <button
            onClick={handleClose}
            aria-label="Close upload modal"
            disabled={uploading}
            className="p-1.5 rounded-full text-[#626B64] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1] hover:bg-[#F2F3F0] dark:hover:bg-white/[0.08] transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#087F5B] dark:border-[#CFFF49] bg-[#087F5B]/5 dark:bg-[#CFFF49]/10'
              : selectedFile
              ? 'border-[#087F5B]/60 dark:border-[#CFFF49]/60 bg-[#F2F3F0] dark:bg-[#181C1A]'
              : 'border-[#C7CEC6] dark:border-white/[0.14] bg-[#F2F3F0]/65 dark:bg-[#090B0A]/60 hover:bg-[#F2F3F0] dark:hover:bg-[#181C1A]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
            className="hidden"
          />

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FFFFFF] dark:bg-white/[0.06] border border-[#DDE2DC] dark:border-white/[0.10] text-[#087F5B] dark:text-[#CFFF49] flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>

            {selectedFile ? (
              <div>
                <p className="text-sm font-semibold text-[#087F5B] dark:text-[#CFFF49] truncate max-w-xs mx-auto">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[#626B64] dark:text-[#9AA69E] mt-0.5">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to ingest
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-[#101211] dark:text-[#F3F5F1]">
                  Drag and drop your file here, or browse
                </p>
                <p className="text-xs text-[#626B64] dark:text-[#9AA69E] mt-1">
                  Supports PDF, Word, Excel, CSV, Images, Screenshots, TXT, MD (Max 50MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#555E58] dark:text-[#9AA69E]">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#087F5B] dark:text-[#CFFF49]" /> Ingesting &amp; indexing...
              </span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E7E9E5] dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full bg-[#101211] dark:bg-[#CFFF49] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-[#087F5B]/10 dark:bg-[#CFFF49]/15 border border-[#087F5B]/25 dark:border-[#CFFF49]/35 text-[#087F5B] dark:text-[#CFFF49] text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>File uploaded and indexed successfully!</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 rounded-full text-xs text-[#626B64] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="vg-cta-lime flex items-center gap-2 px-5 py-2 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-[#101211] transition-all shadow-sm"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Upload to Memory</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

