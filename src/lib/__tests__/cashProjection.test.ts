import { describe, it, expect } from 'vitest';
import { calculateCashProjection } from '@/lib/calculations';
import { showFormDefaults } from '@/lib/showForm';

const show = (id: string, date: string, cache: number, realizado = false) => ({ ...showFormDefaults({ date, cache, realizado }), id });

describe('projeção de caixa automática', () => {
  it('soma cachês a receber e desconta músicos não pagos só de shows agendados', () => {
    const shows = [show('a', '2026-11-10', 1000), show('b', '2026-11-12', 500, true), show('c', '2026-01-01', 800)];
    const musicians = [{ showId: 'a', cache: 200, paid: false }, { showId: 'a', cache: 100, paid: true }, { showId: 'b', cache: 50, paid: false }];
    expect(calculateCashProjection(shows, musicians, '2026-10-26')).toEqual({ shows: 1, receitas: 1000, despesas: 200, saldo: 800 });
  });
});
