import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  TrendingUp,
  MapPin,
  DollarSign,
  Percent
} from "lucide-react";
import { 
  generateMockShowAnalytics, 
  generateMockCityAnalytics 
} from "@/types/admin";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from "recharts";

const AdminShows = () => {
  const [showAnalytics] = useState(generateMockShowAnalytics());
  const [cityAnalytics] = useState(generateMockCityAnalytics());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate aggregated stats
  const totalRevenue = showAnalytics.reduce((sum, s) => sum + s.revenue, 0);
  const totalCosts = showAnalytics.reduce((sum, s) => sum + s.costs, 0);
  const avgMargin = showAnalytics.reduce((sum, s) => sum + s.marginPercent, 0) / showAnalytics.length;

  // Monthly trend data (mock)
  const monthlyTrend = [
    { month: 'Set', revenue: 180000, shows: 120 },
    { month: 'Out', revenue: 195000, shows: 128 },
    { month: 'Nov', revenue: 220000, shows: 145 },
    { month: 'Dez', revenue: 280000, shows: 178 },
    { month: 'Jan', revenue: 245000, shows: 156 },
  ];

  return (
    <AdminLayout title="Analytics de Shows">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Shows</p>
                <p className="text-2xl font-bold">1.456</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gold/10">
                <DollarSign className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(2340000)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <Percent className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Margem Média</p>
                <p className="text-2xl font-bold">{avgMargin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted-foreground/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-muted">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cidades</p>
                <p className="text-2xl font-bold">{cityAnalytics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência de Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px]">
              <LineChart data={monthlyTrend}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Shows per Month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Music className="h-5 w-5" />
              Shows por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px]">
              <BarChart data={monthlyTrend}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="shows" 
                  fill="hsl(var(--gold))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Cities */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Cidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Cidade</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Shows</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Receita Total</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Margem Média</th>
                </tr>
              </thead>
              <tbody>
                {cityAnalytics.map((city, index) => (
                  <tr key={city.city} className="border-b border-border/30 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={index < 3 ? "default" : "outline"} className="w-6 h-6 p-0 justify-center">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{city.city}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">{city.showsCount}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(city.totalRevenue)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-success font-medium">{city.avgMargin.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Shows Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimos Shows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Evento</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Artista</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Cidade</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Data</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Receita</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Custos</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Margem</th>
                </tr>
              </thead>
              <tbody>
                {showAnalytics.map((show) => (
                  <tr key={show.id} className="border-b border-border/30 hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{show.eventName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{show.userName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{show.city}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(show.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-success">
                      {formatCurrency(show.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-destructive">
                      {formatCurrency(show.costs)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={show.marginPercent >= 75 ? "default" : "secondary"}>
                        {show.marginPercent.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminShows;
