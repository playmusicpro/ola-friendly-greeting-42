import { describe, expect, it } from 'vitest';
import { buildDashboardFinancialCharts } from './dashboardFinancialCharts';
import { calculateMonthlyFinancials } from './calculations';
import type { Show, Expense, GeneralExpense } from '@/types';

const show: Show = { id: 'show', date: '2026-10-12', time: '20:00', local: 'Local', tipo: 'Bar', cache: 2000, numMusicos: 2, consumacao: 50, kmRodados: 10, combustivel: 100, pedagio: 10, roupas: 20, equipamentos: 200, outrosCustos: 30, pagamentoMusicos: 400, realizado: true };
const expenses: Expense[] = [{ id: 'expense', category: 'equipamentos', description: 'Comida', amount: 40, date: '2026-10-12' }];
const general: GeneralExpense[] = [{ id: 'expense', categoria: 'Alimentação', descricao: 'Comida', valor: 40, data: '2026-10-12', criadoEm: '' }];
const fixed = [{ id: 'fixed', description: 'Aluguel', amount: 300, dueDay: 31 }];
const ref = new Date(2026, 9, 24);

describe('Gráficos financeiros do Painel', () => {
  it('reconcilia o donut com gastos dos shows, fixas e avulsas sem duplicar', () => {
    const chart = buildDashboardFinancialCharts([show], expenses, fixed, [], general, 'month', ref);
    expect(chart.distribution.map(item => item.value)).toEqual([400, 100, 90, 200, 360]);
    expect(chart.totalGastos).toBe(1150);
    expect(chart.totalGastos).toBe(calculateMonthlyFinancials([show], expenses, fixed, [], ref).totalGastos);
    expect(chart.trend.reduce((sum, item) => sum + item.despesas, 0)).toBe(1150);
  });
  it('considera receitas somente de shows realizados e receitas avulsas', () => {
    const chart = buildDashboardFinancialCharts([show, { ...show, id: 'future', realizado: false }], [], [], [{ id: 'income', description: 'Aula', amount: 150, date: '2026-10-12', source: 'lessons' }], [], 'month', ref);
    expect(chart.trend.reduce((sum, item) => sum + item.receitas, 0)).toBe(2150);
  });
  it('filtra três meses e repete despesas fixas ativas uma vez por mês', () => {
    const chart = buildDashboardFinancialCharts([{ ...show, date: '2026-07-12' }, show], [], [...fixed, { ...fixed[0], id: 'inactive', amount: 999, active: false }], [], [], 'quarter', ref);
    expect(chart.trend.map(item => item.label)).toEqual(['ago', 'set', 'out']);
    expect(chart.totalGastos).toBe(1710);
    expect(chart.trend.reduce((sum, item) => sum + item.despesas, 0)).toBe(1710);
  });
  it('o filtro Ano inclui só o ano atual', () => {
    const chart = buildDashboardFinancialCharts([show, { ...show, date: '2025-10-12' }], [], [], [], [], 'year', ref);
    expect(chart.trend).toHaveLength(12);
    expect(chart.totalGastos).toBe(810);
  });
  it('ajusta vencimento 31 ao último dia de fevereiro', () => {
    const chart = buildDashboardFinancialCharts([], [], fixed, [], [], 'month', new Date(2026, 1, 12));
    expect(chart.trend).toHaveLength(28);
    expect(chart.trend[27].despesas).toBe(300);
    expect(chart.trend.slice(0, 27).reduce((sum, item) => sum + item.despesas, 0)).toBe(0);
  });
});