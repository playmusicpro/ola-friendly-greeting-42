import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildGoogleCalendarLink } from '@/lib/googleCalendarLink';
import { useToast } from '@/hooks/use-toast';
import type { Show } from '@/types';

export function GoogleCalendarShowButton({ show }: { show: Pick<Show, 'date' | 'time' | 'local' | 'title' | 'address' | 'notes' | 'endTime'> }) {
  const { toast } = useToast();
  return <Button size="sm" variant="outline" className="gap-2 whitespace-normal h-auto py-2" onClick={() => {
    try { window.open(buildGoogleCalendarLink(show), '_blank', 'noopener,noreferrer'); }
    catch (error) { toast({ title: 'Não foi possível abrir o Google Agenda', description: error instanceof Error ? error.message : 'Confira os dados do show.', variant: 'destructive' }); }
  }}><CalendarPlus className="h-4 w-4 shrink-0" />Sincronizar com Google Agenda</Button>;
}