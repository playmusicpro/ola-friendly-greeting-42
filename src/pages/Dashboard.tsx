import { Calendar, DollarSign, TrendingUp, Video, Plus, Wallet, AlertTriangle, Info, Music, Users, GraduationCap, Mic, Clock, CalendarDays, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { shows, expenses, fixedExpenses, project, incomes, events } = useFinancialData();
  const { songs, setlists } = useRepertoire();
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  
  // Onboarding
  const {
    showOnboarding,
    setShowOnboarding,
    completeOnboarding,
  } = useOnboarding();
  
  // Enable show notifications
  useShowNotifications(shows);
  
  // Get next 3 upcoming events
  const now = new Date();
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.date + 'T' + event.startTime);
      return eventDate > now && !event.realizado;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.startTime);
      const dateB = new Date(b.date + 'T' + b.startTime);
      return dateA.getTime() - dateB.getTime();
    })
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
  
  // Calcular métricas
  const dre = calculateDRE(shows, expenses, fixedExpenses, incomes);
  const projection = calculateMonthlyProjection(shows);
  
  // Encontrar próximo show
  const nextShow = shows.length > 0 ? shows[0] : null;
  const nextShowDate = nextShow ? new Date(nextShow.date) : undefined;
  
  // Gerar alertas
  const alerts = generateAlerts(shows, dre, nextShowDate);
  return (
    <>
      {/* Onboarding Modal */}
      <Onboarding
        isOpen={showOnboarding}
        onComplete={completeOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      
      {/* Help Center Modal */}
      <HelpCenter
        isOpen={showHelpCenter}
        onClose={() => setShowHelpCenter(false)}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gold via-primary to-gold bg-clip-text text-transparent">
              Painel Inicial
            </h1>
            <p className="text-muted-foreground text-lg">
              Bem-vindo ao seu assistente profissional
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelpCenter(true)}
                className="text-muted-foreground hover:text-primary"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Central de Ajuda</TooltipContent>
          </Tooltip>
        </div>

      {/* Alertas Inteligentes */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Alert 
              key={alert.id} 
              className={
                alert.type === 'danger' 
                  ? 'border-destructive/50 bg-destructive/10' 
                  : alert.type === 'warning'
                  ? 'border-yellow-500/50 bg-yellow-500/10'
                  : 'border-primary/50 bg-primary/10'
              }
            >
              {alert.type === 'danger' ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : alert.type === 'warning' ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <Info className="h-4 w-4 text-primary" />
              )}
              <AlertDescription className="font-medium">
                {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Próximo Show"
                  value={nextShow ? new Date(nextShow.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Nenhum'}
                  icon={Calendar}
                  trend={nextShow ? `${nextShow.local} - ${nextShow.time}` : 'Adicione um show'}
                  variant="default"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>{tooltips.dashboard.totalShows}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Faturamento Projetado"
                  value={formatCurrency(projection.faturamentoProjetado)}
                  icon={DollarSign}
                  trend="Baseado na média dos últimos 3 meses"
                  variant="gold"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>{tooltips.dashboard.monthlyProjection}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Resultado do Mês"
                  value={formatCurrency(dre.resultadoOperacional)}
                  icon={Wallet}
                  trend={`Margem: ${formatPercentage(dre.margemFinal)}`}
                  variant={dre.resultadoOperacional >= 0 ? "success" : "default"}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>{tooltips.dashboard.dre}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Projeto AV"
                  value={formatPercentage((project.savedValue / project.totalValue) * 100)}
                  icon={Video}
                  trend={`${formatCurrency(project.savedValue)} de ${formatCurrency(project.totalValue)}`}
                  variant="default"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>Progresso do seu projeto audiovisual</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Repertório"
                  value={songs.length.toString()}
                  icon={Music}
                  trend={`${setlists.length} setlist(s) criada(s)`}
                  variant="default"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>Seu repertório de músicas e setlists</TooltipContent>
          </Tooltip>
        </div>

      {/* Próximos Eventos Widget */}
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
                    <Badge className={getEventColor(event.tipo)}>
                      {getEventIcon(event.tipo)}
                    </Badge>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="h-auto py-6 flex-col gap-3 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md"
            onClick={() => navigate('/agenda')}
          >
            <Plus className="h-7 w-7" />
            <span className="font-semibold">Adicionar Show</span>
          </Button>
          <Button 
            className="h-auto py-6 flex-col gap-3 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md"
            onClick={() => navigate('/financas')}
          >
            <Plus className="h-7 w-7" />
            <span className="font-semibold">Adicionar Gasto</span>
          </Button>
          <Button 
            className="h-auto py-6 flex-col gap-3 bg-gold hover:bg-gold/90 text-black rounded-xl shadow-md"
            onClick={() => navigate('/projeto')}
          >
            <Plus className="h-7 w-7" />
            <span className="font-semibold">Adicionar Meta</span>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-primary">Atividade Recente</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div>
              <p className="font-medium">Show - Boteco da Esquina</p>
              <p className="text-xs text-muted-foreground">10 Dez, 21h</p>
            </div>
            <span className="text-success font-bold text-lg">+R$ 600</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div>
              <p className="font-medium">Gasto - Cordas de violão</p>
              <p className="text-xs text-muted-foreground">8 Dez</p>
            </div>
            <span className="text-destructive font-bold text-lg">-R$ 85</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Show - Casa de Eventos</p>
              <p className="text-xs text-muted-foreground">5 Dez, 20h</p>
            </div>
            <span className="text-success font-bold text-lg">+R$ 1.200</span>
          </div>
        </div>
      </Card>
      </div>
    </>
  );
};

export default Dashboard;
