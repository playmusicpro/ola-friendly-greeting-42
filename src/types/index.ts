export interface Show {
  id: string;
  date: string;
  time: string;
  local: string;
  tipo: string;
  cache: number;
  numMusicos: number;
  consumacao: number;
  kmRodados: number;
  combustivel: number;
  pedagio: number;
  roupas: number;
  equipamentos: number;
  outrosCustos: number;
  pagamentoMusicos: number;
}

export interface ShowCalculations {
  totalGastos: number;
  lucroReal: number;
  margemPercentual: number;
  valeuAPena: boolean;
  precoMedioCombustivel: number;
}

export interface Expense {
  id: string;
  category: 'combustivel' | 'roupas' | 'equipamentos';
  description: string;
  amount: number;
  date: string;
}

export interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  dueDay: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  totalValue: number;
  savedValue: number;
  weeklyDeposit?: number;
}

export interface ProjectCalculations {
  progressPercentual: number;
  weeksToComplete?: number;
  metaAlcancada: boolean;
}

export interface MonthlyProjection {
  faturamentoProjetado: number;
  crescimentoMesAnterior: number;
  crescimentoAnoAnterior: number;
}

export interface DRE {
  receitaBruta: number;
  custosDirectos: number;
  despesasFixas: number;
  resultadoOperacional: number;
  margemFinal: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
}
