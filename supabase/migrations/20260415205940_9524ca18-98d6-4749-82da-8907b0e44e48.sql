
CREATE TABLE public.beta_invite_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  created_by text NOT NULL DEFAULT 'shane',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  used_by text,
  used_at timestamp with time zone,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'revoked')),
  max_uses integer NOT NULL DEFAULT 1,
  uses integer NOT NULL DEFAULT 0
);

ALTER TABLE public.beta_invite_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read (needed for code validation during sign-up)
CREATE POLICY "Anyone can read invite codes" ON public.beta_invite_codes FOR SELECT TO anon, authenticated USING (true);

-- Admin-only write
CREATE POLICY "Admins can insert invite codes" ON public.beta_invite_codes FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update invite codes" ON public.beta_invite_codes FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete invite codes" ON public.beta_invite_codes FOR DELETE TO authenticated USING (public.is_admin());

-- Service role full access (for edge functions updating used_by during sign-up)
CREATE POLICY "Service role full access on invite codes" ON public.beta_invite_codes FOR ALL TO service_role USING (true) WITH CHECK (true);
