import React from 'react'
import { FileSpreadsheet, FileText, Image as ImageIcon, Search, StickyNote } from 'lucide-react'
import { Container, Section, SectionHeading } from '@/components/landing/ui'
import { MotionReveal } from '@/components/landing/motion'

const FRAGMENTED_PAIN = [
  { label: 'A photo buried among thousands of camera images', icon: ImageIcon },
  { label: 'A pricing screenshot forgotten inside your camera roll', icon: Search },
  { label: 'An admission or travel PDF lost deep in folders', icon: FileText },
  { label: 'A studio receipt hidden inside your Downloads folder', icon: FileSpreadsheet },
  { label: 'A handwritten note you remember writing, but cannot find', icon: StickyNote },
]

export function EmotionalStorySection() {
  return (
    <Section surface="secondary" ariaLabel="Product narrative">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <MotionReveal className="lg:col-span-6 space-y-6">
            <SectionHeading
              eyebrow="Why Memories Slip Away"
              title="Some things are too important to lose."
              subtitle="Important files shouldn't vanish just because you forgot what you named them or which folder stored them two years ago."
            />

            <ul className="space-y-3 pt-2">
              {FRAGMENTED_PAIN.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.label} className="flex items-start gap-3 text-[15px] text-[var(--vg-ink-2)]">
                    <span className="w-7 h-7 rounded-lg bg-[var(--vg-surface)] border border-[var(--vg-border)] flex items-center justify-center text-[#397BEE] shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="leading-relaxed">{item.label}</span>
                  </li>
                )
              })}
            </ul>

            <div className="pt-4 pl-5 border-l-2 border-[#397BEE]">
              <p className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--vg-ink)]">
                Remember the moment. We&apos;ll help you find the file.
              </p>
              <p className="mt-1.5 text-[14px] text-[var(--vg-ink-2)] leading-relaxed">
                Search naturally by what happened in the photo, what words appeared on a screenshot, or what a PDF discussed.
              </p>
            </div>
          </MotionReveal>

          {/* Warm Emotional Photography Editorial Mosaic */}
          <MotionReveal delay={0.1} className="lg:col-span-6 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-7 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-[var(--vg-border)] shadow-[var(--vg-shadow-card)]">
                <img
                  src="/landing/photos/coastal-cliffs.webp"
                  alt="Coastal ocean cliffs remembered from a summer journey"
                  className="w-full h-60 object-cover"
                />
              </div>
              <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-4 flex items-center gap-3 shadow-sm">
                <img
                  src="/landing/photos/quiet-cafe.webp"
                  alt="Coffee cup beside notes on sunlit desk"
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--vg-ink)] truncate">
                    studio_notes_sept.md
                  </p>
                  <p className="text-[12px] text-[var(--vg-ink-2)]">
                    Found in 12 ms by natural recall
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-5 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-[var(--vg-border)] shadow-[var(--vg-shadow-card)]">
                <img
                  src="/landing/photos/coffee-ritual.webp"
                  alt="Morning pour-over ritual captured on camera"
                  className="w-full h-44 object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-[var(--vg-border)] shadow-[var(--vg-shadow-card)]">
                <img
                  src="/landing/photos/archive-pages.webp"
                  alt="Archival printed pages kept alongside personal notes"
                  className="w-full h-40 object-cover"
                />
              </div>
            </div>
          </MotionReveal>
        </div>
      </Container>
    </Section>
  )
}
