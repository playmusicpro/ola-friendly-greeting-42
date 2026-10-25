import { CircleDollarSign, EyeOff } from 'lucide-react';
import { diagnosisSummary, marginBand } from '@/lib/playDiagnosis';
import { calculateMonthlyFinancials } from '@/lib/calculations';

const tones = {
  neutral: 'text-muted-foreground', success: 'text-success',
  warning: 'text-gold', danger: 'text-destructive',
};
const titles = { neutral: 'Seu momento no caixa', success: 'Fechou Bonito', warning: 'Olho Aberto', danger: 'Acorda pro Corre' };

// Diagnóstico único e discreto: apenas a análise da margem real, sem ofertas ou links de venda.
export default function PlayDiagnosisCards({ monthly, hidden }: {
  monthly: ReturnType<typeof calculateMonthlyFinancials>; hidden: boolean;
}) {
  const band = hidden ? 'neutral' : marginBand(monthly.faturamentoBruto, monthly.dre.margemFinal);
  return <section aria-labelledby="play-diagnosis-title">
    <article className={`cash-diagnosis p-4 flex items-start gap-3 ${tones[band]}`}>
      {hidden ? <EyeOff className="h-5 w-5 shrink-0 mt-0.5" /> : <CircleDollarSign className="h-5 w-5 shrink-0 mt-0.5" />}
      <div className="min-w-0">
        <h2 id="play-diagnosis-title" className="text-sm font-medium">{hidden ? 'Valores ocultos' : titles[band]}</h2>
        {!hidden && <p className="text-sm leading-relaxed text-muted-foreground mt-1">{diagnosisSummary(monthly)}</p>}
      </div>
    </article>
  </section>;
}
