-- ============================================================================
-- VectorGallery — Extensions Migration (Search History & Profiles)
-- Migration: 20261117_vectormind_v2_extensions.sql
-- Safe, non-destructive expansion for user profiles & search analytics
-- ============================================================================

-- 1. Search History
CREATE TABLE IF NOT EXISTS public.search_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query text NOT NULL,
    filters jsonb DEFAULT '{}'::jsonb,
    result_count int DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own search history" ON public.search_history;
CREATE POLICY "Users can manage own search history"
    ON public.search_history FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id, created_at DESC);

-- 2. User Profiles & Extended Settings
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    storage_quota_bytes bigint DEFAULT 16106127360,
    backup_settings jsonb DEFAULT '{"auto_backup": true, "wifi_only": true, "categories": ["photos", "documents", "screenshots"]}'::jsonb,
    theme text DEFAULT 'dark',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
CREATE POLICY "Users can manage own profile"
    ON public.user_profiles FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

