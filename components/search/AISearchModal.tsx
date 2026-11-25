import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  Zap,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  ArrowRight,
  Clock,
  Filter,
  CheckCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react'

interface AISearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectResult: (file: any) => void
}

export const AISearchModal: React.FC<AISearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [recentQueries, setRecentQueries] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch real search history on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      fetch('/api/v2/search/history')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.history && Array.isArray(data.history)) {
            setRecentQueries(data.history.map((h: any) => h.query))
          }
        })
        .catch(() => {})
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // Handle keyboard shortcuts (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Open handled by parent layout
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Perform search query
  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const url = `/api/v2/search?q=${encodeURIComponent(searchTerm.trim())}&category=${categoryFilter}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        const foundResults = data.results || []
        setResults(foundResults)

        // Persist real search query to backend
        fetch('/api/v2/search/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchTerm.trim(), result_count: foundResults.length }),
        }).catch(() => {})

        // Update local search history list
        if (!recentQueries.includes(searchTerm.trim())) {
          setRecentQueries((prev) => [searchTerm.trim(), ...prev.slice(0, 4)])
        }
      }
    } catch (e) {
      console.error('[Search Modal] Error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch(query)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#0F1117] border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3 bg-[#13151D]">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (e.target.value.length >= 2) performSearch(e.target.value)
              else setResults([])
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask or search: 'AWS screenshot', 'college admission', 'React notes'..."
            className="flex-1 bg-transparent border-none text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-[#0C0E14] text-[11px] overflow-x-auto">
          <span className="text-zinc-500 font-medium">Filter:</span>
          {['all', 'photos', 'documents', 'screenshots', 'videos'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat)
                if (query.trim()) performSearch(query)
              }}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {results.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-mono text-zinc-500 px-2 uppercase tracking-wider">
                Matching Files ({results.length})
              </p>
              {results.map((res) => (
                <div
                  key={res.file_id}
                  onClick={() => {
                    onSelectResult(res)
                    onClose()
                  }}
                  className="flex items-start justify-between p-3 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                      {res.category === 'photos' || res.category === 'screenshots' ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                        {res.file_name}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {res.snippet}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500">
                        <span className="capitalize px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 font-medium">
                          {res.category}
                        </span>
                        <span className="text-emerald-400/80 font-mono">
                          {res.why_matched}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-zinc-600 group-hover:text-emerald-400 transition-colors ml-3 mt-1">
                    <span className="text-[10px] font-mono font-bold">
                      {Math.round(res.relevance_score * 100)}%
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() && !loading ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No matching documents or screenshots found for &quot;{query}&quot;
            </div>
          ) : (
            /* Suggested & Recent Searches */
            <div className="p-2 space-y-4">
              <div>
                <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Recent Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentQueries.map((rq) => (
                    <button
                      key={rq}
                      onClick={() => {
                        setQuery(rq)
                        performSearch(rq)
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-300 border border-white/[0.06] transition-colors"
                    >
                      {rq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-emerald-400" /> Try Asking
                </p>
                <div className="space-y-1.5">
                  {[
                    'Find the screenshot where I saved AWS pricing',
                    'Show all documents containing my phone number',
                    'Summarize my notes about Docker containers',
                    'Find the bill I saved last month',
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => {
                        setQuery(example)
                        performSearch(example)
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-emerald-400 hover:bg-white/[0.04] transition-colors flex items-center justify-between group"
                    >
                      <span>&quot;{example}&quot;</span>
                      <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-white/[0.06] bg-[#0C0E14] flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono text-zinc-400">Esc</kbd> to close
          </span>
          <span className="text-emerald-400/90 font-medium">Hybrid Keyword + Vector Retrieval</span>
        </div>
      </div>
    </div>
  )
}
