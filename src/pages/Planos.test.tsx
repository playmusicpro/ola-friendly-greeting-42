import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Planos from './Planos';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (name: string, options: { body: { action: string } }) => invoke(name, options),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

const offers = [
  {
    key: 'lifetime_founder',
    label: 'Lote Vitalício — Black Friday',
    description: 'Acesso vitalício ao Play Pro, lote fundador da Black Friday. PIX ou cartão em até 12x.',
    mode: 'payment',
    interval: null,
    priceCents: 49990,
    currency: 'brl',
    planType: 'lifetime_founder',
    highlight: true,
  },
  {
    key: 'monthly',
    label: 'Plano Mensal',
    description: 'Assinatura mensal do Play Pro, cobrada todo mês.',
    mode: 'subscription',
    interval: 'month',
    priceCents: 2990,
    currency: 'brl',
    planType: 'monthly',
    highlight: false,
  },
  {
    key: 'yearly',
    label: 'Plano Anual',
    description: 'Assinatura anual do Play Pro, cobrada uma vez por ano.',
    mode: 'subscription',
    interval: 'year',
    priceCents: 29700,
    currency: 'brl',
    planType: 'yearly',
    highlight: false,
  },
];

function mockInvoke() {
  invoke.mockImplementation(async ({ body }: { body: { action: string } }) => {
    if (body.action === 'list_offers') return { data: { offers } };
    if (body.action === 'validate_coupon') {
      return { data: { valid: true, couponCode: 'BLACKFRIDAY120', affiliate: 'play_pro', discountCents: 12000, priceCents: 49990, totalCents: 37990 } };
    }
    return { data: {} };
  });
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/planos']}>
      <Planos />
    </MemoryRouter>,
  );

describe('Tela de Planos', () => {
  it('mostra a oferta da Black Friday e os dois planos recorrentes', async () => {
    mockInvoke();
    renderPage();
    await waitFor(() => expect(screen.getByText('Lote Vitalício — Black Friday')).toBeInTheDocument());
    expect(screen.getByText('R$ 499,90')).toBeInTheDocument();
    expect(screen.getByText('Plano Mensal')).toBeInTheDocument();
    expect(screen.getByText('Plano Anual')).toBeInTheDocument();
    expect(screen.getByText(/PIX/)).toBeInTheDocument();
    expect(screen.getByText(/12x de R\$ 41,66/)).toBeInTheDocument();
  });

  it('aplica o cupom e atualiza o valor final para R$ 379,90', async () => {
    mockInvoke();
    renderPage();
    await waitFor(() => expect(screen.getByText('R$ 499,90')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Cupom de desconto'), { target: { value: ' blackfriday120 ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar cupom' }));

    await waitFor(() => expect(screen.getByText('R$ 379,90')).toBeInTheDocument());
    expect(screen.getByText(/Cupom BLACKFRIDAY120 aplicado/)).toBeInTheDocument();
    expect(screen.getByText(/12x de R\$ 31,66/)).toBeInTheDocument();
    expect(invoke).toHaveBeenCalledWith(
      'stripe-checkout',
      expect.objectContaining({ body: expect.objectContaining({ action: 'validate_coupon', offer: 'lifetime_founder', couponCode: 'BLACKFRIDAY120' }) }),
    );
  });
});
