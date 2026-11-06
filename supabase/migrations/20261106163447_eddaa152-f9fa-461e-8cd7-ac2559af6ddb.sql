-- Contador de uso de cupom, acionado apenas pelo serviço de pagamento

CREATE OR REPLACE FUNCTION public.record_coupon_use(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stripe_coupons
     SET used_count = used_count + 1
   WHERE code = upper(trim(p_code))
     AND active = true
     AND (max_uses IS NULL OR used_count < max_uses);
END;
$$;

REVOKE ALL ON FUNCTION public.record_coupon_use(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_coupon_use(text) TO service_role;