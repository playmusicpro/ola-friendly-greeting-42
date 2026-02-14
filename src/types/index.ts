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

export interface Event {
  id: string;
  title: string;
  tipo: 'Show' | 'Ensaio' | 'Aula' | 'Gravação' | 'Compromisso' | 'Outro';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime?: string; // HH:MM
  local?: string;
  notes?: string;
  linkedShowId?: string; // Link to Show document
  playlistId?: string; // Link to Setlist
  realizado: boolean;
  // Google Calendar sync fields
  googleEventId?: string; // ID do evento no Google Calendar
  googleCalendarId?: string; // ID do calendário do Google
  syncStatus?: 'synced' | 'pending' | 'error' | 'local_only';
  lastSyncedAt?: string; // ISO timestamp
}

// Google Calendar Integration Types
export type GoogleCalendarStatus = 'disconnected' | 'connected' | 'syncing' | 'error';

export interface GoogleCalendarSettings {
  enabled: boolean;
  status: GoogleCalendarStatus;
  connectedAt?: string;
  lastSyncAt?: string;
  defaultCalendarId?: string;
  syncDirection: 'export_only' | 'import_only' | 'bidirectional';
  autoSync: boolean;
  syncIntervalMinutes: number;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  location?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

export interface SyncResult {
  success: boolean;
  eventsExported: number;
  eventsImported: number;
  errors: string[];
  timestamp: string;
}

// MVP Module Types

export interface FinancialGoal {
  id: string;
  nome: string;
  valorMeta: number;
  periodo: 'mensal' | 'semanal';
  dataInicio: string;
  dataFim: string;
  criadoEm: string;
}

export interface GeneralExpense {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  criadoEm: string;
}

export interface PiggyBank {
  id: string;
  nome: string;
  valorAtual: number;
  objetivo?: number;
  criadoEm: string;
  historico: Array<{
    id: string;
    tipo: 'deposito' | 'retirada';
    valor: number;
    data: string;
  }>;
}
