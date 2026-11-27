export const REPO_URL = 'https://github.com/krishsoni15/VectorGallery'
export const RELEASES_URL = 'https://github.com/krishsoni15/VectorGallery/releases'
export const ISSUES_URL = 'https://github.com/krishsoni15/VectorGallery/issues'
export const SECURITY_DOC_URL = `${REPO_URL}/blob/main/docs/SECURITY.md`
export const CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`
export const APK_EXPECTED_SHA256 =
  '3e8d484b97b87d515e8280b03f9f12de9f76a324333b1a28d081c1a17dbf0529'

export interface ShowcasePhoto {
  id: string
  src: string
  alt: string
  title: string
  category: 'Travel' | 'Personal' | 'Work' | 'Documents'
  date: string
  meta: string
  assignedSection: string
}

/**
 * Curated Project Aura editorial photography (10 bespoke aura-*.webp scenes).
 */
export const CURATED_PHOTOS: ShowcasePhoto[] = [
  {
    id: 'aura-journal',
    src: '/landing/photos/aura-journal-desk.webp',
    alt: 'Open linen-bound journal dated October 14 with handwritten notes, coffee sketch, fountain pen, and stoneware mug',
    title: 'October 14 Sketchbook',
    category: 'Documents',
    date: 'Oct 14',
    meta: 'Handwritten Note',
    assignedSection: 'Hero Search Slice · Chapter 02',
  },
  {
    id: 'aura-train',
    src: '/landing/photos/aura-train-journey.webp',
    alt: 'Hand resting on a leather travel journal beside a paper rail ticket overlooking a sunlit coastal bay',
    title: 'Coastal Rail Passage',
    category: 'Travel',
    date: 'Aug 19',
    meta: '35mm Film Scan',
    assignedSection: 'Chapter 02 · Memory Search',
  },
  {
    id: 'aura-family',
    src: '/landing/photos/aura-family-morning.webp',
    alt: 'Parent and child hands picking fresh green pears from a speckled stoneware bowl on a sunlit kitchen table',
    title: 'Sunday Kitchen Pears',
    category: 'Personal',
    date: 'Sep 08',
    meta: 'Mobile Roll',
    assignedSection: 'Chapter 02 · Chapter 04',
  },
  {
    id: 'aura-study',
    src: '/landing/photos/aura-study-table.webp',
    alt: 'Sunlit wooden desk beside a garden window with a brass lamp, stacked books, laptop, and sticky notes',
    title: 'Window Desk Notes',
    category: 'Work',
    date: 'Oct 03',
    meta: 'Notes + PDFs',
    assignedSection: 'Chapter 02 · Document Search',
  },
  {
    id: 'aura-heirloom',
    src: '/landing/photos/aura-heirloom-object.webp',
    alt: 'Vintage silver rangefinder camera beside black-and-white contact sheets and a brass loupe on linen',
    title: 'Contact Sheet Archive',
    category: 'Work',
    date: 'Sep 22',
    meta: 'Film Archive',
    assignedSection: 'Chapter 02 · Ask AI',
  },
  {
    id: 'aura-interior',
    src: '/landing/photos/aura-sunlit-interior.webp',
    alt: 'Warm sunlit limestone living room with framed botanical prints and ceramic vessels',
    title: 'Afternoon Limestone Light',
    category: 'Personal',
    date: 'Oct 11',
    meta: 'Home Archive',
    assignedSection: 'Chapter 03 · Library · Login',
  },
  {
    id: 'aura-gathering',
    src: '/landing/photos/aura-evening-gathering.webp',
    alt: 'Candlelit courtyard dinner table beneath olive branches with friends sharing food and conversation',
    title: 'Olive Courtyard Supper',
    category: 'Personal',
    date: 'Jul 29',
    meta: 'Shared Album',
    assignedSection: 'Chapter 03 · Library',
  },
  {
    id: 'aura-travel',
    src: '/landing/photos/aura-personal-travel.webp',
    alt: 'Traveler with a shoulder-slung film camera walking along a stone harbor promenade beside moored boats',
    title: 'Harbor Walk at Golden Hour',
    category: 'Travel',
    date: 'Aug 04',
    meta: 'Synced from Phone',
    assignedSection: 'Chapter 03 · Chapter 04 · Install',
  },
  {
    id: 'aura-coast',
    src: '/landing/photos/aura-coastal-path.webp',
    alt: 'Quiet sandy footpath winding through coastal sea grass above chalk cliffs and calm pale sea water',
    title: 'Chalk Cliff Footpath',
    category: 'Travel',
    date: 'Jun 15',
    meta: 'Camera Roll',
    assignedSection: 'Chapter 03 · Chapter 04',
  },
  {
    id: 'aura-botanical',
    src: '/landing/photos/aura-botanical-light.webp',
    alt: 'Eucalyptus and sage stems in an earthen ceramic vase beside a sunlit window casting soft leaf shadows',
    title: 'Morning Window Still Life',
    category: 'Personal',
    date: 'Oct 27',
    meta: 'Private Vault',
    assignedSection: 'Chapter 05 · Signup',
  },
]

export interface DemoSearchResult {
  id: string
  filename: string
  type: 'photo' | 'screenshot' | 'pdf' | 'markdown'
  categoryLabel: string
  date: string
  size: string
  thumb: string
  alt: string
  highlight: string
  excerpt: string
  citation: string
  tags: string[]
}

export const SYNTHETIC_DEMO_QUERIES = [
  'Find the photos from our summer trip',
  'Handwritten coffee sketch from October 14',
  'Coastal train ticket from August',
  'Kitchen morning with green pears',
  'Study desk notes by the garden window',
  'Which film camera was on the contact sheet?',
]

export const SYNTHETIC_SEARCH_CATALOG: DemoSearchResult[] = [
  {
    id: 'demo-summer-harbor',
    filename: 'harbor_promenade_august.webp',
    type: 'photo',
    categoryLabel: 'Photos · Summer Trip',
    date: 'Aug 04, 2026',
    size: '3.8 MB',
    thumb: '/landing/photos/aura-personal-travel.webp',
    alt: 'Traveler walking along a sunlit Mediterranean stone harbor beside boats',
    highlight: 'Matched summer harbor walk, stone seawall, and moored fishing boats',
    excerpt: 'Backed up automatically from Android over Wi-Fi while keeping your phone original intact.',
    citation: 'harbor_promenade_august.webp · Summer Trip',
    tags: ['summer', 'trip', 'travel', 'harbor', 'boats', 'photos', 'coast', 'camera'],
  },
  {
    id: 'demo-train-ticket',
    filename: 'coastal_rail_ticket_aug19.webp',
    type: 'photo',
    categoryLabel: 'Photos · Travel Memory',
    date: 'Aug 19, 2026',
    size: '3.4 MB',
    thumb: '/landing/photos/aura-train-journey.webp',
    alt: 'Hand on a leather notebook next to a rail ticket by a coastal train window',
    highlight: 'Matched coastal rail carriage, leather notebook, and paper train ticket',
    excerpt: 'Text detected on rail stub alongside coastal horizon scene context.',
    citation: 'coastal_rail_ticket_aug19.webp · Travel Journal',
    tags: ['train', 'ticket', 'coastal', 'summer', 'trip', 'travel', 'rail', 'august'],
  },
  {
    id: 'demo-coastal-path',
    filename: 'chalk_cliff_footpath.webp',
    type: 'photo',
    categoryLabel: 'Photos · Summer Trip',
    date: 'Jun 15, 2026',
    size: '4.1 MB',
    thumb: '/landing/photos/aura-coastal-path.webp',
    alt: 'Sandy coastal path through tall grass above chalk cliffs and calm sea',
    highlight: 'Matched coastal cliff path, sea grass, and afternoon ocean light',
    excerpt: 'Grouped automatically with your summer coastal walk moments.',
    citation: 'chalk_cliff_footpath.webp · Coastal Walk',
    tags: ['summer', 'trip', 'coast', 'coastal', 'path', 'sea', 'photos'],
  },
  {
    id: 'demo-october-journal',
    filename: 'october_14_coffee_sketch.webp',
    type: 'screenshot',
    categoryLabel: 'Notes · Handwritten Page',
    date: 'Oct 14, 2026',
    size: '2.9 MB',
    thumb: '/landing/photos/aura-journal-desk.webp',
    alt: 'Open journal page dated October 14 with coffee cup sketch and fountain pen',
    highlight: 'Matched handwritten heading "October 14, 2023" & ink coffee cup illustration',
    excerpt: 'Handwritten entry and botanical margin sketch recognized right inside the scanned page.',
    citation: 'october_14_coffee_sketch.webp · Page Spread',
    tags: ['handwritten', 'coffee', 'sketch', 'october', '14', 'journal', 'note', 'notes'],
  },
  {
    id: 'demo-study-notes',
    filename: 'garden_window_project_notes.pdf',
    type: 'pdf',
    categoryLabel: 'Documents · Study Notes',
    date: 'Oct 03, 2026',
    size: '620 KB',
    thumb: '/landing/photos/aura-study-table.webp',
    alt: 'Wooden study table by a garden window with books, laptop, and sticky notes',
    highlight: 'Reading list & chapter outline — "Preserve daily notes alongside source PDFs"',
    excerpt: 'Full document text indexed cleanly so short phrases surface exact pages.',
    citation: 'garden_window_project_notes.pdf · Page 2',
    tags: ['study', 'desk', 'notes', 'window', 'document', 'pdf', 'reading', 'books'],
  },
  {
    id: 'demo-family-morning',
    filename: 'sunday_kitchen_pears.webp',
    type: 'photo',
    categoryLabel: 'Photos · Home & Family',
    date: 'Sep 08, 2026',
    size: '3.2 MB',
    thumb: '/landing/photos/aura-family-morning.webp',
    alt: 'Hands reaching into a ceramic bowl of green pears on a sunlit wooden table',
    highlight: 'Matched morning kitchen light, green pears, and ceramic mug',
    excerpt: 'Captured on phone and synced quietly to your home archive.',
    citation: 'sunday_kitchen_pears.webp · Family Album',
    tags: ['kitchen', 'morning', 'pears', 'family', 'home', 'light', 'photos'],
  },
  {
    id: 'demo-heirloom-camera',
    filename: 'leica_contact_sheet_notes.md',
    type: 'markdown',
    categoryLabel: 'Notes · Camera Provenance',
    date: 'Sep 22, 2026',
    size: '24 KB',
    thumb: '/landing/photos/aura-heirloom-object.webp',
    alt: 'Vintage silver Leica rangefinder camera beside black-and-white contact sheets',
    highlight: 'Answer: Silver Leica M-series rangefinder paired with 50mm lens and coastal contact sheets.',
    excerpt: 'Synthesized directly from your saved equipment notes and scanned contact sheet labels.',
    citation: 'leica_contact_sheet_notes.md · Entry 4',
    tags: ['film', 'camera', 'contact', 'sheet', 'leica', 'ask', 'which', 'archive'],
  },
]

export const SUPPORTED_FORMAT_GROUPS = [
  {
    group: 'Photos & Screenshots',
    mode: 'Visual Recall + Text Detection',
    badge: 'Indexed',
    formats: ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'BMP', 'HEIC'],
    note: 'Reads text inside screenshots, receipts, and handwritten pages so you can search by what was on screen.',
  },
  {
    group: 'Documents & Notes',
    mode: 'Full Page Search & Citations',
    badge: 'Indexed',
    formats: ['PDF', 'DOCX', 'DOC', 'TXT', 'MD'],
    note: 'Extracts pages and paragraphs cleanly so answers point back to the exact file.',
  },
  {
    group: 'Tables & Spreadsheets',
    mode: 'Structured Search',
    badge: 'Indexed',
    formats: ['XLSX', 'XLS', 'CSV', 'JSON'],
    note: 'Keeps headers and readable table rows searchable right alongside your documents.',
  },
  {
    group: 'Videos',
    mode: 'Private Archive Storage',
    badge: 'Stored + Metadata',
    formats: ['MP4', 'MOV', 'AVI', 'MKV', 'WEBM'],
    note: 'Stored safely in original quality with file metadata and inline playback.',
  },
  {
    group: 'Audio',
    mode: 'Private Playback Storage',
    badge: 'Stored + Metadata',
    formats: ['MP3', 'WAV', 'M4A', 'FLAC', 'OGG'],
    note: 'Kept privately with inline playback and date organization.',
  },
]

export const USE_CASE_ITEMS = [
  {
    role: 'Everyday Households',
    headline: 'Keep family mornings, trips, and important letters together',
    query: 'Kitchen morning with green pears',
    result: 'sunday_kitchen_pears.webp · Family Album',
    photo: '/landing/photos/aura-family-morning.webp',
  },
  {
    role: 'Students & Researchers',
    headline: 'Find lecture notes, handwritten pages, and PDFs in seconds',
    query: 'Study desk notes by the garden window',
    result: 'garden_window_project_notes.pdf · Page 2',
    photo: '/landing/photos/aura-study-table.webp',
  },
  {
    role: 'Writers & Journalers',
    headline: 'Search inside scanned notebooks and handwritten sketches',
    query: 'Handwritten coffee sketch from October 14',
    result: 'october_14_coffee_sketch.webp · Page Spread',
    photo: '/landing/photos/aura-journal-desk.webp',
  },
  {
    role: 'Travelers & Photographers',
    headline: 'Back up every roll cleanly without duplicate clutter',
    query: 'Find the photos from our summer trip',
    result: 'harbor_promenade_august.webp · Summer Trip',
    photo: '/landing/photos/aura-personal-travel.webp',
  },
]

export const FAQ_ITEMS = [
  {
    q: 'What is VectorGallery?',
    a: 'VectorGallery is a calm, open-source home for your photos, screenshots, handwritten notes, and personal documents. It brings mobile backup, smart search, and grounded answers together in one private library you control.',
  },
  {
    q: 'How does searching by memory work?',
    a: 'Type how you remember something — a scene from a trip, a phrase in a scanned notebook, or a detail inside a PDF. VectorGallery reads text inside documents and screenshots automatically and matches your words against your library, even offline.',
  },
  {
    q: 'Is VectorGallery free and open source?',
    a: 'Yes. The entire web app, background processing worker, and Android companion app are open source under the Apache-2.0 license on GitHub.',
  },
  {
    q: 'Can I run everything privately on my own computer?',
    a: 'Yes. You can run VectorGallery locally on your own machine with files saved straight to your disk, or connect your own private cloud storage bucket whenever you are ready.',
  },
  {
    q: 'Do I need external AI accounts to use it?',
    a: 'No. Uploading, browsing, photo timelines, duplicate skipping, text extraction, and offline search all work without any external API keys. Adding a Gemini, Groq, Cohere, or OpenAI key is completely optional for conversational summaries.',
  },
  {
    q: 'Will the Android app ever delete photos from my phone?',
    a: 'Never. Mobile backup is strictly read-only on your phone library — it backs up new memories over Wi-Fi while leaving every original photo and video safely on your device.',
  },
]
