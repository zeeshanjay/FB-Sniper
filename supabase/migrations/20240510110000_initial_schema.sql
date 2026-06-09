-- Astraventa FB Sniper - Multi-Tenant Database Schema
-- Project: sniper
-- All tables are partitioned by user_id for multi-tenancy
-- Row-Level Security (RLS) enabled on all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (Extended from auth.users)
-- ============================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 2. META TOKENS TABLE
-- Stores long-lived Meta/Facebook access tokens
-- ============================================
CREATE TABLE public.meta_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL, -- Encrypted in production
    token_type TEXT NOT NULL DEFAULT 'long-lived',
    expires_at TIMESTAMPTZ NOT NULL,
    scopes TEXT[] DEFAULT ARRAY['public_profile', 'email'],
    meta_user_id TEXT, -- Facebook user ID
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_meta_tokens_user_id ON public.meta_tokens(user_id);
CREATE INDEX idx_meta_tokens_is_active ON public.meta_tokens(is_active);

-- Enable RLS on meta_tokens
ALTER TABLE public.meta_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meta_tokens
CREATE POLICY "Users can view own tokens"
    ON public.meta_tokens FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens"
    ON public.meta_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
    ON public.meta_tokens FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens"
    ON public.meta_tokens FOR DELETE
    USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE TRIGGER update_meta_tokens_updated_at
    BEFORE UPDATE ON public.meta_tokens
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. SNIPER LOGS TABLE
-- Logs all automation actions for audit trail
-- ============================================
CREATE TABLE public.sniper_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'fetch', 'post', 'comment', 'like', 'share'
    target_id TEXT, -- Facebook group/page/post ID
    target_type TEXT, -- 'group', 'page', 'post'
    status TEXT NOT NULL, -- 'success', 'failed', 'rate_limited', 'pending'
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_sniper_logs_user_id ON public.sniper_logs(user_id);
CREATE INDEX idx_sniper_logs_status ON public.sniper_logs(status);
CREATE INDEX idx_sniper_logs_created_at ON public.sniper_logs(created_at DESC);
CREATE INDEX idx_sniper_logs_action_type ON public.sniper_logs(action_type);

-- Enable RLS on sniper_logs
ALTER TABLE public.sniper_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sniper_logs
CREATE POLICY "Users can view own logs"
    ON public.sniper_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
    ON public.sniper_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
    ON public.sniper_logs FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 4. AUTOMATION POSTS TABLE
-- Manages scheduled and posted content
-- ============================================
CREATE TABLE public.automation_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    target_groups TEXT[], -- Array of Facebook group IDs
    target_pages TEXT[], -- Array of Facebook page IDs
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'scheduled', 'posted', 'failed'
    scheduled_at TIMESTAMPTZ,
    posted_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_automation_posts_user_id ON public.automation_posts(user_id);
CREATE INDEX idx_automation_posts_status ON public.automation_posts(status);
CREATE INDEX idx_automation_posts_scheduled_at ON public.automation_posts(scheduled_at);
CREATE INDEX idx_automation_posts_created_at ON public.automation_posts(created_at DESC);

-- Enable RLS on automation_posts
ALTER TABLE public.automation_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_posts
CREATE POLICY "Users can view own posts"
    ON public.automation_posts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
    ON public.automation_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
    ON public.automation_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
    ON public.automation_posts FOR DELETE
    USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE TRIGGER update_automation_posts_updated_at
    BEFORE UPDATE ON public.automation_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. AUTOMATION SETTINGS TABLE
-- User-specific automation preferences
-- ============================================
CREATE TABLE public.automation_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    auto_post_enabled BOOLEAN DEFAULT FALSE,
    post_frequency TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
    rate_limit_delay INTEGER DEFAULT 60, -- Seconds between actions
    max_posts_per_day INTEGER DEFAULT 10,
    timezone TEXT DEFAULT 'UTC',
    quiet_hours_start TIME, -- Start of quiet hours (24h format)
    quiet_hours_end TIME, -- End of quiet hours (24h format)
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on automation_settings
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_settings
CREATE POLICY "Users can view own settings"
    ON public.automation_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON public.automation_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON public.automation_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE TRIGGER update_automation_settings_updated_at
    BEFORE UPDATE ON public.automation_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user has active Meta token
CREATE OR REPLACE FUNCTION public.has_active_meta_token(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.meta_tokens
        WHERE user_id = p_user_id
        AND is_active = TRUE
        AND expires_at > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active token
CREATE OR REPLACE FUNCTION public.get_active_meta_token(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    access_token TEXT,
    expires_at TIMESTAMPTZ,
    meta_user_id TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT mt.id, mt.access_token, mt.expires_at, mt.meta_user_id
    FROM public.meta_tokens mt
    WHERE mt.user_id = p_user_id
    AND mt.is_active = TRUE
    AND mt.expires_at > NOW()
    ORDER BY mt.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log sniper action
CREATE OR REPLACE FUNCTION public.log_sniper_action(
    p_user_id UUID,
    p_action_type TEXT,
    p_target_id TEXT DEFAULT NULL,
    p_target_type TEXT DEFAULT NULL,
    p_status TEXT,
    p_error_message TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.sniper_logs (
        user_id, action_type, target_id, target_type, status, error_message, metadata
    )
    VALUES (
        p_user_id, p_action_type, p_target_id, p_target_type, p_status, p_error_message, p_metadata
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: User dashboard summary
CREATE OR REPLACE VIEW public.user_dashboard_summary AS
SELECT
    u.id AS user_id,
    u.email,
    u.full_name,
    COUNT(DISTINCT mt.id) AS active_tokens,
    COUNT(DISTINCT CASE WHEN mt.is_active = TRUE AND mt.expires_at > NOW() THEN mt.id END) AS valid_tokens,
    COUNT(DISTINCT al.id) AS total_actions,
    COUNT(DISTINCT CASE WHEN al.status = 'success' THEN al.id END) AS successful_actions,
    COUNT(DISTINCT CASE WHEN al.status = 'failed' THEN al.id END) AS failed_actions,
    COUNT(DISTINCT CASE WHEN al.created_at > NOW() - INTERVAL '24 hours' THEN al.id END) AS actions_last_24h,
    COUNT(DISTINCT ap.id) AS total_posts,
    COUNT(DISTINCT CASE WHEN ap.status = 'pending' THEN ap.id END) AS pending_posts,
    COUNT(DISTINCT CASE WHEN ap.status = 'posted' THEN ap.id END) AS posted_posts
FROM public.users u
LEFT JOIN public.meta_tokens mt ON u.id = mt.user_id
LEFT JOIN public.sniper_logs al ON u.id = al.user_id
LEFT JOIN public.automation_posts ap ON u.id = ap.user_id
GROUP BY u.id, u.email, u.full_name;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on tables for authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant insert, update, delete on tables for authenticated users
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant select on specific views for authenticated users
GRANT SELECT ON public.user_dashboard_summary TO authenticated;

-- Grant execute on functions for authenticated users
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- INITIAL DATA
-- ============================================

-- No initial data needed - tables will be populated through user actions
