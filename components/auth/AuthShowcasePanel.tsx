import React from 'react'
import Link from 'next/link'
import { Search, ShieldCheck, Wifi } from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { MemorySphereCanvas } from '@/components/landing/sculpture/MemorySphereCanvas'
import { LivingAuraCanvas } from '@/components/landing/shaders/LivingAuraCanvas'

interface AuthShowcasePanelProps {
  badgeText: string
  headline: string
  description: string
  footerLeft: string
  footerRight: string
}

const CAPABILITY_TAGS = [
  { icon: Search, label: 'Visual & OCR Recall' },
  { icon: Wifi, label: 'Wi-Fi Android Sync' },
  { icon: ShieldCheck, label: 'Zero Lock-In' },
]

/**
 * Shared Project Liquid Intelligence visual stage for /login and /signup.
 * Uses an Obsidian Volt dark architectural showcase panel paired with a light ceramic form panel
 * (Apple/Linear double-color split), seamlessly masking the floating Memory Sphere with zero frame seam.
 */
export function AuthShowcasePanel({
  badgeText,
  headline,
  description,
  footerLeft,
  footerRight,
}: AuthShowcasePanelProps) {
  return (
    <div className="hidden lg:flex lg:col-span-6 relative overflow-hidden bg-[#0B0E11] text-[#F4F6F2] border-r border-white/[0.10] flex-col justify-between p-10 xl:p-14">
      {/* Unified Obsidian Volt Studio Atmospheric Shader */}
      <LivingAuraCanvas
        variant="dark"
        intensity={0.95}
        className="absolute inset-0 z-0 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 68% 54% at 50% 45%, rgba(205,255,69,0.09) 0%, rgba(70,214,164,0.06) 38%, transparent 72%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] vg-grain opacity-30"
      />

      {/* Top Brand Bar */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <VectorGalleryLogo size="md" variant="on-dark" />
        </Link>
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.12] backdrop-blur-md text-[12px] font-medium text-[#CDFF45]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CDFF45]" />
          {badgeText}
        </span>
      </div>

      {/* Center Seamless Memory Sphere Sculpture Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
        <div
          aria-hidden="true"
          className="font-display font-bold uppercase tracking-[-0.055em] leading-none text-white/[0.05] select-none pointer-events-none text-center whitespace-nowrap mb-[-2.6rem] xl:mb-[-3.2rem]"
          style={{ fontSize: 'clamp(3rem, 5.6vw, 5.8rem)' }}
        >
          VECTORGALLERY.
        </div>

        <div className="relative z-10 w-[300px] xl:w-[370px] my-1">
          <MemorySphereCanvas mode="story" themeMode="dark" priority />
        </div>

        <div className="max-w-lg text-center space-y-3 mt-4">
          <h2
            className="font-display text-3xl xl:text-[2.4rem] font-bold tracking-[-0.036em] leading-[1.06] text-[#F4F6F2]"
            style={{ textWrap: 'balance' }}
          >
            {headline}
          </h2>
          <p className="text-[14.5px] xl:text-[15.5px] leading-relaxed text-[#A4AEA9] max-w-md mx-auto">
            {description}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {CAPABILITY_TAGS.map((item) => {
              const Icon = item.icon
              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.10] text-[11.5px] font-medium text-[#E3E8EA]"
                >
                  <Icon className="w-3 h-3 text-[#CDFF45]" />
                  <span>{item.label}</span>
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Provenance & Ownership Footer */}
      <div className="relative z-10 flex items-center justify-between gap-4 pt-5 border-t border-white/[0.10]">
        <span className="text-[12px] font-medium text-[#A4AEA9]">{footerLeft}</span>
        <span className="font-mono text-[11.5px] text-[#B8C5CC]">{footerRight}</span>
      </div>
    </div>
  )
}
