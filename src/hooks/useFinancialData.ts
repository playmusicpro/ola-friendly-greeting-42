import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toISODate } from '@/lib/calculations';
import { showSchema } from '@/lib/showForm';
import { toast } from '@/hooks/use-toast';
import {
  Show, Expense, FixedExpense, Project, Income, NotificationSettings,
  Event, FinancialGoal, GeneralExpense, PiggyBank, GoalMovement,
} from '@/types';

/* ------------------------------------------------------------------ */
/* Mapeadores DB (snake_case) <-> Frontend (camelCase)                  */
/* ------------------------------------------------------------------ */

const num = (v: unknown) => Number(v ?? 0);

const toShow = (r: any): Show => ({
  id: r.id,
  title: r.title ?? undefined, contractor: r.contractor ?? undefined, address: r.address ?? undefined, notes: r.notes ?? undefined, endTime: r.end_time ?? undefined,
  date: r.date,
  time: r.time ?? '',
  local: r.local,
  tipo: r.tipo,
  cache: num(r.cache),
  numMusicos: num(r.num_musicos),
  consumacao: num(r.consumacao),
  kmRodados: num(r.km_rodados),
  combustivel: num(r.combustivel),
  pedagio: num(r.pedagio),
  roupas: num(r.roupas),
  equipamentos: num(r.equipamentos),
  outrosCustos: num(r.outros_custos),
  pagamentoMusicos: num(r.pagamento_musicos),
  realizado: !!r.realizado,
  cashTracking: r.cash_tracking, depositAmount: num(r.deposit_amount), depositReceived: r.deposit_received,
  depositDate: r.deposit_date ?? undefined, settled: r.settled, settlementDate: r.settlement_date ?? undefined,
  deductTeam: r.deduct_team, teamPaymentDate: r.team_payment_date ?? undefined,
});

const fromShow = (s: Omit<Show, 'id'>, userId: string) => ({
  user_id: userId,
  title: s.title || null, contractor: s.contractor || null, address: s.address || null, notes: s.notes || null, end_time: s.endTime || null,
  date: s.date,
  time: s.time || null,
  local: s.local,
  tipo: s.tipo,
  cache: s.cache,
  num_musicos: s.numMusicos,
  consumacao: s.consumacao,
  km_rodados: s.kmRodados,
  combustivel: s.combustivel,
  pedagio: s.pedagio,
  roupas: s.roupas,
  equipamentos: s.equipamentos,
  outros_custos: s.outrosCustos,
  pagamento_musicos: s.pagamentoMusicos,
  realizado: !!s.realizado,
  cash_tracking: s.cashTracking ?? false, deposit_amount: s.depositAmount ?? 0, deposit_received: s.depositReceived ?? false,
  deposit_date: s.depositDate || null, settled: s.settled ?? false, settlement_date: s.settlementDate || null,
  deduct_team: s.deductTeam ?? false, team_payment_date: s.teamPaymentDate || null,
});

const toGeneralExpense = (r: any): GeneralExpense => ({
  id: r.id,
  showId: r.show_id ?? undefined, origin: r.origin ?? undefined,
  descricao: r.descricao,
  categoria: r.categoria,
  valor: num(r.valor),
  data: r.data,
  criadoEm: r.created_at,
});

const toExpense = (r: any): Expense => ({
  id: r.id,
  showId: r.show_id ?? undefined, origin: r.origin ?? undefined,
  category: (['combustivel', 'roupas', 'equipamentos'].includes(r.categoria)
    ? r.categoria
    : 'equipamentos') as Expense['category'],
  description: r.descricao,
  amount: num(r.valor),
  date: r.data,
});

const toFixedExpense = (r: any): FixedExpense => ({
  id: r.id,
  description: r.descricao,
  amount: num(r.valor),
  dueDay: num(r.dia_vencimento),
  active: r.ativo,
});

const toIncome = (r: any): Income => ({
  id: r.id,
  description: r.descricao,
  amount: num(r.valor),
  date: r.data,
  category: r.categoria ?? undefined,
  source: r.source,
});

const fromIncome = (i: Omit<Income, 'id'>, userId: string) => ({
  user_id: userId,
  descricao: i.description,
  valor: i.amount,
  data: i.date,
  categoria: i.category ?? null,
  source: i.source,
});

