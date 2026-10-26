import { describe, it, expect } from 'vitest';
import { summarizeEngagement, summarizeMarket, moduleUsagePercentages, type AdminShow, type AdminProfile } from '@/lib/adminAnalytics';
import { moduleForPath } from '@/lib/appUsage';

const now = new Date('2026-10-26T04:37:00Z');
const ago = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
const show = { realizado: true, user_id: 'one', date: '2026-10-26', cache: 1000, combustivel: 100, pedagio: 20, roupas: 30, equipamentos: 40, consumacao: 50, pagamento_musicos: 200, outros_custos: 60 } as AdminShow;
const profile = { id: 'one', genero_musical: 'Rock', cidade: 'São Paulo', estado: 'SP' } as AdminProfile;

describe('Inteligência administrativa', () => {
  it('inclui acessos há exatamente 7 dias entre os ativos', () => {
    expect(summarizeEngagement(['one'], [{ user_id: 'one', last_active_at: ago(7) }], now).active).toBe(1);
    expect(summarizeEngagement(['one'], [{ user_id: 'one', last_active_at: ago(7.01) }], now).active).toBe(0);
  });
  it('considera inativo apenas acesso há mais de 14 dias', () => {
    expect(summarizeEngagement(['one'], [{ user_id: 'one', last_active_at: ago(14) }], now).inactive).toBe(0);
    expect(summarizeEngagement(['one'], [{ user_id: 'one', last_active_at: ago(14.01) }], now).inactive).toBe(1);
  });
  it('não inventa inatividade para usuários sem histórico', () => {
    expect(summarizeEngagement(['one'], [], now)).toEqual({ active: 0, inactive: 0, intermediate: 0, unknown: 1 });
  });
  it('calcula custo e tickets da base apenas com shows finalizados', () => {
    const result = summarizeMarket([show, { ...show, cache: 9000, realizado: false }], [profile]);
    expect(result.averageCost).toBe(500);
    expect(result.grossTicket).toBe(1000);
    expect(result.netTicket).toBe(500);
  });
  it('calcula margem aritmética por gênero, cidade e UF', () => {
    const result = summarizeMarket([show, { ...show, cache: 2000 }], [profile]);
    expect(result.genres[0].averageMargin).toBe(62.5);
    expect(result.cities[0].name).toBe('São Paulo / SP');
    expect(result.regions[0].averageMargin).toBe(62.5);
  });
  it('mostra categoria desconhecida sem inventar localização', () => {
    expect(summarizeMarket([show], []).cities[0].name).toBe('Não informado');
    expect(summarizeMarket([], []).netTicket).toBe(0);
  });
  it('calcula percentuais sobre a totalidade dos módulos registrados', () => {
    expect(moduleUsagePercentages([{ module: 'agenda', accesses: 3, users_count: 1 }, { module: 'maps', accesses: 1, users_count: 1 }]).map(row => row.percentage)).toEqual([75, 25]);
  });
  it('mapeia módulos sem registrar IDs, login ou administração', () => {
    expect(moduleForPath('/modo-show/private-id')).toBe('repertoire');
    expect(moduleForPath('/financas')).toBe('finance');
    expect(moduleForPath('/agenda')).toBe('agenda');
    expect(moduleForPath('/desafios')).toBe('prompts');
    expect(moduleForPath('/admin/users')).toBeNull();
    expect(moduleForPath('/login')).toBeNull();
  });
});