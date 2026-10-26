import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/hooks/useFinancialData', () => ({ useFinancialData: () => ({ showMusicians: [] }) }));
vi.mock('@/components/MusicianReceiptActions', () => ({ MusicianReceiptActions: () => null }));
import { ShowForm } from './ShowForm';
import { showFormDefaults, showSchema } from '@/lib/showForm';

const show = showFormDefaults({ title: 'Show de Outubro', contractor: 'Produção', local: 'Teatro', date: '2026-10-25', time: '20:00', cache: 2000, depositAmount: 500, depositReceived: true, depositDate: '2026-10-24', pagamentoMusicos: 600, combustivel: 100, consumacao: 80 });

describe('Cadastro completo de shows', () => {
  it('não aceita cadastro sem nome e contratante', () => {
    expect(showSchema.safeParse({ ...show, title: '', contractor: '' }).success).toBe(false);
    expect(showSchema.safeParse(show).success).toBe(true);
  });
  it('salva evento, sinal, equipe, transporte e alimentação pelo formulário completo', async () => {
    const save = vi.fn().mockResolvedValue(true);
    const close = vi.fn();
    render(<ShowForm open onOpenChange={close} onSubmit={save} prefill={show} />);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Show' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Show de Outubro', contractor: 'Produção', cache: 2000, depositAmount: 500, depositReceived: true, pagamentoMusicos: 600, combustivel: 100, consumacao: 80, cashTracking: true })));
    expect(close).toHaveBeenCalledWith(false);
  });
  it('mantém dados e formulário aberto se o salvamento falhar', async () => {
    const save = vi.fn().mockResolvedValue(false);
    const close = vi.fn();
    render(<ShowForm open onOpenChange={close} onSubmit={save} prefill={show} />);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Show' }));
    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Contratante *')).toHaveValue('Produção');
  });
  it('só desconta o sinal efetivamente recebido do saldo a receber', () => {
    const { rerender } = render(<ShowForm open onOpenChange={vi.fn()} onSubmit={vi.fn()} prefill={show} />);
    expect(screen.getByRole('status')).toHaveTextContent('R$ 1.500,00');
    rerender(<ShowForm open onOpenChange={vi.fn()} onSubmit={vi.fn()} prefill={{ ...show, depositReceived: false }} />);
    expect(screen.getByRole('status')).toHaveTextContent('R$ 2.000,00');
    fireEvent.click(screen.getByRole('switch', { name: 'Quitado (100% Pago)' }));
    expect(screen.getByRole('status')).toHaveTextContent('R$ 0,00');
  });
});