const toEvent = (r: any): Event => ({
  id: r.id,
  title: r.title,
  tipo: r.tipo,
  date: r.date,
  startTime: r.start_time,
  endTime: r.end_time ?? undefined,
  local: r.local ?? undefined,
  notes: r.notes ?? undefined,
  linkedShowId: r.linked_show_id ?? undefined,
  playlistId: r.playlist_id ?? undefined,
  realizado: !!r.realizado,
  googleEventId: r.google_event_id ?? undefined,
  googleCalendarId: r.google_calendar_id ?? undefined,
  syncStatus: r.sync_status ?? undefined,
  lastSyncedAt: r.last_synced_at ?? undefined,
});

const isUuid = (v?: string) =>
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

const fromEvent = (e: Omit<Event, 'id'>, userId: string) => ({
  user_id: userId,
  title: e.title,
  tipo: e.tipo,
  date: e.date,
  start_time: e.startTime,
  end_time: e.endTime || null,
  local: e.local || null,
  notes: e.notes || null,
  linked_show_id: isUuid(e.linkedShowId) ? e.linkedShowId : null,
  playlist_id: isUuid(e.playlistId) ? e.playlistId : null,
  realizado: !!e.realizado,
  google_event_id: e.googleEventId || null,
  google_calendar_id: e.googleCalendarId || null,
  sync_status: e.syncStatus || 'local_only',
  last_synced_at: e.lastSyncedAt || null,
});

const toGoal = (r: any): FinancialGoal => ({
  id: r.id,
  nome: r.nome,
  valorMeta: num(r.valor_meta),
  saldoAjuste: num(r.saldo_ajuste),
  periodo: r.periodo,
  dataInicio: r.data_inicio,
  dataFim: r.data_fim ?? '',
  criadoEm: r.created_at,
});

const toProject = (r: any): Project => ({
  id: r.id,
  name: r.name ?? '',
  description: r.description ?? '',
  totalValue: num(r.total_value),
  savedValue: num(r.saved_value),
  weeklyDeposit: r.weekly_deposit != null ? num(r.weekly_deposit) : undefined,
  roteiro: r.roteiro ?? '',
  referencias: r.referencias ?? '',
  cronograma: r.cronograma ?? '',
});

const EMPTY_PROJECT: Project = {
  id: '', name: '', description: '', totalValue: 0, savedValue: 0,
  roteiro: '', referencias: '', cronograma: '',
};


/* ------------------------------------------------------------------ */

const notifyError = (context: string, error: unknown) => {
  const raw = (error as { message?: unknown } | null)?.message;
  const message = typeof raw === 'string' && raw.trim() ? raw : `Erro ao ${context}`;
  toast({ variant: 'destructive', title: `Erro ao ${context}`, description: message });
};

