# VectorGallery Landing Architecture — Project Aura Blueprint

**Single Source of Truth:** `components/landing/design-system.ts`  
**Creative Direction & Visual Studies:** `components/landing/CREATIVE_DIRECTION.md` (**Winning Concept:** Concept A — *"Sculptural Editorial"*)  
**Palette Ratio:** **70% Neutral** (`#FAFAF7` alabaster light / `#0B0D0C` obsidian dark) · **20% Bespoke Media** (`memory-fold-light/dark.webp` & 10 `aura-*.webp` photographs) · **10% Emerald/Jade Accent** (`#087F5B` light / `#58D6A8` dark).

---

## Project Aura Creative Guardrails

1. **Strictly 5 Major Chapters + 1 Final Invitation = 6 `<section>` Landmarks.** Compact 2-column FAQ renders in `<div id="faq" role="region" aria-labelledby="faq-heading">` below the invitation, followed by a clean minimal `<footer>`.
2. **Serif Restraint Rule:** Use `Instrument Serif` (`font-serif italic`) **ONLY** on **1 word in Chapter 01 Hero (*keep*)** and **1 word in Final Invitation (*life*)**. Chapters 02, 03, 04, and 05 use crisp, confident architectural grotesk (`Manrope` / `Inter`) with **zero** green serif italics.
3. **Zero SaaS Badge/Card Fatigue:** Eliminate repetitive uppercase monospace eyebrows above every section, avoid 3-card equal grids where architectural diagrams/showcase belong, and hide `0` GitHub star counts (`stars > 0` only).
4. **Human Language First:** Never lead headings or descriptions with infrastructure terms (`PostgreSQL`, `pgvector`, `SHA-256`, `SQLite`, `OCR` acronyms as lead hooks). Put honest technical specs cleanly inside Chapter 05's expandable `"Under the hood"` disclosure and clean filenames/checksums (`font-mono`).
5. **Seamless Sculpture Integration:** Render `/brand/memory-fold-light.webp` (light) and `/brand/memory-fold-dark.webp` (dark) using `VG_COMPONENTS.media.sculptureMask` so the sculpture's studio floor dissolves organically into `#FAFAF7` and `#0B0D0C` with zero rectangular edge.
6. **Zero Legacy Blue or Neon:** Never use `#397BEE`, `#2563EB`, `#60A5FA`, `#7DB8FF`, `#93C5FD`, `#090F1C`, `#F5F8FF`, or purple/neon hues anywhere.

---

## 5 Major Chapters + Final Invitation + Editorial FAQ & Footer

### Chapter 01 — Hero ("Sculptural Editorial")
- **Files:** `components/landing/HeroSection.tsx`, `components/DarkVeil.tsx` (silk Neutral-First WebGL aura), `components/landing/motion.tsx` (**Owner:** `@hero-engineer`)
- **Layout:** **Asymmetric Studio Split** (`max-w-[1340px]`, `~91%` desktop width at `1440px`, stacked gracefully on mobile).
  - Left (`lg:col-span-6`, left-aligned): Quiet single-line dot kicker (`Personal AI Cloud · Open Source` — no pill box), giant architectural H1 (`clamp(2.65rem, 6.4vw, 6.75rem)` -> up to `108px` on large desktop), crisp human subtext, full-rounded pill CTAs (`Get started` primary `/app` + `View on GitHub` secondary), and quiet single-line reassurance.
  - Right (`lg:col-span-6`, right-bleeding): Seamless `memory-fold-light.webp` (light) / `memory-fold-dark.webp` (dark) with `VG_COMPONENTS.media.sculptureMask` over subtle silk `DarkVeil` aura, anchored at its lower base by **ONE** frosted editorial photo slice (`/landing/photos/aura-journal-desk.webp`) + **ONE** clean glass search pill (`"handwritten coffee sketch from October 14"`). **NO** floating file cards or SVG string connections.
- **Exact Headline:**
  > Everything you *keep*.  
  > Right where you need it.  
  *(Only `keep` uses `VG_TYPOGRAPHY.editorialWordClass` — `Right where you need it.` uses subtle muted neutral or clean contrast grotesk.)*
- **Exact Subtext:**
  > One calm, private home for every photograph, handwritten note, receipt, and document — find anything simply by remembering the moment.
- **Animation:** Gentle staggered reveal (`0.05s` cadence), subtle mouse-linked parallax (`±8px` max) on the glass search slice, silk `DarkVeil` aura (`VG_AURA_SHADER_SPEC`) with CSS fallback and `prefers-reduced-motion` static mode.

---

### Chapter 02 — Finding Anything
- **File:** `components/landing/InteractiveSearchDemo.tsx` (**Owner:** `@product-designer`)
- **Layout:** **Centered Editorial Inquiry** (`max-w-[1160px]`, `surface="default"`, `id="search-demo"`).
  - Monumental centered grotesk H2 (`clamp(2rem, 4.4vw, 4.5rem)` — **NO** serif italic!), concise subtext, and a clean studio **3-Mode Interactive Search Stage** (`Memory search` · `Document search` · `Ask AI`).
  - Typing animation with cursor, clickable sample prompts tailored cleanly to our **bespoke `aura-*.webp` photography** (no mountain repetition!), 2-column visual result cards, and accessible file preview modal.
