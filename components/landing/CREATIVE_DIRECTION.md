# VectorGallery — Project Aura Creative Direction

## Mandatory Visual Study Comparison (1440×900 Light & Dark)

Before locking the Project Aura design system, three distinct Hero architectures were rendered at `1440×900` in both Light (`#FAFAF7`) and Dark (`#0B0D0C`) using the bespoke **Memory Fold** studio renders (`memory-fold-light.webp` / `memory-fold-dark.webp`), editorial photography (`aura-*.webp`), and Neutral-First palette tokens:

| Criterion | Concept A: **Sculptural Editorial** *(Winner)* | Concept B: **Horizon Gallery** | Concept C: **Atelier Monolith** |
| --- | --- | --- | --- |
| **Composition** | Left-anchored `86px–104px` grotesk headline + right-bleeding `memory-fold` sculpture + single base glass search slice | Centered `98px` wide title above panoramic 3-panel triptych + floating center pill | Top split header band (`1.4fr / 0.8fr`) over rounded `40px` recessed stone/obsidian pedestal |
| **Originality & Brand Voice** | **9.5 / 10** — Unmistakably bespoke museum/hardware aesthetic; zero floating SaaS cards or SVG web lines | **8.0 / 10** — Clean centered horizon, though symmetric 3-tile row looks closer to showcase layouts | **8.2 / 10** — Strong structural contrast, yet pushing artwork below a pedestal seam weakens immediate hero presence |
| **Product Clarity** | **9.5 / 10** — Immediate emotional promise + physical Memory Fold prism + one grounded photographic search slice | **8.5 / 10** — Search pill connects two scenes cleanly, though flank cards split attention | **8.0 / 10** — Split copy on right reads slightly secondary before eye reaches bottom pedestal |
| **Horizontal Scale (`1440px`)** | **~91% canvas use** (`1320px` + right-bleeding stage) with generous asymmetrical whitespace | **~93% canvas use** | **~94% canvas use** |
| **Visual Seamlessness Note** | Requires elliptical edge-feather mask (`transparent` by `82%`) so `memory-fold-light/dark` floor melts seamlessly into `#FAFAF7`/`#0B0D0C` | Visible rectangle edge between sculpture background and flanking photo cards | Visible tonal box step where `memory-fold` meets `#F0F1EC` stone pedestal |
| **Mobile Adaptability (`390px`)** | Stacks naturally: monumental left headline & CTAs on top, seamless Memory Fold + embedded search pill cleanly below | Flanking wing photos must collapse awkwardly on narrow screens | Large curved pedestal clips awkwardly above fold on mobile |

---

## Winning Direction: **Concept A — "Sculptural Editorial"**

**Why Concept A Wins:**
1. **Apple / Dieter Rams Studio Presence:** Anchoring oversized architectural grotesk (`Everything you *keep*. Right where you need it.`) against the tactile frosted-glass-and-emerald **Memory Fold** sculpture establishes an iconic signature product identity in a single glance.
2. **Eliminates SaaS Card Noise:** Zero floating mini-cards, zero dashed SVG strings, zero uppercase mono badges. Just pure neutral paper (`#FAFAF7`) or obsidian (`#0B0D0C`), silk atmospheric light (`DarkVeil`), the physical V sculpture, and **one** embedded glass search slice anchored by `aura-journal-desk.webp`.
3. **Scroll Rhythm Discipline:** Because Chapter 01 (Hero) is asymmetric and sculptural, Chapters 02 (`Remember a little. Find a lot.`) and 03 (`Your life isn't made of folders...`) can alternate between centered inquiry and full-width workspace framing without visual monotony.

### Study Screenshots
- Concept A Light (`1440×900`): `/home/krish/.gemini/antigravity/brain/62089029-e540-4120-b799-90ae697f7dcd/scratch/concept-a-light.png`
- Concept A Dark (`1440×900`): `/home/krish/.gemini/antigravity/brain/62089029-e540-4120-b799-90ae697f7dcd/scratch/concept-a-dark.png`
- Concept B Light (`1440×900`): `/home/krish/.gemini/antigravity/brain/62089029-e540-4120-b799-90ae697f7dcd/scratch/concept-b-light.png`
- Concept B Dark (`1440×900`): `/home/krish/.gemini/antigravity/brain/62089029-e540-4120-b799-90ae697f7dcd/scratch/concept-b-dark.png`
- Concept C Light (`1440×900`): `/home/krish/.gemini/antigravity/brain/62089029-e540-4120-b799-90ae697f7dcd/scratch/concept-c-light.png`
- Concept C Dark (`1440×900`): `/home/krish/.gemini/antigravity/brain/62089029-e540-4120-b799-90ae697f7dcd/scratch/concept-c-dark.png`

---

## Core Visual Guardrails (Project Aura)

1. **70 / 20 / 10 Neutral-First Color Balance:** 70% warm alabaster (`#FAFAF7`) or matte obsidian (`#0B0D0C`), 20% editorial photography & Memory Fold ceramic/glass sculpture, 10% botanical emerald (`#087F5B` light / `#58D6A8` dark) reserved for primary actions, active states, and tactile focal moments.
2. **Seamless Studio Blending:** Always apply the elliptical feather mask (`VG_COMPONENTS.media.sculptureMask`) to `memory-fold-light.webp` and `memory-fold-dark.webp` so studio backdrops dissolve organically into `#FAFAF7` and `#0B0D0C` with zero rectangular edge.
3. **Typography Authority & Serif Restraint:** Hero H1 scales up to `108px` (`clamp(2.65rem, 6.4vw, 6.75rem)`), Section H2 up to `72px` (`clamp(2rem, 4.4vw, 4.5rem)`). **Instrument Serif italic is used ONLY in the Hero (1 word: *keep*) and the Final Invitation (1 word: *life*).** All 5 chapter headings stay crisp, confident architectural grotesk (`Manrope`).
4. **Human Language First:** Zero infrastructure jargon (`PostgreSQL`, `pgvector`, `SHA-256`, `SQLite`) in top-level headlines or marketing copy. Technical transparency lives neatly inside expandable `"Under the hood"` disclosures and clean `font-mono` filenames/checksums.

