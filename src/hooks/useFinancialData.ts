import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  Show, Expense, FixedExpense, Project, Income, NotificationSettings,
  Event, FinancialGoal, GeneralExpense, PiggyBank,
} from '@/types';

/* ------------------------------------------------------------------ */
/* Mapeadores DB (snake_case) <-> Frontend (camelCase)                  */
/* ------------------------------------------------------------------ */

const num = (v: unknown) => Number(v ?? 0);

const toShow = (r: any): Show => ({
  id: r.id,
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
});

const fromShow = (s: Omit<Show, 'id'>, userId: string) => ({
  user_id: userId,
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
});

const toGeneralExpense = (r: any): GeneralExpense => ({
  id: r.id,
  descricao: r.descricao,
  categoria: r.categoria,
  valor: num(r.valor),
  data: r.data,
  criadoEm: r.created_at,
});

const toExpense = (r: any): Expense => ({
  id: r.id,
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
  periodo: r.periodo,
  dataInicio: r.data_inicio,
  dataFim: r.data_fim ?? '',
  criadoEm: r.created_at,
});

const toProject = (r: any): Project => ({
  id: r.id,
  name: r.name,
  description: r.description ?? '',
  totalValue: num(r.total_value),
  savedValue: num(r.saved_value),
  weeklyDeposit: r.weekly_deposit != null ? num(r.weekly_deposit) : undefined,
});

const EMPTY_PROJECT: Project = {
  id: '', name: 'Nenhum projeto', description: '', totalValue: 0, savedValue: 0,
};

/* ------------------------------------------------------------------ */

