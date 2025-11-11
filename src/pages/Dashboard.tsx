import { Calendar, DollarSign, TrendingUp, Video, Plus } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Painel Inicial</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está um resumo da sua atividade.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Próximo Show"
          value="15 Dez"
          icon={Calendar}
          trend="Bar do Zé - R$ 800"
          variant="default"
        />
        <StatCard
          title="Faturamento Previsto"
          value="R$ 4.500"
          icon={TrendingUp}
          trend="Este mês"
          variant="gold"
        />
        <StatCard
          title="Gastos Totais"
          value="R$ 1.250"
          icon={DollarSign}
          trend="Este mês"
          variant="default"
        />
        <StatCard
          title="Projeto Audiovisual"
          value="35%"
          icon={Video}
          trend="R$ 3.500 de R$ 10.000"
          variant="success"
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-auto py-4 flex-col gap-2" variant="outline">
            <Plus className="h-6 w-6" />
            <span>Adicionar Show</span>
          </Button>
          <Button className="h-auto py-4 flex-col gap-2" variant="outline">
            <Plus className="h-6 w-6" />
            <span>Adicionar Gasto</span>
          </Button>
          <Button className="h-auto py-4 flex-col gap-2" variant="outline">
            <Plus className="h-6 w-6" />
            <span>Adicionar Meta</span>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium">Show - Boteco da Esquina</p>
              <p className="text-sm text-muted-foreground">10 Dez, 21h</p>
            </div>
            <span className="text-success font-semibold">R$ 600</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium">Gasto - Cordas de violão</p>
              <p className="text-sm text-muted-foreground">8 Dez</p>
            </div>
            <span className="text-destructive font-semibold">-R$ 85</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Show - Casa de Eventos</p>
              <p className="text-sm text-muted-foreground">5 Dez, 20h</p>
            </div>
            <span className="text-success font-semibold">R$ 1.200</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
