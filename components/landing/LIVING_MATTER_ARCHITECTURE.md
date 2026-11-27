# VectorGallery — Project Living Matter Architecture

Visual, motion, and structural blueprint established before section-by-section construction.

## 1. Visual Benchmark & Creative Thesis

Guided directly by the studio sculpture composition benchmark:
- **Monumental Typography Behind Sculpture:** A single geometric grotesk wordmark (`VECTORGALLERY.`) spans ~86–92% of the hero container (`Space Grotesk`, bold, tight tracking) across a bright studio upper band, physically overlapped in depth by a translucent acid-lime + liquid-silver 3D **Memory Sphere** core with tilted orbital rings.
- **Two Signature Studio Themes:**
  - **Light Mode — Liquid Silver:** `#F2F3F0` canvas, `#FFFFFF` pure upper stage / card surfaces, `#E7E9E5` soft secondary, `#D1D5D2` silver midtones, `#A8B3B2` titanium, `#101211` carbon ink, `#555E58` secondary slate, `#D4FF54` acid-lime circular magnetic CTA & glass refraction core, `#087F5B` accessible emerald for links/badges.
  - **Dark Mode — Liquid Carbon:** `#090B0A` carbon canvas, `#131715` surface, `#202522` elevated titanium, `#303633` graphite, `#B9C5C5` brushed silver highlight, `#F3F5F1` ink, `#9AA69E` secondary, `#CFFF49` acid-lime CTA & core glow, `#39D9A0` emerald jade.
- **Contrast Discipline:** Never render bright acid-lime as small body copy on white surfaces. Acid-lime is used ONLY for filled surfaces with high-contrast dark ink (`#101211` on `#D4FF54` -> `> 15:1`), 3D core reflections, and subtle light accents.

## 2. Hybrid 3D Memory Sphere Architecture

Located under `components/landing/sculpture/MemorySphereCanvas.tsx`:
- **Three.js Real-Time PBR Canvas (`alpha: true`):**
  - Procedural studio softbox environment via `PMREMGenerator` + `RoomEnvironment` (works 100% offline with zero external HDR downloads).
  - Translucent acid-lime core (`MeshPhysicalMaterial` with transmission, IOR, thickness, iridescence/clearcoat, internal refractive pulse).
  - Sculpted liquid-titanium ribbons (`TubeGeometry` splines wrapping the core) with brushed metal roughness & specular sheen.
  - Ultra-thin inclined metallic/lime orbital rings rotating asynchronously and responding smoothly to pointer parallax + scroll progress.
- **Studio Poster Cutout Fallback & Instant LCP Layer:**
  - `public/landing/artwork/memory-sphere-light-cutout.webp` & `memory-sphere-dark-cutout.webp` (1024×1024 RGBA transparent cutouts) render immediately during SSR/hydration, when `prefers-reduced-motion` is enabled, or when WebGL context is unavailable.

## 3. Modular Landing Directory Structure (`components/landing/`)

- `design-system.ts` & `tokens.ts` — Palette, fluid typography, motion specs, synthetic search corpus (10 editorial `aura-*.webp` photos + 3 synthetic document captures: Coastal Line boarding pass, Studio Equip receipt, Architectural spatial flow notes).
- `navigation/` — Pill navigation dock matching the benchmark top bar (`Overview · Capture · Search · Mobile · Open Source` + `Sign in` / `Get started` pill + `ThemeSwitch`).
- `hero/` — Sculpture-led Hero (`VECTORGALLERY.` monumental wordmark, transparent WebGL + studio Memory Sphere stage, lower-left statement with dotted hairline rule, right numbered triad `01 / Capture · 02 / Connect · 03 / Remember`, lower-right magnetic circular `#D4FF54` CTA `"Explore the experience"`).
- `sculpture/` — Real-time Three.js `MemorySphereCanvas` + `MemorySphereFallback`.
- `shaders/` — OGL `LivingAuraCanvas` shader (liquid silver & carbon silk reflections with acid-lime light caustics).
- `scroll-scenes/` — GSAP + ScrollTrigger pinned reversible transformation sequence (`Scene A Memory Sphere → B Unfold → C Capture → D Connect → E Remember → F Product Reveal` mapped smoothly to `0%–100%` scroll progress).
- `search/` & `product/` — Interactive `"Find it by remembering it."` live search workbench (`Photos` / `Documents` / `Ask AI`) and multi-view workspace stage.
- `mobile/` — `"Capture here. Find it anywhere."` Android companion flow (capture -> queue -> storage -> desktop search) + APK download & QR route (`/install`).
- `ownership/` — `"Your world. Your rules."` open-source, self-hosting, local disk/BYO storage architecture & live GitHub stats.
- `footer/` — Final Brand Moment (`"EVERYTHING WORTH KEEPING."`), compact FAQ accordion, and clean minimal footer.
- `motion/` — Reusable customized motion primitives (`MagneticCircleButton`, `SplitTextReveal`, `ScrollScrubStage`, `ParallaxCard`).
