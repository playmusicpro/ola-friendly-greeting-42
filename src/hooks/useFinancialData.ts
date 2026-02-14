import { useState } from 'react';
import { Show, Expense, FixedExpense, Project, Income, NotificationSettings, Event, FinancialGoal, GeneralExpense, PiggyBank } from '@/types';

// Mock data para demonstração
const mockShows: Show[] = [
  {
    id: '1',
    date: '2024-12-15',
    time: '21:00',
    local: 'Bar do Zé',
    tipo: 'Bar',
    cache: 800,
    numMusicos: 1,
    consumacao: 50,
    kmRodados: 50,
    combustivel: 120,
    pedagio: 0,
    roupas: 0,
    equipamentos: 0,
    outrosCustos: 30,
    pagamentoMusicos: 0,
  },
  {
    id: '2',
    date: '2024-12-20',
    time: '22:00',
    local: 'Casa de Eventos Premium',
    tipo: 'Casa de Shows',
    cache: 1500,
    numMusicos: 1,
    consumacao: 100,
    kmRodados: 80,
    combustivel: 210,
    pedagio: 30,
    roupas: 0,
    equipamentos: 0,
    outrosCustos: 50,
    pagamentoMusicos: 0,
  },
  {
    id: '3',
    date: '2024-12-28',
    time: '20:00',
    local: 'Festa Particular',
    tipo: 'Particular',
    cache: 2000,
    numMusicos: 1,
    consumacao: 0,
    kmRodados: 120,
    combustivel: 280,
    pedagio: 45,
    roupas: 0,
    equipamentos: 0,
    outrosCustos: 75,
    pagamentoMusicos: 0,
  },
];

const mockExpenses: Expense[] = [
  { id: '1', category: 'combustivel', description: 'Gasolina - Show Bar do Zé', amount: 120, date: '2024-12-15' },
  { id: '2', category: 'roupas', description: 'Camisa social preta', amount: 150, date: '2024-12-05' },
  { id: '3', category: 'equipamentos', description: 'Jogo de cordas para violão', amount: 85, date: '2024-12-08' },
];

const mockFixedExpenses: FixedExpense[] = [
  { id: '1', description: 'Aluguel', amount: 1500, dueDay: 10 },
  { id: '2', description: 'Pensão alimentícia', amount: 800, dueDay: 5 },
  { id: '3', description: 'Parcela do carro', amount: 500, dueDay: 15 },
];

const mockProject: Project = {
  id: '1',
  name: 'Meu Primeiro Clipe Profissional',
  description: 'Clipe da música "Sem Você"',
  totalValue: 10000,
  savedValue: 3500,
  weeklyDeposit: 400,
};

const mockIncomes: Income[] = [
  { id: '1', description: 'Aula de violão - Maria', amount: 150, date: '2024-12-10', source: 'lessons', category: 'Ensino' },
  { id: '2', description: 'Produção musical freelance', amount: 800, date: '2024-12-15', source: 'freelance', category: 'Produção' },
];

const mockNotificationSettings: NotificationSettings = { enableWhatsAppNotifications: false };

const mockEvents: Event[] = [
  { id: '1', title: 'Bar do Zé', tipo: 'Show', date: '2024-12-15', startTime: '21:00', endTime: '23:00', local: 'Bar do Zé', linkedShowId: '1', realizado: false },
  { id: '2', title: 'Ensaio Banda', tipo: 'Ensaio', date: '2024-12-18', startTime: '19:00', endTime: '22:00', local: 'Estúdio Musical', realizado: false },
];

