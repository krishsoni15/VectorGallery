-- ============================================================================
-- VectorGallery — Core Database Schema Migration
-- Migration: 20261117_vectormind_v2_core.sql
-- Safe, non-destructive, idempotent expansion for Personal AI Cloud
-- ============================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 2. Hierarchical Folders
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

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own folders" ON public.folders;
CREATE POLICY "Users can manage own folders"
    ON public.folders FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON public.folders(parent_id);

-- 3. Core Files Table
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

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own files" ON public.files;
CREATE POLICY "Users can manage own files"
    ON public.files FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_category ON public.files(user_id, category);
CREATE INDEX IF NOT EXISTS idx_files_sha256 ON public.files(user_id, sha256_hash);
CREATE INDEX IF NOT EXISTS idx_files_is_trashed ON public.files(user_id, is_trashed);
CREATE INDEX IF NOT EXISTS idx_files_is_favorite ON public.files(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON public.files(folder_id);

-- Full text search trigger for files
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

-- 4. Connected Devices (Mobile & Desktop)
CREATE TABLE IF NOT EXISTS public.devices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_name text NOT NULL,
    platform text NOT NULL CHECK (platform IN ('android', 'ios', 'web', 'macos', 'windows', 'linux')),
    device_identifier text NOT NULL,
    app_version text,
    last_sync_at timestamptz,
    sync_status text DEFAULT 'IDLE' CHECK (sync_status IN ('IDLE', 'SYNCING', 'PAUSED', 'ERROR')),
    settings jsonb DEFAULT '{"wifi_only": true, "auto_backup": true, "categories": ["photos", "documents", "screenshots"]}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, device_identifier)
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own devices" ON public.devices;
CREATE POLICY "Users can manage own devices"
    ON public.devices FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);

-- 5. Mobile Backup Jobs
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

ALTER TABLE public.backup_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own backup jobs" ON public.backup_jobs;
CREATE POLICY "Users can manage own backup jobs"
    ON public.backup_jobs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_backup_jobs_user_status ON public.backup_jobs(user_id, status);

-- 6. Collections & Smart Memories
CREATE TABLE IF NOT EXISTS public.collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    type text NOT NULL DEFAULT 'custom' CHECK (type IN ('custom', 'screenshots', 'important', 'work', 'college', 'bills', 'travel', 'duplicates')),
    filter_criteria jsonb DEFAULT '{}'::jsonb,
    is_smart boolean NOT NULL DEFAULT false,
    icon text,
    cover_image_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own collections" ON public.collections;
CREATE POLICY "Users can manage own collections"
    ON public.collections FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.collection_files (
    collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    file_id uuid NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    added_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (collection_id, file_id)
);

ALTER TABLE public.collection_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own collection files" ON public.collection_files;
CREATE POLICY "Users can manage own collection files"
    ON public.collection_files FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.collections c 
            WHERE c.id = collection_files.collection_id AND c.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.collections c 
            WHERE c.id = collection_files.collection_id AND c.user_id = auth.uid()
        )
    );

-- 7. Tags & File Tags
CREATE TABLE IF NOT EXISTS public.tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    source text NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'ocr', 'ai')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, name)
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own tags" ON public.tags;
CREATE POLICY "Users can manage own tags"
    ON public.tags FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.file_tags (
    file_id uuid NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (file_id, tag_id)
);

ALTER TABLE public.file_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own file tags" ON public.file_tags;
CREATE POLICY "Users can manage own file tags"
    ON public.file_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.files f 
            WHERE f.id = file_tags.file_id AND f.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.files f 
            WHERE f.id = file_tags.file_id AND f.user_id = auth.uid()
        )
    );

-- 8. Persistent Conversations & Citations
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL DEFAULT 'New Conversation',
    provider text DEFAULT 'gemini',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own conversations" ON public.conversations;
CREATE POLICY "Users can manage own conversations"
    ON public.conversations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.conversation_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content text NOT NULL,
    confidence_level text CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW')),
    grounding_score float,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own conversation messages" ON public.conversation_messages;
CREATE POLICY "Users can manage own conversation messages"
    ON public.conversation_messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = conversation_messages.conversation_id AND c.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = conversation_messages.conversation_id AND c.user_id = auth.uid()
        )
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

ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own citations" ON public.citations;
CREATE POLICY "Users can read own citations"
    ON public.citations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_messages m
            JOIN public.conversations c ON m.conversation_id = c.id
            WHERE m.id = citations.message_id AND c.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversation_messages m
            JOIN public.conversations c ON m.conversation_id = c.id
            WHERE m.id = citations.message_id AND c.user_id = auth.uid()
        )
    );

-- 9. Storage Usage Quotas & Audit Logs
CREATE TABLE IF NOT EXISTS public.storage_usage (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_bytes_used bigint NOT NULL DEFAULT 0,
    total_bytes_quota bigint NOT NULL DEFAULT 16106127360, -- 15 GB
    file_count int NOT NULL DEFAULT 0,
    photos_count int NOT NULL DEFAULT 0,
    videos_count int NOT NULL DEFAULT 0,
    documents_count int NOT NULL DEFAULT 0,
    audio_count int NOT NULL DEFAULT 0,
    screenshots_count int NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.storage_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own storage usage" ON public.storage_usage;
CREATE POLICY "Users can view own storage usage"
    ON public.storage_usage FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

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

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

