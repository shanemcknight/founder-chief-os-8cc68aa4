
CREATE UNIQUE INDEX IF NOT EXISTS idx_emails_user_external ON public.emails (user_id, external_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_drafts_user_email ON public.email_drafts (user_id, email_id);
