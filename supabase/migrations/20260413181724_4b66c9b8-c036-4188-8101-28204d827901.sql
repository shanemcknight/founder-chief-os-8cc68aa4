
ALTER TABLE public.profiles ADD COLUMN approved boolean NOT NULL DEFAULT false;

-- Pre-approve Shane's account
UPDATE public.profiles SET approved = true WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'shane@tophatprovisions.com' LIMIT 1
);
