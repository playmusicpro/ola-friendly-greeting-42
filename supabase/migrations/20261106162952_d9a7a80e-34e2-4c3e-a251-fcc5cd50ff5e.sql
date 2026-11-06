-- Fecha o acesso direto do navegador às tabelas de pagamento (só o servidor lê)

REVOKE ALL ON public.stripe_offers FROM anon, authenticated;
REVOKE ALL ON public.stripe_coupons FROM anon, authenticated;
REVOKE ALL ON public.stripe_purchases FROM anon, authenticated;

GRANT ALL ON public.stripe_offers TO service_role;
GRANT ALL ON public.stripe_coupons TO service_role;
GRANT ALL ON public.stripe_purchases TO service_role;

-- Regras explícitas de bloqueio: nenhuma leitura pelo app
CREATE POLICY "Ofertas somente pelo servidor"
  ON public.stripe_offers FOR SELECT
  TO authenticated, anon
  USING (false);

CREATE POLICY "Cupons somente pelo servidor"
  ON public.stripe_coupons FOR SELECT
  TO authenticated, anon
  USING (false);

CREATE POLICY "Compras somente pelo servidor"
  ON public.stripe_purchases FOR SELECT
  TO authenticated, anon
  USING (false);