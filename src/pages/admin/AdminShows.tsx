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
import { useAdminRows } from '@/hooks/useAdminData';
import { AdminDataState } from '@/components/AdminDataState';
import { summarizeAdminShows } from '@/lib/adminAnalytics';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from "recharts";

const AdminShows = () => {
  const showsQuery = useAdminRows('shows');
  const profilesQuery = useAdminRows('profiles');
  const summary = summarizeAdminShows(showsQuery.data ?? []);
  const showAnalytics = summary.rows.map(show => ({
    ...show, eventName: show.local,
    userName: profilesQuery.data?.find(profile => profile.id === show.user_id)?.name ?? 'Perfil não disponível',
  })).sort((a, b) => b.date.localeCompare(a.date));
  const totalRevenue = summary.net;
  const avgMargin = summary.margin;
  const monthlyTrend = summary.monthly;
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <AdminLayout title="Análises de Shows">
      <AdminDataState loading={showsQuery.isLoading || profilesQuery.isLoading} error={showsQuery.error || profilesQuery.error} retry={() => { void showsQuery.refetch(); void profilesQuery.refetch(); }} />
      {!showsQuery.isLoading && !showsQuery.error && summary.totalShows === 0 && <p className="py-4 text-muted-foreground">Nenhum show finalizado registrado.</p>}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Shows finalizados</p>
                <p className="text-2xl font-bold">{summary.totalShows}</p>
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
                <p className="text-xs text-muted-foreground">Faturamento Real</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
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
                <p className="text-xs text-muted-foreground">Margem consolidada</p>
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
                <p className="text-xs text-muted-foreground">Cachê bruto</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.gross)}</p>
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
              Tendência de Faturamento
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
                  
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Data</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Faturamento</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Custos</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Margem</th>
                </tr>
              </thead>
              <tbody>
                {showAnalytics.map((show) => (
                  <tr key={show.id} className="border-b border-border/30 hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{show.eventName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{show.userName}</td>
                    
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
