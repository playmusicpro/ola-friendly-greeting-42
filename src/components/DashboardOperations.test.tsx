import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import DashboardOperations from './DashboardOperations';

vi.mock('@/hooks/useFinancialData', () => ({ useFinancialData: () => ({
  shows: [], expenses: [], fixedExpenses: [], incomes: [], events: [], goals: [],
  generalExpenses: [{ id: 'expense-1', descricao: 'Transporte', categoria: 'combustivel', valor: 123.45, data: '2026-10-24' }],
  piggyBanks: [{ id: 'bank-1', nome: 'Novo instrumento', valorAtual: 250, objetivo: 1000 }],
}) }));
vi.mock('./FinancialGoals', () => ({ default: () => null }));

describe('Sigilo nas operações restauradas', () => {
  it('oculta os valores de gastos recentes e reservas ao ativar o sigilo', () => {
    const { rerender } = render(<MemoryRouter><DashboardOperations /></MemoryRouter>);
    expect(screen.getByText('-R$ 123,45')).toBeInTheDocument();
    expect(screen.getByText('R$ 250,00')).toBeInTheDocument();
    rerender(<MemoryRouter><DashboardOperations hidden /></MemoryRouter>);
    expect(screen.queryByText('-R$ 123,45')).not.toBeInTheDocument();
    expect(screen.queryByText('R$ 250,00')).not.toBeInTheDocument();
    expect(screen.getAllByText('R$ ****,**')).toHaveLength(2);
  });
});