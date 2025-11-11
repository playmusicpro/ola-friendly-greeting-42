import { Fuel, Shirt, Music, PiggyBank, Home as HomeIcon, TrendingDown } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Financas = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Consultor Financeiro</h1>
        <p className="text-muted-foreground">
          Acompanhe seus gastos e economias
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total de Gastos"
          value="R$ 1.250"
          icon={TrendingDown}
          trend="Este mês"
          variant="default"
        />
        <StatCard
          title="Cofrinho"
          value="R$ 3.500"
          icon={PiggyBank}
          trend="Guardado para projeto"
          variant="gold"
        />
        <StatCard
          title="Despesas Fixas"
          value="R$ 2.800"
          icon={HomeIcon}
          trend="Mensais"
          variant="default"
        />
      </div>

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
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Fuel className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Combustível</h2>
                  <p className="text-sm text-muted-foreground">Gastos com transporte</p>
                </div>
              </div>
              <Button>Adicionar Gasto</Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Gasolina - Show Bar do Zé</p>
                  <p className="text-sm text-muted-foreground">15 Dez, 50km</p>
                </div>
                <span className="text-lg font-semibold text-destructive">R$ 120</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Pedágio + Gasolina - Casa de Eventos</p>
                  <p className="text-sm text-muted-foreground">20 Dez, 80km</p>
                </div>
                <span className="text-lg font-semibold text-destructive">R$ 210</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total do mês</span>
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