- **Exact Headline:**
  > Remember a little. Find a lot.
- **Exact Subtext:**
  > Search in everyday words across moments you photographed, pages you scanned, or details tucked inside a note.
- **Photos (`public/landing/photos/`):**
  - `aura-train-journey.webp` (`Memory search` — coastal train ride & ticket)
  - `aura-family-morning.webp` (`Memory search` — kitchen pears & morning light)
  - `aura-journal-desk.webp` (`Document search` — handwritten Oct 14 journal entry)
  - `aura-study-table.webp` (`Document search` — studio study & notes)
  - `aura-heirloom-object.webp` (`Ask AI` — film camera & contact sheet provenance)

---

### Chapter 03 — Entire Digital World
- **File:** `components/landing/ProductShowcaseSection.tsx` (**Owner:** `@product-designer`)
- **Layout:** **Full-Width Studio Workspace Frame + Clean Typographic Pillars** (`surface="secondary"` -> `#F0F1EC` light / `#171A18` dark, `id="showcase"`).
  - Left-aligned or centered wide grotesk H2 (`clamp(2rem, 4.4vw, 4.5rem)` — **NO** serif italic!) above a wide architectural workspace window (`BrowserFrame` with **3 focused interactive states**):
    1. `Library` — Curated masonry/timeline view featuring `aura-sunlit-interior.webp`, `aura-evening-gathering.webp`, `aura-personal-travel.webp`, `aura-coastal-path.webp`.
    2. `Search` — Instant unified recall across photos, scanned bills, and notes with matched highlight previews.
    3. `Assistant` — Conversational grounded answers citing exact saved pages and photos cleanly.
  - Below frame: **3 clean typographic columns** (border-top hairline pillars — NOT heavy boxed bento cards).
- **Exact Headline:**
  > Your life isn't made of folders. Neither should your cloud be.
- **Exact Subtext:**
  > Photographs, paperwork, screenshots, and personal notes come together effortlessly in one quiet place built for how memory actually works.

---

### Chapter 04 — Connected Everywhere
- **File:** `components/landing/MobileSection.tsx` (**Owner:** `@assets-mobile`)
- **Layout:** **Asymmetric Hardware Showcase + Horizontal Continuity Strip** (`surface="default"`, `id="mobile"`).
  - Left (`lg:col-span-5`): Clean grotesk H2 (**NO** serif italic!), warm human subtext, primary APK download pill (`/vectorgallery.apk`, size badge `~107.8 MB`), `/install` guide link, and compact expandable SHA-256 verification disclosure (no jargon walls). Never fabricate Play Store / App Store links.
  - Right (`lg:col-span-7`): **CSS/SVG Android Device Frame** displaying interactive real Flutter app screen tabs (`Home`, `Files`, `AI Chat`, `Search`, `Settings`) populated with `aura-family-morning.webp`, `aura-personal-travel.webp`, and `aura-coastal-path.webp` — plus a clean horizontal continuity flow beneath (`Phone` → `Local Queue` → `Private Vault` → `Desktop Web`).
- **Exact Headline:**
  > Your memories move with you.
- **Exact Subtext:**
  > Back up your Android camera roll automatically over Wi-Fi without ever touching the originals on your phone — ready on desktop the moment you need them.

---

### Chapter 05 — Yours, Completely
- **File:** `components/landing/PrivacySection.tsx` (**Owner:** `@product-designer`)
- **Layout:** **Asymmetric Architectural Split — Zero 3-Card Grid** (`surface="secondary"`, `id="privacy"`).
  - Left (`lg:col-span-6`): Clean grotesk H2 (**NO** serif italic!), plain human explanation (ownership, choose where your library lives, open-source transparency), subtle GitHub link (**HIDE stars completely when `stars === 0` or `null` — only show badge if `stars > 0`!**), and an interactive **expandable `"Under the hood"` disclosure** containing `Local Disk / Supabase / Cloudflare R2` driver tabs, quickstart terminal commands (`npm run dev`, `npm run worker`, `flutter run`), Apache-2.0 badge, and honest `docs/SECURITY.md` note (AES-256-GCM BYOK keys, plaintext server indexing).
  - Right (`lg:col-span-6`, `id="developers"`): **Architectural Geometry Visual** — clean layered architectural study pairing `aura-botanical-light.webp` with an understated geometric ownership diagram (`Your Device` ↔ `Your Storage` ↔ `Your Keys`, zero developer jargon in top diagram).
- **Exact Headline:**
  > Personal means personal.
- **Exact Subtext:**
  > Keep everything on your own machine or choose your own private cloud storage. Open source under Apache-2.0, with zero lock-in.

---

