# VectorGallery Landing Architecture — "Digital Sanctuary" Redesign

**Single Source of Truth:** `components/landing/design-system.ts`  
**Brand Identity:** Green Digital Sanctuary — warm ivory paper (`#F7F8F3`), botanical emerald (`#087F5B`), soft sage (`#E6EDE4`), and mint (`#B8E7D4`) in light mode; deep forest night (`#080E0C`), canopy (`#101914`), elevated moss (`#1C3329`), and luminous jade (`#53D9A3`) in dark mode.

---

## Non-Negotiable Creative Rules

1. **Strictly 6 Homepage Sections + Compact FAQ + 3-Column Footer.** Never exceed 6 `<section>` landmarks on `pages/index.tsx`. (Render the compact FAQ as a `<div id="faq" role="region" aria-labelledby="faq-heading">` so semantic accessibility is preserved while keeping `<section>` count strictly 6.)
2. **Zero Blue, Purple, Neon, or Generic AI Gradients.** Replace every leftover `#397BEE`, `#2563EB`, `#7DB8FF`, `#60A5FA`, `#93C5FD`, `#090F1C`, `#F5F8FF`, and `.vg-blue-cta` class with tokens from `design-system.ts` (`--vg-*`, `.vg-cta`).
3. **Editorial Serif Restraint.** `Instrument Serif` (`font-serif italic font-normal`) is reserved for **1–2 emotionally meaningful words per section headline** ONLY. Primary headings stay `Manrope` (`font-display font-bold`); body stays `Inter` (`font-sans`); technical metadata/hashes/commands stay `Geist Mono` (`font-mono`).
4. **Atmospheric WebGL Shader Warning (`DarkVeil.tsx`).** The existing `components/DarkVeil.tsx` CPPN shader produces purple/violet (`rgb(34, 6, 87)`) at `uHueShift = 0`. **Agent 2 MUST modify `DarkVeil.tsx`** to remap CPPN luminance directly onto botanical green stops (`VG_AURA_SHADER_SPEC` in `design-system.ts`) instead of relying on `hueShift = 0`.
5. **Respect Reduced Motion.** Every Framer Motion animation must check `useReducedMotion()` and honor `<MotionConfig reducedMotion="user">`.
6. **Honest Technical Claims.** Preserve accurate product facts: 50 MB upload bound, SHA-256 deduplication, dual OCR + unpdf/DOCX/XLSX parsing, video/audio stored with metadata (no unbuilt transcription), non-destructive Android Flutter SQLite queue, AES-256-GCM BYOK encryption with plaintext server indexing (`docs/SECURITY.md`).

---

## Consolidated Homepage Blueprint (6 Sections + FAQ + Footer)

