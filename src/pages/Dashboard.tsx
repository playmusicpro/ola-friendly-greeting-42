import { Calendar, DollarSign, TrendingUp, Video, Plus, Wallet, AlertTriangle, Info, Music, Users, GraduationCap, Mic, Clock, CalendarDays, HelpCircle, PiggyBank, Target, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
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
  calculateMonthlyProjection, 
  generateAlerts,
  formatCurrency,
  formatPercentage 
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
  const projection = calculateMonthlyProjection(shows);
  const nextShow = shows.length > 0 ? shows[0] : null;
  const nextShowDate = nextShow ? new Date(nextShow.date) : undefined;
  const alerts = generateAlerts(shows, dre, nextShowDate);

  // MVP calculations
  const totalGeneralExpenses = generalExpenses
    .filter(e => new Date(e.data).getMonth() === now.getMonth())
    .reduce((sum, e) => sum + e.valor, 0);

  const totalPiggyBanks = piggyBanks.reduce((sum, pb) => sum + pb.valorAtual, 0);

  const activeGoal = goals.length > 0 ? goals[goals.length - 1] : null;
  const goalProgress = activeGoal
    ? Math.min(100, (dre.receitaBruta / activeGoal.valorMeta) * 100)
    : 0;

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
      
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gold via-primary to-gold bg-clip-text text-transparent">
              Painel Inicial
            </h1>
            <p className="text-muted-foreground text-lg">Bem-vindo ao seu assistente profissional</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setShowHelpCenter(true)} className="text-muted-foreground hover:text-primary">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Central de Ajuda</TooltipContent>
          </Tooltip>
        </div>

        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={alert.type === 'danger' ? 'border-destructive/50 bg-destructive/10' : alert.type === 'warning' ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-primary/50 bg-primary/10'}>
                {alert.type === 'danger' ? <AlertTriangle className="h-4 w-4 text-destructive" /> : alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> : <Info className="h-4 w-4 text-primary" />}
                <AlertDescription className="font-medium">{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard title="Próximo Show" value={nextShow ? new Date(nextShow.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Nenhum'} icon={Calendar} trend={nextShow ? `${nextShow.local} - ${nextShow.time}` : 'Adicione um show'} variant="default" />
              </div>
            </TooltipTrigger>
            <TooltipContent>{tooltips.dashboard.totalShows}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard title="Faturamento Projetado" value={formatCurrency(projection.faturamentoProjetado)} icon={DollarSign} trend="Baseado na média dos últimos 3 meses" variant="gold" />
              </div>
            </TooltipTrigger>
            <TooltipContent>{tooltips.dashboard.monthlyProjection}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard title="Resultado do Mês" value={formatCurrency(dre.resultadoOperacional)} icon={Wallet} trend={`Margem: ${formatPercentage(dre.margemFinal)}`} variant={dre.resultadoOperacional >= 0 ? "success" : "default"} />
              </div>
            </TooltipTrigger>
            <TooltipContent>{tooltips.dashboard.dre}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard title="Gastos do Mês" value={formatCurrency(totalGeneralExpenses)} icon={TrendingUp} trend={`${generalExpenses.length} registro(s)`} variant="default" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Total de gastos registrados neste mês</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard title="Reservas" value={formatCurrency(totalPiggyBanks)} icon={PiggyBank} trend={`${piggyBanks.length} cofrinho(s)`} variant="gold" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Total guardado em cofrinhos</TooltipContent>
          </Tooltip>
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
                <span className="text-muted-foreground">{formatCurrency(dre.receitaBruta)} de {formatCurrency(activeGoal.valorMeta)}</span>
                <span className="font-semibold text-gold">{formatPercentage(goalProgress)}</span>
              </div>
              <Progress value={goalProgress} className="h-3" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                const progress = Math.min(100, (dre.receitaBruta / goal.valorMeta) * 100);
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
                    <Progress value={progress} className="h-2 mb-1" />
                    <p className="text-xs text-muted-foreground">{formatPercentage(progress)} • {formatCurrency(dre.receitaBruta)} / {formatCurrency(goal.valorMeta)}</p>
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
