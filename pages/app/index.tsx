import Head from 'next/head'
import Link from 'next/link'
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { AppLayout, NavItemKey } from '@/components/layout/AppLayout'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { FileManagerView } from '@/components/files/FileManagerView'
import { AISearchModal } from '@/components/search/AISearchModal'
import { AssistantView } from '@/components/assistant/AssistantView'
import { CollectionsView } from '@/components/collections/CollectionsView'
import { SettingsView } from '@/components/settings/SettingsView'
import { UserGuideView } from '@/components/guide/UserGuideView'
import { UploadModal } from '@/components/files/UploadModal'
import { FilePreviewModal } from '@/components/files/FilePreviewModal'

export default function AppPage() {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<NavItemKey>('home')
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<any | null>(null)
  const [newCollectionModalOpen, setNewCollectionModalOpen] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDesc, setNewCollectionDesc] = useState('')
  const [collectionError, setCollectionError] = useState<string | null>(null)
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | null>(null)
  const [focusedAssistantFile, setFocusedAssistantFile] = useState<any | null>(null)

  // Inline modal states for rename / permanent delete (no blocking native dialogs)
  const [renameTarget, setRenameTarget] = useState<{ id: string; currentName: string; nextName: string } | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const [stats, setStats] = useState({
    storage: {
      total_bytes_used: 0,
      total_bytes_quota: 16106127360,
      formatted_used: '0 B',
      formatted_quota: '15.00 GB',
      percent_used: 0,
    },
    counts: {
      total_files: 0,
      photos: 0,
      videos: 0,
      documents: 0,
      audio: 0,
      screenshots: 0,
    },
    backup_health: {
      connected_devices: 0,
      last_sync_at: null as string | null,
      sync_status: 'IDLE',
    },
    recent_files: [] as any[],
  })

  const [files, setFiles] = useState<any[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [collections, setCollections] = useState<any[]>([])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/v2/dashboard/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      console.error('[App] Failed to fetch stats:', e)
    }
  }, [])

  const fetchFiles = useCallback(async (tab: NavItemKey) => {
    setFilesLoading(true)
    try {
      let category = 'all'
      let isTrashed = false
      let isFavorite = false

      if (tab === 'videos') category = 'videos'
      else if (tab === 'documents') category = 'documents'
      else if (tab === 'audio') category = 'audio'
      else if (tab === 'favorites') isFavorite = true
      else if (tab === 'trash') isTrashed = true

      const res = await fetch(
        `/api/v2/files?category=${category}&is_trashed=${isTrashed}${isFavorite ? '&is_favorite=true' : ''}`
      )
      if (res.ok) {
        const data = await res.json()
        const rawFiles = data.files || []
        if (tab === 'photos') {
          setFiles(
            rawFiles.filter(
              (f: any) =>
                f.category === 'photos' ||
                f.category === 'screenshots' ||
                f.mime_type?.startsWith('image/')
            )
          )
        } else {
          setFiles(rawFiles)
        }
      }
    } catch (e) {
      console.error('[App] Failed to fetch files:', e)
    } finally {
      setFilesLoading(false)
    }
  }, [])

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/v2/collections')
      if (res.ok) {
        const data = await res.json()
        setCollections(data.collections || [])
      }
    } catch (e) {
      console.error('[App] Failed to fetch collections:', e)
    }
  }, [])

  // Reload user-scoped vault data whenever session user changes
  useEffect(() => {
    fetchStats()
    fetchCollections()
    if (['photos', 'videos', 'documents', 'audio', 'downloads', 'recent', 'favorites', 'trash', 'collections'].includes(activeTab)) {
      fetchFiles(activeTab)
    }
  }, [user?.id, activeTab, fetchStats, fetchCollections, fetchFiles])

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchModalOpen((prev) => !prev)
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault()
        setUploadModalOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false)
        setUploadModalOpen(false)
        setNewCollectionModalOpen(false)
        setRenameTarget(null)
        setDeleteTargetId(null)
        setPreviewFile(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleToggleFavorite = async (fileId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/v2/files/${fileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !currentStatus }),
      })
      if (res.ok) {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, is_favorite: !currentStatus } : f))
        )
        if (previewFile?.id === fileId) {
          setPreviewFile((prev: any) => ({ ...prev, is_favorite: !currentStatus }))
        }
        fetchStats()
      }
    } catch (e) {
      console.error('[App] Favorite toggle error:', e)
    }
  }

  const handleTrashFile = async (fileId: string) => {
    try {
      const res = await fetch(`/api/v2/files/${fileId}`, { method: 'DELETE' })
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId))
        if (previewFile?.id === fileId) setPreviewFile(null)
        fetchStats()
      }
    } catch (e) {
      console.error('[App] Trash error:', e)
    }
  }

  const handleRestoreFile = async (fileId: string) => {
    try {
      const res = await fetch('/api/v2/files/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_ids: [fileId] }),
      })
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId))
        fetchStats()
      }
    } catch (e) {
      console.error('[App] Restore error:', e)
    }
  }

  const handleConfirmPermanentDelete = async () => {
    if (!deleteTargetId) return
    const targetId = deleteTargetId
    setDeleteTargetId(null)
    try {
      const res = await fetch(`/api/v2/files/${targetId}?permanent=true`, { method: 'DELETE' })
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== targetId))
        fetchStats()
      }
    } catch (e) {
      console.error('[App] Permanent delete error:', e)
    }
  }

  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!renameTarget || !renameTarget.nextName.trim()) return
    const { id, currentName, nextName } = renameTarget
    const clean = nextName.trim()
    setRenameTarget(null)
    if (clean === currentName) return

    try {
      const res = await fetch(`/api/v2/files/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_name: clean }),
      })
      if (res.ok) {
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, original_name: clean } : f)))
        fetchStats()
      }
    } catch (e) {
      console.error('[App] Rename error:', e)
    }
  }

  const handleDownloadFile = async (file: any) => {
    try {
      const res = await fetch(`/api/v2/files/${file.id}`)
      if (res.ok) {
        const data = await res.json()
        const downloadUrl = data.file?.download_url || file.thumbnail_url
        if (downloadUrl) {
          const a = document.createElement('a')
          a.href = downloadUrl
          a.download = file.original_name
          a.target = '_blank'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      }
    } catch (e) {
      console.error('[App] Download error:', e)
    }
  }

  const handleOpenFileById = async (fileId: string) => {
    const existing =
      files.find((file) => file.id === fileId) ||
      stats.recent_files?.find((file) => file.id === fileId)
    if (existing) {
      setPreviewFile(existing)
    }
    try {
      const res = await fetch(`/api/v2/files/${fileId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.file) {
          setPreviewFile(data.file)
        }
      }
    } catch (e) {
      console.error('[App] Failed to fetch file by id:', e)
    }
  }

  const handleBulkAction = async (
    action: 'trash' | 'restore' | 'favorite' | 'unfavorite' | 'delete',
    selectedIds: string[]
  ) => {
    try {
      const res = await fetch('/api/v2/files/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, file_ids: selectedIds }),
      })
      if (res.ok) {
        fetchFiles(activeTab)
        fetchStats()
      }
    } catch (e) {
      console.error('[App] Bulk action error:', e)
    }
  }

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return
    setCollectionError(null)
    try {
      const res = await fetch('/api/v2/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCollectionName.trim(),
          description: newCollectionDesc.trim(),
          type: 'custom',
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setCollectionError(data?.error || 'Unable to create collection')
        return
      }
      await fetchCollections()
      setNewCollectionModalOpen(false)
      setNewCollectionName('')
      setNewCollectionDesc('')
    } catch (e: any) {
      setCollectionError(e.message || 'Network error creating collection')
    }
  }

  const handleAddFilesToCollection = async (collectionId: string, fileIds: string[]) => {
    const res = await fetch(`/api/v2/collections/${collectionId}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_ids: fileIds }),
    })
    if (res.ok) {
      await fetchCollections()
    }
  }

  const handleRemoveFileFromCollection = async (collectionId: string, fileId: string) => {
    const res = await fetch(`/api/v2/collections/${collectionId}/files?file_id=${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      await fetchCollections()
    }
  }

  const handleDeleteCollection = async (collectionId: string) => {
    const res = await fetch(`/api/v2/collections/${collectionId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      await fetchCollections()
    }
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Personal Vault'

  return (
    <div className="vm-app-shell">
      <Head>
        <title>VectorGallery — Personal AI Cloud & Digital Memory</title>
        <meta name="description" content="Personal AI Cloud Storage & Intelligent Digital Memory Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenUpload={() => setUploadModalOpen(true)}
        storageStats={{
          formatted_used: stats.storage.formatted_used,
          formatted_quota: stats.storage.formatted_quota,
          percent_used: stats.storage.percent_used,
        }}
        connectedDevicesCount={stats.backup_health.connected_devices}
      >
        {!user && (
          <div className="bg-[#FFFFFF]/90 dark:bg-[#131715]/90 border-b border-[#DDE2DC] dark:border-white/[0.08] px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-[#555E58] dark:text-[#9AA69E]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-[#CFFF49] shrink-0" />
              <span className="font-medium text-[#101211] dark:text-[#F3F5F1]">Local Sandbox</span>
              <span className="text-[#626B64] dark:text-[#9AA69E] text-[11px] hidden sm:inline">
                — Files, OCR index &amp; AI chat run locally until you sign in.
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Link
                href="/login?redirect=/app"
                className="px-3 py-1 rounded-full border border-[#DDE2DC] dark:border-white/[0.12] bg-[#F2F3F0] dark:bg-white/[0.06] hover:bg-[#E7E9E5] dark:hover:bg-white/[0.12] text-[#101211] dark:text-[#F3F5F1] font-medium text-[11.5px] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup?redirect=/app"
                className="px-3 py-1 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] font-semibold text-[11.5px] transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <DashboardView
            stats={stats}
            userName={userName}
            onOpenSearch={() => setSearchModalOpen(true)}
            onOpenUpload={() => setUploadModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectFile={(f) => setPreviewFile(f)}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantView
            onOpenFile={handleOpenFileById}
            initialPrompt={assistantInitialPrompt}
            onConsumedPrompt={() => setAssistantInitialPrompt(null)}
            focusedFile={focusedAssistantFile}
            onClearFocusedFile={() => setFocusedAssistantFile(null)}
          />
        )}

        {['photos', 'videos', 'documents', 'audio', 'downloads', 'recent', 'favorites', 'trash'].includes(activeTab) && (
          <FileManagerView
            files={files}
            loading={filesLoading}
            activeCategory={activeTab}
            isTrashView={activeTab === 'trash'}
            onSelectFile={(f) => setPreviewFile(f)}
            onToggleFavorite={handleToggleFavorite}
            onTrashFile={handleTrashFile}
            onRestoreFile={handleRestoreFile}
            onPermanentDelete={(id) => setDeleteTargetId(id)}
            onRenameFile={(id, currentName) =>
              setRenameTarget({ id, currentName, nextName: currentName })
            }
            onDownloadFile={handleDownloadFile}
            onBulkAction={handleBulkAction}
          />
        )}

        {activeTab === 'collections' && (
          <CollectionsView
            collections={collections}
            files={files}
            onSelectFile={(f) => setPreviewFile(f)}
            onToggleFavorite={handleToggleFavorite}
            onDownloadFile={handleDownloadFile}
            onCreateCollection={() => setNewCollectionModalOpen(true)}
            onAddFilesToCollection={handleAddFilesToCollection}
            onRemoveFileFromCollection={handleRemoveFileFromCollection}
            onDeleteCollection={handleDeleteCollection}
          />
        )}

        {activeTab === 'guide' && (
          <UserGuideView
            inApp
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenUpload={() => setUploadModalOpen(true)}
            onOpenSearch={() => setSearchModalOpen(true)}
          />
        )}

        {activeTab === 'settings' && <SettingsView />}
      </AppLayout>

      {/* New Collection Modal */}
      {newCollectionModalOpen && (
        <div
          onClick={() => setNewCollectionModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101211]/45 dark:bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.10] p-6 space-y-4 shadow-2xl text-[#101211] dark:text-[#F3F5F1]"
          >
            <h3 className="text-base font-bold text-[#101211] dark:text-[#F3F5F1]">Create New Collection</h3>
            <p className="text-xs text-[#626B64] dark:text-[#9AA69E]">Organize your files into a persistent digital memory album.</p>

            {collectionError && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{collectionError}</p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#101211] dark:text-[#F3F5F1] block mb-1">Collection Name</label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., Tax Returns 2026, Summer Trip..."
                  className="w-full bg-[#FFFFFF] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.10] rounded-xl px-3 py-2 text-xs text-[#101211] dark:text-[#F3F5F1] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#CFFF49]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#101211] dark:text-[#F3F5F1] block mb-1">Description (Optional)</label>
                <textarea
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  rows={2}
                  placeholder="Notes about what this collection holds..."
                  className="w-full bg-[#FFFFFF] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.10] rounded-xl px-3 py-2 text-xs text-[#101211] dark:text-[#F3F5F1] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#CFFF49]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DDE2DC] dark:border-white/[0.08]">
              <button
                onClick={() => setNewCollectionModalOpen(false)}
                className="px-3.5 py-2 rounded-full text-xs text-[#626B64] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  newCollectionName.trim()
                    ? 'vg-cta-lime bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] shadow-sm'
                    : 'bg-[#E7E9E5] dark:bg-white/[0.06] text-[#626B64] dark:text-[#7B867F] cursor-not-allowed'
                }`}
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename File Modal */}
      {renameTarget && (
        <div
          onClick={() => setRenameTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101211]/45 dark:bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <form
            onSubmit={handleConfirmRename}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.10] p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-[#101211] dark:text-[#F3F5F1]">Rename File</h3>
            <input
              type="text"
              autoFocus
              value={renameTarget.nextName}
              onChange={(e) => setRenameTarget({ ...renameTarget, nextName: e.target.value })}
              className="w-full bg-[#FFFFFF] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.12] rounded-xl px-3 py-2 text-xs text-[#101211] dark:text-[#F3F5F1] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#CFFF49]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="px-3.5 py-1.5 rounded-full text-xs text-[#626B64] dark:text-[#9AA69E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="vg-cta-lime px-4 py-1.5 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] text-xs font-semibold"
              >
                Save Name
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {deleteTargetId && (
        <div
          onClick={() => setDeleteTargetId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101211]/45 dark:bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.10] p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-[#101211] dark:text-[#F3F5F1]">Permanently Delete File?</h3>
            <p className="text-xs text-[#555E58] dark:text-[#9AA69E]">
              This removes the original file and its indexed search chunks permanently.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-3.5 py-1.5 rounded-full text-xs text-[#626B64] dark:text-[#9AA69E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-semibold"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AISearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectResult={(result) => {
          const targetId = result.file_id || result.id
          if (targetId) {
            handleOpenFileById(targetId)
          }
        }}
      />

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={() => {
          fetchStats()
          fetchCollections()
          fetchFiles(activeTab)
        }}
      />

      <FilePreviewModal
        file={previewFile}
        filesList={files.length > 0 ? files : stats.recent_files || []}
        onNavigateFile={(nextFile) => setPreviewFile(nextFile)}
        onOpenAssistantWithFile={(targetFile) => {
          const name = targetFile?.original_name || targetFile?.name || 'this file'
          setFocusedAssistantFile(targetFile)
          setAssistantInitialPrompt(`Summarize key details and extracted text from "${name}".`)
          setPreviewFile(null)
          setActiveTab('assistant')
        }}
        onClose={() => setPreviewFile(null)}
        onToggleFavorite={handleToggleFavorite}
        onTrash={handleTrashFile}
        onDownload={handleDownloadFile}
      />
    </div>
  )
}
