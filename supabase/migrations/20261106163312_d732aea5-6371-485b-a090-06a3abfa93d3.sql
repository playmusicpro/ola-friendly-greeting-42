-- Rótulo de plano gravado no perfil quando o pagamento é confirmado

ALTER TABLE public.stripe_offers
  ADD COLUMN IF NOT EXISTS plan_label text NOT NULL DEFAULT 'free';

COMMENT ON COLUMN public.stripe_offers.plan_label IS 'Valor gravado em profiles.plan quando o pagamento desta oferta é confirmado (free | pro | premium)';

UPDATE public.stripe_offers SET plan_label = 'premium' WHERE key IN ('lifetime_founder', 'yearly');
UPDATE public.stripe_offers SET plan_label = 'pro' WHERE key = 'monthly';