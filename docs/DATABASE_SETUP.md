# VectorGallery — Database Architecture & Setup

VectorGallery uses PostgreSQL with the `pgvector` extension hosted on Supabase.

---

## 1. Migration History

1. `supabase/migrations/20230406025118_init.sql`: Initial vector search tables (`nods_project`, `nods_page`, `nods_page_section`).
2. `supabase/migrations/20260521092518_hybrid_search.sql`: Hybrid keyword (FTS) and vector cosine similarity search functions.
3. `supabase/migrations/20260908_auth_and_keys.sql`: User-level multi-tenancy and encrypted provider keys table.
4. `supabase/migrations/20261117_vectormind_v2_core.sql`: VectorGallery Core:
   - `folders`: Hierarchical folders with parent-child trees.
   - `files`: Master file records with metadata, SHA-256 hashes, OCR text, and FTS triggers.
   - `devices`: Connected mobile and desktop clients.
   - `backup_jobs`: Upload queue and resume states.
   - `collections` & `collection_files`: Smart albums and custom groupings.
   - `tags` & `file_tags`: Auto-detected OCR tags and user labels.
   - `conversations`, `conversation_messages`, `citations`: Grounded assistant conversations and source file citations.
   - `storage_usage`: Per-user quota tracking.
   - `audit_logs`: Immutable action trail.
5. `supabase/migrations/20261117_vectormind_v2_extensions.sql`: Search query history and extended user profiles.

---

## 2. Applying Migrations

### Via Supabase CLI:
```bash
npx supabase login
npx supabase link --project-ref <your-project-id>
npx supabase db push
```

### Via Supabase SQL Editor:
Open your Supabase Project Dashboard $\to$ **SQL Editor** $\to$ Run the SQL contents of:
1. `supabase/migrations/20261117_vectormind_v2_core.sql`
2. `supabase/migrations/20261117_vectormind_v2_extensions.sql`

---

## 3. Row Level Security (RLS) Verification

All tables enforce Row Level Security ensuring strict isolation between user accounts:
```sql
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own files"
    ON public.files FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```
No tenant can view, query, update, or delete any record where `user_id != auth.uid()`.

