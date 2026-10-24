import { calculateMonthlyFinancials, toISODate } from '@/lib/calculations';
import type { Show, Expense, FixedExpense, Income, GeneralExpense } from '@/types';

export type FinancialRange = 'month' | 'quarter' | 'year';
export const PRIVATE_CURRENCY = 'R$ ****,**';
export const expenseCategories = ['Músicos', 'Combustível', 'Alimentação', 'Equipamentos', 'Outros'] as const;

export function buildDashboardFinancialCharts(shows: Show[], expenses: Expense[], fixed: FixedExpense[], incomes: Income[], general: GeneralExpense[], range: FinancialRange, reference = new Date()) {
  const months = range === 'month' ? [new Date(reference.getFullYear(), reference.getMonth(), 1)]
    : Array.from({ length: range === 'quarter' ? 3 : 12 }, (_, i) => new Date(reference.getFullYear(), range === 'quarter' ? reference.getMonth() - 2 + i : i, 1));
  const start = toISODate(months[0]);
  const lastMonth = months[months.length - 1];
  const end = toISODate(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0));
  const inRange = (date: string) => date >= start && date <= end;
  const distribution = expenseCategories.map(name => ({ name, value: 0 }));
  const add = (index: number, amount: number) => { distribution[index].value += amount; };
  shows.filter(s => inRange(s.date)).forEach(s => {
    add(0, s.pagamentoMusicos); add(1, s.combustivel); add(2, s.consumacao); add(3, s.equipamentos);
    add(4, s.pedagio + s.roupas + s.outrosCustos);
  });
  const generalById = new Map(general.map(e => [e.id, e.categoria]));
  expenses.filter(e => inRange(e.date)).forEach(e => {
    const category = (generalById.get(e.id) ?? e.category).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const index = /music|equipe/.test(category) ? 0 : /combust|transporte/.test(category) ? 1 : /alimenta|consuma/.test(category) ? 2 : /equipamento/.test(category) ? 3 : 4;
    add(index, e.amount);
  });
  add(4, fixed.filter(f => f.active !== false).reduce((sum, f) => sum + f.amount, 0) * months.length);
  const trend = range === 'month'
    ? Array.from({ length: new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate() }, (_, i) => {
      const day = toISODate(new Date(reference.getFullYear(), reference.getMonth(), i + 1));
      const monthly = calculateMonthlyFinancials(shows.filter(s => s.date === day), expenses.filter(e => e.date === day), fixed.filter(f => Math.min(f.dueDay, new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate()) === i + 1), incomes.filter(e => e.date === day), reference);
      return { label: String(i + 1).padStart(2, '0'), receitas: monthly.dre.receitaBruta, despesas: monthly.totalGastos };
    })
    : months.map(month => {
      const monthly = calculateMonthlyFinancials(shows, expenses, fixed, incomes, month);
      return { label: month.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), receitas: monthly.dre.receitaBruta, despesas: monthly.totalGastos };
    });
  return { trend, distribution, totalGastos: distribution.reduce((sum, item) => sum + item.value, 0) };
}