### Section 6 — Final Invitation
- **File:** `components/landing/FinalInvitationSection.tsx` (**Owner:** `@assets-mobile`)
- **Layout:** **Full-Bleed Emerald Light-Field Monument** (`id="get-started"`, deep forest `#092219` with soft radial emerald/mint light-field aura, `VG_LAYOUT.sectionPadding.finalInvitation`).
  - Centered animated **Memory Fold / Connected Frames** mark (`<VectorGalleryLogo variant="on-dark" size="lg" showWordmark={false} />`), monumental H2 with the **second & final Instrument Serif accent (`life`)**, concise emotional close, and pill CTAs (`Get started` -> `/app`, `View on GitHub` -> `REPO_URL`).
- **Exact Headline:**
  > Keep everything that makes *life* yours.  
  *(Only `life` uses `VG_TYPOGRAPHY.editorialWordOnForestClass`)*
- **Exact Subtext:**
  > Set up privately on your computer in minutes, or pair your Android phone over Wi-Fi.

---

### Compact 2-Column Editorial FAQ & Minimal Footer
- **File:** `components/landing/FaqAndFooterSection.tsx` (**Owner:** `@saas-engineer`)
- **FAQ (`<div id="faq" role="region" aria-labelledby="faq-heading">`):**
  - **NO boxed accordion cards.** Use clean editorial 2-column layout (`lg:grid-cols-12`: left compact heading `"Questions, answered simply."`; right 6 hairline-divided Q&A disclosures using `border-b border-[var(--vg-border)]` and clean `+` / `−` or chevron toggles).
  - Keep **6 concise, human questions**:
    1. `What is VectorGallery?`
    2. `How does searching by memory work?`
    3. `Is VectorGallery free and open source?`
    4. `Can I run everything privately on my own computer?`
    5. `Do I need external AI accounts to use it?`
    6. `Will the Android app ever delete photos from my phone?`
- **Minimal Footer:**
  - **NO giant faint background wordmark (`VectorGallery` watermark removed!).**
  - Clean single horizontal grid: left brand mark + 1-line tagline + `ThemeSwitch mode="segmented"`, right **3 compact columns** (`Product`, `Resources`, `Legal`), and a whisper-quiet copyright/license line.

---

## Minimal Navigation (`LandingNavbar.tsx`)
- **Owner:** `@saas-engineer`
- **Structure:** Clean single-row sticky bar (`bg-[#FAFAF7]/85 dark:bg-[#0B0D0C]/85 backdrop-blur-xl`):
  - Left: `<VectorGalleryLogo size="md" />`
  - Center: **Exactly 3 links** — `Product` (`#showcase`), `Mobile` (`#mobile`), `Open Source` (`#privacy`)
  - Right: `ThemeSwitch`, `GitHub` (no `0` star badge!), `Sign in` (`/login`), `Get started` pill button (`/app`), plus clean mobile menu drawer.

---

## Complete File Ownership Map (Project Aura)

| Agent | Exclusive Files |
| --- | --- |
| **Agent 1 (`@creative-director`)** | `components/landing/CREATIVE_DIRECTION.md`, `components/landing/design-system.ts`, `components/landing/ARCHITECTURE.md`, `styles/globals.css`, `tailwind.config.js`, `components/brand/VectorGalleryLogo.tsx`, `public/brand/{logo,logo-dark,logo-light,logo-monochrome,logo-mark,favicon}.svg`, `public/brand/social-preview.png` |
| **Agent 2 (`@hero-engineer`)** | `components/landing/HeroSection.tsx`, `components/DarkVeil.tsx`, `components/landing/motion.tsx` |
| **Agent 3 (`@product-designer`)** | `components/landing/InteractiveSearchDemo.tsx`, `components/landing/ProductShowcaseSection.tsx`, `components/landing/PrivacySection.tsx` |
| **Agent 4 (`@assets-mobile`)** | `components/landing/MobileSection.tsx`, `components/landing/FinalInvitationSection.tsx`, `components/landing/tokens.ts` (update `CURATED_PHOTOS`, `SYNTHETIC_SEARCH_CATALOG`, `FAQ_ITEMS` to use `aura-*.webp` & human language), `public/landing/photos/ATTRIBUTION.md` |
| **Agent 5 (`@saas-engineer`)** | `components/landing/LandingNavbar.tsx`, `components/landing/FaqAndFooterSection.tsx`, `components/landing/ui.tsx`, `components/landing/ThemeSwitch.tsx`, `pages/index.tsx`, `pages/login.tsx`, `pages/signup.tsx`, `pages/install.tsx`, `pages/_app.tsx`, `pages/_document.tsx`, `components/SiteHeader.tsx`, `components/AccountMenu.tsx`, `components/ThemeToggle.tsx`, `public/site.webmanifest`, `public/manifest.json` |
| **Agent 6 (`@quality-engineer`)** | Full QA after assembly (`tsc`, `eslint`, `vitest`, `build`, routes, light/dark screenshots at `1440×900` & `390×844`, a11y, zero console/image errors) |
| **Agent 7 (`@design-reviewer`)** | Independent design polish & verification against Apple/Linear/Raycast benchmark |
