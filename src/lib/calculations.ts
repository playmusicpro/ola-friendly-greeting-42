import { 
  Show, 
  ShowCalculations, 
  MonthlyProjection, 
  DRE, 
  Alert,
  ProjectCalculations,
  Project,
  Expense,
  FixedExpense,
  Income,
  FinancialGoal
} from '@/types';

export function calculateShow(show: Show): ShowCalculations {
  const totalGastos = 
    show.combustivel + 
    show.pedagio + 
    show.roupas + 
    show.equipamentos + 
    show.consumacao + 
    show.pagamentoMusicos + 
    show.outrosCustos;

  const faturamentoReal = show.cache - totalGastos;
  const margemPercentual = show.cache > 0 ? (faturamentoReal / show.cache) * 100 : 0;
  const valeuAPena = faturamentoReal > 0;
  const precoMedioCombustivel = show.kmRodados > 0 ? show.combustivel / show.kmRodados : 0;

  return {
    totalGastos,
    faturamentoReal,
    lucroReal: faturamentoReal,
    margemPercentual,
    valeuAPena,
    precoMedioCombustivel,
  };
}

export function calculateMonthlyProjection(
  showsLastThreeMonths: Show[]
): MonthlyProjection {
  const totalRevenue = showsLastThreeMonths.reduce((sum, show) => sum + show.cache, 0);
  const averageMonthly = showsLastThreeMonths.length > 0 ? totalRevenue / 3 : 0;
  const faturamentoProjetado = averageMonthly * 1.1;

  // Para crescimento, precisaríamos de dados históricos mais completos
  // Por enquanto, retorna valores zerados
  const crescimentoMesAnterior = 0;
  const crescimentoAnoAnterior = 0;

  return {
    faturamentoProjetado,
    crescimentoMesAnterior,
    crescimentoAnoAnterior,
  };
}

export function calculateDRE(
  shows: Show[],
  expenses: Expense[],
  fixedExpenses: FixedExpense[],
  incomes?: Income[]
): DRE {
  const receitaBruta = shows.reduce((sum, show) => sum + show.cache, 0);
  const receitaOutras = incomes ? incomes.reduce((sum, income) => sum + income.amount, 0) : 0;
  
  const custosDirectos = shows.reduce((sum, show) => {
    const calc = calculateShow(show);
    return sum + calc.totalGastos;
  }, 0);

  const despesasFixas = 
    expenses.reduce((sum, exp) => sum + exp.amount, 0) +
    fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const resultadoOperacional = (receitaBruta + receitaOutras) - custosDirectos - despesasFixas;
  const margemFinal = (receitaBruta + receitaOutras) > 0 ? (resultadoOperacional / (receitaBruta + receitaOutras)) * 100 : 0;

  return {
    receitaBruta: receitaBruta + receitaOutras,
    custosDirectos,
    despesasFixas,
    resultadoOperacional,
    margemFinal,
  };
}

export function calculateProjectProgress(project: Project): ProjectCalculations {
  const progressPercentual = project.totalValue > 0 
    ? (project.savedValue / project.totalValue) * 100 
    : 0;
  
  const metaAlcancada = progressPercentual >= 100;
  
  let weeksToComplete: number | undefined;
  if (project.weeklyDeposit && project.weeklyDeposit > 0 && !metaAlcancada) {
    const remaining = project.totalValue - project.savedValue;
    weeksToComplete = Math.ceil(remaining / project.weeklyDeposit);
  }

  return {
    progressPercentual,
    weeksToComplete,
    metaAlcancada,
  };
}

