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

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  source: 'lessons' | 'freelance' | 'other';
}

export interface NotificationSettings {
  enableWhatsAppNotifications: boolean;
  whatsAppNumber?: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  userId: string;
  eventType: 'whatsapp' | 'push';
  eventId: string;
  messageBody: string;
  deliveryStatus: 'sent' | 'failed' | 'pending';
  error?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  tone: string; // Tom original
  howYouPlay?: string;
  cifraClubLink?: string;
  notes?: string;
  acordesArray?: string[]; // Array de acordes para transposição
  cifraText?: string; // Texto da cifra com acordes entre colchetes [C] [Am] etc
}

export interface Setlist {
  id: string;
  name: string;
  songIds: string[]; // Mantido para compatibilidade
  musicas: Array<{
    songId: string;
    tomEscolhido: string | null; // Tom transposto (sombra), null = tom original
  }>;
  order: string[]; // Ordem das músicas no setlist
  createdAt: string;
}
