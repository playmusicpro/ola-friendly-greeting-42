import { describe, expect, it } from 'vitest';
import { buildPlayDiagnosis, contextualMaterial, marginBand } from './playDiagnosis';
import { calculateMonthlyFinancials } from './calculations';
import { PAID_MATERIALS } from './officialMaterials';
import type { Show } from '@/types';

const date = new Date(2026, 9, 25);
const show: Show = { id: 's', date: '2026-10-20', time: '20:00', local: 'Bar', tipo: 'Bar', cache: 1000, numMusicos: 1, consumacao: 0, kmRodados: 0, combustivel: 100, pedagio: 50, roupas: 900, equipamentos: 0, outrosCustos: 200, pagamentoMusicos: 200, realizado: true, cashTracking: true, depositAmount: 300, depositReceived: true, depositDate: '2026-10-20', settled: false, deductTeam: true, teamPaymentDate: '2026-10-20' };
const totals = calculateMonthlyFinancials([show], [], [], [], date);
describe('Diagnóstico do Play Pro', () => {
  it('margem de 60% é verde', () => expect(marginBand(1000, 60)).toBe('success'));
  it('margem de 40% é amarela', () => expect(marginBand(1000, 40)).toBe('warning'));
  it('59,99% permanece amarela', () => expect(marginBand(1000, 59.99)).toBe('warning'));
  it('39,99% é vermelha', () => expect(marginBand(1000, 39.99)).toBe('danger'));
  it('sem receita não avalia margem', () => expect(marginBand(0, -100)).toBe('neutral'));
  it('cobra só saldo de shows realizados no mês e desconta o sinal recebido', () => {
    const result = buildPlayDiagnosis(totals, [show, { ...show, id: 'future', realizado: false }, { ...show, id: 'old', date: '2026-09-20' }], [], date);
    expect(result.pending).toBe(700);
  });
  it('show quitado não gera cobrança', () => {
    expect(buildPlayDiagnosis(totals, [{ ...show, settled: true, settlementDate: '2026-10-25' }], [], date).pending).toBe(0);
  });
  it('percentual de logística inclui combustível e pedágio, nunca roupas ou outros', () => {
    const result = buildPlayDiagnosis(totals, [show], [], date);
    expect(result.transportPercent).toBe(50);
    expect(result.teamPercent).toBeCloseTo(200 / 300 * 100);
  });
  it('margem apertada indica Bar, Barzinho e Boteco', () => expect(contextualMaterial('danger', 'automatico')).toEqual(PAID_MATERIALS.bar));
  it('interesse declarado de preço indica Músico de Sucesso', () => expect(contextualMaterial('success', 'precificacao')).toEqual(PAID_MATERIALS.precificacao));
  it('interesse declarado de repertório indica Transição Musical Profissional', () => expect(contextualMaterial('neutral', 'repertorio')).toEqual(PAID_MATERIALS.repertorio));
  it('interesse declarado de covers indica Grave Você Mesmo', () => expect(contextualMaterial('warning', 'covers')).toEqual(PAID_MATERIALS.covers));
});