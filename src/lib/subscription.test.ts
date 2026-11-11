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
