import { 
  Show, 
  ShowCalculations, 
  MonthlyProjection, 
  DRE, 
  Alert,
  ProjectCalculations,
  Project,
  Expense,
  FixedExpense
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

  const lucroReal = show.cache - totalGastos;
  const margemPercentual = show.cache > 0 ? (lucroReal / show.cache) * 100 : 0;
  const valeuAPena = lucroReal > 0;
  const precoMedioCombustivel = show.kmRodados > 0 ? show.combustivel / show.kmRodados : 0;

  return {
    totalGastos,
    lucroReal,
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
  fixedExpenses: FixedExpense[]
): DRE {
  const receitaBruta = shows.reduce((sum, show) => sum + show.cache, 0);
  
  const custosDirectos = shows.reduce((sum, show) => {
    const calc = calculateShow(show);
    return sum + calc.totalGastos;
  }, 0);

  const despesasFixas = 
    expenses.reduce((sum, exp) => sum + exp.amount, 0) +
    fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const resultadoOperacional = receitaBruta - custosDirectos - despesasFixas;
  const margemFinal = receitaBruta > 0 ? (resultadoOperacional / receitaBruta) * 100 : 0;

  return {
    receitaBruta,
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
  receita: number;
  custo: number;
  lucro: number;
  margem: number;
}

export function calculateShowDRE(show: Show): ShowDRE {
  const calc = calculateShow(show);
  return {
    showId: show.id,
    titulo: show.local,
    data: show.date,
    receita: show.cache,
    custo: calc.totalGastos,
    lucro: calc.lucroReal,
    margem: calc.margemPercentual,
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

  // Top 5 mais lucrativos
  const topMost = [...items]
    .sort((a, b) => b.lucro - a.lucro)
    .slice(0, 5);

  // Top 5 menos lucrativos
  const topLeast = [...items]
    .sort((a, b) => a.lucro - b.lucro)
    .slice(0, 5);

  // Dados para gráfico
  const chartData = items.map((item) => ({
    name: item.titulo,
    receita: item.receita,
    custo: item.custo,
  }));

  return {
    items,
    topMost,
    topLeast,
    chartData,
  };
}
