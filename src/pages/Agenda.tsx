import { useState } from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useRepertoire } from '@/hooks/useRepertoire';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Music, 
  Music2, 
  GraduationCap, 
  Mic, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  CheckCircle, 
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';
import { EventForm } from '@/components/EventForm';
import { Event } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { GoogleCalendarSyncIndicator } from '@/components/GoogleCalendarSyncIndicator';
import { GoogleCalendarShowButton } from '@/components/GoogleCalendarShowButton';
import { ShowForm } from '@/components/ShowForm';
import type { Show } from '@/types';
import { showFromEvent } from '@/lib/showForm';
import { recordAppUsage } from '@/lib/appUsage';
import { OpenInMapsButton } from '@/components/OpenInMapsButton';
import { mapsDirectionsUrl } from '@/lib/musicianReceipt';
import { formatDateBR } from '@/lib/dateUtils';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

export default function Agenda() {
  const { events, addEvent, updateEvent, deleteEvent, duplicateEvent, markEventAsRealizado, shows, addShow, updateShow, deleteShow, markShowRealizado } = useFinancialData();
  const [financialShow, setFinancialShow] = useState<Show | undefined>();
  const [showFinancialForm, setShowFinancialForm] = useState(false);
  const [sourceEvent, setSourceEvent] = useState<Event | undefined>();
  const [showPrefill, setShowPrefill] = useState<Partial<Show> | undefined>();
  const openEventShow = (event: Event, duplicate = false) => {
    const linked = !duplicate && event.linkedShowId ? shows.find(show => show.id === event.linkedShowId) : undefined;
    setFinancialShow(linked);
    setSourceEvent(duplicate ? undefined : event);
    setShowPrefill(duplicate ? { ...showFromEvent(event), title: `${event.title} (cópia)`, realizado: false } : showFromEvent(event));
    setShowFinancialForm(true);
  };
  const { setlists, songs } = useRepertoire();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [deletingShow, setDeletingShow] = useState<Show | null>(null);
  const editShow = (show: Show) => { setFinancialShow(show); setSourceEvent(undefined); setShowPrefill(undefined); setShowFinancialForm(true); };
  const duplicateShowCard = (show: Show) => { const { id: _id, ...rest } = show; setFinancialShow(undefined); setSourceEvent(undefined); setShowPrefill({ ...rest, title: `${show.title || show.local} (cópia)`, realizado: false, depositReceived: false, settled: false }); setShowFinancialForm(true); };
  const completeShow = async (show: Show) => { if (await markShowRealizado(show.id, true)) toast({ title: 'Show realizado', description: 'O calendário já mostra a data em verde.' }); };
  const shareShow = (show: Show) => {
    const msg = `*${show.title || show.local}*\nData: ${formatDateBR(show.date)}\nHorário: ${show.time}${show.endTime ? ` - ${show.endTime}` : ''}\nLocal: ${show.local}${show.address ? `\nEndereço: ${show.address}` : ''}${show.contractor ? `\nContratante: ${show.contractor}` : ''}${show.notes ? `\n\nNotas: ${show.notes}` : ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getEventIcon = (tipo: Event['tipo']) => {
    switch (tipo) {
      case 'Show':
        return Music;
      case 'Ensaio':
        return Music2;
      case 'Aula':
        return GraduationCap;
      case 'Gravação':
        return Mic;
      case 'Compromisso':
        return CalendarIcon;
      default:
        return CalendarIcon;
    }
  };

  const getEventColor = (tipo: Event['tipo']) => {
    switch (tipo) {
      case 'Show':
        return 'bg-primary text-primary-foreground';
      case 'Ensaio':
        return 'bg-secondary text-secondary-foreground';
      case 'Aula':
        return 'bg-accent text-accent-foreground';
      case 'Gravação':
        return 'bg-destructive text-destructive-foreground';
      case 'Compromisso':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const selectedDateStr = selectedDate?.toISOString().split('T')[0] || '';
  const dayEvents = events.filter(event => event.date === selectedDateStr);
  const linkedShowIds = new Set(events.map(e => e.linkedShowId).filter(Boolean));
  // Shows cadastrados aparecem na agenda mesmo sem evento vinculado, ordenados por data/horário.
  const dayShows = shows.filter(s => s.date === selectedDateStr && !linkedShowIds.has(s.id));
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingShows = [...shows].filter(s => s.date >= todayStr && !s.realizado).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const handleAddEvent = async (eventData: Omit<Event, 'id'>) => {
    if (!await addEvent(eventData)) return false;
    toast({
      title: "Evento criado",
      description: "O evento foi adicionado à agenda.",
    });
  };

  const handleUpdateEvent = async (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      if (!await updateEvent(editingEvent.id, eventData)) return false;
      toast({
        title: "Evento atualizado",
        description: "As alterações foram salvas.",
      });
      setEditingEvent(null);
    }
  };

  const handleDeleteEvent = () => {
    if (deletingEventId) {
      deleteEvent(deletingEventId);
      toast({
        title: "Evento excluído",
        description: "O evento foi removido da agenda.",
      });
      setDeletingEventId(null);
    }
  };

  const handleDuplicate = (id: string) => {
    const event = events.find(item => item.id === id);
    if (event?.tipo === 'Show') { openEventShow(event, true); return; }
    duplicateEvent(id);
    toast({
      title: "Evento duplicado",
      description: "Uma cópia do evento foi criada.",
    });
  };

  const handleMarkRealizado = async (id: string) => {
    const event = events.find(item => item.id === id);
    if (event?.tipo === 'Show' && !event.linkedShowId) { openEventShow(event); return; }
    if (!await markEventAsRealizado(id)) return;
    toast({
      title: "Evento marcado como realizado",
      description: "O status do evento foi atualizado.",
    });
  };

  const handleWhatsApp = (event: Event) => {
    const message = `*${event.title}*\nTipo: ${event.tipo}\nData: ${format(new Date(event.date + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}\nHorário: ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}${event.local ? `\nLocal: ${event.local}` : ''}${event.notes ? `\n\nNotas: ${event.notes}` : ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleMaps = (local: string) => {
    void recordAppUsage('maps', 'action');
    const url = mapsDirectionsUrl(local);
    window.open(url, '_blank');
  };

  const handleExportPDF = (event: Event) => {
    const setlist = event.playlistId ? setlists.find(s => s.id === event.playlistId) : null;
    
    let content = `EVENTO: ${event.title}\nTipo: ${event.tipo}\nData: ${format(new Date(event.date + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}\nHorário: ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}\n${event.local ? `Local: ${event.local}` : ''}${event.notes ? `\n\nNotas:\n${event.notes}` : ''}`;

    if (setlist) {
      content += `\n\n${'='.repeat(50)}\nSETLIST: ${setlist.name}\n${'='.repeat(50)}\n\n`;
      setlist.musicas.forEach((musicaEntry, index) => {
        const song = songs.find(s => s.id === musicaEntry.songId);
        if (song) {
          content += `${index + 1}. ${song.title} - ${song.artist}\n`;
          content += `   Tom: ${musicaEntry.tomEscolhido || song.tone}`;
          if (song.howYouPlay) {
            content += ` | Como tocar: ${song.howYouPlay}`;
          }
          content += '\n\n';
        }
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evento-${event.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportação concluída",
      description: "Arquivo baixado com sucesso",
    });
  };

  // Amarelo = agendado (ainda não realizado); verde neon = todos os itens da data realizados.
  const dateStatus = new Map<string, boolean>();
  [...events.map(e => ({ d: e.date, done: e.realizado })), ...shows.map(sh => ({ d: sh.date, done: sh.realizado }))].forEach(({ d, done }) => dateStatus.set(d, (dateStatus.get(d) ?? true) && !!done));
  const toDate = (d: string) => new Date(d + 'T00:00:00');
  const modifiers = {
    scheduled: [...dateStatus].filter(([, done]) => !done).map(([d]) => toDate(d)),
    completed: [...dateStatus].filter(([, done]) => done).map(([d]) => toDate(d)),
  };
  const modifiersClassNames = { scheduled: 'calendar-dot calendar-dot-scheduled', completed: 'calendar-dot calendar-dot-completed' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">Gerencie seus eventos e compromissos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { setFinancialShow(undefined); setSourceEvent(undefined); setShowPrefill(undefined); setShowFinancialForm(true); }}><Plus className="h-4 w-4 mr-2" />Novo Show</Button>
          <GoogleCalendarSyncIndicator />
          <Button onClick={() => { setEditingEvent(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Eventos - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayShows.map(show => (
              <Card key={show.id} className="mb-4"><CardContent className="pt-6 space-y-2">
                <Badge className={getEventColor('Show')}><Music className="h-3 w-3 mr-1" />Show</Badge>
                <h3 className="font-semibold text-lg">{show.title || show.local}</h3>
                <p className="text-sm text-muted-foreground"><Clock className="h-3 w-3 inline mr-1" />{show.time}{show.endTime ? ` - ${show.endTime}` : ''} · {show.local}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <GoogleCalendarShowButton show={show} />
                  <OpenInMapsButton destination={show.address || show.local} />
                  <Button variant="outline" size="sm" onClick={() => editShow(show)}><Edit className="h-4 w-4 mr-2" />Editar</Button>
                </div>
              </CardContent></Card>
            ))}
            {dayEvents.length === 0 && dayShows.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum evento agendado para este dia
              </p>
            ) : (
              <div className="space-y-4">
                {dayEvents.map((event) => {
                  const Icon = getEventIcon(event.tipo);
                  const linkedShow = event.linkedShowId ? shows.find(s => s.id === event.linkedShowId) : null;
                  
                  return (
                    <Card key={event.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getEventColor(event.tipo)}>
                                <Icon className="h-3 w-3 mr-1" />
                                {event.tipo}
                              </Badge>
                              {event.realizado && (
                                <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Realizado
                                </Badge>
                              )}
                            </div>
                            
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p><Clock className="h-3 w-3 inline mr-1" />{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</p>
                              {event.local && <p>📍 {event.local}</p>}
                              {linkedShow && <p>🎵 Show vinculado: {linkedShow.local}</p>}
                              {event.notes && <p className="mt-2">{event.notes}</p>}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {event.tipo === 'Show' && <GoogleCalendarShowButton show={{ date: event.date, time: event.startTime, endTime: event.endTime, local: event.local || event.title, title: event.title, address: event.local, notes: event.notes }} />}
                          {linkedShow && <Button variant="outline" size="sm" onClick={() => openEventShow(event)}>Cachê e Pagamentos</Button>}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { if (event.tipo === 'Show') { openEventShow(event); return; } setEditingEvent(event); setIsFormOpen(true); }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicate(event.id)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Duplicar
                          </Button>

                          {!event.realizado && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkRealizado(event.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Marcar Realizado
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWhatsApp(event)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Button>

                          {(linkedShow?.address || event.local) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMaps(linkedShow?.address || event.local || '')}
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              Abrir no Maps
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingEventId(event.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Próximos Shows</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {upcomingShows.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum show agendado.</p> : upcomingShows.map(show => (
            <div key={show.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0">
              <button type="button" className="text-left min-w-0" onClick={() => setSelectedDate(new Date(show.date + 'T00:00:00'))}>
                <p className="font-semibold break-words">{show.title || show.local}</p>
                <p className="text-xs text-muted-foreground">{formatDateBR(show.date)} · {show.time} · {show.local}</p>
              </button>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => editShow(show)}><Edit className="h-3 w-3 mr-1" />Editar</Button>
                <Button size="sm" variant="outline" onClick={() => duplicateShowCard(show)}><Copy className="h-3 w-3 mr-1" />Duplicar</Button>
                <Button size="sm" variant="outline" onClick={() => completeShow(show)}><CheckCircle className="h-3 w-3 mr-1" />Marcar Realizado</Button>
                <Button size="sm" variant="outline" onClick={() => shareShow(show)}><ExternalLink className="h-3 w-3 mr-1" />WhatsApp</Button>
                <OpenInMapsButton destination={show.address || show.local} />
                <Button size="sm" variant="destructive" aria-label={`Excluir ${show.title || show.local}`} onClick={() => setDeletingShow(show)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <EventForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent}
        initialData={editingEvent || undefined}
        onDelete={editingEvent ? () => setDeletingEventId(editingEvent.id) : undefined}
      />
      <ConfirmDeleteDialog open={!!deletingShow} itemName={deletingShow?.title || deletingShow?.local} onCancel={() => setDeletingShow(null)} onConfirm={async () => { const target = deletingShow; setDeletingShow(null); if (target && await deleteShow(target.id)) toast({ title: 'Show excluído' }); }} />
      <ShowForm open={showFinancialForm} onOpenChange={setShowFinancialForm} initialData={financialShow} prefill={showPrefill} onDelete={financialShow ? async () => { const ok = await deleteShow(financialShow.id); if (ok) toast({ title: 'Show excluído' }); return ok; } : undefined} onSubmit={async data => {
        const saved = financialShow ? await updateShow(financialShow.id, data) : await addShow(data, sourceEvent?.id);
        if (!saved) return false;
        if (financialShow && sourceEvent) {
          if (!await updateEvent(sourceEvent.id, { ...sourceEvent, title: data.title || data.local, date: data.date, startTime: data.time, endTime: data.endTime, local: data.local, notes: data.notes, realizado: !!data.realizado })) return false;
        }
        toast({ title: financialShow ? 'Show atualizado' : 'Show criado', description: 'Dados do evento, recebimentos e custos salvos.' });
        return true;
      }} />

      <AlertDialog open={!!deletingEventId} onOpenChange={() => setDeletingEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir este evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirmar Exclusão</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