export function generateAlerts(
  shows: Show[],
  dre: DRE,
  lastShowDate?: Date
): Alert[] {
  const alerts: Alert[] = [];

  // Alerta: margem baixa nos shows
  const showsWithCalculations = shows.map(show => ({
    show,
    calc: calculateShow(show),
  }));

  const lowMarginShows = showsWithCalculations.filter(
    ({ calc }) => calc.margemPercentual < 15 && calc.margemPercentual > 0
  );

  if (lowMarginShows.length > 0 && lowMarginShows.length === shows.length) {
    alerts.push({
      id: 'low-margin',
      type: 'warning',
      message: 'Seus shows estão com margem baixa este mês.',
    });
  }

  // Alerta: despesas altas
  if (dre.receitaBruta > 0) {
    const despesasPercentual = (dre.despesasFixas / dre.receitaBruta) * 100;
    if (despesasPercentual > 40) {
      alerts.push({
        id: 'high-expenses',
        type: 'danger',
        message: 'Cuidado: suas despesas estão consumindo grande parte do faturamento.',
      });
    }
  }

  // Alerta: sem shows há 14 dias
  if (lastShowDate) {
    const daysSinceLastShow = Math.floor(
      (new Date().getTime() - lastShowDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastShow >= 14) {
      alerts.push({
        id: 'no-recent-shows',
        type: 'info',
        message: 'Está na hora de atualizar sua agenda!',
      });
    }
  }

  return alerts;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export interface ShowDRE {
  showId: string;
  titulo: string;
  data: string;
  /** Receita bruta (cachê contratado) */
  receita: number;
  /** Custos totais do evento (combustível, cachê da equipe, etc.) */
  custo: number;
  /** Faturamento real = receita bruta - custos */
  faturamento: number;
  /** @deprecated use faturamento */
  lucro: number;
  margem: number;
  realizado: boolean;
}

export function calculateShowDRE(show: Show): ShowDRE {
  const calc = calculateShow(show);
  return {
    showId: show.id,
    titulo: show.local,
    data: show.date,
    receita: show.cache,
    custo: calc.totalGastos,
    faturamento: calc.faturamentoReal,
    lucro: calc.faturamentoReal,
    margem: calc.margemPercentual,
    realizado: !!show.realizado,
  };
}

export function getShowsAnalysis(
  shows: Show[],
  startDate?: string,
  endDate?: string
) {
  // Filtrar por período se fornecido
  let filteredShows = shows;
  if (startDate || endDate) {
    filteredShows = shows.filter((show) => {
      if (startDate && show.date < startDate) return false;
      if (endDate && show.date > endDate) return false;
      return true;
    });
  }

  // Calcular DRE para cada show
  const items = filteredShows.map(calculateShowDRE);

  // Ranking por faturamento real (receita - custos) e, em empate, por margem
  const byFaturamento = (a: ShowDRE, b: ShowDRE) =>
    b.faturamento - a.faturamento || b.margem - a.margem;

  const topMost = [...items].sort(byFaturamento).slice(0, 5);
  const topLeast = [...items].sort((a, b) => byFaturamento(b, a)).slice(0, 5);

  const receitaBrutaTotal = items.reduce((sum, i) => sum + i.receita, 0);
  const custoTotal = items.reduce((sum, i) => sum + i.custo, 0);
  const faturamentoTotal = receitaBrutaTotal - custoTotal;
  const margemMedia = receitaBrutaTotal > 0 ? (faturamentoTotal / receitaBrutaTotal) * 100 : 0;

  // Dados para gráfico
  const chartData = items.map((item) => ({
    name: item.titulo,
    receita: item.receita,
    custo: item.custo,
    faturamento: item.faturamento,
  }));

  return {
    items,
    topMost,
    topLeast,
    chartData,
    receitaBrutaTotal,
    custoTotal,
    faturamentoTotal,
    margemMedia,
  };
}

/* ------------------------------------------------------------------ */
/* Períodos, metas e projeção                                          */
/* ------------------------------------------------------------------ */

const toISODate = (d: Date) => d.toISOString().split('T')[0];

/** Intervalo (YYYY-MM-DD) do período atual: semana (seg-dom) ou mês corrente. */
export function getPeriodRange(
  periodo: 'mensal' | 'semanal',
  reference: Date = new Date()
): { start: string; end: string } {
  const ref = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());

  if (periodo === 'semanal') {
    const day = ref.getDay(); // 0 = domingo
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(ref);
    start.setDate(ref.getDate() + diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: toISODate(start), end: toISODate(end) };
  }

  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return { start: toISODate(start), end: toISODate(end) };
}

const inRange = (date: string, start: string, end: string) => date >= start && date <= end;

export interface GoalProgress {
  meta: number;
  realizado: number;
  restante: number;
  progressoPercentual: number;
  concluida: boolean;
  periodo: 'mensal' | 'semanal';
  start: string;
  end: string;
}

/**
 * Progresso de uma meta considerando apenas shows finalizados no período
 * (faturamento real = cachê - custos) somados às outras receitas do período.
 */
export function calculateGoalProgress(
  goal: FinancialGoal,
  shows: Show[],
  incomes: Income[] = [],
  reference: Date = new Date()
): GoalProgress {
  const periodo = goal.periodo === 'semanal' ? 'semanal' : 'mensal';
  const { start, end } = getPeriodRange(periodo, reference);

  const faturamentoShows = shows
    .filter((s) => s.realizado && inRange(s.date, start, end))
    .reduce((sum, s) => sum + calculateShow(s).faturamentoReal, 0);

  const outrasReceitas = incomes
    .filter((i) => inRange(i.date, start, end))
    .reduce((sum, i) => sum + i.amount, 0);

  const realizado = faturamentoShows + outrasReceitas;
  const meta = goal.valorMeta || 0;
  const progressoPercentual = meta > 0 ? Math.min(100, (realizado / meta) * 100) : 0;

  return {
    meta,
    realizado,
    restante: Math.max(0, meta - realizado),
    progressoPercentual,
    concluida: meta > 0 && realizado >= meta,
    periodo,
    start,
    end,
  };
}

/**
 * Faturamento projetado: média mensal do faturamento real dos últimos 3 meses
 * (shows finalizados) + faturamento previsto dos shows já agendados no mês atual.
 */
export function calculateProjectedRevenue(
  shows: Show[],
  reference: Date = new Date()
): { faturamentoProjetado: number; mediaMensal: number; previstoMesAtual: number } {
  const inicioJanela = new Date(reference.getFullYear(), reference.getMonth() - 2, 1);
  const inicio = toISODate(inicioJanela);
  const hoje = toISODate(reference);
  const { start: inicioMes, end: fimMes } = getPeriodRange('mensal', reference);

  const realizados = shows.filter(
    (s) => s.realizado && s.date >= inicio && s.date <= hoje
  );
  const totalRealizado = realizados.reduce(
    (sum, s) => sum + calculateShow(s).faturamentoReal,
    0
  );
  const mediaMensal = totalRealizado / 3;

  const previstoMesAtual = shows
    .filter((s) => !s.realizado && inRange(s.date, inicioMes, fimMes) && s.date >= hoje)
    .reduce((sum, s) => sum + calculateShow(s).faturamentoReal, 0);

  return {
    faturamentoProjetado: mediaMensal + previstoMesAtual,
    mediaMensal,
    previstoMesAtual,
  };
}

/** Próximo show futuro ainda não finalizado. */
export function getNextShow(shows: Show[], reference: Date = new Date()): Show | null {
  const hoje = toISODate(reference);
  const futuros = shows
    .filter((s) => !s.realizado && s.date >= hoje)
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  return futuros[0] ?? null;
}