export function useFinancialData() {
  const [shows, setShows] = useState<Show[]>(mockShows);
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [fixedExpenses] = useState<FixedExpense[]>(mockFixedExpenses);
  const [project] = useState<Project>(mockProject);
  const [incomes, setIncomes] = useState<Income[]>(mockIncomes);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [generalExpenses, setGeneralExpenses] = useState<GeneralExpense[]>([]);
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>([]);

  // Shows CRUD
  const addShow = (showData: Omit<Show, 'id'>) => {
    const newShow: Show = { ...showData, id: Date.now().toString() };
    setShows(prev => [...prev, newShow].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const updateShow = (id: string, showData: Omit<Show, 'id'>) => {
    setShows(prev => prev.map(s => s.id === id ? { ...showData, id } : s).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const deleteShow = (id: string) => {
    setShows(prev => prev.filter(s => s.id !== id));
  };

  const duplicateShow = (id: string) => {
    const original = shows.find(s => s.id === id);
    if (!original) return;
    const dup: Show = { ...original, id: `show-${Date.now()}`, local: `${original.local} (cópia)` };
    setShows(prev => [dup, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    return dup;
  };

  // Incomes CRUD
  const addIncome = (data: Omit<Income, 'id'>) => {
    setIncomes(prev => [...prev, { ...data, id: Date.now().toString() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateIncome = (id: string, data: Omit<Income, 'id'>) => {
    setIncomes(prev => prev.map(i => i.id === id ? { ...data, id } : i).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...settings }));
  };

  // Events CRUD
  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = { ...eventData, id: Date.now().toString() };
    setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime()));
  };

  const updateEvent = (id: string, eventData: Omit<Event, 'id'>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...eventData, id } : e).sort((a, b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime()));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const duplicateEvent = (id: string) => {
    const original = events.find(e => e.id === id);
    if (!original) return;
    const dup: Event = { ...original, id: `event-${Date.now()}`, title: `${original.title} (cópia)` };
    setEvents(prev => [dup, ...prev].sort((a, b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime()));
    return dup;
  };

  const markEventAsRealizado = (id: string) => {
    const event = events.find(e => e.id === id);
    if (!event) return;
    updateEvent(id, { ...event, realizado: true });
    if (event.tipo === 'Show' && !event.linkedShowId) {
      addShow({
        date: event.date, time: event.startTime, local: event.local || event.title,
        tipo: 'Bar', cache: 0, numMusicos: 1, consumacao: 0, kmRodados: 0,
        combustivel: 0, pedagio: 0, roupas: 0, equipamentos: 0, outrosCustos: 0, pagamentoMusicos: 0,
      });
    }
  };

  // Goals CRUD
  const addGoal = (data: Omit<FinancialGoal, 'id' | 'criadoEm'>) => {
    const newGoal: FinancialGoal = { ...data, id: Date.now().toString(), criadoEm: new Date().toISOString() };
    setGoals(prev => [...prev, newGoal]);
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // General Expenses CRUD
  const addGeneralExpense = (data: Omit<GeneralExpense, 'id' | 'criadoEm'>) => {
    const newExp: GeneralExpense = { ...data, id: Date.now().toString(), criadoEm: new Date().toISOString() };
    setGeneralExpenses(prev => [...prev, newExp].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
  };

  const deleteGeneralExpense = (id: string) => {
    setGeneralExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Piggy Banks CRUD
  const addPiggyBank = (data: Omit<PiggyBank, 'id' | 'criadoEm' | 'historico'>) => {
    const newPB: PiggyBank = {
      ...data, id: Date.now().toString(), criadoEm: new Date().toISOString(),
      historico: data.valorAtual > 0 ? [{ id: `t-${Date.now()}`, tipo: 'deposito', valor: data.valorAtual, data: new Date().toISOString().split('T')[0] }] : [],
    };
    setPiggyBanks(prev => [...prev, newPB]);
  };

  const addToPiggyBank = (id: string, valor: number) => {
    setPiggyBanks(prev => prev.map(pb => pb.id === id ? {
      ...pb, valorAtual: pb.valorAtual + valor,
      historico: [...pb.historico, { id: `t-${Date.now()}`, tipo: 'deposito' as const, valor, data: new Date().toISOString().split('T')[0] }],
    } : pb));
  };

  const withdrawFromPiggyBank = (id: string, valor: number) => {
    setPiggyBanks(prev => prev.map(pb => pb.id === id ? {
      ...pb, valorAtual: Math.max(0, pb.valorAtual - valor),
      historico: [...pb.historico, { id: `t-${Date.now()}`, tipo: 'retirada' as const, valor, data: new Date().toISOString().split('T')[0] }],
    } : pb));
  };

  const deletePiggyBank = (id: string) => {
    setPiggyBanks(prev => prev.filter(pb => pb.id !== id));
  };

  return {
    shows, expenses, fixedExpenses, project, incomes, notificationSettings, events,
    goals, generalExpenses, piggyBanks,
    addShow, updateShow, deleteShow, duplicateShow,
    addIncome, updateIncome, deleteIncome,
    updateNotificationSettings,
    addEvent, updateEvent, deleteEvent, duplicateEvent, markEventAsRealizado,
    addGoal, deleteGoal,
    addGeneralExpense, deleteGeneralExpense,
    addPiggyBank, addToPiggyBank, withdrawFromPiggyBank, deletePiggyBank,
  };
}
