import { describe, expect, it } from 'vitest';
import { summarizeAdminShows, type AdminShow } from '@/lib/adminAnalytics';

const show: AdminShow = {
  title: null, address: null, notes: null, end_time: null,
  id: 'show-1', user_id: 'user-1', date: '2026-10-18', time: null, local: 'Evento', tipo: 'Bar',
  cache: 1000, num_musicos: 2, consumacao: 50, km_rodados: 100, combustivel: 100,
  pedagio: 20, roupas: 30, equipamentos: 40, outros_custos: 60, pagamento_musicos: 200,
  realizado: true, created_at: '', updated_at: '',
};

describe('Administração com shows reais', () => {
  it('desconta todos os custos no faturamento do show', () => {
    const result = summarizeAdminShows([show]);
    expect(result.net).toBe(500);
    expect(result.costs).toBe(500);
    expect(result.margin).toBe(50);
  });
  it('não reconhece faturamento de shows não finalizados', () => {
    expect(summarizeAdminShows([{ ...show, realizado: false }]).net).toBe(0);
  });
  it('agrupa atividade registrada por ano e mês sem inventar períodos', () => {
    expect(summarizeAdminShows([show]).monthly).toEqual([{ month: '2026-10', shows: 1, revenue: 500 }]);
  });
  it('mantém totais finitos quando não existem shows', () => {
    expect(summarizeAdminShows([]).margin).toBe(0);
    expect(summarizeAdminShows([]).totalShows).toBe(0);
  });
});