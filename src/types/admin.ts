export interface AdminUser {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'premium';
  premiumExpiresAt: string | null;
  createdAt: string;
  lastLoginAt: string;
  showsCount: number;
  totalRevenue: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface AdminMetrics {
  mrr: number;
  mrrGrowth: number;
  activeUsers: number;
  activeUsersGrowth: number;
  churnRate: number;
  churnRateChange: number;
  dailyActiveUsers: number;
  dauGrowth: number;
  totalShows: number;
  totalRevenue: number;
}

export interface ShowAnalytics {
  id: string;
  userId: string;
  userName: string;
  eventName: string;
  city: string;
  date: string;
  revenue: number;
  costs: number;
  margin: number;
  marginPercent: number;
}

export interface CityAnalytics {
  city: string;
  showsCount: number;
  totalRevenue: number;
  avgMargin: number;
}

export interface LogEntry {
  id: string;
  type: 'whatsapp' | 'backup' | 'error' | 'system';
  message: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  details?: string;
}

// Mock data generators
export const generateMockUsers = (): AdminUser[] => [
  {
    id: '1',
    email: 'joao.silva@email.com',
    name: 'João Silva',
    plan: 'premium',
    premiumExpiresAt: '2025-12-31',
    createdAt: '2024-01-15',
    lastLoginAt: '2025-02-01',
    showsCount: 45,
    totalRevenue: 125000,
    status: 'active'
  },
  {
    id: '2',
    email: 'maria.santos@email.com',
    name: 'Maria Santos',
    plan: 'pro',
    premiumExpiresAt: '2025-06-30',
    createdAt: '2024-03-20',
    lastLoginAt: '2025-01-28',
    showsCount: 23,
    totalRevenue: 67500,
    status: 'active'
  },
  {
    id: '3',
    email: 'carlos.oliveira@email.com',
    name: 'Carlos Oliveira',
    plan: 'free',
    premiumExpiresAt: null,
    createdAt: '2024-06-10',
    lastLoginAt: '2025-01-15',
    showsCount: 8,
    totalRevenue: 12000,
    status: 'active'
  },
  {
    id: '4',
    email: 'ana.costa@email.com',
    name: 'Ana Costa',
    plan: 'premium',
    premiumExpiresAt: '2025-08-15',
    createdAt: '2024-02-28',
    lastLoginAt: '2025-02-02',
    showsCount: 56,
    totalRevenue: 189000,
    status: 'active'
  },
  {
    id: '5',
    email: 'pedro.lima@email.com',
    name: 'Pedro Lima',
    plan: 'pro',
    premiumExpiresAt: '2025-04-20',
    createdAt: '2024-05-12',
    lastLoginAt: '2024-12-20',
    showsCount: 15,
    totalRevenue: 34500,
    status: 'inactive'
  },
  {
    id: '6',
    email: 'lucia.ferreira@email.com',
    name: 'Lucia Ferreira',
    plan: 'free',
    premiumExpiresAt: null,
    createdAt: '2024-08-05',
    lastLoginAt: '2025-01-30',
    showsCount: 3,
    totalRevenue: 4500,
    status: 'active'
  },
  {
    id: '7',
    email: 'ricardo.souza@email.com',
    name: 'Ricardo Souza',
    plan: 'premium',
    premiumExpiresAt: '2025-10-10',
    createdAt: '2024-04-18',
    lastLoginAt: '2025-02-01',
    showsCount: 67,
    totalRevenue: 234000,
    status: 'active'
  },
  {
    id: '8',
    email: 'fernanda.alves@email.com',
    name: 'Fernanda Alves',
    plan: 'pro',
    premiumExpiresAt: '2025-03-25',
    createdAt: '2024-07-22',
    lastLoginAt: '2025-01-25',
    showsCount: 19,
    totalRevenue: 52000,
    status: 'active'
  }
];

export const generateMockMetrics = (): AdminMetrics => ({
  mrr: 12450,
  mrrGrowth: 15.3,
  activeUsers: 847,
  activeUsersGrowth: 8.7,
  churnRate: 2.1,
  churnRateChange: -0.5,
  dailyActiveUsers: 234,
  dauGrowth: 12.4,
  totalShows: 1456,
  totalRevenue: 2340000
});

export const generateMockShowAnalytics = (): ShowAnalytics[] => [
  {
    id: '1',
    userId: '1',
    userName: 'João Silva',
    eventName: 'Casamento Silva',
    city: 'São Paulo',
    date: '2025-01-28',
    revenue: 5500,
    costs: 1200,
    margin: 4300,
    marginPercent: 78.2
  },
  {
    id: '2',
    userId: '4',
    userName: 'Ana Costa',
    eventName: 'Aniversário 50 anos',
    city: 'Rio de Janeiro',
    date: '2025-01-25',
    revenue: 4200,
    costs: 800,
    margin: 3400,
    marginPercent: 81.0
  },
  {
    id: '3',
    userId: '7',
    userName: 'Ricardo Souza',
    eventName: 'Evento Corporativo',
    city: 'Belo Horizonte',
    date: '2025-01-22',
    revenue: 8500,
    costs: 2100,
    margin: 6400,
    marginPercent: 75.3
  },
  {
    id: '4',
    userId: '2',
    userName: 'Maria Santos',
    eventName: 'Formatura Medicina',
    city: 'São Paulo',
    date: '2025-01-20',
    revenue: 3800,
    costs: 650,
    margin: 3150,
    marginPercent: 82.9
  },
  {
    id: '5',
    userId: '1',
    userName: 'João Silva',
    eventName: 'Bar Mitzvah',
    city: 'Curitiba',
    date: '2025-01-18',
    revenue: 6200,
    costs: 1400,
    margin: 4800,
    marginPercent: 77.4
  }
];

export const generateMockCityAnalytics = (): CityAnalytics[] => [
  { city: 'São Paulo', showsCount: 456, totalRevenue: 890000, avgMargin: 76.5 },
  { city: 'Rio de Janeiro', showsCount: 289, totalRevenue: 567000, avgMargin: 74.2 },
  { city: 'Belo Horizonte', showsCount: 178, totalRevenue: 345000, avgMargin: 78.1 },
  { city: 'Curitiba', showsCount: 145, totalRevenue: 278000, avgMargin: 79.3 },
  { city: 'Porto Alegre', showsCount: 123, totalRevenue: 234000, avgMargin: 75.8 },
  { city: 'Salvador', showsCount: 98, totalRevenue: 189000, avgMargin: 73.4 },
  { city: 'Brasília', showsCount: 87, totalRevenue: 167000, avgMargin: 77.9 },
  { city: 'Recife', showsCount: 80, totalRevenue: 145000, avgMargin: 72.6 }
];

export const generateMockLogs = (): LogEntry[] => [
  {
    id: '1',
    type: 'whatsapp',
    message: 'DRE enviado com sucesso',
    userId: '1',
    userName: 'João Silva',
    timestamp: '2025-02-02T10:30:00',
    status: 'success',
    details: 'Show: Casamento Silva - 28/01/2025'
  },
  {
    id: '2',
    type: 'backup',
    message: 'Backup automático realizado',
    timestamp: '2025-02-02T03:00:00',
    status: 'success',
    details: '847 usuários, 1456 shows'
  },
  {
    id: '3',
    type: 'error',
    message: 'Falha ao processar pagamento Stripe',
    userId: '5',
    userName: 'Pedro Lima',
    timestamp: '2025-02-01T14:22:00',
    status: 'failed',
    details: 'card_declined: insufficient_funds'
  },
  {
    id: '4',
    type: 'whatsapp',
    message: 'Falha ao enviar mensagem',
    userId: '3',
    userName: 'Carlos Oliveira',
    timestamp: '2025-02-01T11:45:00',
    status: 'failed',
    details: 'Número inválido: +55119...'
  },
  {
    id: '5',
    type: 'system',
    message: 'Novo usuário registrado',
    userId: '8',
    userName: 'Fernanda Alves',
    timestamp: '2025-02-01T09:15:00',
    status: 'success'
  },
  {
    id: '6',
    type: 'backup',
    message: 'Backup automático realizado',
    timestamp: '2025-02-01T03:00:00',
    status: 'success',
    details: '845 usuários, 1452 shows'
  },
  {
    id: '7',
    type: 'whatsapp',
    message: 'DRE enviado com sucesso',
    userId: '4',
    userName: 'Ana Costa',
    timestamp: '2025-01-31T16:20:00',
    status: 'success',
    details: 'Show: Aniversário 50 anos - 25/01/2025'
  },
  {
    id: '8',
    type: 'error',
    message: 'Erro ao gerar PDF',
    userId: '2',
    userName: 'Maria Santos',
    timestamp: '2025-01-31T12:10:00',
    status: 'failed',
    details: 'Memory limit exceeded'
  }
];
