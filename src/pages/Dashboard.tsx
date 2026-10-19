import { Calendar, DollarSign, TrendingUp, Video, Plus, Wallet, AlertTriangle, Info, Music, Users, GraduationCap, Mic, Clock, CalendarDays, HelpCircle, PiggyBank, Target, Trash2, ArrowUpRight, MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DashboardTrend from "@/components/DashboardTrend";
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
  generateAlerts,
  formatCurrency,
  formatPercentage,
  getNextShow,
  calculateProjectedRevenue,
  calculateGoalProgress
} from "@/lib/calculations";
import Onboarding from "@/components/Onboarding";
import HelpCenter from "@/components/HelpCenter";
import { GoalForm } from "@/components/GoalForm";
import { ExpenseForm } from "@/components/ExpenseForm";
import { PiggyBankForm } from "@/components/PiggyBankForm";
import { EventQuickForm } from "@/components/EventQuickForm";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { session } = useAuth();
  const displayName = profile?.name?.trim() || "Músico";
  const avatarUrl = session?.user.user_metadata?.avatar_url;
  const { toast } = useToast();
  const {
    shows, expenses, fixedExpenses, project, incomes, events,
    goals, generalExpenses, piggyBanks,
    addGoal, deleteGoal,
    addGeneralExpense,
    addPiggyBank,
    addEvent,
  } = useFinancialData();
  const { songs, setlists } = useRepertoire();
  const [showHelpCenter, setShowHelpCenter] = useState(false);
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
  
  const dre = calculateDRE(shows, expenses, fixedExpenses, incomes);
  const projection = calculateProjectedRevenue(shows, now);
  const nextShow = getNextShow(shows, now);
  const nextShowDate = nextShow ? new Date(nextShow.date) : undefined;
  const alerts = generateAlerts(shows, dre, nextShowDate);
  const monthlyTrends = Array.from({ length: 6 }, (_, index) => {
    const reference = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const month = `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, '0')}`;
    return {
      projection: calculateProjectedRevenue(shows, reference).faturamentoProjetado,
      result: calculateDRE(shows.filter(show => show.date.startsWith(month)), expenses.filter(expense => expense.date.startsWith(month)), fixedExpenses, incomes.filter(income => income.date.startsWith(month))).resultadoOperacional,
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
      <GoalForm open={showGoalForm} onOpenChange={setShowGoalForm} onSubmit={(data) => { addGoal(data); toast({ title: "Meta criada!", description: "Sua meta financeira foi salva." }); }} />
      <ExpenseForm open={showExpenseForm} onOpenChange={setShowExpenseForm} onSubmit={(data) => { addGeneralExpense(data); toast({ title: "Gasto registrado!", description: "O gasto foi salvo com sucesso." }); }} />
      <PiggyBankForm open={showPiggyForm} onOpenChange={setShowPiggyForm} onSubmit={(data) => { addPiggyBank(data); toast({ title: "Cofrinho criado!", description: "Seu cofrinho foi salvo com sucesso." }); }} />
      <EventQuickForm open={showEventForm} onOpenChange={setShowEventForm} onSubmit={handleAddEvent} />
      
      <div className="dashboard-content space-y-5">
        <header className="flex items-center gap-3 pb-1">
          <Avatar className="dashboard-avatar h-11 w-11 shrink-0">
            {typeof avatarUrl === 'string' && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-secondary text-gold text-sm font-semibold">{displayName.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase()}</AvatarFallback>
          </Avatar>
          <h1 className="text-lg font-medium min-w-0 truncate">Olá, <span className="font-semibold">{displayName.split(' ')[0]}</span></h1>
        </header>

        <Card className="dashboard-next-show overflow-hidden">
          <CardContent className="p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2 text-gold text-sm font-medium"><Calendar className="h-4 w-4" />Próximo Show</div>
              <Badge variant="outline" className="border-gold/20 bg-gold/5 text-gold text-xs">{nextShow ? 'Agendado' : 'Sua agenda'}</Badge>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-2xl sm:text-3xl font-semibold break-words">{nextShow?.local || 'O palco espera por você'}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                  {nextShow ? <><span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDateBR(nextShow.date)}</span>{nextShow.time && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{nextShow.time}</span>}</> : <span>Nenhum show agendado</span>}
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label={nextShow ? 'Ver próximo show' : 'Adicionar show'} className="shrink-0 rounded-full border border-gold/20 text-gold" onClick={() => nextShow ? navigate('/agenda') : setShowEventForm(true)}>{nextShow ? <ArrowUpRight className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <Card className="min-w-0 overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="h-4 w-4 shrink-0 text-primary" /><h2 className="text-xs sm:text-sm font-medium">Faturamento Projetado</h2></div>
              <p className="dashboard-financial-value mt-4 font-semibold tabular-nums">{formatCurrency(projection.faturamentoProjetado)}</p>
              <Badge variant="outline" className="mt-3 border-primary/20 bg-primary/10 text-primary text-[10px] sm:text-xs">{projectedPercentage === null ? 'Sem base anterior' : `${projectedPercentage > 0 ? '+' : ''}${formatPercentage(projectedPercentage)} vs. média`}</Badge>
              <DashboardTrend values={monthlyTrends.map(point => point.projection)} label="Tendência do faturamento projetado em seis meses" tone="blue" />
            </CardContent>
          </Card>
          <Card className="min-w-0 overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4 shrink-0 text-gold" /><h2 className="text-xs sm:text-sm font-medium">Resultado do Mês</h2></div>
              <p className="dashboard-financial-value mt-4 font-semibold tabular-nums">{formatCurrency(dre.resultadoOperacional)}</p>
              <Badge variant="outline" className="mt-3 border-gold/20 bg-gold/5 text-gold text-[10px] sm:text-xs">{formatPercentage(dre.margemFinal)} de margem</Badge>
              <DashboardTrend values={monthlyTrends.map(point => point.result)} label="Tendência dos resultados em seis meses" tone="gold" />
            </CardContent>
          </Card>
        </div>

        {alerts.length > 0 && <div className="space-y-3">{alerts.map(alert => <Alert key={alert.id} className={alert.type === 'danger' ? 'border-destructive/30 bg-destructive/5' : 'border-gold/20 bg-gold/5'}><AlertTriangle className="h-4 w-4" /><AlertDescription>{alert.message}</AlertDescription></Alert>)}</div>}

        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <Card><CardContent className="p-4 sm:p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="h-4 w-4" />Gastos do Mês</div><p className="dashboard-financial-value mt-2 font-semibold">{formatCurrency(totalGeneralExpenses)}</p></CardContent></Card>
          <Card><CardContent className="p-4 sm:p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><PiggyBank className="h-4 w-4 text-gold" />Reservas</div><p className="dashboard-financial-value mt-2 font-semibold text-gold">{formatCurrency(totalPiggyBanks)}</p></CardContent></Card>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
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
            <Button onClick={() => setShowEventForm(true)} className="h-auto py-6 flex-col gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md w-full">
              <Plus className="h-7 w-7" />
              <span className="font-semibold">Adicionar Show</span>
            </Button>
            <Button onClick={() => setShowExpenseForm(true)} className="h-auto py-6 flex-col gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md w-full">
              <Plus className="h-7 w-7" />
              <span className="font-semibold">Adicionar Gasto</span>
            </Button>
            <Button onClick={() => setShowGoalForm(true)} className="h-auto py-6 flex-col gap-3 bg-gold hover:bg-gold/90 text-accent-foreground rounded-xl shadow-md w-full">
              <Plus className="h-7 w-7" />
              <span className="font-semibold">Adicionar Meta</span>
            </Button>
            <Button onClick={() => setShowPiggyForm(true)} className="h-auto py-6 flex-col gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl shadow-md w-full">
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
