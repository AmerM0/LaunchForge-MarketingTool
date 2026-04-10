-- ============================================================
-- Migration 002 — Add unique constraint on brand_kits.project_id
-- This ensures each project has at most one brand kit and allows
-- proper upsert behavior (ON CONFLICT DO UPDATE).
-- Run: npx supabase db push
-- ============================================================

ALTER TABLE public.brand_kits
  ADD CONSTRAINT brand_kits_project_id_key UNIQUE (project_id);
