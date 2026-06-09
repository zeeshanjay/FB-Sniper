-- Migration 003b: Add delay scheduling to post_scheduled_comments
-- Run this in Supabase SQL Editor (ALTER TABLE only — no new tables)

ALTER TABLE public.post_scheduled_comments
  ADD COLUMN IF NOT EXISTS delay_minutes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fire_at       TIMESTAMPTZ;

-- Index so the worker loop can efficiently find due delayed comments
CREATE INDEX IF NOT EXISTS idx_psc_fire_at
  ON public.post_scheduled_comments(fire_at)
  WHERE fire_at IS NOT NULL;
