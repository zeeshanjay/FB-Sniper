-- Migration 002: Add target_groups table
-- Run this in Supabase SQL Editor

-- ============================================
-- target_groups TABLE
-- Stores user-defined Facebook groups to target
-- ============================================
CREATE TABLE IF NOT EXISTS public.target_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_target_groups_user_id ON public.target_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_target_groups_is_active ON public.target_groups(is_active);

ALTER TABLE public.target_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own groups"   ON public.target_groups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own groups" ON public.target_groups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own groups" ON public.target_groups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own groups" ON public.target_groups FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_target_groups_updated_at
    BEFORE UPDATE ON public.target_groups
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.target_groups TO authenticated;

-- ============================================
-- Fix meta_tokens: ensure only one row per user
-- Adds a unique partial index so upsert works cleanly
-- ============================================
-- (optional, run after confirming no duplicate active rows)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_meta_tokens_one_per_user
--     ON public.meta_tokens (user_id)
--     WHERE is_active = true;
