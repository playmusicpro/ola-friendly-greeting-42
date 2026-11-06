-- Stripe: ofertas, cupons, compras e situação do plano no perfil

-- 1) Perfil: situação da assinatura e tipo de plano comprado
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS plan_type text;

COMMENT ON COLUMN public.profiles.status IS 'inactive | active | canceled — atualizado pelo webhook do Stripe';
COMMENT ON COLUMN public.profiles.plan_type IS 'lifetime_founder | monthly | yearly — plano pago confirmado';

-- 2) Ofertas vendidas no checkout
CREATE TABLE public.stripe_offers (
  key text PRIMARY KEY,
  label text NOT NULL,
  description text,
  mode text NOT NULL DEFAULT 'payment',
  interval text,
  price_cents bigint NOT NULL,
  currency text NOT NULL DEFAULT 'brl',
  stripe_price_id text NOT NULL,
  stripe_product_id text,
  plan_type text NOT NULL,
  highlight boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.stripe_offers TO authenticated;
GRANT ALL ON public.stripe_offers TO service_role;

ALTER TABLE public.stripe_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ofertas ativas visiveis para usuarios logados"
  ON public.stripe_offers FOR SELECT
  TO authenticated
  USING (active = true);

CREATE TRIGGER set_stripe_offers_updated_at
  BEFORE UPDATE ON public.stripe_offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.stripe_offers
  (key, label, description, mode, interval, price_cents, currency, stripe_price_id, stripe_product_id, plan_type, highlight, sort_order, active)
VALUES
  ('lifetime_founder', 'Lote Vitalício — Black Friday', 'Acesso vitalício ao Play Pro, lote fundador da Black Friday. PIX ou cartão em até 12x.', 'payment', NULL, 49990, 'brl', 'price_1UYpwrEkbUW7qEru7KqC3MVC', 'prod_VZzw0pRrusXgU0', 'lifetime_founder', true, 1, true),
  ('monthly', 'Plano Mensal', 'Assinatura mensal do Play Pro, cobrada todo mês.', 'subscription', 'month', 2990, 'brl', 'price_1UYpxCEkbUW7qErutyssSBDQ', 'prod_VZzxWJS7vZ2kt9', 'monthly', false, 2, true),
  ('yearly', 'Plano Anual', 'Assinatura anual do Play Pro, cobrada uma vez por ano.', 'subscription', 'year', 29700, 'brl', 'price_1UYpxhEkbUW7qEruspq6Jz3O', 'prod_VZzxyHmLUXWSHi', 'yearly', false, 3, true)
ON CONFLICT (key) DO NOTHING;

-- 3) Cupons de desconto (lidos apenas pelo servidor)
CREATE TABLE public.stripe_coupons (
  code text PRIMARY KEY,
  stripe_coupon_id text NOT NULL,
  offer_key text REFERENCES public.stripe_offers(key),
  affiliate text,
  description text,
  discount_cents bigint NOT NULL,
  active boolean NOT NULL DEFAULT true,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.stripe_coupons TO service_role;

ALTER TABLE public.stripe_coupons ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_stripe_coupons_updated_at
  BEFORE UPDATE ON public.stripe_coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.stripe_coupons (code, stripe_coupon_id, offer_key, affiliate, description, discount_cents, active)
VALUES ('BLACKFRIDAY120', 'BLACKFRIDAY120', 'lifetime_founder', 'play_pro', 'Black Friday — R$ 120,00 de desconto no Lote Vitalício', 12000, true)
ON CONFLICT (code) DO NOTHING;

-- 4) Compras confirmadas
CREATE TABLE public.stripe_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE,
  stripe_customer_id text,
  stripe_payment_intent text,
  offer_key text REFERENCES public.stripe_offers(key),
  amount_cents bigint NOT NULL,
  currency text NOT NULL DEFAULT 'brl',
  coupon_code text,
  affiliate text,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stripe_purchases_user_idx ON public.stripe_purchases (user_id, created_at DESC);

GRANT SELECT ON public.stripe_purchases TO authenticated;
GRANT ALL ON public.stripe_purchases TO service_role;

ALTER TABLE public.stripe_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve as proprias compras"
  ON public.stripe_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER set_stripe_purchases_updated_at
  BEFORE UPDATE ON public.stripe_purchases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();