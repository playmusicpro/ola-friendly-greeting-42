import { calculateMonthlyFinancials, showCashCosts, showCashReceipts, toISODate } from '@/lib/calculations';
import type { Show, Expense, FixedExpense, Income, GeneralExpense } from '@/types';

export type FinancialRange = 'month' | 'quarter' | 'year';
export const PRIVATE_CURRENCY = 'R$ ****,**';
export const expenseCategories = ['Músicos', 'Combustível', 'Alimentação', 'Equipamentos', 'Outros'] as const;

/** Cores fixas por categoria (HSL), sincronizadas com os tokens --chart-category-* do index.css. */
export const expenseCategoryColors = [
  '190 95% 55%',  // Músicos — ciano
  '38 95% 55%',   // Combustível — âmbar
  '266 85% 62%',  // Alimentação — violeta
  '158 80% 45%',  // Equipamentos — esmeralda
  '345 85% 67%',  // Outros — rosa
] as const;

export const expenseCategoryColor = (index: number) => `hsl(${expenseCategoryColors[index] ?? expenseCategoryColors[4]})`;

export function buildDashboardFinancialCharts(shows: Show[], expenses: Expense[], fixed: FixedExpense[], incomes: Income[], general: GeneralExpense[], range: FinancialRange, reference = new Date()) {
  const months = range === 'month' ? [new Date(reference.getFullYear(), reference.getMonth(), 1)]
    : Array.from({ length: range === 'quarter' ? 3 : 12 }, (_, i) => new Date(reference.getFullYear(), range === 'quarter' ? reference.getMonth() - 2 + i : i, 1));
  const start = toISODate(months[0]);
  const lastMonth = months[months.length - 1];
  const end = toISODate(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0));
  const inRange = (date: string) => date >= start && date <= end;
  const distribution = expenseCategories.map(name => ({ name, value: 0 }));
  const add = (index: number, amount: number) => { distribution[index].value += amount; };
  shows.flatMap(showCashCosts).filter(row => inRange(row.date)).forEach(row => {
    const index = row.category === 'musicos' ? 0 : row.category === 'combustivel' ? 1 : row.category === 'alimentacao' ? 2 : row.category === 'equipamentos' ? 3 : 4;
    add(index, row.amount);
  });
  const generalById = new Map(general.map(e => [e.id, e.categoria]));
  expenses.filter(e => inRange(e.date) && e.origin !== 'team_payment').forEach(e => {
    const category = (generalById.get(e.id) ?? e.category).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const index = /music|equipe/.test(category) ? 0 : /combust|transporte/.test(category) ? 1 : /alimenta|consuma/.test(category) ? 2 : /equipamento/.test(category) ? 3 : 4;
    add(index, e.amount);
  });
  add(4, fixed.filter(f => f.active !== false).reduce((sum, f) => sum + f.amount, 0) * months.length);
  const trend = range === 'month'
    ? Array.from({ length: new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate() }, (_, i) => {
      const day = toISODate(new Date(reference.getFullYear(), reference.getMonth(), i + 1));
      const receitas = shows.flatMap(showCashReceipts).filter(row => row.date === day).reduce((sum, row) => sum + row.amount, 0) + incomes.filter(row => row.date === day).reduce((sum, row) => sum + row.amount, 0);
      const despesas = shows.flatMap(showCashCosts).filter(row => row.date === day).reduce((sum, row) => sum + row.amount, 0) + expenses.filter(row => row.date === day && row.origin !== 'team_payment').reduce((sum, row) => sum + row.amount, 0) + fixed.filter(f => f.active !== false && Math.min(f.dueDay, new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate()) === i + 1).reduce((sum, row) => sum + row.amount, 0);
      return { label: String(i + 1).padStart(2, '0'), receitas, despesas };
    })
    : months.map(month => {
      const monthly = calculateMonthlyFinancials(shows, expenses, fixed, incomes, month);
      return { label: month.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), receitas: monthly.dre.receitaBruta, despesas: monthly.totalGastos };
    });
  return { trend, distribution, totalGastos: distribution.reduce((sum, item) => sum + item.value, 0) };
}