import { Card, CardContent } from '@/components/ui/card';
import { summarizeEngagement, type ActivityRow } from '@/lib/adminAnalytics';

export function AdminEngagement({ userIds, activity, unavailable }: { userIds: string[]; activity: ActivityRow[]; unavailable: boolean }) {
  const metrics = summarizeEngagement(userIds, activity);
  return <section aria-label="Engajamento" className="mb-6">
    <div className="grid grid-cols-4 gap-4">
      {[
        { label: 'Ativos · últimos 7 dias', value: metrics.active, color: 'text-success' },
        { label: 'Inativos · mais de 14 dias', value: metrics.inactive, color: 'text-destructive' },
        { label: 'Último acesso · 7 a 14 dias', value: metrics.intermediate, color: 'text-gold' },
        { label: 'Sem acesso registrado', value: metrics.unknown, color: 'text-muted-foreground' },
      ].map(item => <Card key={item.label}><CardContent className="p-5"><p className="text-xs text-muted-foreground">{item.label}</p><p className={`mt-2 text-2xl font-bold ${item.color}`}>{unavailable ? '—' : item.value}</p></CardContent></Card>)}
    </div>
    <p className="mt-2 text-xs text-muted-foreground">Rastreamento iniciado em 26/10/2026. Sem histórico anterior não significa inatividade.</p>
  </section>;
}