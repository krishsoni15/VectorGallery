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
 * Diverse 12-photo curated gallery audited against public/landing/photos/.
 * Interleaves botanical landscapes, human moments, studio workspaces, and archival scans
 * while reflecting section assignments in components/landing/ARCHITECTURE.md.
 */
export const CURATED_PHOTOS: ShowcasePhoto[] = [
  {
    id: 'ph-mountain',
    src: '/landing/photos/mountain-pass.webp',
    alt: 'Winding highland road cutting through emerald green misty hills',
    title: 'Highland Pass Morning',
    category: 'Travel',
    date: 'Nov 24',
    meta: 'RAW · 35mm f/2.8',
    assignedSection: 'Hero Canvas + Search Demo',
  },
  {
    id: 'ph-workspace',
    src: '/landing/photos/workspace-journal.webp',
    alt: 'Laptop, handwritten grid notebook with sketches, and rangefinder camera on wooden desk',
    title: 'Studio Architecture Notes',
    category: 'Work',
    date: 'Nov 15',
    meta: 'OCR Indexed',
    assignedSection: 'Hero Vault Hub + Search Demo',
  },
  {
    id: 'ph-coffee',
    src: '/landing/photos/coffee-ritual.webp',
    alt: 'Pour-over glass Chemex carafe brewing coffee with gooseneck kettle',
    title: 'Sunday Pour-Over',
    category: 'Personal',
    date: 'Oct 29',
    meta: 'Mobile Roll',
    assignedSection: 'Product Showcase + Final Invitation',
  },
  {
    id: 'ph-pages',
    src: '/landing/photos/archive-pages.webp',
    alt: 'Collection of open printed book pages arranged across an archival backdrop',
    title: 'Editorial Research Scans',
    category: 'Documents',
    date: 'Sep 25',
    meta: 'PDF + OCR',
    assignedSection: 'Search Demo (Documents)',
  },
  {
    id: 'ph-lake',
    src: '/landing/photos/lake-morning.webp',
    alt: 'Canoe paddler crossing a calm turquoise alpine lake lined with evergreens',
    title: 'Calm Morning Lake',
    category: 'Personal',
    date: 'Nov 19',
    meta: 'JPEG · 24 MP',
    assignedSection: 'Hero Canvas + Mobile Sync',
  },
  {
    id: 'ph-camera',
    src: '/landing/photos/analog-camera.webp',
    alt: 'Classic silver Zeiss Ikon rangefinder camera resting on piano keys',
    title: 'Analog Rangefinder',
    category: 'Work',
    date: 'Oct 08',
    meta: 'PNG · Archive',
    assignedSection: 'Product Showcase (Photos)',
  },
  {
    id: 'ph-cafe',
    src: '/landing/photos/quiet-cafe.webp',
    alt: 'Morning sunlight across a wooden cafe table with espresso cups and smartphone',
    title: 'Morning Study Session',
    category: 'Work',
    date: 'Sep 18',
    meta: 'OCR Ready',
    assignedSection: 'Search Demo (Receipts)',
  },
  {
    id: 'ph-coast',
    src: '/landing/photos/coastal-cliffs.webp',
    alt: 'Sandstone sea stacks and rugged coastal cliffs washed by deep teal ocean waves',
    title: 'Coastal Sea Stacks',
    category: 'Travel',
    date: 'Oct 02',
    meta: 'Mobile Backup',
    assignedSection: 'Product Showcase (Photos)',
  },
  {
    id: 'ph-reader',
    src: '/landing/photos/outdoor-reader.webp',
    alt: 'Hands holding an e-reader with crisp book typography outdoors over green grass',
    title: 'Field Reading Notes',
    category: 'Documents',
    date: 'Sep 12',
    meta: 'DOCX + Text',
    assignedSection: 'Search Demo (Ask AI)',
  },
  {
    id: 'ph-arch',
    src: '/landing/photos/stone-architecture.webp',
    alt: 'Historic white stone castle surrounded by dense evergreen alpine forest',
    title: 'Forest Ridge Architecture',
    category: 'Travel',
    date: 'Oct 14',
    meta: 'SHA-256 Verified',
    assignedSection: 'Product Showcase + Privacy',
  },
  {
    id: 'ph-studio',
    src: '/landing/photos/studio-desk.webp',
    alt: 'Monochrome workspace desk with mechanical keyboard, ceramic mug, and mouse',
    title: 'Late Night Desk Setup',
    category: 'Work',
    date: 'Nov 02',
    meta: 'Dual OCR',
    assignedSection: 'Search Demo (Screenshot OCR)',
  },
  {
    id: 'ph-valley',
    src: '/landing/photos/valley-reflection.webp',
    alt: 'Granite cliff walls and green pine trees reflected in a clear mountain river',
    title: 'Valley Mirror Stream',
    category: 'Travel',
    date: 'Oct 21',
    meta: '50mm · f/4.0',
    assignedSection: 'Product Showcase + Final Invitation',
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
  'Find my photos from the mountains.',
  'Find the screenshot with AWS pricing.',
  'Show my college admission PDF.',
  'Find receipts from last month.',
  'Summarize my Docker notes.',
  'Find my project requirements.',
]

export const SYNTHETIC_SEARCH_CATALOG: DemoSearchResult[] = [
  {
    id: 'demo-mountains',
    filename: 'Highland_Pass_Horizon.webp',
    type: 'photo',
    categoryLabel: 'Photos · Travel Archive',
    date: 'Nov 24, 2026',
    size: '4.2 MB',
    thumb: '/landing/photos/mountain-pass.webp',
    alt: 'Winding highland mountain road through green misty hills',
    highlight: 'Semantic photo recall matched misty green highlands & winding pass geometry',
    excerpt: 'Captured at 35mm · Backed up from Android with SHA-256 checksum deduplication.',
    citation: 'Highland_Pass_Horizon.webp · EXIF metadata',
    tags: ['mountain', 'mountains', 'photos', 'travel', 'ridge', 'landscape', 'highland'],
  },
  {
    id: 'demo-fjord',
    filename: 'Nordic_Summit_Trail.webp',
    type: 'photo',
    categoryLabel: 'Photos · Alpine Overlook',
    date: 'Nov 10, 2026',
    size: '5.1 MB',
    thumb: '/landing/photos/fjord-overlook.webp',
    alt: 'Rocky Nordic fjord cliff overlooking clear blue channel',
    highlight: 'Matched alpine plateau overlook and deep fjord channel landscape',
    excerpt: 'Indexed in Personal Travel folder · Verified unique SHA-256 content hash.',
    citation: 'Nordic_Summit_Trail.webp · Personal Vault',
    tags: ['mountain', 'mountains', 'photos', 'lake', 'cliff', 'fjord', 'summit'],
  },
  {
    id: 'demo-aws',
    filename: 'aws_ec2_pricing_console.png',
    type: 'screenshot',
    categoryLabel: 'Screenshots · Cloud Billing',
    date: 'Nov 18, 2026',
    size: '640 KB',
    thumb: '/landing/photos/studio-desk.webp',
    alt: 'Monochrome developer desk setup representing cloud console screenshot capture',
    highlight: 'c6i.large On-Demand: $0.085/hr · t3.medium Linux: $0.0416/hr · EBS gp3: $0.08/GB-mo',
    excerpt: 'Dual OCR engine classified mobile screenshot under cloud pricing tables & terminal capture.',
    citation: 'aws_ec2_pricing_console.png · OCR extracted region',
    tags: ['aws', 'pricing', 'screenshot', 'ec2', 'cloud', 'cost'],
  },
  {
    id: 'demo-admission',
    filename: 'university_admission_letter_2026.pdf',
    type: 'pdf',
    categoryLabel: 'Documents · Official PDF',
    date: 'Oct 12, 2026',
    size: '1.1 MB',
    thumb: '/landing/photos/archive-pages.webp',
    alt: 'Open archival book pages representing indexed PDF documents',
    highlight: 'Page 1: Offer of Admission — Fall Semester Enrollment & Registrar Verification ID #AD-4092',
    excerpt: 'Parsed via unpdf text extraction and indexed into searchable document chunks.',
    citation: 'university_admission_letter_2026.pdf · Page 1',
    tags: ['college', 'admission', 'pdf', 'university', 'letter'],
  },
  {
    id: 'demo-receipts',
    filename: 'studio_supplies_receipt_oct.pdf',
    type: 'pdf',
    categoryLabel: 'Documents · Expense Receipt',
    date: 'Oct 28, 2026',
    size: '420 KB',
    thumb: '/landing/photos/quiet-cafe.webp',
    alt: 'Wooden cafe table with espresso cups and phone representing expense receipts',
    highlight: 'Subtotal: $128.40 · Tax: $10.27 · Total Paid: $138.67 (Receipt #ST-8841)',
    excerpt: 'Detected receipt category from extracted header & payment line items.',
    citation: 'studio_supplies_receipt_oct.pdf · Page 1',
    tags: ['receipt', 'receipts', 'bill', 'invoice', 'month', 'expense'],
  },
  {
    id: 'demo-docker',
    filename: 'docker_compose_architecture.md',
    type: 'markdown',
    categoryLabel: 'Documents · Developer Notes',
    date: 'Nov 03, 2026',
    size: '18 KB',
    thumb: '/landing/photos/workspace-journal.webp',
    alt: 'Laptop and handwritten engineering notebook on wooden desk',
    highlight: 'Summary: Multi-stage alpine containers, pgvector healthcheck volumes & non-root worker loop.',
    excerpt: 'Grounded assistant synthesizes bullet summary citing exact markdown lines.',
    citation: 'docker_compose_architecture.md · Section 2',
    tags: ['docker', 'containers', 'notes', 'summarize', 'compose'],
  },
  {
    id: 'demo-requirements',
    filename: 'project_requirements_v2_spec.docx',
    type: 'pdf',
    categoryLabel: 'Documents · Project Spec',
    date: 'Nov 14, 2026',
    size: '310 KB',
    thumb: '/landing/photos/outdoor-reader.webp',
    alt: 'Handheld e-reader displaying crisp project text outdoors',
    highlight: 'Milestones: Web uploads (50MB bound), SQLite backup queue & strict RLS multi-tenant policies.',
    excerpt: 'Extracted DOCX XML text paragraphs for instant keyword and semantic matching.',
    citation: 'project_requirements_v2_spec.docx · Paragraph 4',
    tags: ['project', 'requirements', 'spec', 'docx', 'milestones'],
  },
]

export const SUPPORTED_FORMAT_GROUPS = [
  {
    group: 'Images & Screenshots',
    mode: 'Optical OCR + Visual Preview',
    badge: 'Analyzed',
    formats: ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'BMP', 'HEIC'],
    note: 'Images run through dual OCR extraction and automated screenshot classification (code, receipts, consoles).',
  },
  {
    group: 'Documents & Books',
    mode: 'Full Text Chunking & Indexing',
    badge: 'Parsed',
    formats: ['PDF', 'DOCX', 'DOC', 'TXT', 'MD'],
    note: 'PDF pages and DOCX XML paragraphs are chunked, embedded optionally with your provider key, and cited by page.',
  },
  {
    group: 'Spreadsheets & Data',
    mode: 'Structured Header & Row Extraction',
    badge: 'Parsed',
    formats: ['XLSX', 'XLS', 'CSV', 'JSON'],
    note: 'Extracts column headers, sheet names, and readable structured records for instant search queries.',
  },
  {
    group: 'Video Vault',
    mode: 'Metadata & Private Archive Storage',
    badge: 'Stored + Metadata',
    formats: ['MP4', 'MOV', 'AVI', 'MKV', 'WEBM'],
    note: 'Archived non-destructively with file metadata, size, and MIME indexing (frame-by-frame video transcription is not claimed).',
  },
  {
    group: 'Audio Recordings',
    mode: 'Metadata & Playback Storage',
    badge: 'Stored + Metadata',
    formats: ['MP3', 'WAV', 'M4A', 'FLAC', 'OGG'],
    note: 'Stored safely with metadata tagging and inline playback (speech-to-text transcription is not enabled out of the box).',
  },
]

