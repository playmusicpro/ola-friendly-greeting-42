import { z } from 'zod';
import type { Event, Show } from '@/types';

const cost = z.number().finite().min(0, 'Valor não pode ser negativo');
export const showSchema = z.object({
  title: z.string().trim().min(1, 'Nome do show é obrigatório'),
  contractor: z.string().trim().min(1, 'Contratante é obrigatório'),
  address: z.string().optional(), notes: z.string().optional(), endTime: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'), time: z.string().min(1, 'Horário é obrigatório'),
  local: z.string().trim().min(1, 'Local é obrigatório').max(200), tipo: z.string().min(1, 'Selecione o tipo'),
  cache: cost, numMusicos: z.number().int().min(1).max(50), consumacao: cost, kmRodados: cost,
  combustivel: cost, pedagio: cost, roupas: cost, equipamentos: cost, outrosCustos: cost, pagamentoMusicos: cost,
  realizado: z.boolean(), cashTracking: z.boolean(), depositAmount: cost, depositReceived: z.boolean(),
  depositDate: z.string().optional(), settled: z.boolean(), settlementDate: z.string().optional(),
  deductTeam: z.boolean(), teamPaymentDate: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.depositAmount > data.cache) ctx.addIssue({ code: 'custom', path: ['depositAmount'], message: 'Sinal não pode superar o cachê' });
  if (data.depositReceived && !data.depositDate) ctx.addIssue({ code: 'custom', path: ['depositDate'], message: 'Informe a data do sinal' });
  if (data.settled && !data.settlementDate) ctx.addIssue({ code: 'custom', path: ['settlementDate'], message: 'Informe a data da quitação' });
  if (data.deductTeam && !data.teamPaymentDate) ctx.addIssue({ code: 'custom', path: ['teamPaymentDate'], message: 'Informe a data do pagamento da equipe' });
});
export type ShowFormData = z.infer<typeof showSchema>;
export function showFormDefaults(show?: Partial<Show>): ShowFormData {
  return {
    address: '', notes: '', endTime: '', date: '', time: '', local: '', tipo: 'Bar',
    cache: 0, numMusicos: 1, consumacao: 0, kmRodados: 0, combustivel: 0, pedagio: 0, roupas: 0,
    equipamentos: 0, outrosCustos: 0, pagamentoMusicos: 0, realizado: false, depositAmount: 0,
    depositReceived: false, settled: false, deductTeam: false, ...show,
    title: show?.title || show?.local || '', contractor: show?.contractor || '', cashTracking: true,
  };
}
export function showFromEvent(event: Event): Partial<Show> {
  return { title: event.title, date: event.date, time: event.startTime, endTime: event.endTime,
    local: event.local || '', notes: event.notes, realizado: event.realizado };
}