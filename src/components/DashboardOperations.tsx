import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, PiggyBank, Target, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { calculateGoalProgress, calculateMonthlyFinancials, formatCurrency, formatPercentage, generateAlerts } from '@/lib/calculations';
import { PRIVATE_CURRENCY } from '@/lib/dashboardFinancialCharts';
import { formatDateBR } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ModuleArtwork from '@/components/ModuleArtwork';
import FinancialGoals from '@/components/FinancialGoals';

export default function DashboardOperations({ hidden = false }: { hidden?: boolean }) {
  const navigate = useNavigate();
  const { shows, expenses, fixedExpenses, incomes, events, goals, generalExpenses, piggyBanks } = useFinancialData();
  const now = new Date();
  const money = (value: number) => hidden ? PRIVATE_CURRENCY : formatCurrency(value);
  const monthly = calculateMonthlyFinancials(shows, expenses, fixedExpenses, incomes, now);
  const alerts = generateAlerts(shows, monthly.dre);
  const upcomingEvents = events.filter(event => !event.realizado && new Date(`${event.date}T${event.startTime}`) > now)
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)).slice(0, 3);
  const activeGoal = goals.at(-1);
  const activeProgress = activeGoal ? calculateGoalProgress(activeGoal, shows, incomes, now) : null;

  return <>
    {alerts.length > 0 && <section aria-label="Alertas" className="space-y-3">{alerts.map(alert => <Alert key={alert.id} className={alert.type === 'danger' ? 'border-destructive/30 bg-destructive/5' : 'border-gold/20 bg-gold/5'}><AlertTriangle className="h-4 w-4" /><AlertDescription>{alert.message}</AlertDescription></Alert>)}</section>}
    {activeGoal && activeProgress && <Card className="thematic-card"><ModuleArtwork module="/analises" /><CardContent className="p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-semibold min-w-0"><Target className="h-5 w-5 shrink-0 text-gold" /><span className="break-words">Meta Atual: {activeGoal.nome}</span></h2><Badge variant="outline">{activeGoal.periodo}</Badge></div>
      <div className="flex flex-wrap justify-between gap-2 text-sm"><span className="text-muted-foreground">{money(activeProgress.realizado)} de {money(activeGoal.valorMeta)}</span><span className="text-gold font-semibold">{hidden ? '•••' : formatPercentage(activeProgress.progressoPercentual)}</span></div>
      <Progress value={hidden ? 0 : activeProgress.progressoPercentual} className="h-2" />
      <p className="text-xs text-muted-foreground">Faltam {money(activeProgress.restante)}</p>
    </CardContent></Card>}
    <section aria-labelledby="upcoming-events-title" className="space-y-3">
      <div className="flex items-center justify-between gap-3"><h2 id="upcoming-events-title" className="flex items-center gap-2 text-xl font-semibold text-gold"><CalendarDays className="h-5 w-5 shrink-0" />Próximos Eventos</h2><Button size="icon" variant="ghost" aria-label="Abrir Agenda" onClick={() => navigate('/agenda')}><ArrowUpRight className="h-5 w-5" /></Button></div>
      {upcomingEvents.length === 0 && <p className="text-sm text-muted-foreground">Nenhum evento futuro agendado</p>}
      {upcomingEvents.map(event => <Card key={event.id} className="thematic-card"><ModuleArtwork module="show" /><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold break-words">{event.title}</h3><p className="flex flex-wrap items-center gap-1.5 mt-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{formatDateBR(event.date)} às {event.startTime}</p>{event.local && <p className="mt-1 text-xs text-muted-foreground break-words">{event.local}</p>}</div><Badge variant="outline" className="shrink-0">{event.tipo}</Badge></div></CardContent></Card>)}
    </section>
    <section aria-labelledby="recent-expenses-title" className="space-y-3">
      <div className="flex items-center justify-between gap-3"><h2 id="recent-expenses-title" className="text-xl font-semibold text-gold">Gastos Recentes</h2><Button size="icon" variant="ghost" aria-label="Ver todos os gastos" onClick={() => navigate('/financas')}><ArrowUpRight className="h-5 w-5" /></Button></div>
      {generalExpenses.length === 0 && <p className="text-sm text-muted-foreground">Nenhum gasto registrado</p>}
      <ul className="divide-y divide-border">{generalExpenses.slice(0, 5).map(expense => <li key={expense.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="font-medium break-words">{expense.descricao}</p><p className="text-xs text-muted-foreground">{formatDateBR(expense.data)} · {expense.categoria}</p></div><span className="text-destructive font-semibold tabular-nums">{hidden ? PRIVATE_CURRENCY : `-${money(expense.valor)}`}</span></li>)}</ul>
    </section>
    <section aria-labelledby="dashboard-savings-title" className="space-y-3">
      <div className="flex items-center justify-between gap-3"><h2 id="dashboard-savings-title" className="text-xl font-semibold text-gold">Seus Cofrinhos</h2><Button size="icon" variant="ghost" aria-label="Gerenciar cofrinhos" onClick={() => navigate('/financas')}><ArrowUpRight className="h-5 w-5" /></Button></div>
      {piggyBanks.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cofrinho criado</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{piggyBanks.map(bank => <Card key={bank.id} className="thematic-card"><ModuleArtwork module="savings" /><CardContent className="p-5 space-y-3"><div className="flex justify-between gap-3"><h3 className="font-semibold break-words min-w-0">{bank.nome}</h3><PiggyBank className="h-5 w-5 shrink-0 text-gold" /></div><p className="dashboard-financial-value font-semibold text-gold">{money(bank.valorAtual)}</p>{bank.objetivo && bank.objetivo > 0 && <><Progress value={hidden ? 0 : bank.valorAtual / bank.objetivo * 100} className="h-2" /><p className="text-xs text-muted-foreground">Objetivo: {money(bank.objetivo)}</p></>}</CardContent></Card>)}</div>
    </section>
    <FinancialGoals hidden={hidden} />
  </>;
}