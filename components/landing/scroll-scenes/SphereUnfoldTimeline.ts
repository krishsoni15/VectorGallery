export interface TimelineSceneSpec {
  id: string
  numeral: string
  label: string
  range: [number, number]
  targetProgress: number
  title: string
  caption: string
}

/**
 * Reversible normalized ScrollTrigger timeline specification (#12):
 * 0–12% Arrival -> 12–30% Unfold -> 30–46% Discover -> 46–62% Connect -> 62–80% Remember -> 80–94% Expand -> 94–100% Product
 */
export const UNFOLD_SCENES: TimelineSceneSpec[] = [
  {
    id: 'scene-arrival',
    numeral: '01',
    label: 'Arrival',
    range: [0, 0.12],
    targetProgress: 0.04,
    title: 'One living core for everything you save.',
    caption:
      'Every photograph, receipt, ticket stub, and handwritten thought begins unified inside a calm personal archive.',
  },
  {
    id: 'scene-unfold',
    numeral: '02',
    label: 'Unfold',
    range: [0.12, 0.30],
    targetProgress: 0.22,
    title: 'Look closer as the archive opens from within.',
    caption:
      'Metallic contours part cleanly while the translucent glass core dilates—revealing the visual layers stored inside.',
  },
  {
    id: 'scene-discover',
    numeral: '03',
    label: 'Discover',
    range: [0.30, 0.46],
    targetProgress: 0.39,
    title: 'Photos, notes, and receipts emerge in spatial depth.',
    caption:
      'Originals retain full texture and visual fidelity—from golden-hour dinners to handwritten project notes and train passes.',
  },
  {
    id: 'scene-connect',
    numeral: '04',
    label: 'Connect',
    range: [0.46, 0.62],
    targetProgress: 0.55,
    title: 'Unrelated files organize by moment and meaning.',
    caption:
      'Dates, optical text inside documents, and visual scenes align automatically into a quiet interconnected library.',
  },
  {
    id: 'scene-remember',
    numeral: '05',
    label: 'Remember',
    range: [0.62, 0.80],
    targetProgress: 0.74,
    title: 'Recall a phrase. Watch the noise recede.',
    caption:
      'Search "Coastal train pass to Nice & summer trip"—matched memories step forward cleanly into focus.',
  },
  {
    id: 'scene-product',
    numeral: '06',
    label: 'Workspace',
    range: [0.80, 1.02],
    targetProgress: 0.96,
    title: 'A continuous transition into your personal vault.',
    caption:
      'Inspect full-resolution previews, copied OCR text, and grounded citations directly inside VectorGallery.',
  },
]

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t)
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(1e-5, edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export interface StageKinematics {
  unfoldW: number
  discoverW: number
  connectW: number
  rememberW: number
  productW: number
  sphereScale: number
  sphereOpacity: number
  apertureScale: number
  wingSplitPx: number
  connectLineProgress: number
  searchBarOpacity: number
  typedQueryRatio: number
  workspaceShellOpacity: number
  inspectorOpacity: number
}

/**
 * Pure deterministic function mapping normalized scroll progress (0..1) into synchronized kinematics.
 * Keeps forward and reverse scrubbing mathematically reversible without state drift.
 */
export function computeStageKinematics(p: number): StageKinematics {
  const unfoldW = smoothstep(0.08, 0.25, p)
  const discoverW = smoothstep(0.21, 0.40, p)
  const connectW = smoothstep(0.44, 0.60, p)
  const rememberW = smoothstep(0.61, 0.78, p)
  const productW = smoothstep(0.79, 0.94, p)

  // Maintain strong focal scale cleanly through Scene 02, then fade core out before Workspace expansion
  const sphereScale = 1.0 + unfoldW * 0.26 - smoothstep(0.36, 0.62, p) * 0.46
  const sphereOpacity = 1.0 - smoothstep(0.42, 0.74, p)
  const apertureScale = 0.78 + unfoldW * 0.56 + discoverW * 0.22 - productW * 0.40
  const wingSplitPx = unfoldW * 1.05 + discoverW * 0.55

  const connectLineProgress = connectW * (1 - smoothstep(0.78, 0.88, p))
  const searchBarOpacity = smoothstep(0.60, 0.67, p) * (1 - smoothstep(0.87, 0.93, p))
  const typedQueryRatio = smoothstep(0.63, 0.75, p)

  const workspaceShellOpacity = smoothstep(0.79, 0.91, p)
  const inspectorOpacity = smoothstep(0.84, 0.96, p)

  return {
    unfoldW,
    discoverW,
    connectW,
    rememberW,
    productW,
    sphereScale,
    sphereOpacity,
    apertureScale,
    wingSplitPx,
    connectLineProgress,
    searchBarOpacity,
    typedQueryRatio,
    workspaceShellOpacity,
    inspectorOpacity,
  }
}
