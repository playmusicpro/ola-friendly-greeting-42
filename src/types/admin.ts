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
  type: 'whatsapp' | 'backup' | 'error' | 'system' | 'usage';
  message: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  details?: string;
}