export const USE_CASE_ITEMS = [
  {
    role: 'Students',
    headline: 'Keep admission letters, syllabi & notes together',
    query: 'Show my college admission PDF',
    result: 'university_admission_letter_2026.pdf · Page 1 citation',
    photo: '/landing/photos/archive-pages.webp',
  },
  {
    role: 'Developers',
    headline: 'Search terminal screenshots, logs & Markdown specs',
    query: 'Find the screenshot with AWS pricing',
    result: 'aws_ec2_pricing_console.png · OCR table match',
    photo: '/landing/photos/workspace-journal.webp',
  },
  {
    role: 'Professionals',
    headline: 'Surface receipts, bills & contracts on demand',
    query: 'Find receipts from last month',
    result: 'studio_supplies_receipt_oct.pdf · $138.67 total',
    photo: '/landing/photos/quiet-cafe.webp',
  },
  {
    role: 'Creators & Photographers',
    headline: 'Preserve camera rolls with zero duplicates',
    query: 'Find my photos from the mountains',
    result: 'Highland_Pass_Horizon.webp · SHA-256 verified',
    photo: '/landing/photos/analog-camera.webp',
  },
  {
    role: 'Researchers',
    headline: 'Ask questions grounded directly in PDF sources',
    query: 'Summarize my Docker notes',
    result: 'Synthesized bullet brief + cited markdown sections',
    photo: '/landing/photos/outdoor-reader.webp',
  },
  {
    role: 'Everyday Households',
    headline: 'Back up Android memories automatically over Wi-Fi',
    query: 'Back up recent camera captures',
    result: 'Non-destructive Flutter queue · Wi-Fi only supported',
    photo: '/landing/photos/coffee-ritual.webp',
  },
]

