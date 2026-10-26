import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminDataState } from '@/components/AdminDataState';
import { useAdminModuleUsage } from '@/hooks/useAdminIntelligence';
import { moduleUsagePercentages } from '@/lib/adminAnalytics';
import { moduleLabels } from '@/lib/appUsage';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

export function AdminModuleUsage() {
  const [days, setDays] = useState(30);
  const [now] = useState(() => Date.now());
  const query = useAdminModuleUsage(new Date(now - days * 86_400_000).toISOString());
  const data = moduleUsagePercentages(query.data ?? []);
  const chart = Object.entries(moduleLabels).map(([module, name]) => ({ name, percentage: data.find(row => row.module === module)?.percentage ?? 0 }));
  const total = data.reduce((sum, row) => sum + row.accesses, 0);
  return <Card className="mb-6">
    <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-lg">Uso por módulo</CardTitle><div className="flex gap-2">{[7, 30, 90].map(value => <Button key={value} size="sm" variant={days === value ? 'default' : 'outline'} onClick={() => setDays(value)}>{value} dias</Button>)}</div></CardHeader>
    <CardContent>
      <AdminDataState loading={query.isLoading} error={query.error} retry={query.refetch} />
      {!query.isLoading && !query.error && (total === 0 ? <p className="py-8 text-sm text-muted-foreground">Nenhum uso registrado neste período.</p> : <>
        <ChartContainer config={{ percentage: { label: 'Uso', color: 'hsl(var(--primary))' } }} className="h-[260px] w-full">
          <BarChart data={chart} layout="vertical" margin={{ left: 20 }}><XAxis type="number" tickFormatter={value => `${value}%`} /><YAxis type="category" dataKey="name" width={160} /><ChartTooltip content={<ChartTooltipContent />} formatter={value => `${Number(value).toFixed(1)}%`} /><Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} /></BarChart>
        </ChartContainer>
        <p className="mt-3 text-xs text-muted-foreground">{total} acessos/ações · Percentual sobre os módulos monitorados; navegação interna, geração de prompts e abertura de Maps.</p>
      </>)}
    </CardContent>
  </Card>;
}