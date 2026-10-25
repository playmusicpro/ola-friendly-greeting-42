import { useState } from 'react';
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, CircleDollarSign, EyeOff, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buildPlayDiagnosis, contextualMaterial } from '@/lib/playDiagnosis';
import { COMMUNITY_URL, FREE_MATERIALS, HOTMART_MEMBERS_URL, MARKET_FOCUS_LABELS, type MarketFocus } from '@/lib/officialMaterials';
import { calculateMonthlyFinancials } from '@/lib/calculations';
import type { Show, FinancialGoal } from '@/types';

const tones = {
  neutral: 'border-border bg-card text-muted-foreground', success: 'border-success/40 bg-success/5 text-success',
  warning: 'border-gold/40 bg-gold/5 text-gold', danger: 'border-destructive/40 bg-destructive/5 text-destructive',
};
export default function PlayDiagnosisCards({ monthly, shows, goals, hidden }: {
  monthly: ReturnType<typeof calculateMonthlyFinancials>; shows: Show[]; goals: FinancialGoal[]; hidden: boolean;
}) {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);
  const [focus, setFocus] = useState<MarketFocus>('automatico');
  const diagnosis = buildPlayDiagnosis(monthly, shows, goals, new Date(), rotation);
  const free = FREE_MATERIALS[Math.abs(rotation) % FREE_MATERIALS.length];
  // Financial tone and contextual recommendations must not reveal the hidden margin.
  const band = hidden ? 'neutral' : diagnosis.band;
  const material = contextualMaterial(band, focus);
  const titles = { neutral: 'Seu momento no caixa', success: 'Fechou Bonito', warning: 'Olho Aberto', danger: 'Acorda pro Corre' };
  return <section aria-labelledby="play-diagnosis-title" className="space-y-3">
    <div className="flex flex-wrap items-center gap-3 justify-between"><h2 id="play-diagnosis-title" className="text-lg font-semibold">Diagnóstico do Play Pro</h2><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label="Dica anterior" title="Dica anterior" onClick={() => setRotation(value => value - 1)}><ChevronLeft className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label="Próxima dica" title="Próxima dica" onClick={() => setRotation(value => value + 1)}><ChevronRight className="h-4 w-4" /></Button></div></div>
    <div className="grid gap-3 lg:grid-cols-3">
      <article className={`rounded-lg border p-4 flex flex-col gap-3 min-w-0 ${tones[band]}`}>
        <div className="flex items-center gap-2">{hidden ? <EyeOff className="h-5 w-5" /> : <CircleDollarSign className="h-5 w-5" />}<h3 className="font-semibold">{hidden ? 'Valores ocultos' : titles[band]}</h3></div>
        {!hidden && <><p className="text-sm leading-relaxed text-foreground">{diagnosis.message}</p>{diagnosis.collection && <p className="text-sm leading-relaxed text-foreground border-t border-border pt-3">{diagnosis.collection}</p>}<Button className="mt-auto self-start" variant="outline" onClick={() => navigate('/financas')}>{diagnosis.pending > 0 ? 'Conferir recebimentos' : 'Ver meu caixa'}<ArrowRight className="ml-2 h-4 w-4" /></Button></>}
      </article>
      <article className="rounded-lg border border-gold/20 bg-card p-4 flex flex-col gap-3 min-w-0">
        <h3 className="flex items-center gap-2 font-semibold"><MessageCircle className="h-5 w-5 text-gold" />{free.title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{free.message}</p>
        <Button asChild variant="outline" className="mt-auto h-auto min-h-10 whitespace-normal text-left justify-between"><a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer">{free.button}<ArrowRight className="ml-2 h-4 w-4 shrink-0" /></a></Button>
      </article>
      <article className="rounded-lg border border-primary/30 bg-card p-4 flex flex-col gap-3 min-w-0">
        <h3 className="flex items-center gap-2 font-semibold"><BookOpen className="h-5 w-5 text-primary" />{material.title}</h3>
        <Select value={focus} onValueChange={value => setFocus(value as MarketFocus)}><SelectTrigger aria-label="Meu foco na estrada"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(MARKET_FOCUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
        <p className="text-sm leading-relaxed text-muted-foreground">{material.message}</p><p className="text-xs text-muted-foreground">Material pago · Área de membros Hotmart</p>
        <Button asChild variant="outline" className="mt-auto h-auto min-h-10 whitespace-normal text-left justify-between"><a href={HOTMART_MEMBERS_URL} target="_blank" rel="noopener noreferrer">{material.button}<ArrowRight className="ml-2 h-4 w-4 shrink-0" /></a></Button>
      </article>
    </div>
  </section>;
}