### Section 1 — Hero
- **File:** `components/landing/HeroSection.tsx` (**Owner:** `@hero-engineer`)
- **Motion & Shader Files:** `components/DarkVeil.tsx` (adapt CPPN shader for green aurora), `components/landing/motion.tsx` (**Owner:** `@hero-engineer`)
- **Retired File:** Delete `components/landing/ScrollMemoryStory.tsx` (its convergence narrative is absorbed cleanly into Hero's Memory Canvas).
- **Layout Structure:** **Asymmetric 12-column editorial stage** (`VG_LAYOUT.containers.wide`, `VG_LAYOUT.sectionPadding.hero`).
  - Left (`lg:col-span-7` / ~60%, left-aligned): Pill eyebrow badge (`Personal AI Cloud & Digital Memory Vault`), H1 display headline, lead subtext, primary emerald/jade CTA (`/app`) + secondary GitHub CTA, and calm open-source micro-line.
  - Right (`lg:col-span-5` / ~40%): **Floating Memory Canvas** — scattered photo, document, and screenshot cards that animate into an organized searchable vault hub along subtle emerald vector paths, with responsive stacked layout below `lg`.
- **Exact Headline:**
  > Life is worth *remembering*.  
  *(Serif word: `remembering` — `<em className={VG_TYPOGRAPHY.editorialWordClass}>remembering</em>`)*
- **Exact Subtext:**
  > One serene, open-source sanctuary for every photograph, screenshot, PDF, and field note you keep. Search by memory, not by filename.
- **Design Tokens:**
  - Surface: `var(--vg-bg)` (`#F7F8F3` light / `#080E0C` dark) with botanical `DarkVeil` green aura behind composition (`VG_AURA_SHADER_SPEC`) + CSS gradient fallback.
  - Pill badge: `VG_COMPONENTS.badges.sage`.
  - Primary CTA: `VG_COMPONENTS.buttons.primary`; Secondary CTA: `VG_COMPONENTS.buttons.secondary`.
  - Memory cards: `VG_COMPONENTS.cards.surface` / `VG_COMPONENTS.cards.glass`, `VG_COMPONENTS.badges.photoScrim`.
- **Photos (`public/landing/photos/`):**
  - `mountain-pass.webp` (Photo card)
  - `lake-morning.webp` (Photo card)
  - `workspace-journal.webp` (Vault hub thumbnail)
  - `fjord-overlook.webp` (Vault hub thumbnail)
- **Animation Approach:**
  - Immediate entrance (`duration: 0.55–0.72s`, `VG_MOTION.ease`, `0.05s` stagger) with gentle mouse-driven spring parallax (`VG_MOTION.springParallax`) on desktop floating cards, SVG `pathLength` vector trace (`1.0s`), and subtle WebGL green aura (`DarkVeil.tsx`) with viewport intersection pause + `prefers-reduced-motion` static fallback.

---

### Section 2 — Search Demo
- **File:** `components/landing/InteractiveSearchDemo.tsx` (**Owner:** `@product-designer`)
- **Layout Structure:** **Centered editorial heading** (`max-w-3xl mx-auto text-center`) above a crisp **BrowserFrame Interactive 3-Mode Search Stage** (`max-w-[1120px] mx-auto`, `surface="default"`, `id="search-demo"`).
  - Top mode selector pills switching deterministically between **3 search modes**:
    1. `Memory search` (natural-language photo & scene recall)
    2. `Document search` (OCR pricing tables, receipts, PDFs & Markdown passages)
    3. `Ask AI` (synthesized grounded answers with clickable source citations)
  - Interactive search bar with typing animation + blinking cursor, relevant synthetic query chips per mode (e.g. mountain queries return mountain/fjord results cleanly, never random receipts), 2-column result cards with photo thumbnails, and accessible preview modal.
- **Exact Headline:**
  > Remember the *moment*. Find the file.  
  *(Serif word: `moment`)*
- **Exact Subtext:**
  > Ask across your archive in plain language — preview real visual recall, optical screenshot OCR, and cited document passages on deterministic sample data.
- **Design Tokens:**
  - Stage wrapper: `BrowserFrame` + `VG_COMPONENTS.cards.surface`, `VG_LAYOUT.shadows.hero`.
  - Mode tabs: `VG_COMPONENTS.buttons.tabActive` / `tabIdle`.
  - Search input: `VG_COMPONENTS.inputs.search`.
  - Result highlight pill: `bg-[var(--vg-surface-soft)] text-[var(--vg-ink)]`.
- **Photos (`public/landing/photos/`):**
  - `mountain-pass.webp`, `fjord-overlook.webp` (`Memory search`)
  - `studio-desk.webp`, `quiet-cafe.webp` (`Document search` / OCR)
  - `archive-pages.webp`, `workspace-journal.webp`, `outdoor-reader.webp` (`Ask AI` / citations)
- **Animation Approach:**
  - `MotionReveal` section entrance (`VG_MOTION.ease`), `layout` smooth card reflow on mode/query change, `AnimatePresence` modal scale/fade (`0.2s`), deterministic typewriter effect (`22ms/char`, disabled when `prefers-reduced-motion` is true).

---

### Section 3 — Product Showcase
- **File:** `components/landing/ProductShowcaseSection.tsx` (**Owner:** `@product-designer`)
- **Replaces & Retires:** `EmotionalStorySection.tsx`, `FeatureBentoSection.tsx`, `HowItWorksAndMemories.tsx`, and the product showcase half of `ProductAndMobileSection.tsx`.
- **Layout Structure:** **Centered editorial header + full-width BrowserFrame interactive stage + 3 concise key benefits below** (`surface="secondary"` -> `#EEF3EC` light / `#111C17` dark, `id="showcase"`).
  - **4 Focused Workspace Tabs** inside a sleek `BrowserFrame` (`max-w-[1200px]`):
    1. `Photos timeline` — Chronological camera roll, EXIF tags, favorites & SHA-256 deduplication.
    2. `Search results` — Hybrid PostgreSQL `pgvector` + offline Unicode retrieval + dual OCR match highlights.
    3. `AI Assistant` — Grounded BYOK chat (`Gemini`, `Groq`, `Cohere`, `OpenAI`) with direct source citations.
    4. `Document viewer` — Clean inline preview for PDFs, DOCX specs, spreadsheets & Markdown (plus metadata storage for video/audio).
  - Below `BrowserFrame`: **3 key benefit columns** (clean editorial typography — NOT an 8-card bento grid!).
- **Exact Headline:**
  > Everything you keep, *beautifully* together.  
  *(Serif word: `beautifully`)*
- **Exact Subtext:**
  > Photos, scanned paperwork, Markdown notes, and grounded AI answers live inside one calm workspace — without folders getting in the way.
- **Design Tokens:**
  - Section background: `var(--vg-surface-2)`.
  - Frame & sidebar: `BrowserFrame` (`VG_COMPONENTS.cards.surface`), tab pills (`VG_COMPONENTS.buttons.tabActive` / `tabIdle`), badges (`VG_COMPONENTS.badges.mint` & `monoTag`).
- **Photos (`public/landing/photos/`):**
  - `coastal-cliffs.webp` (`Photos timeline`)
  - `analog-camera.webp` (`Photos timeline` secondary)
  - `valley-reflection.webp` (`AI Assistant`)
  - `stone-architecture.webp` (`Search results`)
  - `coffee-ritual.webp` (`Document viewer` / workspace context)
- **Animation Approach:**
  - `MotionReveal` header & frame entrance, `AnimatePresence mode="wait"` subtle crossfade + `8px` vertical settle (`0.28s`, `VG_MOTION.ease`) when switching tabs.

---

### Section 4 — Mobile
- **File:** `components/landing/MobileSection.tsx` (**Owner:** `@assets-mobile`)
- **Replaces:** Mobile half of `ProductAndMobileSection.tsx` (coordinate deleting `ProductAndMobileSection.tsx` once both `ProductShowcaseSection.tsx` and `MobileSection.tsx` land).
- **Layout Structure:** **Asymmetric 12-column hardware & utility showcase** (`surface="default"`, `id="mobile"`).
  - Left (`lg:col-span-6`): Eyebrow (`Flutter Android Companion`), headline, subtext, primary APK download button (`Download Android APK` at `/vectorgallery.apk`, `~107.8 MB`), secondary `/install` link, verified `SHA-256` (`3e8d484b97b87d515e8280b03f9f12de9f76a324333b1a28d081c1a17dbf0529`) checksum copy pill, and 3 succinct highlights (`Wi-Fi only backup`, `Non-destructive sync`, `SHA-256 deduplication`). Do NOT fabricate Google Play / App Store availability.
  - Right (`lg:col-span-6`): **Cinematic CSS/SVG Device Mockup** — sculpted Android hardware frame(s) showing the Flutter app UI + animated phone-to-cloud transfer indicator over a soft mint/jade backdrop.
- **Exact Headline:**
  > Your world, *wherever* you go.  
  *(Serif word: `wherever`)*
- **Exact Subtext:**
  > Automatic, non-destructive Android backup over Wi-Fi. Built in Flutter with a persistent SQLite retry queue and SHA-256 pre-check so phone originals stay untouched.
- **Design Tokens:**
  - Section background: `var(--vg-bg)`.
  - Device bezel: `#0B1612` with `rgba(180, 220, 198, 0.16)` rim light and `VG_LAYOUT.shadows.hero`.
  - Progress bars & sync badges: `#087F5B` / `#53D9A3` & `VG_COMPONENTS.badges.mint`.
- **Photos (`public/landing/photos/`):**
  - `snow-expedition.webp`, `misty-pines.webp`, `canyon-dusk.webp`, `lake-morning.webp`
- **Animation Approach:**
  - `MotionReveal` staggered column entry (`0.08s` offset), subtle phone-to-cloud transfer pulse/flow (disabled under `prefers-reduced-motion`), and copy confirmation micro-state.

---

### Section 5 — Privacy & Open Source
- **File:** `components/landing/PrivacySection.tsx` (**Owner:** `@product-designer` — replaces & deletes `CommunityAndFormatsSection.tsx`)
- **Layout Structure:** **Asymmetric 12-column trust & developer split** (`surface="secondary"`, `id="privacy"`).
  - Left (`lg:col-span-6`): Eyebrow (`Open Source · Apache-2.0`), headline, subtext, **3 clean architectural benefits**:
    1. **Storage Choice** — Switch cleanly between `Local Disk`, `Supabase Private Storage`, or `Cloudflare R2`.
    2. **Self-Hosting Ready** — Run locally with `npm run dev` or add PostgreSQL `pgvector` + background worker anytime.
    3. **Open Source & Honest Privacy** — Apache-2.0 licensed; BYOK keys encrypted with AES-256-GCM; server OCR/indexing runs on plaintext (never claim zero-knowledge E2EE).
  - Right (`lg:col-span-6`, `id="developers"`): **Self-Host Quickstart Terminal** (`Web App`, `Worker`, `Mobile` tabs + copy button) paired with a compact **GitHub Repo Card** reading `/api/github-stats` (stars, forks, `Apache-2.0` license badge, Repo/Issues/Contributing links).
- **Exact Headline:**
  > Your memories *belong* to you.  
  *(Serif word: `belong`)*
- **Exact Subtext:**
  > Open source under Apache-2.0. Self-host locally on your own machine or bring your own storage bucket and AI keys — never locked into our cloud.
- **Design Tokens:**
  - Section background: `var(--vg-surface-2)`.
  - Cards: `VG_COMPONENTS.cards.surface`; code terminal: `VG_COMPONENTS.inputs.codeBlock` (`#080E0C` background, `#B8E7D4`/`#DCEFE5` text).
- **Photos (`public/landing/photos/`):**
  - Minimal typographic/code clarity (or optional subtle small `stone-architecture.webp` thumbnail if needed).
- **Animation Approach:**
  - `MotionReveal` two-column reveal, clean tab highlight transition, copy-confirmation micro-state.

---

### Section 6 — Final Invitation
- **File:** `components/landing/FinalInvitationSection.tsx` (**Owner:** `@assets-mobile`)
- **Layout Structure:** **Full-bleed forest-green monumental invitation** (`id="get-started"`, background `#092219` / gradient from `#087F5B`/25 into `#092219` & `#071A13`, `VG_LAYOUT.sectionPadding.finalInvitation`).
  - Centered focal stack (`max-w-3xl mx-auto text-center`) framed by subtle ambient radial mint glow (`rgba(83, 217, 163, 0.14)`):
    - Animated **Connected Frames** logo mark (`<VectorGalleryLogo variant="on-dark" size="lg" showWordmark={false} />` with subtle scale/fade).
    - Monumental headline & brief emotional subtext.
    - Dual action row (`VG_COMPONENTS.buttons.forestPrimary` for `Get started` -> `/app`, `VG_COMPONENTS.buttons.forestSecondary` for `View on GitHub` -> `REPO_URL`).
    - Optional subtle peripheral framed memory thumbnails (`valley-reflection.webp`, `coffee-ritual.webp`) on `hidden lg:block` edges without crowding the center invitation.
- **Exact Headline:**
  > Keep what makes *life* yours.  
  *(Serif word: `life` — `VG_TYPOGRAPHY.editorialWordOnForestClass` in `#B8E7D4`)*
- **Exact Subtext:**
  > Start privately on your own computer in under a minute, or install the Android companion for effortless Wi-Fi backup.
- **Design Tokens:**
  - Forest canvas: `#092219` / `#071A13`, text `#EFF7F3`, muted `#B8E7D4`/`#9CB6AA`, buttons `VG_COMPONENTS.buttons.forestPrimary` (`#53D9A3` with `#061811` ink) and `forestSecondary`.
- **Photos (`public/landing/photos/`):**
  - `valley-reflection.webp`, `coffee-ritual.webp` (subtle edge accents on desktop)
- **Animation Approach:**
  - Viewport-triggered `VectorGalleryLogo` Connected Frames convergence animation + soft `MotionReveal` text cadence (`0.08s` stagger).

---

### Compact FAQ (Outside the 6 `<section>` landmarks)
- **File:** `components/landing/FaqAndFooterSection.tsx` (**Owner:** `@saas-engineer`)
- **Markup Rule:** Wrap in `<div id="faq" role="region" aria-labelledby="faq-heading" className="py-16 sm:py-20 bg-[var(--vg-bg)]">` so total `<section>` count remains strictly **6**.
- **Layout Structure:** Centered narrow single-column accordion (`max-w-[780px]`), clean border-divided cards (`rounded-2xl`), first item open by default.
- **Exact Headline:**
  > Clear *answers*, before you start. *(Serif word: `answers`)*
- **Exact Subtext:**
  > Six essentials verified directly against the VectorGallery codebase and documentation.
- **EXACT 6 Questions (keep ONLY these 6 in FAQ):**
  1. `What is VectorGallery?`
  2. `How does AI search work?`
  3. `Is VectorGallery open source?`
  4. `Can I run it locally?`
  5. `Do I need AI API keys?`
  6. `Can I back up my Android phone?`

---

### Streamlined 3-Column Footer
- **File:** `components/landing/FaqAndFooterSection.tsx` (**Owner:** `@saas-engineer`)
- **Layout Structure:** Compact architectural footer (`bg-[var(--vg-surface-2)]` or `var(--vg-bg)` with `border-t border-[var(--vg-border)]`, `pt-14 pb-10`).
  - Top/Left brand column (`md:col-span-5`): `VectorGalleryLogo` (`size="md"`), 1-sentence brand tagline, `ThemeSwitch mode="segmented"`.
  - Right **3 Columns** (`md:col-span-7 grid-cols-2 sm:grid-cols-3`):
    1. **Product:** `Web Workspace (/app)`, `Search Demo (#search-demo)`, `Product Showcase (#showcase)`, `Android App (/install)`
    2. **Resources:** `GitHub Repository`, `Releases & APK`, `Contributing`, `FAQ (#faq)`
    3. **Legal:** `Apache-2.0 License`, `Security Architecture`, `Sign In (/login)`, `Create Account (/signup)`
  - Bottom hairline copyright/attribution bar + restrained oversized botanical wordmark watermark (`text-[#0F241B]/[0.045] dark:text-[#53D9A3]/[0.055]`).

---

## Navigation Header (`LandingNavbar.tsx`)
- **Owner:** `@saas-engineer`
- **Structure:** Sticky, glassmorphic on scroll (`#FFFFFF/88` light / `#101914/88` dark, `border-[var(--vg-border)]`), single-row desktop bar (`max-w-[1360px]`):
  - Left: `VectorGalleryLogo` (`variant="animated"`, `size="md"`)
  - Center: Simple clean links — `Product (#showcase)`, `How it works (#search-demo)`, `Mobile (#mobile)`, `Open Source (#privacy)` (no heavy mega-dropdown!)
  - Right: `ThemeSwitch`, `GitHub` link (with star count if live), `"Sign in"` text link (`/login`), `"Get started"` primary emerald button (`/app`), plus clean mobile hamburger drawer.

---

## Photo Allocation Summary (16 Curated WebP Assets in `public/landing/photos/`)

| Photo | Assigned Section |
| --- | --- |
| `mountain-pass.webp` | Hero Canvas + Search Demo (Memory search) |
| `lake-morning.webp` | Hero Canvas + Mobile Sync Thumb |
| `workspace-journal.webp` | Hero Vault Hub + Search Demo (Ask AI / Notes) |
| `fjord-overlook.webp` | Hero Vault Hub + Search Demo (Memory search) |
| `studio-desk.webp` | Search Demo (Document search / Screenshot OCR) |
| `quiet-cafe.webp` | Search Demo (Document search / Receipt OCR) |
| `archive-pages.webp` | Search Demo (Document search / PDF) |
| `outdoor-reader.webp` | Search Demo (Ask AI / Citations) |
| `coastal-cliffs.webp` | Product Showcase (Photos timeline) |
| `analog-camera.webp` | Product Showcase (Photos timeline secondary) |
| `coffee-ritual.webp` | Product Showcase (Document viewer) + Final Invitation Accent |
| `valley-reflection.webp` | Product Showcase (AI Assistant) + Final Invitation Accent + Auth Backdrop |
| `stone-architecture.webp` | Product Showcase (Search results) / Privacy Reference |
| `snow-expedition.webp` | Mobile Section (Primary Phone Gallery) |
| `misty-pines.webp` | Mobile Section (Backup Queue Screen) |
| `canyon-dusk.webp` | Mobile Section (Mobile Recall Screen) |

---

## Complete File Ownership Map

No two agents may edit the same file simultaneously. Coordinate handoffs on the message board.

| Agent | Role | Owned Files (Create / Update / Delete) |
| --- | --- | --- |
| **Agent 1 (`@creative-director`)** | Brand & Design System *(Complete)* | `components/landing/design-system.ts`, `components/landing/ARCHITECTURE.md`, `styles/globals.css`, `tailwind.config.js`, `components/brand/VectorGalleryLogo.tsx`, `public/brand/{favicon,logo,logo-dark,logo-mark,logo-light,logo-monochrome}.svg`, `public/{favicon,vectorgallery-icon}.svg` |
| **Agent 2 (`@hero-engineer`)** | Hero & WebGL Aura | `components/landing/HeroSection.tsx`, `components/DarkVeil.tsx` (green luminance remap), `components/landing/motion.tsx`, **delete** `components/landing/ScrollMemoryStory.tsx` |
| **Agent 3 (`@product-designer`)** | Search Demo, Showcase & Privacy | `components/landing/InteractiveSearchDemo.tsx`, `components/landing/ProductShowcaseSection.tsx`, `components/landing/PrivacySection.tsx`, **delete** `components/landing/FeatureBentoSection.tsx`, `components/landing/EmotionalStorySection.tsx`, `components/landing/HowItWorksAndMemories.tsx`, `components/landing/CommunityAndFormatsSection.tsx` |
| **Agent 4 (`@assets-mobile`)** | Mobile, Final Invitation & Assets | `components/landing/MobileSection.tsx`, `components/landing/FinalInvitationSection.tsx`, `public/landing/photos/` audit & `ATTRIBUTION.md`, `components/landing/tokens.ts` (update `CURATED_PHOTOS`, `USE_CASE_ITEMS`, refine `SYNTHETIC_SEARCH_CATALOG`, trim `FAQ_ITEMS` to 6), **delete** `components/landing/ProductAndMobileSection.tsx` once replaced |
| **Agent 5 (`@saas-engineer`)** | Nav, FAQ/Footer, Auth, Install & Assembly | `components/landing/LandingNavbar.tsx`, `components/landing/FaqAndFooterSection.tsx` (6 FAQs + 3-col Footer), `components/landing/ui.tsx`, `components/landing/ThemeSwitch.tsx`, `components/SiteHeader.tsx`, `components/AccountMenu.tsx`, `components/ThemeToggle.tsx`, `components/LiveQrCode.tsx`, `pages/index.tsx` (final assembly), `pages/_app.tsx`, `pages/_document.tsx` (`Instrument+Serif:ital@0;1`), `pages/login.tsx`, `pages/signup.tsx`, `pages/install.tsx`, `public/site.webmanifest`, `public/manifest.json` |
| **Agent 6 (`@quality-engineer`)** | Verification & QA *(After assembly)* | Run `tsc --noEmit`, `eslint`, `vitest run`, `npm run build`, route 200 checks, visual/contrast/a11y checks (`1440×900` & `390×844` light/dark), zero leftover blue/purple hexes, strictly 6 `<section>` landmarks |
| **Agent 7 (`@design-reviewer`)** | Independent Design Review *(After QA)* | Critique & polish typography, spacing, motion hierarchy, photography harmony, light/dark consistency across Round 1 & Round 2 |

---

## Implementation Checklist for Agents 2–5

1. **Import tokens** from `@/components/landing/design-system` (`VG_TYPOGRAPHY`, `VG_COMPONENTS`, `VG_MOTION`, `VG_PALETTE`) or use CSS vars (`var(--vg-bg)`, `var(--vg-surface)`, `var(--vg-surface-2)`, `var(--vg-brand)`, `var(--vg-ink)`, `var(--vg-ink-2)`, `var(--vg-border)`).
2. **Add `Instrument Serif` to `_document.tsx`** (`@saas-engineer`): load `Manrope`, `Inter`, `Instrument+Serif:ital@0;1`, and `Geist+Mono`.
3. **Retire `.vg-blue-cta`** everywhere; use `.vg-cta` or `VG_COMPONENTS.buttons.primary`.
4. **Update `public/site.webmanifest` & `public/manifest.json`** (`@saas-engineer`): `"background_color": "#F7F8F3"`, `"theme_color": "#087F5B"`.
5. **Verify `pages/index.tsx`** (`@saas-engineer`) renders strictly:
   1. `<HeroSection />`
   2. `<InteractiveSearchDemo />`
   3. `<ProductShowcaseSection />`
   4. `<MobileSection apkSizeLabel={apkSizeLabel} />`
   5. `<PrivacySection githubStats={githubStats} />`
   6. `<FinalInvitationSection />`
   *(plus `<LandingNavbar />` above `<main>` and `<FaqAndFooterSection />` containing the non-`<section>` FAQ region and 3-column `<footer>`)*.
