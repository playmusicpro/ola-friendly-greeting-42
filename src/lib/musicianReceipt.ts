import type { Show, ShowMusician } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import { formatDateBR } from '@/lib/dateUtils';

export const NO_EMPLOYMENT_CLAUSE = 'O presente pagamento refere-se à prestação de serviços musicais autônomos e eventuais para o evento acima especificado, sem qualquer habitualidade, subordinação ou vínculo empregatício entre as partes, nos termos da legislação vigente.';
export const GOVBR_SIGNER_URL = 'https://www.gov.br/governodigital/pt-br/identidade/assinatura-eletronica';

/** Rota até o destino partindo da localização atual (Google Maps abre o app no celular). */
export function mapsDirectionsUrl(destination: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.trim())}`;
}

export interface ReceiptPayer { name: string; email?: string | null; phone?: string | null }

export function showDuration(show: Pick<Show, 'time' | 'endTime'>) {
  if (!show.time || !show.endTime) return 'Não informada';
  const [h1, m1] = show.time.split(':').map(Number); const [h2, m2] = show.endTime.split(':').map(Number);
  let mins = h2 * 60 + m2 - (h1 * 60 + m1); if (mins <= 0) mins += 24 * 60;
  return `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`;
}

const esc = (v: string) => v.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function buildReceiptHtml(show: Show, musician: ShowMusician, payer: ReceiptPayer) {
  const rows = (pairs: [string, string][]) => pairs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Recibo - ${esc(musician.name)}</title>
<style>body{font-family:Georgia,serif;max-width:720px;margin:32px auto;padding:0 20px;color:#111}h1{font-size:22px;text-align:center}h2{font-size:15px;margin-top:24px;border-bottom:1px solid #999}table{width:100%;border-collapse:collapse}th{text-align:left;width:38%;padding:4px 0;color:#444;font-weight:normal}td{padding:4px 0}.clause{margin-top:24px;padding:12px;border:1px solid #999;font-style:italic}.sign{margin-top:48px;display:grid;grid-template-columns:1fr 1fr;gap:32px}.line{border-top:1px solid #111;padding-top:6px;text-align:center;font-size:13px}.gov{margin-top:24px;border:1px dashed #666;padding:16px;text-align:center;font-size:13px}@media print{.noprint{display:none}}</style></head><body>
<h1>Recibo de Prestação de Serviços Musicais</h1>
<p>Valor: <strong>${esc(formatCurrency(musician.cache))}</strong></p>
<h2>Pagador (Contratante)</h2><table>${rows([['Nome', payer.name], ['E-mail', payer.email || '—'], ['Telefone', payer.phone || '—']])}</table>
<h2>Recebedor (Músico)</h2><table>${rows([['Nome', musician.name], ['Instrumento', musician.instrument || '—'], ['Cachê', formatCurrency(musician.cache)]])}</table>
<h2>Dados do Evento</h2><table>${rows([['Evento', show.title || show.local], ['Local', show.local], ['Endereço', show.address || '—'], ['Data', formatDateBR(show.date)], ['Horário', show.endTime ? `${show.time} às ${show.endTime}` : show.time], ['Duração', showDuration(show)]])}</table>
<p class="clause">${esc(NO_EMPLOYMENT_CLAUSE)}</p>
<div class="sign"><div class="line">${esc(payer.name)}<br>Pagador</div><div class="line">${esc(musician.name)}<br>Recebedor</div></div>
<div class="gov">Espaço reservado para assinatura eletrônica Gov.br ou validação digital</div>
<p class="noprint" style="text-align:center;margin-top:24px"><button onclick="print()">Salvar em PDF / Imprimir</button></p>
</body></html>`;
}

export function buildReceiptWhatsApp(show: Show, musician: ShowMusician, payer: ReceiptPayer) {
  return [
    '*Comprovante de Prestação de Serviços Musicais*', '',
    `Pagador: ${payer.name}`, `Músico: ${musician.name}${musician.instrument ? ` (${musician.instrument})` : ''}`,
    `Valor: ${formatCurrency(musician.cache)}`, '',
    `Evento: ${show.title || show.local}`, `Local: ${show.address || show.local}`,
    `Data: ${formatDateBR(show.date)} · ${show.time}${show.endTime ? ` às ${show.endTime}` : ''}`, '',
    `_${NO_EMPLOYMENT_CLAUSE}_`, '',
    'O recibo assinado (Gov.br) segue em anexo nesta conversa.',
  ].join('\n');
}
