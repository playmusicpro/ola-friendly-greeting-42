import { describe, expect, it } from 'vitest';
import { expenseCategories, expenseCategoryColor, expenseCategoryColors } from '@/lib/dashboardFinancialCharts';

describe('Cores fixas das categorias de despesa', () => {
  it('cada categoria tem uma cor HSL fixa e distinta', () => {
    expect(expenseCategoryColors).toHaveLength(expenseCategories.length);
    expect(new Set(expenseCategoryColors).size).toBe(expenseCategories.length);
    for (const color of expenseCategoryColors) {
      expect(color).toMatch(/^\d{1,3} \d{1,3}% \d{1,3}%$/);
    }
  });

  it('mapeia Músicos=ciano, Combustível=âmbar, Alimentação=violeta, Equipamentos=esmeralda', () => {
    expect(expenseCategoryColor(0)).toBe('hsl(190 95% 55%)');
    expect(expenseCategoryColor(1)).toBe('hsl(38 95% 55%)');
    expect(expenseCategoryColor(2)).toBe('hsl(266 85% 62%)');
    expect(expenseCategoryColor(3)).toBe('hsl(158 80% 45%)');
  });

  it('índice desconhecido cai na cor de Outros', () => {
    expect(expenseCategoryColor(99)).toBe(expenseCategoryColor(4));
  });
});
