-- ============================================================================
-- VectorGallery — Unified All-in-One Supabase Database & Storage Setup
-- Safe & idempotent: run once in Supabase Dashboard -> SQL Editor -> Run
-- Creates all extensions, core & v2 tables, triggers, indexes, RLS policies,
-- hybrid_search RPC, private 'documents' storage bucket, and refreshes schema.
-- ============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- 2. Storage Bucket ('documents', private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Legacy + Vector Search Tables (v1/v2 RAG compatibility)
CREATE TABLE IF NOT EXISTS public.nods_project (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Default Workspace',
  created_at timestamptz DEFAULT now(),
  provider text DEFAULT 'gemini',
  embedding_provider text DEFAULT 'gemini',
  chat_provider text DEFAULT 'groq'
);

ALTER TABLE public.nods_project ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

INSERT INTO public.nods_project (id, name, provider, embedding_provider, chat_provider)
VALUES ('00000000-0000-0000-0000-000000000001', 'Personal Cloud Vault', 'gemini', 'gemini', 'groq')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.nods_page (
  id bigserial PRIMARY KEY,
  parent_page_id bigint REFERENCES public.nods_page(id) ON DELETE SET NULL,
  project_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  path text NOT NULL,
  checksum text,
  meta jsonb DEFAULT '{}'::jsonb,
  type text,
  source text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.nods_page ADD COLUMN IF NOT EXISTS project_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.nods_page ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.nods_page ADD COLUMN IF NOT EXISTS meta jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_nods_page_project_id ON public.nods_page(project_id);
CREATE INDEX IF NOT EXISTS idx_nods_page_user_id ON public.nods_page(user_id);

CREATE TABLE IF NOT EXISTS public.nods_page_section (
  id bigserial PRIMARY KEY,
  page_id bigint NOT NULL REFERENCES public.nods_page(id) ON DELETE CASCADE,
  content text,
  token_count int,
  embedding vector(768),
  slug text,
  heading text,
  heading_context text,
  page_number int DEFAULT 1,
  chunk_level int DEFAULT 1,
  chunk_index int DEFAULT 0,
  fts tsvector
);

ALTER TABLE public.nods_page_section ADD COLUMN IF NOT EXISTS fts tsvector;
ALTER TABLE public.nods_page_section ADD COLUMN IF NOT EXISTS heading_context text;
ALTER TABLE public.nods_page_section ADD COLUMN IF NOT EXISTS page_number int DEFAULT 1;
ALTER TABLE public.nods_page_section ADD COLUMN IF NOT EXISTS chunk_level int DEFAULT 1;
ALTER TABLE public.nods_page_section ADD COLUMN IF NOT EXISTS chunk_index int DEFAULT 0;

CREATE OR REPLACE FUNCTION public.nods_page_section_fts_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.fts := to_tsvector('english', coalesce(NEW.heading, '') || ' ' || coalesce(NEW.heading_context, '') || ' ' || coalesce(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_nods_page_section_fts ON public.nods_page_section;
CREATE TRIGGER trg_nods_page_section_fts
  BEFORE INSERT OR UPDATE ON public.nods_page_section
  FOR EACH ROW
  EXECUTE FUNCTION public.nods_page_section_fts_trigger();

CREATE INDEX IF NOT EXISTS idx_nods_page_section_page_id ON public.nods_page_section(page_id);
CREATE INDEX IF NOT EXISTS idx_nods_page_section_fts ON public.nods_page_section USING gin(fts);

-- 4. User Provider Keys (BYOK Encrypted Storage)
CREATE TABLE IF NOT EXISTS public.user_provider_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('gemini', 'openai', 'groq', 'cohere')),
  encrypted_api_key text NOT NULL,
  key_last4 text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- 5. Core Personal AI Cloud Tables (v2)
CREATE TABLE IF NOT EXISTS public.folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.folders(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#1D9E75',
  icon text DEFAULT 'folder',
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON public.folders(parent_id);

CREATE TABLE IF NOT EXISTS public.files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES public.folders(id) ON DELETE SET NULL,
  original_name text NOT NULL,
  sanitized_name text NOT NULL,
  mime_type text NOT NULL,
  category text NOT NULL CHECK (category IN ('photos', 'videos', 'documents', 'audio', 'screenshots', 'other')),
  size_bytes bigint NOT NULL DEFAULT 0,
  storage_key text NOT NULL,
  storage_provider text NOT NULL DEFAULT 'supabase',
  sha256_hash text NOT NULL,
  thumbnail_url text,
  extracted_text text,
  fts tsvector,
  processing_status text NOT NULL DEFAULT 'PENDING' CHECK (processing_status IN ('PENDING', 'VALIDATING', 'EXTRACTING', 'GENERATING_METADATA', 'GENERATING_EMBEDDINGS', 'INDEXING', 'READY', 'FAILED')),
  indexing_status text NOT NULL DEFAULT 'PENDING' CHECK (indexing_status IN ('PENDING', 'INDEXED', 'SKIPPED', 'FAILED')),
  processing_error text,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_favorite boolean NOT NULL DEFAULT false,
  is_trashed boolean NOT NULL DEFAULT false,
  trashed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_category ON public.files(user_id, category);
CREATE INDEX IF NOT EXISTS idx_files_sha256 ON public.files(user_id, sha256_hash);
CREATE INDEX IF NOT EXISTS idx_files_is_trashed ON public.files(user_id, is_trashed);
CREATE INDEX IF NOT EXISTS idx_files_is_favorite ON public.files(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON public.files(folder_id);

CREATE OR REPLACE FUNCTION public.files_fts_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.fts := setweight(to_tsvector('english', coalesce(NEW.original_name, '')), 'A') ||
             setweight(to_tsvector('english', coalesce(NEW.category, '')), 'B') ||
             setweight(to_tsvector('english', coalesce(NEW.extracted_text, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_files_fts ON public.files;
CREATE TRIGGER trg_files_fts
  BEFORE INSERT OR UPDATE ON public.files
  FOR EACH ROW
  EXECUTE FUNCTION public.files_fts_trigger();

CREATE INDEX IF NOT EXISTS idx_files_fts ON public.files USING gin(fts);

CREATE TABLE IF NOT EXISTS public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('android', 'ios', 'web', 'macos', 'windows', 'linux')),
  device_identifier text NOT NULL,
  app_version text,
  last_sync_at timestamptz,
  sync_status text DEFAULT 'IDLE' CHECK (sync_status IN ('IDLE', 'SYNCING', 'PAUSED', 'ERROR')),
  settings jsonb DEFAULT '{"wifi_only": false, "auto_backup": true, "categories": ["photos", "documents", "screenshots"]}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_identifier)
);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);

CREATE TABLE IF NOT EXISTS public.backup_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE CASCADE,
  file_id uuid REFERENCES public.files(id) ON DELETE SET NULL,
  local_path text NOT NULL,
  sha256_hash text NOT NULL,
  file_size bigint NOT NULL,
  status text NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'UPLOADING', 'COMPLETED', 'FAILED', 'PAUSED')),
  progress_percentage float NOT NULL DEFAULT 0.0,
  retry_count int NOT NULL DEFAULT 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_user_status ON public.backup_jobs(user_id, status);

CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'custom' CHECK (type IN ('custom', 'screenshots', 'important', 'work', 'college', 'bills', 'travel', 'duplicates', 'diwali')),
  filter_criteria jsonb DEFAULT '{}'::jsonb,
  is_smart boolean NOT NULL DEFAULT false,
  icon text,
  cover_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_files (
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, file_id)
);

CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  source text NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'ocr', 'ai')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS public.file_tags (
  file_id uuid NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (file_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New Conversation',
  provider text DEFAULT 'gemini',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  confidence_level text CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW')),
  grounding_score float,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.conversation_messages(id) ON DELETE CASCADE,
  file_id uuid REFERENCES public.files(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  page_number int,
  excerpt text NOT NULL,
  similarity float,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.storage_usage (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_bytes_used bigint NOT NULL DEFAULT 0,
  total_bytes_quota bigint NOT NULL DEFAULT 16106127360,
  file_count int NOT NULL DEFAULT 0,
  photos_count int NOT NULL DEFAULT 0,
  videos_count int NOT NULL DEFAULT 0,
  documents_count int NOT NULL DEFAULT 0,
  audio_count int NOT NULL DEFAULT 0,
  screenshots_count int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  ip_address text,
  user_agent text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  result_count int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  storage_quota_bytes bigint DEFAULT 16106127360,
  backup_settings jsonb DEFAULT '{"auto_backup": true, "wifi_only": false, "categories": ["photos", "documents", "screenshots"]}'::jsonb,
  theme text DEFAULT 'dark',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Row Level Security Policies (Strict per-user isolation)
ALTER TABLE public.nods_project ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nods_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nods_page_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_provider_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own or unowned projects" ON public.nods_project;
CREATE POLICY "Users see own or unowned projects" ON public.nods_project FOR ALL
  USING (user_id = auth.uid() OR user_id IS NULL) WITH CHECK (true);

DROP POLICY IF EXISTS "Users see own or unowned pages" ON public.nods_page;
CREATE POLICY "Users see own or unowned pages" ON public.nods_page FOR ALL
  USING (user_id = auth.uid() OR user_id IS NULL) WITH CHECK (true);

DROP POLICY IF EXISTS "Users see own sections" ON public.nods_page_section;
CREATE POLICY "Users see own sections" ON public.nods_page_section FOR ALL
  USING (EXISTS (SELECT 1 FROM public.nods_page p WHERE p.id = nods_page_section.page_id AND (p.user_id = auth.uid() OR p.user_id IS NULL)))
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own keys" ON public.user_provider_keys;
CREATE POLICY "Users can manage own keys" ON public.user_provider_keys FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own folders" ON public.folders;
CREATE POLICY "Users can manage own folders" ON public.folders FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own files" ON public.files;
CREATE POLICY "Users can manage own files" ON public.files FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own devices" ON public.devices;
CREATE POLICY "Users can manage own devices" ON public.devices FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own backup jobs" ON public.backup_jobs;
CREATE POLICY "Users can manage own backup jobs" ON public.backup_jobs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own collections" ON public.collections;
CREATE POLICY "Users can manage own collections" ON public.collections FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own collection files" ON public.collection_files;
CREATE POLICY "Users can manage own collection files" ON public.collection_files FOR ALL
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_files.collection_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_files.collection_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own tags" ON public.tags;
CREATE POLICY "Users can manage own tags" ON public.tags FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own file tags" ON public.file_tags;
CREATE POLICY "Users can manage own file tags" ON public.file_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM public.files f WHERE f.id = file_tags.file_id AND f.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.files f WHERE f.id = file_tags.file_id AND f.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own conversations" ON public.conversations;
CREATE POLICY "Users can manage own conversations" ON public.conversations FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own conversation messages" ON public.conversation_messages;
CREATE POLICY "Users can manage own conversation messages" ON public.conversation_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_messages.conversation_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_messages.conversation_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can read own citations" ON public.citations;
CREATE POLICY "Users can read own citations" ON public.citations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.conversation_messages m JOIN public.conversations c ON m.conversation_id = c.id WHERE m.id = citations.message_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversation_messages m JOIN public.conversations c ON m.conversation_id = c.id WHERE m.id = citations.message_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view own storage usage" ON public.storage_usage;
CREATE POLICY "Users can view own storage usage" ON public.storage_usage FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own search history" ON public.search_history;
CREATE POLICY "Users can manage own search history" ON public.search_history FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
CREATE POLICY "Users can manage own profile" ON public.user_profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 7. Unified Hybrid Search RPC (matches v1 + v2 API calls cleanly)
DROP FUNCTION IF EXISTS public.hybrid_search(vector, text, int, float);
DROP FUNCTION IF EXISTS public.hybrid_search(text, vector, text, int, float);

CREATE OR REPLACE FUNCTION public.hybrid_search(
  query_embedding vector(768),
  query_text text,
  p_project_id text DEFAULT '00000000-0000-0000-0000-000000000001',
  match_count int DEFAULT 10,
  similarity_threshold float DEFAULT 0.25
)
RETURNS TABLE (
  id bigint,
  page_id bigint,
  slug text,
  heading text,
  content text,
  similarity float,
  rrf_score float,
  chunk_level int,
  heading_context text,
  page_number int,
  token_count int
)
LANGUAGE plpgsql AS $$
DECLARE
  cleaned_query text;
BEGIN
  cleaned_query := trim(coalesce(query_text, ''));

  RETURN QUERY
  WITH semantic_results AS (
    SELECT s.id,
           row_number() OVER (ORDER BY (1 - (s.embedding <=> query_embedding)) DESC) AS rank
    FROM public.nods_page_section s
    JOIN public.nods_page p ON p.id = s.page_id
    WHERE (p_project_id IS NULL OR p.project_id = p_project_id)
      AND s.embedding IS NOT NULL
      AND (1 - (s.embedding <=> query_embedding)) > similarity_threshold
  ),
  keyword_results AS (
    SELECT s.id,
           row_number() OVER (ORDER BY ts_rank(s.fts, websearch_to_tsquery('english', cleaned_query)) DESC) AS rank
    FROM public.nods_page_section s
    JOIN public.nods_page p ON p.id = s.page_id
    WHERE (p_project_id IS NULL OR p.project_id = p_project_id)
      AND cleaned_query <> ''
      AND s.fts @@ websearch_to_tsquery('english', cleaned_query)
  )
  SELECT
    n.id,
    n.page_id,
    n.slug,
    n.heading,
    n.content,
    (1 - (n.embedding <=> query_embedding))::float AS similarity,
    (coalesce(1.0 / (60.0 + sem.rank), 0.0) + coalesce(1.0 / (60.0 + kw.rank), 0.0))::float AS rrf_score,
    n.chunk_level,
    n.heading_context,
    n.page_number,
    n.token_count
  FROM semantic_results sem
  FULL OUTER JOIN keyword_results kw ON sem.id = kw.id
  JOIN public.nods_page_section n ON n.id = coalesce(sem.id, kw.id)
  ORDER BY rrf_score DESC, similarity DESC
  LIMIT match_count;
END;
$$;

-- 8. Schema, Table, Sequence & Function Grants (Fixes Postgres 42501 permission denied)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- 9. Reload PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';

