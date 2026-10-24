import { AudioLines, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useChromaticTuner } from '@/hooks/useChromaticTuner';

function TunerSession() {
  const { status, reading, error, start, stop } = useChromaticTuner();
  const listening = status === 'listening';
  const active = status !== 'off';
  const state = reading?.status ?? 'idle';
  const label = reading
    ? state === 'tuned' ? 'Afinado' : state === 'flat' ? 'Abaixo da afinação' : 'Acima da afinação'
    : listening ? 'Aguardando uma nota' : status === 'starting' ? 'Aguardando permissão' : 'Microfone desligado';
  const position = reading ? Math.round(Math.max(0, Math.min(100, reading.cents + 50))) : 50;

  return <div className="tuner-session" data-tuning={state}>
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span className="flex items-center gap-2"><AudioLines className="h-4 w-4 text-gold" />CROMÁTICO</span>
      <span>A4 · 440 Hz</span>
    </div>
    <div className="tuner-note-area">
      <div className="tuner-note" aria-label={reading ? `Nota ${reading.note}, oitava ${reading.octave}` : 'Nenhuma nota detectada'}>
        {reading?.note ?? '—'}{reading && <sub>{reading.octave}</sub>}
      </div>
      <p className="font-mono text-lg tabular-nums text-foreground">{reading ? `${reading.frequency.toFixed(1)} Hz` : '— Hz'}</p>
      <p className="tuner-state" role="status">{label}</p>
    </div>
    <div className="tuner-meter" role="meter" aria-label="Desvio de afinação em cents" aria-valuemin={-50} aria-valuemax={50} aria-valuenow={reading ? Math.round(reading.cents) : 0} aria-valuetext={reading ? `${Math.round(reading.cents)} cents` : 'Sem sinal'}>
      <div className="tuner-scale"><span className="tuner-center-zone" /><span className="tuner-center-line" />
        {reading && <svg className="tuner-needle" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><line x1={position} x2={position} y1="0" y2="40" vectorEffect="non-scaling-stroke" /></svg>}
      </div>
      <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>−50</span><span className="text-foreground">0 cents</span><span>+50</span></div>
    </div>
    <p className="h-6 text-center font-mono text-sm tabular-nums text-muted-foreground">{reading ? `${reading.cents > 0 ? '+' : ''}${Math.round(reading.cents)} cents · alvo ${reading.targetFrequency.toFixed(1)} Hz` : '— cents'}</p>
    {error && <p className="text-sm text-destructive text-center" role="alert">{error}</p>}
    <Button className="w-full gap-2" variant={active ? 'outline' : 'default'} onClick={() => active ? stop() : void start()}>
      {active ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      {active ? 'Desligar Microfone' : 'Ligar Microfone'}
    </Button>
  </div>;
}

export default function ChromaticTuner({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="tuner-dialog">
      <DialogTitle className="text-gold tracking-normal">Afinador</DialogTitle>
      <DialogDescription className="sr-only">Afinador cromático</DialogDescription>
      {open && <TunerSession />}
    </DialogContent>
  </Dialog>;
}