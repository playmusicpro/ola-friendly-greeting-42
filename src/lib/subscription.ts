/** Regra do paywall: só libera o app com assinatura/plano ativo gravado pelo webhook do Stripe. */
export type AccessProfile = {
  status?: string | null;
  has_active_subscription?: boolean | null;
  is_vip?: boolean | null;
  vip_expires_at?: string | null;
};

/** VIP manual: is_vip true e sem validade ou validade no futuro. */
export function isVipActive(profile: AccessProfile | null | undefined, now: Date = new Date()): boolean {
  if (!profile || profile.is_vip !== true) return false;
  if (!profile.vip_expires_at) return true;
  return new Date(profile.vip_expires_at).getTime() > now.getTime();
}

/** Acesso ao app: assinatura Stripe ativa OU VIP válido. Email confirmado sozinho não libera. */
export function hasAppAccess(profile: AccessProfile | null | undefined, now: Date = new Date()): boolean {
  return isSubscriptionActive(profile) || isVipActive(profile, now);
}

export function isSubscriptionActive(profile: AccessProfile | null | undefined): boolean {
  if (!profile) return false;
  if (profile.has_active_subscription === true) return true;
  return profile.status === 'active';
}

/** Rotas acessíveis sem assinatura ativa. */
export const PAYWALL_ALLOWED_PATHS = ['/planos'];

export function isPaywallAllowedPath(pathname: string): boolean {
  return PAYWALL_ALLOWED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