const notifyError = (context: string, error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
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
      const { data, error } = await supabase.from('shows').select('*').order('date', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(toShow);
    },
  });

  const expensesQ = useQuery({
    queryKey: key('expenses'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*').order('data', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const fixedQ = useQuery({
    queryKey: key('fixed_expenses'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('fixed_expenses').select('*').order('dia_vencimento');
      if (error) throw error;
      return (data ?? []).map(toFixedExpense);
    },
  });

  const incomesQ = useQuery({
    queryKey: key('incomes'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('incomes').select('*').order('data', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toIncome);
    },
  });

  const eventsQ = useQuery({
    queryKey: key('events'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').order('date').order('start_time');
      if (error) throw error;
      return (data ?? []).map(toEvent);
    },
  });

  const goalsQ = useQuery({
    queryKey: key('financial_goals'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('financial_goals').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toGoal);
    },
  });

  const projectQ = useQuery({
    queryKey: key('projects'), enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').order('created_at').limit(1);
      if (error) throw error;
      return data && data.length ? toProject(data[0]) : EMPTY_PROJECT;
    },
  });

  const piggyQ = useQuery({
    queryKey: key('piggy_banks'), enabled,
    queryFn: async () => {
      const [banks, txs] = await Promise.all([
        supabase.from('piggy_banks').select('*').order('created_at'),
        supabase.from('piggy_bank_transactions').select('*').order('data', { ascending: true }),
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
      const { data, error } = await supabase.from('notification_settings').select('*').maybeSingle();
      if (error) throw error;
      return {
        enableWhatsAppNotifications: !!data?.enable_whatsapp,
        whatsAppNumber: data?.whatsapp_number ?? undefined,
      };
    },
  });

  /* ------------------------------ Mutations ----------------------------- */

  const invalidate = (...names: string[]) =>
    names.forEach((n) => qc.invalidateQueries({ queryKey: key(n) }));

  const run = async (context: string, fn: () => Promise<void>, ...refresh: string[]) => {
    if (!userId) {
      notifyError(context, new Error('Sessão expirada. Faça login novamente.'));
      return;
    }
    try {
      await fn();
      invalidate(...refresh);
    } catch (e) {
      notifyError(context, e);
    }
  };

  const req = async <T,>(p: PromiseLike<{ data: T; error: any }>): Promise<T> => {
    const { data, error } = await p;
    if (error) throw error;
    return data;
  };

  /* Shows */
  const addShow = (showData: Omit<Show, 'id'>) =>
    run('salvar show', async () => {
      await req(supabase.from('shows').insert(fromShow(showData, userId!)));
    }, 'shows');

  const updateShow = (id: string, showData: Omit<Show, 'id'>) =>
    run('atualizar show', async () => {
      await req(supabase.from('shows').update(fromShow(showData, userId!)).eq('id', id));
    }, 'shows');

  const deleteShow = (id: string) =>
    run('excluir show', async () => {
      await req(supabase.from('shows').delete().eq('id', id));
    }, 'shows', 'events');

  const duplicateShow = (id: string) => {
    const original = (showsQ.data ?? []).find((s) => s.id === id);
    if (!original) return;
    const { id: _drop, ...rest } = original;
    addShow({ ...rest, local: `${original.local} (cópia)` });
    return { ...original, local: `${original.local} (cópia)` };
  };

  /* Receitas */
  const addIncome = (data: Omit<Income, 'id'>) =>
    run('salvar receita', async () => {
      await req(supabase.from('incomes').insert(fromIncome(data, userId!)));
    }, 'incomes');

  const updateIncome = (id: string, data: Omit<Income, 'id'>) =>
    run('atualizar receita', async () => {
      await req(supabase.from('incomes').update(fromIncome(data, userId!)).eq('id', id));
    }, 'incomes');

  const deleteIncome = (id: string) =>
    run('excluir receita', async () => {
      await req(supabase.from('incomes').delete().eq('id', id));
    }, 'incomes');

  /* Notificações */
  const updateNotificationSettings = (settings: Partial<NotificationSettings>) =>
    run('salvar notificações', async () => {
      const current = notifQ.data ?? { enableWhatsAppNotifications: false };
      const merged = { ...current, ...settings };
      await req(supabase.from('notification_settings').upsert({
        user_id: userId!,
        enable_whatsapp: !!merged.enableWhatsAppNotifications,
        whatsapp_number: merged.whatsAppNumber ?? null,
      }, { onConflict: 'user_id' }));
    }, 'notification_settings');

  /* Eventos */
  const addEvent = (eventData: Omit<Event, 'id'>) =>
    run('salvar evento', async () => {
      await req(supabase.from('events').insert(fromEvent(eventData, userId!)));
    }, 'events');

  const updateEvent = (id: string, eventData: Omit<Event, 'id'>) =>
    run('atualizar evento', async () => {
      await req(supabase.from('events').update(fromEvent(eventData, userId!)).eq('id', id));
    }, 'events');

  const deleteEvent = (id: string) =>
    run('excluir evento', async () => {
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
    run('marcar evento como realizado', async () => {
      const event = (eventsQ.data ?? []).find((e) => e.id === id);
      if (!event) throw new Error('Evento não encontrado');

      let linkedShowId = event.linkedShowId;
      if (event.tipo === 'Show' && !linkedShowId) {
        const created = await req(
          supabase.from('shows').insert(fromShow({
            date: event.date, time: event.startTime, local: event.local || event.title,
            tipo: 'Bar', cache: 0, numMusicos: 1, consumacao: 0, kmRodados: 0,
            combustivel: 0, pedagio: 0, roupas: 0, equipamentos: 0, outrosCustos: 0,
            pagamentoMusicos: 0,
          }, userId!)).select('id').single()
        );
        linkedShowId = (created as any).id;
      }

      await req(supabase.from('events')
        .update({ realizado: true, linked_show_id: linkedShowId ?? null })
        .eq('id', id));
    }, 'events', 'shows');

  /* Metas */
  const addGoal = (data: Omit<FinancialGoal, 'id' | 'criadoEm'>) =>
    run('salvar meta', async () => {
      await req(supabase.from('financial_goals').insert({
        user_id: userId!,
        nome: data.nome,
        valor_meta: data.valorMeta,
        periodo: data.periodo,
        data_inicio: data.dataInicio,
        data_fim: data.dataFim || null,
      }));
    }, 'financial_goals');

  const deleteGoal = (id: string) =>
    run('excluir meta', async () => {
      await req(supabase.from('financial_goals').delete().eq('id', id));
    }, 'financial_goals');

  /* Gastos */
  const addGeneralExpense = (data: Omit<GeneralExpense, 'id' | 'criadoEm'>) =>
    run('salvar gasto', async () => {
      await req(supabase.from('expenses').insert({
        user_id: userId!,
        descricao: data.descricao,
        categoria: data.categoria,
        valor: data.valor,
        data: data.data,
      }));
    }, 'expenses');

  const deleteGeneralExpense = (id: string) =>
    run('excluir gasto', async () => {
      await req(supabase.from('expenses').delete().eq('id', id));
    }, 'expenses');

  /* Cofrinhos */
  const addPiggyBank = (data: Omit<PiggyBank, 'id' | 'criadoEm' | 'historico'>) =>
    run('criar cofrinho', async () => {
      const created = await req(supabase.from('piggy_banks').insert({
        user_id: userId!,
        nome: data.nome,
        valor_atual: data.valorAtual,
        objetivo: data.objetivo ?? null,
      }).select('id').single());

      if (data.valorAtual > 0) {
        await req(supabase.from('piggy_bank_transactions').insert({
          user_id: userId!,
          piggy_bank_id: (created as any).id,
          tipo: 'deposito',
          valor: data.valorAtual,
          data: new Date().toISOString().split('T')[0],
        }));
      }
    }, 'piggy_banks');

  const movePiggyBank = (id: string, valor: number, tipo: 'deposito' | 'retirada') =>
    run(tipo === 'deposito' ? 'depositar no cofrinho' : 'retirar do cofrinho', async () => {
      const pb = (piggyQ.data ?? []).find((p) => p.id === id);
      if (!pb) throw new Error('Cofrinho não encontrado');
      const novoValor = tipo === 'deposito'
        ? pb.valorAtual + valor
        : Math.max(0, pb.valorAtual - valor);

      await req(supabase.from('piggy_bank_transactions').insert({
        user_id: userId!, piggy_bank_id: id, tipo, valor,
        data: new Date().toISOString().split('T')[0],
      }));
      await req(supabase.from('piggy_banks').update({ valor_atual: novoValor }).eq('id', id));
    }, 'piggy_banks');

  const addToPiggyBank = (id: string, valor: number) => movePiggyBank(id, valor, 'deposito');
  const withdrawFromPiggyBank = (id: string, valor: number) => movePiggyBank(id, valor, 'retirada');

  const deletePiggyBank = (id: string) =>
    run('excluir cofrinho', async () => {
      await req(supabase.from('piggy_banks').delete().eq('id', id));
    }, 'piggy_banks');

  /* ------------------------------- Retorno ------------------------------ */

  const expensesRaw = expensesQ.data ?? [];

  return {
    shows: showsQ.data ?? [],
    expenses: expensesRaw.map(toExpense) as Expense[],
    fixedExpenses: fixedQ.data ?? [],
    project: projectQ.data ?? EMPTY_PROJECT,
    incomes: incomesQ.data ?? [],
    notificationSettings: notifQ.data ?? { enableWhatsAppNotifications: false },
    events: eventsQ.data ?? [],
    goals: goalsQ.data ?? [],
    generalExpenses: expensesRaw.map(toGeneralExpense) as GeneralExpense[],
    piggyBanks: piggyQ.data ?? [],
    isLoading:
      showsQ.isLoading || expensesQ.isLoading || incomesQ.isLoading || eventsQ.isLoading,

    addShow, updateShow, deleteShow, duplicateShow,
    addIncome, updateIncome, deleteIncome,
    updateNotificationSettings,
    addEvent, updateEvent, deleteEvent, duplicateEvent, markEventAsRealizado,
    addGoal, deleteGoal,
    addGeneralExpense, deleteGeneralExpense,
    addPiggyBank, addToPiggyBank, withdrawFromPiggyBank, deletePiggyBank,
  };
}
