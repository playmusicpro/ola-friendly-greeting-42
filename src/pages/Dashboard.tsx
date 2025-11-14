import { Calendar, DollarSign, TrendingUp, Video, Plus, Wallet, AlertTriangle, Info, Music } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useRepertoire } from "@/hooks/useRepertoire";
import { 
  calculateDRE, 
  calculateMonthlyProjection, 
  generateAlerts,
  formatCurrency,
  formatPercentage 
} from "@/lib/calculations";

const Dashboard = () => {
  const { shows, expenses, fixedExpenses, project } = useFinancialData();
  const { songs, setlists } = useRepertoire();
  
  // Calcular métricas
  const dre = calculateDRE(shows, expenses, fixedExpenses);
  const projection = calculateMonthlyProjection(shows);
  
  // Encontrar próximo show
  const nextShow = shows.length > 0 ? shows[0] : null;
  const nextShowDate = nextShow ? new Date(nextShow.date) : undefined;
  
  // Gerar alertas
  const alerts = generateAlerts(shows, dre, nextShowDate);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gold via-primary to-gold bg-clip-text text-transparent">
          Painel Inicial
        </h1>
        <p className="text-muted-foreground text-lg">
          Bem-vindo ao seu assistente profissional
        </p>
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
        <StatCard
          title="Próximo Show"
          value={nextShow ? new Date(nextShow.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Nenhum'}
          icon={Calendar}
          trend={nextShow ? `${nextShow.local} - ${nextShow.time}` : 'Adicione um show'}
          variant="default"
        />
        <StatCard
          title="Faturamento Projetado"
          value={formatCurrency(projection.faturamentoProjetado)}
          icon={DollarSign}
          trend="Baseado na média dos últimos 3 meses"
          variant="gold"
        />
        <StatCard
          title="Resultado do Mês"
          value={formatCurrency(dre.resultadoOperacional)}
          icon={Wallet}
          trend={`Margem: ${formatPercentage(dre.margemFinal)}`}
          variant={dre.resultadoOperacional >= 0 ? "success" : "default"}
        />
        <StatCard
          title="Projeto AV"
          value={formatPercentage((project.savedValue / project.totalValue) * 100)}
          icon={Video}
          trend={`${formatCurrency(project.savedValue)} de ${formatCurrency(project.totalValue)}`}
          variant="default"
        />
        <StatCard
          title="Repertório"
          value={songs.length.toString()}
          icon={Music}
          trend={`${setlists.length} setlist(s) criada(s)`}
          variant="default"
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6 shadow-lg border-primary/10">
        <h2 className="text-xl font-semibold mb-4 text-gold">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-auto py-6 flex-col gap-3 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md">
            <Plus className="h-7 w-7" />
            <span className="font-semibold">Adicionar Show</span>
          </Button>
          <Button className="h-auto py-6 flex-col gap-3 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md">
            <Plus className="h-7 w-7" />
            <span className="font-semibold">Adicionar Gasto</span>
          </Button>
          <Button className="h-auto py-6 flex-col gap-3 bg-gold hover:bg-gold/90 text-black rounded-xl shadow-md">
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
  );
};

export default Dashboard;
