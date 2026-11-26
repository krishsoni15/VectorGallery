import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Image as ImageIcon, RotateCcw, Search, X } from 'lucide-react'
import { Container, Section, SectionHeading } from '@/components/landing/ui'
import {
  DemoSearchResult,
  SYNTHETIC_DEMO_QUERIES,
  SYNTHETIC_SEARCH_CATALOG,
} from '@/components/landing/tokens'
import { cn } from '@/lib/utils'

/**
 * Deterministic public search experience using synthetic sample workspace records.
 * Never queries private user libraries or billed AI APIs.
 */
export function InteractiveSearchDemo() {
  const [query, setQuery] = useState(SYNTHETIC_DEMO_QUERIES[0])
  const [typingTarget, setTypingTarget] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<DemoSearchResult | null>(null)

  useEffect(() => {
    if (!typingTarget) return
    let idx = 0
    setQuery('')
    const timer = setInterval(() => {
      idx += 1
      setQuery(typingTarget.slice(0, idx))
      if (idx >= typingTarget.length) {
        clearInterval(timer)
        setTypingTarget(null)
      }
    }, 22)
    return () => clearInterval(timer)
  }, [typingTarget])

  const results = useMemo(() => {
    const clean = query.trim().toLowerCase()
    if (!clean) return SYNTHETIC_SEARCH_CATALOG.slice(0, 4)

    const tokens = clean.replace(/[?.!,]/g, '').split(/\s+/).filter((t) => t.length > 2)
    const scored = SYNTHETIC_SEARCH_CATALOG.map((item) => {
      const haystack = `${item.filename} ${item.categoryLabel} ${item.highlight} ${item.excerpt} ${item.tags.join(' ')}`.toLowerCase()
      let score = 0
      tokens.forEach((tok) => {
        if (item.tags.includes(tok)) score += 3
        else if (haystack.includes(tok)) score += 1
      })
      return { item, score }
    })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)

    return scored.map((s) => s.item)
  }, [query])

  const resetDemo = () => {
    setTypingTarget(null)
    setQuery('')
  }

  return (
    <Section id="search-demo" ariaLabel="Interactive search demonstration">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <SectionHeading
            eyebrow="Interactive Sample Workspace"
            title="Ask in plain language. Preview real retrieval."
            subtitle="Explore how natural queries surface photos, screenshots, receipts, and notes — using deterministic sample workspace data."
          />

          <span className="inline-flex items-center gap-2 self-start lg:self-end px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--vg-surface-soft)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)] border border-[var(--vg-border)] shrink-0">
            Sample data only · Zero private access
          </span>
        </div>

        <div className="rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-card)] p-5 sm:p-8 space-y-6">
          {/* Search Input Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-[#397BEE] dark:text-[#60A5FA] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <label htmlFor="public-search-demo-input" className="sr-only">
                Try a sample VectorGallery search query
              </label>
              <input
                id="public-search-demo-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setTypingTarget(null)
                  setQuery(e.target.value)
                }}
                placeholder="Ask anything — e.g. Find receipts from last month..."
                className="w-full h-12 sm:h-13 pl-12 pr-4 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] text-[15px] text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[#397BEE]/35 focus:border-[#397BEE] transition-all"
              />
            </div>
            <button
              type="button"
              onClick={resetDemo}
              className="h-12 px-4 rounded-xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] hover:bg-[var(--vg-surface-soft)] text-[13px] font-medium text-[var(--vg-ink)] inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Clickable Query Suggestions */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Sample search prompts">
            {SYNTHETIC_DEMO_QUERIES.map((prompt) => {
              const active = query === prompt
              return (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setTypingTarget(prompt)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
                    active
                      ? 'vg-blue-cta bg-[#2563EB] text-[#FFFFFF] border-[#2563EB] shadow-sm'
                      : 'bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border-[var(--vg-border)] hover:text-[var(--vg-ink)] hover:border-[#7DB8FF]'
                  )}
                >
                  {prompt}
                </button>
              )
            })}
          </div>

          {/* Matching Results */}
          {results.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-[var(--vg-surface-2)] border border-dashed border-[var(--vg-border)] space-y-2">
              <p className="text-[15px] font-semibold text-[var(--vg-ink)]">
                No matching items in the sample library
              </p>
              <p className="text-[13px] text-[var(--vg-ink-2)]">
                VectorGallery tells you clearly when content is missing rather than guessing. Try clicking a suggested query above.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {results.map((item) => (
                <motion.button
                  layout
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedFile(item)}
                  className="text-left rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] hover:border-[#397BEE]/60 p-4 flex gap-4 items-start transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
                >
                  <img
                    src={item.thumb}
                    alt={item.alt}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[var(--vg-border)] group-hover:scale-[1.03] transition-transform"
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[#2563EB] dark:text-[#60A5FA] truncate">
                        {item.categoryLabel}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--vg-ink-muted)] shrink-0">
                        {item.size}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-semibold text-[var(--vg-ink)] truncate">
                      {item.filename}
                    </h3>
                    <p className="text-[12px] text-[var(--vg-ink)] bg-[#E0EDFF]/70 dark:bg-[#1C3150]/70 px-2.5 py-1 rounded-lg line-clamp-2">
                      {item.highlight}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[var(--vg-ink-muted)] pt-0.5">
                      <span>{item.citation}</span>
                      <span className="font-medium text-[#2563EB] dark:text-[#93C5FD] group-hover:underline">
                        Preview →
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </Container>

      {/* Accessible File Preview Dialog */}
      <AnimatePresence>
        {selectedFile && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-preview-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090F1C]/65 backdrop-blur-sm"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {selectedFile.type === 'photo' ? (
                    <ImageIcon className="w-4 h-4 text-[#2563EB] shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#2563EB] shrink-0" />
                  )}
                  <h3 id="demo-preview-title" className="text-[16px] font-semibold text-[var(--vg-ink)] truncate">
                    {selectedFile.filename}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  aria-label="Close sample file preview"
                  className="w-8 h-8 rounded-full border border-[var(--vg-border)] flex items-center justify-center text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <img
                src={selectedFile.thumb}
                alt={selectedFile.alt}
                className="w-full h-56 rounded-2xl object-cover border border-[var(--vg-border)]"
              />

              <div className="space-y-2 text-[13px]">
                <p className="font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                  {selectedFile.citation}
                </p>
                <p className="text-[var(--vg-ink)] leading-relaxed">{selectedFile.highlight}</p>
                <p className="text-[var(--vg-ink-2)] leading-relaxed">{selectedFile.excerpt}</p>
              </div>

              <div className="pt-2 border-t border-[var(--vg-border)] flex items-center justify-between text-[12px] text-[var(--vg-ink-muted)]">
                <span>Uploaded {selectedFile.date} · {selectedFile.size}</span>
                <span>Sample workspace item</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  )
}
