import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DashboardFinancialCharts from './DashboardFinancialCharts';

describe('Sigilo financeiro', () => {
  it('não revela valores nem desenha séries monetárias quando oculto', () => {
    const { container } = render(<DashboardFinancialCharts shows={[]} expenses={[]} fixedExpenses={[{ id: '1', description: 'Aluguel', amount: 1234.56, dueDay: 1 }]} incomes={[]} generalExpenses={[]} hidden />);
    expect(screen.getAllByText('R$ ****,**')).toHaveLength(6);
    expect(container.textContent).not.toContain('1.234');
    expect(container.querySelector('.recharts-wrapper')).toBeNull();
  });
});