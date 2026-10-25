import { calculateMonthlyFinancials, formatCurrency, showCashCosts, showOutstanding } from './calculations';
import { getMonthStart, getMonthEnd } from './dateUtils';
import { PAID_MATERIALS, type MarketFocus } from './officialMaterials';
import type { FinancialGoal, Show } from '@/types';

export function marginBand(revenue: number, margin: number) {
  if (revenue <= 0) return 'neutral';
  if (margin >= 60) return 'success';
  if (margin >= 40) return 'warning';
  return 'danger';
}

export function buildPlayDiagnosis(monthly: ReturnType<typeof calculateMonthlyFinancials>, shows: Show[], goals: FinancialGoal[], reference = new Date(), rotation = 0) {
  const start = getMonthStart(reference), end = getMonthEnd(reference);
  const band = marginBand(monthly.faturamentoBruto, monthly.dre.margemFinal);
  const rows = shows.flatMap(showCashCosts).filter(row => row.date >= start && row.date <= end);
  const percent = (amount: number) => monthly.faturamentoBruto > 0 ? amount / monthly.faturamentoBruto * 100 : 0;
  const logisticsPercent = percent(rows.filter(row => ['combustivel', 'outros'].includes(row.category)).reduce((sum, row) => sum + row.amount, 0));
  // Separate tolls from the broad "outros" bucket: clothes and other costs are not logistics.
  const transport = shows.reduce((sum, show) => sum + (rows.some(row => row.date === show.date) && (!show.cashTracking || show.realizado) && show.date >= start && show.date <= end ? show.combustivel + show.pedagio : 0), 0);
  const teamPercent = percent(rows.filter(row => row.category === 'musicos').reduce((sum, row) => sum + row.amount, 0));
  const pending = Math.round(shows.filter(show => show.realizado && show.date >= start && show.date <= end).reduce((sum, show) => sum + showOutstanding(show), 0) * 100) / 100;
  const goal = goals.find(goal => (goal.saldoAjuste ?? 0) < goal.valorMeta);
  const margin = monthly.dre.margemFinal.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  const messages = band === 'success' ? [
    `Respiro fundo no caixa! Sua margem de lucro tá em ${margin}%. ${goal ? `Se você reservar esse lucro, a Meta '${goal.nome}' ganha força na estrada!` : 'O caixa tá firme pra novos investimentos.'}`,
    `Mandou bem demais! Os gastos da pista e da equipe levaram ${percent(monthly.custosShows).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% do que entrou. Continue acompanhando o caixa antes de investir.`,
  ] : band === 'warning' ? [
    `Fica esperto na gasolina e no transporte: combustível e pedágio levaram ${percent(transport).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% do que entrou esse mês. Na próxima, já coloca a taxa de deslocamento na conta do contratante.`,
    `O cachê da rapaziada da banda levou ${teamPercent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% do total recebido. Tenta fechar pacote quando tiver dois shows no mesmo final de semana pra render mais.`,
  ] : band === 'danger' ? [
    `Atenção aqui: Você faturou ${formatCurrency(monthly.faturamentoBruto)}, mas só sobrou ${formatCurrency(monthly.lucroLiquidoReal)} de verdade no seu bolso. A estrutura do show tá engolindo o seu lucro. Hora de rever os custos da equipe ou subir o valor do show!`,
  ] : ['Ainda não entrou faturamento neste mês. Registre os recebimentos pra enxergar o momento real do caixa, sem confundir cachê combinado com dinheiro recebido.'];
  return { band, margin: monthly.dre.margemFinal, pending, transportPercent: percent(transport), teamPercent,
    message: messages[Math.abs(rotation) % messages.length],
    collection: pending > 0 ? `Tem ${formatCurrency(pending)} travado de show que você já fez esse mês. Passa o Pix pro contratante e cobra o saldo combinado antes do fim da semana!` : undefined };
}

export function contextualMaterial(band: ReturnType<typeof marginBand>, focus: MarketFocus) {
  if (focus === 'precificacao') return PAID_MATERIALS.precificacao;
  if (focus === 'repertorio') return PAID_MATERIALS.repertorio;
  if (focus === 'covers' || focus === 'video') return PAID_MATERIALS.covers;
  if (band === 'danger') return PAID_MATERIALS.bar;
  return { ...PAID_MATERIALS.precificacao, title: 'Próximo passo na estrada', message: "Quer fortalecer sua postura e negociação? Conheça o e-book 'Músico de Sucesso' na área de membros." };
}