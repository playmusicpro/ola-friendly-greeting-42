import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { summarizeMarket, type AdminShow, type AdminProfile } from '@/lib/adminAnalytics';

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
export function AdminMarketMetrics({ shows, profiles, unavailable }: { shows: AdminShow[]; profiles: AdminProfile[]; unavailable: boolean }) {
  const market = summarizeMarket(shows, profiles);
  const [group, setGroup] = useState<'genres' | 'cities' | 'regions'>('genres');
  return <section className="mb-6 space-y-4" aria-label="Inteligência de mercado">
    <h2 className="text-lg font-semibold">Ticket médio da base</h2>
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'Média de Custo por Show', value: market.averageCost, color: 'text-destructive' },
        { label: 'Ticket Médio · Cachê Bruto', value: market.grossTicket, color: 'text-gold' },
        { label: 'Ticket Médio · Resultado Líquido', value: market.netTicket, color: 'text-success' },
      ].map(item => <Card key={item.label}><CardContent className="p-5"><p className="text-xs text-muted-foreground">{item.label}</p><p className={`mt-2 text-2xl font-bold ${item.color}`}>{unavailable ? '—' : money(item.value)}</p></CardContent></Card>)}
    </div>
    <p className="text-xs text-muted-foreground">{market.count} shows finalizados · Resultado por show = cachê bruto − custos registrados. Não inclui despesas fixas, saídas avulsas ou reservas pessoais; não representa caixa recebido.</p>
    <div className="flex items-center justify-between gap-4"><h3 className="font-semibold">Margem média por segmento</h3><div className="flex gap-2">{([{ key: 'genres', label: 'Estilo musical' }, { key: 'cities', label: 'Cidade' }, { key: 'regions', label: 'Região / UF' }] as const).map(item => <Button size="sm" key={item.key} variant={group === item.key ? 'default' : 'outline'} onClick={() => setGroup(item.key)}>{item.label}</Button>)}</div></div>
    <p className="text-xs text-muted-foreground">Média aritmética das margens por show. Localização e estilo do perfil do músico; UF representa a região cadastrada.</p>
    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-muted-foreground"><th className="py-3 text-left">Segmento</th><th className="text-right">Shows</th><th className="text-right">Custo médio</th><th className="text-right">Cachê médio</th><th className="text-right">Resultado médio</th><th className="text-right">Margem média</th></tr></thead><tbody>
      {!unavailable && market[group].map(row => <tr key={row.name} className="border-b border-border/30"><td className="py-3 font-medium">{row.name}</td><td className="text-right">{row.shows}</td><td className="text-right">{money(row.averageCost)}</td><td className="text-right">{money(row.grossTicket)}</td><td className="text-right">{money(row.netTicket)}</td><td className={row.averageMargin < 0 ? 'text-right text-destructive' : 'text-right text-success'}>{row.averageMargin.toFixed(1)}%</td></tr>)}
      {!unavailable && market.count === 0 && <tr><td colSpan={6} className="py-6 text-muted-foreground">Nenhum show finalizado para este relatório.</td></tr>}
    </tbody></table></div>
  </section>;
}