import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminRows } from "@/hooks/useAdminData";
import { AdminDataState } from "@/components/AdminDataState";
import { Users, MapPin, Music, UserCheck } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { useAdminIntelligenceRows } from '@/hooks/useAdminIntelligence';
import { AdminEngagement } from '@/components/AdminEngagement';
import { AdminModuleUsage } from '@/components/AdminModuleUsage';

type ProfileRow = {
  cidade: string | null;
  estado: string | null;
  genero_musical: string | null;
  tipo_musico: string | null;
  onboarding_completed: boolean | null;
};

const pieColors = [
  "hsl(var(--primary))",
  "hsl(var(--gold))",
  "hsl(var(--success))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
];

const countBy = (rows: ProfileRow[], getKey: (r: ProfileRow) => string | null) => {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const key = (getKey(r) || "").trim();
    if (!key) return;
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

const EmptyChart = () => (
  <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
    Nenhum dado registrado ainda
  </div>
);

const AdminDashboard = () => {
  const query = useAdminRows('profiles');
  const activity = useAdminIntelligenceRows('admin_activity_page');
  const { data: profiles = [], isLoading } = query;

  const generos = countBy(profiles, (r) => r.genero_musical).slice(0, 8);
  const cidades = countBy(profiles, (r) =>
    r.cidade ? `${r.cidade}${r.estado ? ` - ${r.estado}` : ""}` : null
  ).slice(0, 8);
  const tipos = countBy(profiles, (r) => r.tipo_musico).slice(0, 5);

  const totalUsuarios = profiles.length;
  const perfisCompletos = profiles.filter((p) => p.onboarding_completed).length;
  const totalCidades = countBy(profiles, (r) => r.cidade).length;
  const totalGeneros = countBy(profiles, (r) => r.genero_musical).length;

  const stats = [
    { label: "Usuários", value: totalUsuarios, icon: Users, bg: "bg-primary/10", fg: "text-primary" },
    { label: "Perfis completos", value: perfisCompletos, icon: UserCheck, bg: "bg-success/10", fg: "text-success" },
    { label: "Cidades", value: totalCidades, icon: MapPin, bg: "bg-gold/10", fg: "text-gold" },
    { label: "Gêneros musicais", value: totalGeneros, icon: Music, bg: "bg-primary/10", fg: "text-primary" },
  ];

  return (
    <AdminLayout title="Visão Geral">
      <AdminDataState loading={isLoading} error={query.error} retry={query.refetch} />
      <AdminDataState loading={activity.isLoading} error={activity.error} retry={activity.refetch} />
      <AdminEngagement userIds={profiles.map(profile => profile.id)} activity={activity.data ?? []} unavailable={isLoading || activity.isLoading || !!query.error || !!activity.error} />
      <AdminModuleUsage />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold">{isLoading ? "—" : s.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.fg}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Usuários por Cidade</CardTitle>
          </CardHeader>
          <CardContent>
            {cidades.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer config={{}} className="h-[300px]">
                <BarChart data={cidades} layout="vertical">
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tipo de Músico</CardTitle>
          </CardHeader>
          <CardContent>
            {tipos.length === 0 ? (
              <EmptyChart />
            ) : (
              <>
                <ChartContainer config={{}} className="h-[200px]">
                  <PieChart>
                    <Pie
                      data={tipos}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {tipos.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {tipos.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pieColors[index % pieColors.length] }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.name} ({item.value})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Music className="h-5 w-5" />
            Gêneros Musicais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generos.length === 0 ? (
            <EmptyChart />
          ) : (
            <ChartContainer config={{}} className="h-[300px]">
              <BarChart data={generos}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
