-- ============================================================
-- AI Brand Architect — Supabase Migration v1
-- How to run: npx supabase db push
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============================================================
-- TABLES
-- ============================================================

-- profiles: extends auth.users, created automatically on signup
CREATE TABLE IF NOT EXISTS public.profiles (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              TEXT NOT NULL,
  full_name          TEXT,
  avatar_url         TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- subscriptions: synced from Stripe via webhook
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                   TEXT PRIMARY KEY,          -- Stripe subscription ID e.g. sub_xxx
  user_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status               TEXT NOT NULL,             -- active | trialing | past_due | canceled
  price_id             TEXT NOT NULL,             -- Stripe Price ID e.g. price_xxx
  quantity             INTEGER DEFAULT 1,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- projects: user's brand strategy inputs
CREATE TABLE IF NOT EXISTS public.projects (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  product_idea         TEXT NOT NULL,
  niche                TEXT NOT NULL,
  target_audience      TEXT NOT NULL,
  budget_range         TEXT,
  competitors          TEXT[],
  unique_selling_point TEXT,
  status               TEXT NOT NULL DEFAULT 'draft', -- draft | generating | complete | failed
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- brand_kits: the AI-generated output, linked to a project
CREATE TABLE IF NOT EXISTS public.brand_kits (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id         UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  market_analysis    JSONB,   -- Node 1 output
  positioning        JSONB,   -- Node 2 output
  offer              JSONB,   -- Node 3 output
  copy               JSONB,   -- Node 4 output
  ad_strategy        JSONB,   -- Node 5 output
  launch_plan        JSONB,   -- Node 6 output
  generation_time_ms INTEGER,
  model_version      TEXT DEFAULT 'claude-sonnet-4-20250514',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  embedding          vector(1536)  -- pgvector: ready for future RAG features
);

-- Vector search index (for future "find similar brand kits" feature)
CREATE INDEX IF NOT EXISTS brand_kits_embedding_idx
  ON public.brand_kits
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Automatically create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_brand_kits_updated_at
  BEFORE UPDATE ON public.brand_kits
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Every table is locked down. Users can only see their own data.
-- ============================================================

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits    ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- subscriptions (read-only for users; webhook writes via service_role)
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL USING (auth.role() = 'service_role');

-- projects
CREATE POLICY "Users can manage own projects"
  ON public.projects FOR ALL USING (auth.uid() = user_id);

-- brand_kits
CREATE POLICY "Users can view own brand kits"
  ON public.brand_kits FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand kits"
  ON public.brand_kits FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage brand kits"
  ON public.brand_kits FOR ALL USING (auth.role() = 'service_role');
