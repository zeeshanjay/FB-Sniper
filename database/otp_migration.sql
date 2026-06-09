-- ============================================
-- OTP VERIFICATIONS TABLE
-- Stores temporary OTP codes for email verification
-- Run this in Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT NOT NULL,
    otp_hash    TEXT NOT NULL,              -- SHA-256 hash of the 6-digit code
    full_name   TEXT,
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    attempts    INTEGER NOT NULL DEFAULT 0, -- Max 3 before invalidation
    verified    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_otp_email    ON public.otp_verifications (email);
CREATE INDEX IF NOT EXISTS idx_otp_expires  ON public.otp_verifications (expires_at);

-- Auto-delete expired/verified records (keeps table clean)
-- Run this periodically or set up a cron job in Supabase
-- DELETE FROM public.otp_verifications WHERE expires_at < NOW() OR verified = TRUE;

-- RLS: Service role only (no direct client access)
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Only the backend service role can read/write
-- (No client-facing policies — all OTP ops go through FastAPI)
