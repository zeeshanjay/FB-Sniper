-- Migration 003: Paired scheduled comments for automation posts
-- When a post campaign publishes, the worker instantly drops all
-- linked comments on every returned fb_post_id.

CREATE TABLE public.post_scheduled_comments (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id       UUID        NOT NULL REFERENCES public.automation_posts(id) ON DELETE CASCADE,
    content       TEXT        NOT NULL,
    status        TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    fb_post_ids   TEXT[]      DEFAULT ARRAY[]::TEXT[],  -- populated after parent publishes
    posted_at     TIMESTAMPTZ,
    retry_count   INTEGER     NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_psc_post_id    ON public.post_scheduled_comments(post_id);
CREATE INDEX idx_psc_user_id    ON public.post_scheduled_comments(user_id);
CREATE INDEX idx_psc_status     ON public.post_scheduled_comments(status);

-- Timestamp trigger
CREATE TRIGGER update_psc_updated_at
    BEFORE UPDATE ON public.post_scheduled_comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.post_scheduled_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheduled comments"
    ON public.post_scheduled_comments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled comments"
    ON public.post_scheduled_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled comments"
    ON public.post_scheduled_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled comments"
    ON public.post_scheduled_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE
    ON public.post_scheduled_comments TO authenticated;
