import { Calendar, DollarSign, TrendingUp, Video, Plus, Wallet, AlertTriangle, Info, Music, Users, GraduationCap, Mic, Clock, CalendarDays, HelpCircle, PiggyBank, Target, Trash2, ArrowUpRight, MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import ProfileAvatar from "@/components/ProfileAvatar";
import DashboardTrend from "@/components/DashboardTrend";
import concertImage from "@/assets/dashboard-concert.jpg";
import ModuleArtwork from "@/components/ModuleArtwork";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useRepertoire } from "@/hooks/useRepertoire";
import { useShowNotifications } from "@/hooks/useShowNotifications";
import { useOnboarding } from "@/hooks/useOnboarding";
import { formatDateBR } from "@/lib/dateUtils";
import { tooltips } from "@/lib/helpContent";
import { 
  calculateDRE,
  calculateMonthlyFinancials, 
  generateAlerts,
  formatCurrency,
  formatPercentage,
  getNextShow,
  calculateProjectedRevenue,
  calculateGoalProgress
} from "@/lib/calculations";
import Onboarding from "@/components/Onboarding";
import HelpCenter from "@/components/HelpCenter";
import { GoalTransactionForm } from '@/components/GoalTransactionForm';
import { GoogleCalendarShowButton } from '@/components/GoogleCalendarShowButton';
import { GoalForm } from "@/components/GoalForm";
import { ExpenseForm } from "@/components/ExpenseForm";
import { PiggyBankForm } from "@/components/PiggyBankForm";
import { EventQuickForm } from "@/components/EventQuickForm";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const displayName = profile?.name?.trim() || "Músico";
  const { toast } = useToast();
  const {
    nextShow, shows, expenses, fixedExpenses, project, incomes, events,
    goals, generalExpenses, piggyBanks,
    addGoal, deleteGoal, moveGoal,
    addGeneralExpense,
    addPiggyBank,
    addEvent,
  } = useFinancialData();
  const { songs, setlists } = useRepertoire();
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [transactionGoal, setTransactionGoal] = useState<{id: string; nome: string} | null>(null);
  const [goalTipo, setGoalTipo] = useState<'deposito' | 'retirada'>('deposito');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showPiggyForm, setShowPiggyForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  
  const { showOnboarding, setShowOnboarding, completeOnboarding } = useOnboarding();
  useShowNotifications(shows);
  
  const now = new Date();
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.date + 'T' + event.startTime);
      return eventDate > now && !event.realizado;
    })
    .sort((a, b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime())
    .slice(0, 3);

  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case 'Show': return <Music className="h-4 w-4" />;
      case 'Ensaio': return <Users className="h-4 w-4" />;
      case 'Aula': return <GraduationCap className="h-4 w-4" />;
      case 'Gravação': return <Mic className="h-4 w-4" />;
      default: return <CalendarDays className="h-4 w-4" />;
    }
  };

  const getEventColor = (tipo: string) => {
    switch (tipo) {
      case 'Show': return 'bg-primary text-primary-foreground';
      case 'Ensaio': return 'bg-secondary text-secondary-foreground';
      case 'Aula': return 'bg-accent text-accent-foreground';
      case 'Gravação': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  const monthly = calculateMonthlyFinancials(shows, expenses, fixedExpenses, incomes, now);
  const dre = monthly.dre;
  const projection = calculateProjectedRevenue(shows, now);

  const nextShowDate = nextShow ? new Date(nextShow.date) : undefined;
  const alerts = generateAlerts(shows, dre, nextShowDate);
  const monthlyTrends = Array.from({ length: 6 }, (_, index) => {
    const reference = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const month = `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, '0')}`;
    return {
      projection: calculateProjectedRevenue(shows, reference).faturamentoProjetado,
      result: calculateMonthlyFinancials(shows, expenses, fixedExpenses, incomes, reference).dre.resultadoOperacional,
    };
  });
  const projectedPercentage = projection.mediaMensal !== 0 ? ((projection.faturamentoProjetado - projection.mediaMensal) / Math.abs(projection.mediaMensal)) * 100 : null;

  // MVP calculations
  const totalGeneralExpenses = generalExpenses
    .filter(e => new Date(e.data).getMonth() === now.getMonth())
    .reduce((sum, e) => sum + e.valor, 0);

  const totalPiggyBanks = piggyBanks.reduce((sum, pb) => sum + pb.valorAtual, 0);

  const activeGoal = goals.length > 0 ? goals[goals.length - 1] : null;
  const activeGoalProgress = activeGoal
    ? calculateGoalProgress(activeGoal, shows, incomes, now)
    : null;
  const goalProgress = activeGoalProgress?.progressoPercentual ?? 0;

  const handleAddEvent = (data: { nomeEvento: string; dataEvento: string; horaEvento: string; local?: string; valorPrevisto?: number; observacoes?: string }) => {
    addEvent({
      title: data.nomeEvento,
      tipo: 'Show',
      date: data.dataEvento,
      startTime: data.horaEvento,
      local: data.local,
      notes: data.observacoes,
      realizado: false,
    });
    toast({ title: "Evento salvo!", description: "O evento foi adicionado com sucesso." });
  };

  return (
    <>
      <Onboarding isOpen={showOnboarding} onComplete={completeOnboarding} onClose={() => setShowOnboarding(false)} />
      <HelpCenter isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />
      <GoalTransactionForm goal={transactionGoal} tipo={goalTipo} balance={transactionGoal ? calculateGoalProgress(goals.find(g => g.id === transactionGoal.id) ?? { id: '', nome: '', valorMeta: 0, periodo: 'mensal', dataInicio: '', dataFim: '', criadoEm: '' }, shows, incomes, now).realizado : 0} onClose={() => setTransactionGoal(null)} onSubmit={async (id, value, tipo) => { const ok = await moveGoal(id, value, tipo); if (ok) toast({ title: tipo === 'deposito' ? 'Aporte realizado' : 'Resgate realizado' }); return ok; }} />
      <GoalForm open={showGoalForm} onOpenChange={setShowGoalForm} onSubmit={(data) => { addGoal(data); toast({ title: "Meta criada!", description: "Sua meta financeira foi salva." }); }} />
      <ExpenseForm open={showExpenseForm} onOpenChange={setShowExpenseForm} onSubmit={(data) => { addGeneralExpense(data); toast({ title: "Gasto registrado!", description: "O gasto foi salvo com sucesso." }); }} />
      <PiggyBankForm open={showPiggyForm} onOpenChange={setShowPiggyForm} onSubmit={(data) => { addPiggyBank(data); toast({ title: "Cofrinho criado!", description: "Seu cofrinho foi salvo com sucesso." }); }} />
      <EventQuickForm open={showEventForm} onOpenChange={setShowEventForm} onSubmit={handleAddEvent} />
      
      <div className="dashboard-content space-y-5">
        <header className="flex items-center gap-3 pb-1">
          <ProfileAvatar name={displayName} />
          <h1 className="text-base font-bold min-w-0 truncate">Olá, <span>{displayName.split(' ')[0].toUpperCase()}</span></h1>
        </header>

        <Card className="dashboard-next-show relative overflow-hidden">
          <div className="dashboard-show-art" aria-hidden="true"><img src={concertImage} width={1024} height={768} alt="" /><CalendarDays className="dashboard-calendar-lit" /></div>
          <CardContent className="relative z-10 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2 text-gold text-sm font-medium"><Calendar className="h-4 w-4" />Próximo Show</div>
              <Badge variant="outline" className="border-gold/20 bg-gold/5 text-gold text-xs">{nextShow ? 'Agendado' : 'Sua agenda'}</Badge>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="dashboard-show-title text-2xl sm:text-3xl font-semibold break-words">{nextShow?.local || 'O palco espera por você'}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                  {nextShow ? <><span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDateBR(nextShow.date)}</span>{nextShow.time && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{nextShow.time}</span>}</> : <span>Nenhum show agendado</span>}
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label={nextShow ? 'Ver próximo show' : 'Adicionar show'} className="shrink-0 rounded-full border border-gold/20 text-gold" onClick={() => nextShow ? navigate('/agenda') : setShowEventForm(true)}>{nextShow ? <ArrowUpRight className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</Button>
            </div>
            {nextShow && <div className="mt-4"><GoogleCalendarShowButton show={nextShow} /></div>}
            <Button variant="outline" className="dashboard-itinerary mt-5 gap-2 text-xs" onClick={() => navigate('/agenda')}>Ver Roteiro do Show<ChevronRight className="h-4 w-4" /></Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <Card className="thematic-card dashboard-financial-card min-w-0 overflow-hidden">
            <ModuleArtwork module="/analises" />
            <CardContent className="dashboard-financial-content p-4 sm:p-5">
              <div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="h-4 w-4 shrink-0 text-primary" /><h2 className="text-xs sm:text-sm font-medium">Faturamento Projetado</h2></div>
              <p className="dashboard-financial-value mt-4 font-semibold tabular-nums">{formatCurrency(projection.faturamentoProjetado)}</p>
              <div className="dashboard-financial-footer"><Badge variant="outline" className={`dashboard-status text-[10px] sm:text-xs ${projectedPercentage !== null && projectedPercentage > 0 ? 'dashboard-status-positive' : 'dashboard-status-blue'}`}>{projectedPercentage === null ? 'Sem base anterior' : `${projectedPercentage > 0 ? '+' : ''}${formatPercentage(projectedPercentage)} vs. média`}</Badge>
              <DashboardTrend values={monthlyTrends.map(point => point.projection)} label="Tendência do faturamento projetado em seis meses" tone="gold" />
              </div>
            </CardContent>
          </Card>
          <Card className="thematic-card dashboard-financial-card min-w-0 overflow-hidden">
            <ModuleArtwork module="/financas" />
            <CardContent className="dashboard-financial-content p-4 sm:p-5">
              <div className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4 shrink-0 text-gold" /><h2 className="text-xs sm:text-sm font-medium">Resultado do Mês</h2></div>
              <p className="dashboard-financial-value mt-4 font-semibold tabular-nums">{formatCurrency(dre.resultadoOperacional)}</p>
              <div className="dashboard-financial-footer"><Badge variant="outline" className={`dashboard-status text-[10px] sm:text-xs ${dre.margemFinal > 0 ? 'dashboard-status-positive' : 'dashboard-status-blue'}`}>{formatPercentage(dre.margemFinal)} de margem</Badge>
              <DashboardTrend values={monthlyTrends.map(point => point.result)} label="Tendência dos resultados em seis meses" tone="blue" />
              </div>
            </CardContent>
          </Card>
        </div>

        {alerts.length > 0 && <div className="space-y-3">{alerts.map(alert => <Alert key={alert.id} className={alert.type === 'danger' ? 'border-destructive/30 bg-destructive/5' : 'border-gold/20 bg-gold/5'}><AlertTriangle className="h-4 w-4" /><AlertDescription>{alert.message}</AlertDescription></Alert>)}</div>}

        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <Card className="thematic-card"><ModuleArtwork module="/receitas" /><CardContent className="p-4 sm:p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="h-4 w-4 shrink-0 text-gold" />Gastos do Mês</div><p className="dashboard-financial-value mt-2 font-semibold">{formatCurrency(monthly.totalGastos)}</p></CardContent></Card>
          <Card className="thematic-card"><ModuleArtwork module="savings" /><CardContent className="p-4 sm:p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><PiggyBank className="h-4 w-4 shrink-0 text-gold" />Reservas</div><p className="dashboard-financial-value mt-2 font-semibold text-gold">{formatCurrency(totalPiggyBanks)}</p></CardContent></Card>
        </div>

        {/* Meta Ativa */}
        {activeGoal && (
          <Card className="p-6 shadow-lg border-gold/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-gold" />
                <h2 className="text-lg font-semibold">Meta Atual: {activeGoal.nome}</h2>
              </div>
              <Badge variant="outline">{activeGoal.periodo}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{formatCurrency(activeGoalProgress?.realizado ?? 0)} de {formatCurrency(activeGoal.valorMeta)}</span>
                <span className="font-semibold text-gold">{formatPercentage(goalProgress)}</span>
              </div>
              <Progress value={goalProgress} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Faltam {formatCurrency(activeGoalProgress?.restante ?? 0)} • considera shows finalizados no período
              </p>
            </div>
          </Card>
        )}

        {/* Próximos Eventos */}
        {upcomingEvents.length > 0 && (
          <Card className="thematic-card">
            <ModuleArtwork module="show" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 shrink-0 text-gold" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Badge className={getEventColor(event.tipo)}>{getEventIcon(event.tipo)}</Badge>
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDateBR(event.date)} às {event.startTime}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{event.tipo}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6 shadow-lg border-primary/10">
          <h2 className="text-xl font-semibold mb-4 text-gold">Acesso Rápido</h2>
          <div className="dashboard-quick-actions grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button onClick={() => setShowEventForm(true)} className="module-navigation h-auto py-6 flex-col gap-3 w-full">
              <ModuleArtwork module="show" />
              <Plus className="h-7 w-7" />
              <span className="font-semibold">Adicionar Show</span>
            </Button>
            <Button onClick={() => setShowExpenseForm(true)} className="module-navigation h-auto py-6 flex-col gap-3 w-full">
              <ModuleArtwork module="/financas" />
              <Plus className="h-7 w-7" />
              <span className="font-semibold">Adicionar Gasto</span>
            </Button>
            <Button onClick={() => setShowGoalForm(true)} className="module-navigation h-auto py-6 flex-col gap-3 w-full">
              <ModuleArtwork module="/analises" />
              <Plus className="h-7 w-7" />
              <span className="font-semibold">Adicionar Meta</span>
            </Button>
            <Button onClick={() => setShowPiggyForm(true)} className="module-navigation h-auto py-6 flex-col gap-3 w-full">
              <ModuleArtwork module="savings" />
              <PiggyBank className="h-7 w-7" />
              <span className="font-semibold">Adicionar Cofrinho</span>
            </Button>
          </div>
        </Card>

        {/* Gastos Recentes */}
        {generalExpenses.length > 0 && (
          <Card className="p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-primary">Gastos Recentes</h2>
            <div className="space-y-4">
              {generalExpenses.slice(0, 5).map(exp => (
                <div key={exp.id} className="flex items-center justify-between py-3 border-b border-border/50">
                  <div>
                    <p className="font-medium">{exp.descricao}</p>
                    <p className="text-xs text-muted-foreground">{formatDateBR(exp.data)} • {exp.categoria}</p>
                  </div>
                  <span className="text-destructive font-bold text-lg">-{formatCurrency(exp.valor)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Cofrinhos */}
        {piggyBanks.length > 0 && (
          <Card className="p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gold">Seus Cofrinhos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {piggyBanks.map(pb => (
                <div key={pb.id} className="p-4 rounded-xl border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{pb.nome}</p>
                    <PiggyBank className="h-5 w-5 text-gold" />
                  </div>
                  <p className="text-2xl font-bold text-gold">{formatCurrency(pb.valorAtual)}</p>
                  {pb.objetivo && (
                    <div className="mt-2">
                      <Progress value={(pb.valorAtual / pb.objetivo) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Objetivo: {formatCurrency(pb.objetivo)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Metas */}
        {goals.length > 0 && (
          <Card className="p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gold">Metas Financeiras</h2>
            <div className="space-y-3">
              {goals.map(goal => {
                const gp = calculateGoalProgress(goal, shows, incomes, now);
                return (
                  <div key={goal.id} className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{goal.nome}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{goal.periodo}</Badge>
                        <Button size="icon" variant="ghost" onClick={() => { deleteGoal(goal.id); toast({ title: "Meta removida" }); }}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <Progress value={gp.progressoPercentual} className="h-2 mb-1" />
                    <p className="text-xs text-muted-foreground">{formatPercentage(gp.progressoPercentual)} • {formatCurrency(gp.realizado)} / {formatCurrency(goal.valorMeta)}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button size="sm" onClick={() => { setGoalTipo('deposito'); setTransactionGoal(goal); }}><Plus className="h-4 w-4 mr-1" />Aporte / Adicionar Valor</Button>
                      <Button size="sm" variant="outline" disabled={gp.realizado <= 0} onClick={() => { setGoalTipo('retirada'); setTransactionGoal(goal); }}>Resgate / Retirar Valor</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

      </div>
    </>
  );
};

export default Dashboard;