export const FAQ_ITEMS = [
  {
    q: 'What is VectorGallery?',
    a: 'VectorGallery is an open-source Personal AI Cloud and Digital Memory platform that combines private photo and file storage, multi-format text extraction, OCR for screenshots and scanned notes, hybrid natural-language search, a grounded AI assistant, and a Flutter Android backup companion.',
  },
  {
    q: 'How does AI search work?',
    a: 'When external embedding keys (Gemini, Cohere, or OpenAI) are configured alongside PostgreSQL pgvector, VectorGallery runs hybrid keyword + semantic vector search. When running offline or without keys, its multilingual Unicode smart matcher scores exact phrases, bigrams, and category signals locally.',
  },
  {
    q: 'Is VectorGallery open source?',
    a: 'Yes. The web application, background ingestion worker, SQL migrations, and Flutter mobile source code are published under the Apache-2.0 license on GitHub.',
  },
  {
    q: 'Can I run it locally?',
    a: 'Yes. VectorGallery runs out of the box on your local machine using the LocalStorageDriver (storing binaries cleanly on local disk and metadata in JSON) with zero external cloud dependencies required.',
  },
  {
    q: 'Do I need AI API keys?',
    a: 'No. Uploads, SHA-256 deduplication, photo timeline browsing, collections, previews, downloads, heuristic OCR, and offline keyword retrieval all work cleanly without any AI API key. Adding a Gemini, Groq, Cohere, or OpenAI key unlocks neural embeddings and streaming LLM synthesis.',
  },
  {
    q: 'Can I back up my Android phone?',
    a: 'Yes. The Flutter companion app (located in mobile/) scans camera roll folders, screenshots, and documents, queues unique files in a persistent SQLite queue, and uploads with exponential backoff and an optional Wi-Fi-only guard. Sync is strictly non-destructive on your phone library.',
  },
]
