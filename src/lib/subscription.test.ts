import { describe, it, expect } from 'vitest';
import { isSubscriptionActive, isPaywallAllowedPath } from './subscription';

describe('paywall', () => {
  it('bloqueia perfil inativo ou ausente', () => {
    expect(isSubscriptionActive({ status: 'inactive' })).toBe(false);
    expect(isSubscriptionActive({ status: 'canceled' })).toBe(false);
    expect(isSubscriptionActive(null)).toBe(false);
  });
  it('libera status active ou has_active_subscription true', () => {
    expect(isSubscriptionActive({ status: 'active' })).toBe(true);
    expect(isSubscriptionActive({ status: 'inactive', has_active_subscription: true })).toBe(true);
  });
  it('só /planos fica acessível sem assinatura', () => {
    expect(isPaywallAllowedPath('/planos')).toBe(true);
    expect(isPaywallAllowedPath('/')).toBe(false);
    expect(isPaywallAllowedPath('/repertorio')).toBe(false);
  });
});

import { hasAppAccess } from './subscription';
describe('acesso VIP', () => {
  const now = new Date('2026-11-13T12:00:00Z');
  it('VIP sem validade libera', () => expect(hasAppAccess({ status: 'inactive', is_vip: true }, now)).toBe(true));
  it('VIP com validade futura libera', () => expect(hasAppAccess({ is_vip: true, vip_expires_at: '2026-12-01T00:00:00Z' }, now)).toBe(true));
  it('VIP expirado bloqueia', () => expect(hasAppAccess({ is_vip: true, vip_expires_at: '2026-11-01T00:00:00Z' }, now)).toBe(false));
  it('sem VIP e sem assinatura bloqueia', () => expect(hasAppAccess({ status: 'inactive', is_vip: false }, now)).toBe(false));
});
