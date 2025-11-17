import { useState } from "react";
import { BarChart, Copy, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinancialData } from "@/hooks/useFinancialData";
import { getShowsAnalysis, formatCurrency, formatPercentage } from "@/lib/calculations";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

const Analises = () => {
  const { shows, duplicateShow } = useFinancialData();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const analysis = getShowsAnalysis(shows, startDate, endDate);

  const handleDuplicate = (showId: string) => {
    const duplicated = duplicateShow(showId);
    if (duplicated) {
      toast({
        title: "Show duplicado!",
        description: `"${duplicated.local}" foi criado com sucesso.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gold via-primary to-gold bg-clip-text text-transparent">
          Análise por Evento
        </h1>
        <p className="text-muted-foreground text-lg">
          DRE individual, rankings e análise comparativa de shows
        </p>
      </div>

      {/* Filtros */}
      <Card className="p-6 shadow-lg border-gold/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <BarChart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Filtros por Período</h2>
            <p className="text-xs text-muted-foreground">
              Selecione um intervalo para análise
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Inicial</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Data Final</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {(startDate || endDate) && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            Limpar Filtros
          </Button>
        )}
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total de Shows</p>
              <p className="text-3xl font-bold">{analysis.items.length}</p>
            </div>
            <BarChart className="h-8 w-8 text-gold" />
          </div>
        </Card>
        <Card className="p-6 border-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
              <p className="text-3xl font-bold text-success">
                {formatCurrency(
                  analysis.items.reduce((sum, item) => sum + item.receita, 0)
                )}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
        </Card>
        <Card className="p-6 border-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lucro Total</p>
              <p className="text-3xl font-bold text-gold">
                {formatCurrency(
                  analysis.items.reduce((sum, item) => sum + item.lucro, 0)
                )}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-gold" />
          </div>
        </Card>
      </div>

      {/* Gráfico Comparativo */}
      {analysis.chartData.length > 0 && (
        <Card className="p-6 shadow-lg border-gold/20">
          <h2 className="text-xl font-semibold mb-4">Receita vs Custo por Show</h2>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart data={analysis.chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="receita" fill="hsl(var(--success))" name="Receita" />
              <Bar dataKey="custo" fill="hsl(var(--destructive))" name="Custo" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Mais Lucrativos */}
        <Card className="p-6 shadow-lg border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Top 5 Mais Lucrativos</h2>
              <p className="text-xs text-muted-foreground">Shows com melhor resultado</p>
            </div>
          </div>

          <div className="space-y-3">
            {analysis.topMost.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum show encontrado no período
              </p>
            ) : (
              analysis.topMost.map((show, index) => (
                <div
                  key={show.showId}
                  className="p-4 bg-background/50 rounded-xl border border-border hover:border-success/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-success">#{index + 1}</div>
                      <div>
                        <p className="font-semibold">{show.titulo}</p>
                        <p className="text-xs text-muted-foreground">{show.data}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(show.showId)}
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Receita</p>
                      <p className="font-semibold text-success">
                        {formatCurrency(show.receita)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lucro</p>
                      <p className="font-semibold text-gold">
                        {formatCurrency(show.lucro)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Margem</p>
                      <p className="font-semibold">{formatPercentage(show.margem)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top 5 Menos Lucrativos */}
        <Card className="p-6 shadow-lg border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Top 5 Menos Lucrativos</h2>
              <p className="text-xs text-muted-foreground">Shows que precisam de atenção</p>
            </div>
          </div>

          <div className="space-y-3">
            {analysis.topLeast.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum show encontrado no período
              </p>
            ) : (
              analysis.topLeast.map((show, index) => (
                <div
                  key={show.showId}
                  className="p-4 bg-background/50 rounded-xl border border-border hover:border-destructive/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-destructive">#{index + 1}</div>
                      <div>
                        <p className="font-semibold">{show.titulo}</p>
                        <p className="text-xs text-muted-foreground">{show.data}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(show.showId)}
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Receita</p>
                      <p className="font-semibold">{formatCurrency(show.receita)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lucro</p>
                      <p
                        className={`font-semibold ${
                          show.lucro < 0 ? "text-destructive" : "text-gold"
                        }`}
                      >
                        {formatCurrency(show.lucro)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Margem</p>
                      <p
                        className={`font-semibold ${
                          show.margem < 0 ? "text-destructive" : ""
                        }`}
                      >
                        {formatPercentage(show.margem)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Lista Completa de Eventos */}
      {analysis.items.length > 0 && (
        <Card className="p-6 shadow-lg border-gold/20">
          <h2 className="text-xl font-semibold mb-4">Todos os Eventos Analisados</h2>
          <div className="space-y-3">
            {analysis.items.map((show) => (
              <div
                key={show.showId}
                className="p-4 bg-background/50 rounded-xl border border-border hover:border-gold/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-lg">{show.titulo}</p>
                    <p className="text-sm text-muted-foreground">{show.data}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(show.showId)}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Duplicar
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Receita</p>
                    <p className="font-semibold text-success">
                      {formatCurrency(show.receita)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Custo</p>
                    <p className="font-semibold text-destructive">
                      {formatCurrency(show.custo)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Lucro</p>
                    <p
                      className={`font-semibold ${
                        show.lucro < 0 ? "text-destructive" : "text-gold"
                      }`}
                    >
                      {formatCurrency(show.lucro)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Margem</p>
                    <p
                      className={`font-semibold ${
                        show.margem < 0 ? "text-destructive" : ""
                      }`}
                    >
                      {formatPercentage(show.margem)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analises;
