import { useState } from 'react';
import { Show, Expense, FixedExpense, Project, Income, NotificationSettings, Event } from '@/types';

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
  {
    id: '1',
    category: 'combustivel',
    description: 'Gasolina - Show Bar do Zé',
    amount: 120,
    date: '2024-12-15',
  },
  {
    id: '2',
    category: 'roupas',
    description: 'Camisa social preta',
    amount: 150,
    date: '2024-12-05',
  },
  {
    id: '3',
    category: 'equipamentos',
    description: 'Jogo de cordas para violão',
    amount: 85,
    date: '2024-12-08',
  },
];

const mockFixedExpenses: FixedExpense[] = [
  {
    id: '1',
    description: 'Aluguel',
    amount: 1500,
    dueDay: 10,
  },
  {
    id: '2',
    description: 'Pensão alimentícia',
    amount: 800,
    dueDay: 5,
  },
  {
    id: '3',
    description: 'Parcela do carro',
    amount: 500,
    dueDay: 15,
  },
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
  {
    id: '1',
    description: 'Aula de violão - Maria',
    amount: 150,
    date: '2024-12-10',
    source: 'lessons',
    category: 'Ensino',
  },
  {
    id: '2',
    description: 'Produção musical freelance',
    amount: 800,
    date: '2024-12-15',
    source: 'freelance',
    category: 'Produção',
  },
];

const mockNotificationSettings: NotificationSettings = {
  enableWhatsAppNotifications: false,
};

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Bar do Zé',
    tipo: 'Show',
    date: '2024-12-15',
    startTime: '21:00',
    endTime: '23:00',
    local: 'Bar do Zé',
    linkedShowId: '1',
    realizado: false,
  },
  {
    id: '2',
    title: 'Ensaio Banda',
    tipo: 'Ensaio',
    date: '2024-12-18',
    startTime: '19:00',
    endTime: '22:00',
    local: 'Estúdio Musical',
    realizado: false,
  },
];

export function useFinancialData() {
  const [shows, setShows] = useState<Show[]>(mockShows);
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [fixedExpenses] = useState<FixedExpense[]>(mockFixedExpenses);
  const [project] = useState<Project>(mockProject);
  const [incomes, setIncomes] = useState<Income[]>(mockIncomes);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings);
  const [events, setEvents] = useState<Event[]>(mockEvents);

  const addShow = (showData: Omit<Show, 'id'>) => {
    const newShow: Show = {
      ...showData,
      id: Date.now().toString(),
    };
    setShows(prev => [...prev, newShow].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
  };

  const updateShow = (id: string, showData: Omit<Show, 'id'>) => {
    setShows(prev => prev.map(show => 
      show.id === id ? { ...showData, id } : show
    ).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
  };

  const deleteShow = (id: string) => {
    setShows(prev => prev.filter(show => show.id !== id));
  };

  const duplicateShow = (id: string) => {
    const originalShow = shows.find(show => show.id === id);
    if (!originalShow) return;

    const duplicatedShow: Show = {
      ...originalShow,
      id: `show-${Date.now()}`,
      local: `${originalShow.local} (cópia)`,
    };

    setShows(prev => [duplicatedShow, ...prev].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));

    return duplicatedShow;
  };

  const addIncome = (incomeData: Omit<Income, 'id'>) => {
    const newIncome: Income = {
      ...incomeData,
      id: Date.now().toString(),
    };
    setIncomes(prev => [...prev, newIncome].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const updateIncome = (id: string, incomeData: Omit<Income, 'id'>) => {
    setIncomes(prev => prev.map(income => 
      income.id === id ? { ...incomeData, id } : income
    ).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const deleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(income => income.id !== id));
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...settings }));
  };

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent].sort((a, b) => 
      new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime()
    ));
  };

  const updateEvent = (id: string, eventData: Omit<Event, 'id'>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...eventData, id } : event
    ).sort((a, b) => 
      new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime()
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const duplicateEvent = (id: string) => {
    const originalEvent = events.find(event => event.id === id);
    if (!originalEvent) return;

    const duplicatedEvent: Event = {
      ...originalEvent,
      id: `event-${Date.now()}`,
      title: `${originalEvent.title} (cópia)`,
    };

    setEvents(prev => [duplicatedEvent, ...prev].sort((a, b) => 
      new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime()
    ));

    return duplicatedEvent;
  };

  const markEventAsRealizado = (id: string) => {
    const event = events.find(e => e.id === id);
    if (!event) return;

    // Mark event as realizado
    updateEvent(id, { ...event, realizado: true });

    // If it's a Show event and not linked, optionally create Show doc
    if (event.tipo === 'Show' && !event.linkedShowId) {
      const newShow: Omit<Show, 'id'> = {
        date: event.date,
        time: event.startTime,
        local: event.local || event.title,
        tipo: 'Bar',
        cache: 0,
        numMusicos: 1,
        consumacao: 0,
        kmRodados: 0,
        combustivel: 0,
        pedagio: 0,
        roupas: 0,
        equipamentos: 0,
        outrosCustos: 0,
        pagamentoMusicos: 0,
      };
      addShow(newShow);
    }
  };

  return {
    shows,
    expenses,
    fixedExpenses,
    project,
    incomes,
    notificationSettings,
    events,
    addShow,
    updateShow,
    deleteShow,
    duplicateShow,
    addIncome,
    updateIncome,
    deleteIncome,
    updateNotificationSettings,
    addEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    markEventAsRealizado,
  };
}
