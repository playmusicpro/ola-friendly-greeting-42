import { Fuel, Shirt, Music, PiggyBank, Home as HomeIcon, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancialData } from "@/hooks/useFinancialData";
import { calculateDRE, formatCurrency, formatPercentage } from "@/lib/calculations";

const Financas = () => {
  const { shows, expenses, fixedExpenses, project, incomes } = useFinancialData();
  
  // Calcular totais
  const totalGastos = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalFixas = fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Calcular DRE incluindo outras receitas
  const dre = calculateDRE(shows, expenses, fixedExpenses, incomes);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gold via-primary to-gold bg-clip-text text-transparent">
          Consultor Financeiro
        </h1>
        <p className="text-muted-foreground text-lg">
          Acompanhe seus gastos e economias de forma profissional
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total de Gastos"
          value={formatCurrency(totalGastos)}
          icon={TrendingDown}
          trend="Custos operacionais deste mês"
          variant="default"
        />
        <StatCard
          title="Cofrinho"
          value={formatCurrency(project.savedValue)}
          icon={PiggyBank}
          trend={`${((project.savedValue / project.totalValue) * 100).toFixed(0)}% do seu projeto audiovisual`}
          variant="gold"
        />
        <StatCard
          title="Despesas Fixas"
          value={formatCurrency(totalFixas)}
          icon={HomeIcon}
          trend="Compromissos recorrentes"
          variant="default"
        />
      </div>

      {/* DRE Simplificado */}
      <Card className="p-6 shadow-lg border-gold/20 bg-gradient-to-br from-primary/5 to-gold/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gold/10">
            <TrendingUp className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">DRE Simplificado</h2>
            <p className="text-xs text-muted-foreground">Demonstrativo de Resultado do Mês</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Receita Bruta</p>
              <p className="text-xs text-muted-foreground mt-1">Soma de todos os cachês</p>
            </div>
            <span className="text-2xl font-bold text-success">{formatCurrency(dre.receitaBruta)}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Custos Diretos</p>
              <p className="text-xs text-muted-foreground mt-1">Gastos relacionados aos shows</p>
            </div>
            <span className="text-2xl font-bold text-destructive">-{formatCurrency(dre.custosDirectos)}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Despesas Fixas</p>
              <p className="text-xs text-muted-foreground mt-1">Aluguel, pensão, parcelas, etc.</p>
            </div>
            <span className="text-2xl font-bold text-destructive">-{formatCurrency(dre.despesasFixas)}</span>
          </div>

          <div className="h-px bg-gold/20 my-4"></div>

          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-primary/10 to-gold/10 rounded-xl border-2 border-gold/30">
            <div>
              <p className="font-semibold text-lg">Resultado Operacional</p>
              <p className="text-xs text-muted-foreground mt-1">Lucro líquido do período</p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${dre.resultadoOperacional >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(dre.resultadoOperacional)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Margem: {formatPercentage(dre.margemFinal)}
              </p>
            </div>
          </div>

          {dre.margemFinal < 0 && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive font-medium">
                Atenção: Suas despesas superaram sua receita este mês
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs for Categories */}
      <Tabs defaultValue="combustivel" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="combustivel">Combustível</TabsTrigger>
          <TabsTrigger value="roupas">Roupas</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="cofrinho">Cofrinho</TabsTrigger>
          <TabsTrigger value="fixas">Despesas Fixas</TabsTrigger>
        </TabsList>

        <TabsContent value="combustivel" className="space-y-4">
          <Card className="p-6 shadow-lg border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Fuel className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Combustível</h2>
                  <p className="text-xs text-muted-foreground">Gastos com transporte para shows</p>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl">Adicionar Gasto</Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                <div>
                  <p className="font-medium">Gasolina - Show Bar do Zé</p>
                  <p className="text-xs text-muted-foreground">15 Dez, 50km rodados</p>
                </div>
                <span className="text-lg font-semibold text-destructive">R$ 120</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                <div>
                  <p className="font-medium">Pedágio + Gasolina - Casa de Eventos</p>
                  <p className="text-xs text-muted-foreground">20 Dez, 80km rodados</p>
                </div>
                <span className="text-lg font-semibold text-destructive">R$ 210</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gold/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total do mês em combustível</span>
                <span className="text-2xl font-bold text-destructive">R$ 330</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="roupas" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Shirt className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Roupas de Palco</h2>
                  <p className="text-sm text-muted-foreground">Investimento em imagem</p>
                </div>
              </div>
              <Button>Adicionar Gasto</Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Camisa social preta</p>
                  <p className="text-sm text-muted-foreground">5 Dez</p>
                </div>
                <span className="text-lg font-semibold text-destructive">R$ 150</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total do mês</span>
                <span className="text-2xl font-bold text-destructive">R$ 150</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="equipamentos" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Equipamentos</h2>
                  <p className="text-sm text-muted-foreground">Manutenção e acessórios</p>
                </div>
              </div>
              <Button>Adicionar Gasto</Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Jogo de cordas para violão</p>
                  <p className="text-sm text-muted-foreground">8 Dez</p>
                </div>
                <span className="text-lg font-semibold text-destructive">R$ 85</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Cabo P10 novo</p>
                  <p className="text-sm text-muted-foreground">3 Dez</p>
                </div>
                <span className="text-lg font-semibold text-destructive">R$ 45</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total do mês</span>
                <span className="text-2xl font-bold text-destructive">R$ 130</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cofrinho" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gold/10">
                  <PiggyBank className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Cofrinho</h2>
                  <p className="text-sm text-muted-foreground">Para projeto audiovisual</p>
                </div>
              </div>
              <Button className="bg-gold text-black hover:bg-gold/90">Adicionar</Button>
            </div>
            
            <div className="text-center py-8">
              <div className="text-5xl font-bold text-gold mb-2">R$ 3.500</div>
              <p className="text-muted-foreground">Total guardado</p>
            </div>

            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Depósito - Show Casa de Eventos</p>
                  <p className="text-sm text-muted-foreground">20 Dez</p>
                </div>
                <span className="text-lg font-semibold text-gold">+R$ 500</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Depósito - Show Boteco da Esquina</p>
                  <p className="text-sm text-muted-foreground">10 Dez</p>
                </div>
                <span className="text-lg font-semibold text-gold">+R$ 300</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="fixas" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <HomeIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Despesas Fixas</h2>
                  <p className="text-sm text-muted-foreground">Compromissos mensais</p>
                </div>
              </div>
              <Button>Adicionar</Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Aluguel</p>
                  <p className="text-sm text-muted-foreground">Vence dia 10</p>
                </div>
                <span className="text-lg font-semibold text-destructive">R$ 1.500</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Pensão alimentícia</p>
                  <p className="text-sm text-muted-foreground">Vence dia 5</p>
                </div>
                <span className="text-lg font-semibold text-destructive">R$ 800</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Parcela do carro</p>
                  <p className="text-sm text-muted-foreground">Vence dia 15</p>
                </div>
                <span className="text-lg font-semibold text-destructive">R$ 500</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total mensal</span>
                <span className="text-2xl font-bold text-destructive">R$ 2.800</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financas;