export function useFinancialData() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();

  const key = (name: string) => ['playpro', name, userId];
  const enabled = !!userId;

  /* ------------------------------- Queries ------------------------------ */

  const showsQ = useQuery({
    queryKey: key('shows'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('shows').select('*').eq('user_id', userId ?? '').order('date', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(toShow);
    },
  });

  const today = toISODate(new Date());
  const nextShowQ = useQuery({
    queryKey: [...key('next_show'), today], enabled,
    queryFn: async (): Promise<Show | null> => {
      const [shows, events] = await Promise.all([
        supabase.from('shows').select('*').eq('user_id', userId ?? '').eq('realizado', false).gte('date', today).order('date').order('time').limit(1),
        supabase.from('events').select('*').eq('user_id', userId ?? '').eq('tipo', 'Show').eq('realizado', false).is('linked_show_id', null).gte('date', today).order('date').order('start_time').limit(1),
      ]);
      if (shows.error) throw shows.error;
      if (events.error) throw events.error;
      const candidates = (shows.data ?? []).map(toShow);
      for (const e of events.data ?? []) candidates.push({ id: e.id, title: e.title, date: e.date, time: e.start_time, endTime: e.end_time ?? undefined, local: e.local || e.title, address: e.local ?? undefined, notes: e.notes ?? undefined, tipo: 'Show', cache: 0, numMusicos: 1, consumacao: 0, kmRodados: 0, combustivel: 0, pedagio: 0, roupas: 0, equipamentos: 0, outrosCustos: 0, pagamentoMusicos: 0, realizado: false });
      return candidates.sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time))[0] ?? null;
    },
  });

  const expensesQ = useQuery({
    queryKey: key('expenses'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*').eq('user_id', userId ?? '').order('data', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const fixedQ = useQuery({
    queryKey: key('fixed_expenses'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('fixed_expenses').select('*').eq('user_id', userId ?? '').order('dia_vencimento');
      if (error) throw error;
      return (data ?? []).map(toFixedExpense);
    },
  });

  const incomesQ = useQuery({
    queryKey: key('incomes'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('incomes').select('*').eq('user_id', userId ?? '').order('data', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toIncome);
    },
  });

  const eventsQ = useQuery({
    queryKey: key('events'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').eq('user_id', userId ?? '').order('date').order('start_time');
      if (error) throw error;
      return (data ?? []).map(toEvent);
    },
  });

  const goalsQ = useQuery({
    queryKey: key('financial_goals'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('financial_goals').select('*').eq('user_id', userId ?? '').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toGoal);
    },
  });

  const projectQ = useQuery({
    queryKey: key('projects'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId ?? '').order('created_at').limit(1);
      if (error) throw error;
      return data && data.length ? toProject(data[0]) : EMPTY_PROJECT;
    },
  });

  const goalMovementsQ = useQuery({
    queryKey: key('goal_movements'), enabled,
    queryFn: async (): Promise<GoalMovement[]> => {
      const rows: GoalMovement[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase.from('financial_goal_transactions').select('*').eq('user_id', userId ?? '').order('created_at').order('id').range(offset, offset + 499);
        if (error) throw error;
        rows.push(...(data ?? []).map(row => ({ id: row.id, goalId: row.goal_id, tipo: row.tipo as GoalMovement['tipo'], valor: num(row.valor), date: toISODate(new Date(row.created_at)) })));
        if ((data ?? []).length < 500) break;
      }
      return rows;
    },
  });

  const piggyQ = useQuery({
    queryKey: key('piggy_banks'), enabled,
    queryFn: async () => {
      const [banks, txs] = await Promise.all([
        supabase.from('piggy_banks').select('*').eq('user_id', userId ?? '').order('created_at'),
        supabase.from('piggy_bank_transactions').select('*').eq('user_id', userId ?? '').order('data', { ascending: true }),
      ]);
      if (banks.error) throw banks.error;
      if (txs.error) throw txs.error;
      return (banks.data ?? []).map((b: any): PiggyBank => ({
        id: b.id,
        nome: b.nome,
        valorAtual: num(b.valor_atual),
        objetivo: b.objetivo != null ? num(b.objetivo) : undefined,
        criadoEm: b.created_at,
        historico: (txs.data ?? [])
          .filter((t: any) => t.piggy_bank_id === b.id)
          .map((t: any) => ({ id: t.id, tipo: t.tipo, valor: num(t.valor), data: t.data })),
      }));
    },
  });

  const notifQ = useQuery({
    queryKey: key('notification_settings'), enabled,
    queryFn: async (): Promise<NotificationSettings> => {
      const { data, error } = await supabase.from('notification_settings').select('*').eq('user_id', userId ?? '').maybeSingle();
      if (error) throw error;
      return {
        enableWhatsAppNotifications: !!data?.enable_whatsapp,
        whatsAppNumber: data?.whatsapp_number ?? undefined,
      };
    },
  });

  /* ------------------------------ Mutations ----------------------------- */

  const invalidate = async (...names: string[]) => {
    const affected = new Set(names);
    if (affected.has('shows') || affected.has('events')) affected.add('next_show');
    await Promise.all([...affected].map(n => qc.invalidateQueries({ queryKey: key(n) })));
  };

  const run = async (context: string, fn: (ownerId: string) => Promise<void>, ...refresh: string[]) => {
    if (!userId) {
      notifyError(context, new Error('Sessão expirada. Faça login novamente.'));
      return false;
    }
    try {
      await fn(userId);
      await invalidate(...refresh);
      return true;
    } catch (e) {
      notifyError(context, e);
      return false;
    }
  };

  const req = async <T,>(p: PromiseLike<{ data: T; error: any }>): Promise<T> => {
    const { data, error } = await p;
    if (error) throw error;
    return data;
  };

  /* Shows */
  const addShow = (showData: Omit<Show, 'id'>, sourceEventId?: string) =>
    run('salvar show', async (ownerId) => {
      const validation = showSchema.safeParse(showData);
      if (!validation.success) throw new Error(validation.error.issues[0]?.message || 'Complete o cadastro do show.');
      const saved = await req(supabase.from('shows').insert(fromShow(showData, ownerId)).select('id').single());
      if (sourceEventId) await req(supabase.from('events').update({ linked_show_id: saved.id, title: showData.title || showData.local, date: showData.date, start_time: showData.time, end_time: showData.endTime || null, local: showData.local, notes: showData.notes || null, realizado: !!showData.realizado }).eq('id', sourceEventId));
    }, 'shows', 'expenses', 'events');

  const updateShow = (id: string, showData: Omit<Show, 'id'>) =>
    run('atualizar show', async (ownerId) => {
      await req(supabase.from('shows').update(fromShow(showData, ownerId)).eq('id', id));
    }, 'shows', 'expenses');

  const deleteShow = (id: string) =>
    run('excluir show', async (ownerId) => {
      await req(supabase.from('shows').delete().eq('id', id));
    }, 'shows', 'events', 'expenses');

  const markShowRealizado = (id: string, realizado = true) =>
    run('atualizar status do show', async (ownerId) => {
      await req(supabase.from('shows').update({ realizado }).eq('id', id));
      // Mantém o evento vinculado em sincronia, quando existir
      const linked = (eventsQ.data ?? []).find((e) => e.linkedShowId === id);
      if (linked) {
        await req(supabase.from('events').update({ realizado }).eq('id', linked.id));
      }
    }, 'shows', 'events', 'financial_goals');

  const duplicateShow = (id: string) => {
    const original = (showsQ.data ?? []).find((s) => s.id === id);
    if (!original) return;
    const { id: _drop, ...rest } = original;
    addShow({ ...rest, realizado: false, depositReceived: false, settled: false, deductTeam: false, depositDate: undefined, settlementDate: undefined, teamPaymentDate: undefined, local: `${original.local} (cópia)` });
    return { ...original, local: `${original.local} (cópia)` };
  };

  /* Projeto Audiovisual */
  const saveProject = (data: Partial<Omit<Project, 'id'>>) =>
    run('salvar projeto', async (ownerId) => {
      const current = projectQ.data ?? EMPTY_PROJECT;
      const payload = {
        user_id: ownerId,
        name: data.name ?? current.name ?? '',
        description: data.description ?? current.description ?? '',
        total_value: data.totalValue ?? current.totalValue ?? 0,
        saved_value: data.savedValue ?? current.savedValue ?? 0,
        weekly_deposit: data.weeklyDeposit ?? current.weeklyDeposit ?? null,
        roteiro: data.roteiro ?? current.roteiro ?? '',
        referencias: data.referencias ?? current.referencias ?? '',
        cronograma: data.cronograma ?? current.cronograma ?? '',
      };
      if (current.id) {
        await req(supabase.from('projects').update(payload).eq('id', current.id));
      } else {
        await req(supabase.from('projects').insert(payload));
      }
    }, 'projects');

  const moveProjectSavings = (valor: number, tipo: 'deposito' | 'retirada') =>
    run(tipo === 'deposito' ? 'depositar no cofrinho do projeto' : 'retirar do cofrinho do projeto', async (ownerId) => {
      const current = projectQ.data ?? EMPTY_PROJECT;
      if (!current.id) throw new Error('Crie o projeto antes de movimentar o cofrinho.');
      const novoValor = tipo === 'deposito'
        ? current.savedValue + valor
        : Math.max(0, current.savedValue - valor);
      await req(supabase.from('projects').update({ saved_value: novoValor }).eq('id', current.id));
    }, 'projects');

  const depositToProject = (valor: number) => moveProjectSavings(valor, 'deposito');
  const withdrawFromProject = (valor: number) => moveProjectSavings(valor, 'retirada');


  /* Receitas */
  const addIncome = (data: Omit<Income, 'id'>) =>
    run('salvar receita', async (ownerId) => {
      await req(supabase.from('incomes').insert(fromIncome(data, ownerId)));
    }, 'incomes');

  const updateIncome = (id: string, data: Omit<Income, 'id'>) =>
    run('atualizar receita', async (ownerId) => {
      await req(supabase.from('incomes').update(fromIncome(data, ownerId)).eq('id', id));
    }, 'incomes');

  const deleteIncome = (id: string) =>
    run('excluir receita', async (ownerId) => {
      await req(supabase.from('incomes').delete().eq('id', id));
    }, 'incomes');

  /* Notificações */
  const updateNotificationSettings = (settings: Partial<NotificationSettings>) =>
    run('salvar notificações', async (ownerId) => {
      const current = notifQ.data ?? { enableWhatsAppNotifications: false };
      const merged = { ...current, ...settings };
      await req(supabase.from('notification_settings').upsert({
        user_id: ownerId,
        enable_whatsapp: !!merged.enableWhatsAppNotifications,
        whatsapp_number: merged.whatsAppNumber ?? null,
      }, { onConflict: 'user_id' }));
    }, 'notification_settings');

  /* Eventos */
  const addEvent = (eventData: Omit<Event, 'id'>) =>
    run('salvar evento', async (ownerId) => {
      if (eventData.tipo === 'Show') throw new Error('Use Novo Show para preencher os dados financeiros do evento.');
      await req(supabase.from('events').insert(fromEvent(eventData, ownerId)));
    }, 'events');

  const updateEvent = (id: string, eventData: Omit<Event, 'id'>) =>
    run('atualizar evento', async (ownerId) => {
      await req(supabase.from('events').update(fromEvent(eventData, ownerId)).eq('id', id));
    }, 'events');

  const deleteEvent = (id: string) =>
    run('excluir evento', async (ownerId) => {
      await req(supabase.from('events').delete().eq('id', id));
    }, 'events');

  const duplicateEvent = (id: string) => {
    const original = (eventsQ.data ?? []).find((e) => e.id === id);
    if (!original) return;
    const { id: _drop, ...rest } = original;
    addEvent({ ...rest, title: `${original.title} (cópia)` });
    return { ...original, title: `${original.title} (cópia)` };
  };

  const markEventAsRealizado = (id: string) =>
    run('marcar evento como realizado', async (ownerId) => {
      const event = (eventsQ.data ?? []).find((e) => e.id === id);
      if (!event) throw new Error('Evento não encontrado');

      const linkedShowId = event.linkedShowId;
      if (event.tipo === 'Show' && !linkedShowId) {
        throw new Error('Complete o cadastro financeiro do show antes de marcar como realizado.');
      }

      await req(supabase.from('events')
        .update({ realizado: true, linked_show_id: linkedShowId ?? null })
        .eq('id', id));
    }, 'events', 'shows');

  /* Metas */
  const addGoal = (data: Omit<FinancialGoal, 'id' | 'criadoEm'>) =>
    run('salvar meta', async (ownerId) => {
      await req(supabase.from('financial_goals').insert({
        user_id: ownerId,
        nome: data.nome,
        valor_meta: data.valorMeta,
        periodo: data.periodo,
        data_inicio: data.dataInicio,
        data_fim: data.dataFim || null,
      }));
    }, 'financial_goals', 'goal_movements');

  const deleteGoal = (id: string) =>
    run('excluir meta', async (ownerId) => {
      if (((goalsQ.data ?? []).find(goal => goal.id === id)?.saldoAjuste ?? 0) > 0) throw new Error('Resgate o valor reservado antes de excluir a meta.');
      await req(supabase.rpc('delete_financial_goal' as never, { p_goal_id: id } as never));
    }, 'financial_goals', 'goal_movements');

  const moveGoal = (id: string, valor: number, tipo: 'deposito' | 'retirada') =>
    run('movimentar meta', async () => {
      await req(supabase.rpc('move_financial_goal', { p_goal_id: id, p_valor: valor, p_tipo: tipo }));
    }, 'financial_goals', 'goal_movements');

  const saveFixedExpense = (data: Omit<FixedExpense, 'id'>, id?: string) =>
    run('salvar despesa fixa', async (ownerId) => {
      const payload = { user_id: ownerId, descricao: data.description, valor: data.amount, dia_vencimento: data.dueDay, ativo: data.active !== false };
      if (id) await req(supabase.from('fixed_expenses').update(payload).eq('id', id).eq('user_id', ownerId));
      else await req(supabase.from('fixed_expenses').insert(payload));
    }, 'fixed_expenses');

  /* Gastos */
  const addGeneralExpense = (data: Omit<GeneralExpense, 'id' | 'criadoEm'>) =>
    run('salvar gasto', async (ownerId) => {
      await req(supabase.from('expenses').insert({
        user_id: ownerId,
        descricao: data.descricao,
        categoria: data.categoria,
        valor: data.valor,
        data: data.data,
      }));
    }, 'expenses');

  const deleteGeneralExpense = (id: string) =>
    run('excluir gasto', async (ownerId) => {
      await req(supabase.from('expenses').delete().eq('id', id));
    }, 'expenses');

  /* Cofrinhos */
  const addPiggyBank = (data: Omit<PiggyBank, 'id' | 'criadoEm' | 'historico'>) =>
    run('criar cofrinho', async (ownerId) => {
      const created = await req(supabase.from('piggy_banks').insert({
        user_id: ownerId,
        nome: data.nome,
        valor_atual: 0,
        objetivo: data.objetivo ?? null,
      }).select('id').single());

      if (data.valorAtual > 0) {
        await req(supabase.rpc('move_piggy_bank', { p_bank_id: (created as any).id, p_tipo: 'deposito', p_valor: data.valorAtual }));
      }
    }, 'piggy_banks');

  const movePiggyBank = (id: string, valor: number, tipo: 'deposito' | 'retirada') =>
    run(tipo === 'deposito' ? 'depositar no cofrinho' : 'retirar do cofrinho', async (ownerId) => {
      await req(supabase.rpc('move_piggy_bank', { p_bank_id: id, p_valor: valor, p_tipo: tipo }));
    }, 'piggy_banks');

  const addToPiggyBank = (id: string, valor: number) => movePiggyBank(id, valor, 'deposito');
  const withdrawFromPiggyBank = (id: string, valor: number) => movePiggyBank(id, valor, 'retirada');

  const deletePiggyBank = (id: string) =>
    run('excluir cofrinho', async (ownerId) => {
      if (((piggyQ.data ?? []).find(bank => bank.id === id)?.valorAtual ?? 0) > 0) throw new Error('Retire o saldo antes de excluir o cofrinho.');
      await req(supabase.from('piggy_banks').delete().eq('id', id));
    }, 'piggy_banks');

  /* ------------------------------- Retorno ------------------------------ */

  const expensesRaw = expensesQ.data ?? [];

  return {
    shows: showsQ.data ?? [],
    nextShow: nextShowQ.data ?? null,
    expenses: expensesRaw.map(toExpense) as Expense[],
    fixedExpenses: fixedQ.data ?? [],
    project: projectQ.data ?? EMPTY_PROJECT,
    incomes: incomesQ.data ?? [],
    notificationSettings: notifQ.data ?? { enableWhatsAppNotifications: false },
    events: eventsQ.data ?? [],
    goals: goalsQ.data ?? [],
    goalMovements: goalMovementsQ.data ?? [],
    generalExpenses: expensesRaw.map(toGeneralExpense) as GeneralExpense[],
    piggyBanks: piggyQ.data ?? [],
    isLoading:
      showsQ.isLoading || expensesQ.isLoading || incomesQ.isLoading || eventsQ.isLoading,

    addShow, updateShow, deleteShow, duplicateShow, markShowRealizado,
    saveProject, depositToProject, withdrawFromProject,
    addIncome, updateIncome, deleteIncome,
    updateNotificationSettings,
    addEvent, updateEvent, deleteEvent, duplicateEvent, markEventAsRealizado,
    addGoal, deleteGoal, moveGoal, saveFixedExpense,
    addGeneralExpense, deleteGeneralExpense,
    addPiggyBank, addToPiggyBank, withdrawFromPiggyBank, deletePiggyBank,
  };
}
