import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  Users, 
  TrendingDown, 
  Activity,
  Music,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  generateMockMetrics, 
  generateMockShowAnalytics,
  generateMockCityAnalytics 
} from "@/types/admin";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = () => {
  const [metrics] = useState(generateMockMetrics());
  const [cityAnalytics] = useState(generateMockCityAnalytics());
  const [recentShows] = useState(generateMockShowAnalytics().slice(0, 5));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const pieColors = [
    'hsl(var(--primary))',
    'hsl(var(--gold))',
    'hsl(var(--success))',
    'hsl(var(--destructive))',
    'hsl(var(--muted-foreground))'
  ];

  const planDistribution = [
    { name: 'Free', value: 45, fill: pieColors[4] },
    { name: 'Pro', value: 35, fill: pieColors[0] },
    { name: 'Premium', value: 20, fill: pieColors[1] }
  ];

  return (
    <AdminLayout title="Visão Geral">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">MRR</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.mrr)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">+{metrics.mrrGrowth}%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Usuários Ativos</p>
                <p className="text-2xl font-bold">{metrics.activeUsers}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">+{metrics.activeUsersGrowth}%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gold/10">
                <Users className="h-5 w-5 text-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Churn Rate</p>
                <p className="text-2xl font-bold">{metrics.churnRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">{metrics.churnRateChange}%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">DAU</p>
                <p className="text-2xl font-bold">{metrics.dailyActiveUsers}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">+{metrics.dauGrowth}%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <Activity className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue by City Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Receita por Cidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <BarChart data={cityAnalytics.slice(0, 6)} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="city" width={100} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Bar 
                  dataKey="totalRevenue" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px]">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-4">
              {planDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shows */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Music className="h-5 w-5" />
            Shows Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Evento</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Usuário</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Cidade</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Data</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Receita</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Margem</th>
                </tr>
              </thead>
              <tbody>
                {recentShows.map((show) => (
                  <tr key={show.id} className="border-b border-border/30 hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{show.eventName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{show.userName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{show.city}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(show.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(show.revenue)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-success font-medium">{show.marginPercent.toFixed(1)}%</span>
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

export default AdminDashboard;
