/** Regra do paywall: só libera o app com assinatura/plano ativo gravado pelo webhook do Stripe. */
export function isSubscriptionActive(profile: { status?: string | null; has_active_subscription?: boolean | null } | null | undefined): boolean {
  if (!profile) return false;
  if (profile.has_active_subscription === true) return true;
  return profile.status === 'active';
}

/** Rotas acessíveis sem assinatura ativa. */
export const PAYWALL_ALLOWED_PATHS = ['/planos'];

export function isPaywallAllowedPath(pathname: string): boolean {
  return PAYWALL_ALLOWED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
