import { describe, expect, it } from 'vitest';
import { calculateMonthlyFinancials, calculateGoalProgress, getNextShow, toISODate } from '../calculations';
import { buildGoogleCalendarLink } from '../googleCalendarLink';
import type { Show, FinancialGoal } from '@/types';

const show = (overrides: Partial<Show> = {}): Show => ({ id: 's', date: '2026-10-24', time: '21:00', local: 'Palco', tipo: 'Bar', cache: 1000, numMusicos: 1, consumacao: 10, kmRodados: 0, combustivel: 20, pedagio: 30, roupas: 40, equipamentos: 50, outrosCustos: 60, pagamentoMusicos: 70, realizado: true, ...overrides });
const goal: FinancialGoal = { id: 'g', nome: 'Meta', valorMeta: 2000, periodo: 'mensal', dataInicio: '2026-10-01', dataFim: '2026-10-31', criadoEm: '' };
const now = new Date(2026, 9, 24);

describe('monthly financial integrity', () => {
  it('adds show operations, active fixed expenses and individual outflows exactly once', () => {
    const result = calculateMonthlyFinancials([show(), show({ id: 'old', date: '2025-10-24' })], [{ id: 'e', amount: 100, date: '2026-10-24', category: 'equipamentos', description: 'Avulso' }, { id: 'old', amount: 9999, date: '2025-10-24', category: 'equipamentos', description: 'Outro ano' }], [{ id: 'f', amount: 500, dueDay: 1, description: 'Aluguel' }, { id: 'off', amount: 300, dueDay: 1, description: 'Inativa', active: false }], [], now);
    expect(result.custosShows).toBe(280);
    expect(result.despesasFixas).toBe(500);
    expect(result.saidasAvulsas).toBe(100);
    expect(result.totalGastos).toBe(880);
    expect(result.dre.resultadoOperacional).toBe(120);
  });
  it('does not recognize planned show income as completed revenue', () => {
    expect(calculateMonthlyFinancials([show({ realizado: false })], [], [], [], now).dre.receitaBruta).toBe(0);
  });
  it('increases and decreases goal progress with persisted adjustments', () => {
    expect(calculateGoalProgress({ ...goal, saldoAjuste: 280 }, [show()], [], now).realizado).toBe(1000);
    expect(calculateGoalProgress({ ...goal, saldoAjuste: 280 }, [show()], [], now).progressoPercentual).toBe(50);
    expect(calculateGoalProgress({ ...goal, saldoAjuste: 80 }, [show()], [], now).progressoPercentual).toBe(40);
  });
  it('chooses the nearest non-completed show from today onwards', () => {
    expect(getNextShow([show({ id: 'late', date: '2026-10-30', realizado: false }), show({ id: 'today', realizado: false }), show({ id: 'done' }), show({ id: 'past', date: '2026-10-23', realizado: false })], now)?.id).toBe('today');
  });
  it('keeps local calendar dates near midnight', () => {
    expect(toISODate(new Date(2026, 9, 24, 23, 59))).toBe('2026-10-24');
  });
});

describe('Google Agenda event URL', () => {
  it('contains the title, local start/end, address and description', () => {
    const url = new URL(buildGoogleCalendarLink(show({ title: 'Show & Música', endTime: '23:30', address: 'Rua São João, 10', notes: 'Apresentação ao vivo' })));
    expect(url.searchParams.get('text')).toBe('Show & Música');
    expect(url.searchParams.get('dates')).toBe('20261024T210000/20261024T233000');
    expect(url.searchParams.get('location')).toBe('Rua São João, 10');
    expect(url.searchParams.get('details')).toBe('Apresentação ao vivo');
    expect(url.searchParams.get('ctz')).toBe('America/Sao_Paulo');
  });
  it('ends an overnight show on the following calendar day', () => {
    expect(new URL(buildGoogleCalendarLink(show({ time: '23:00', endTime: '01:00' }))).searchParams.get('dates')).toBe('20261024T230000/20261025T010000');
  });
});