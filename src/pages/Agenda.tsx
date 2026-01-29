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

export default function Agenda() {
  const { events, addEvent, updateEvent, deleteEvent, duplicateEvent, markEventAsRealizado, shows } = useFinancialData();
  const { setlists, songs } = useRepertoire();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

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

  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    addEvent(eventData);
    toast({
      title: "Evento criado",
      description: "O evento foi adicionado à agenda.",
    });
  };

  const handleUpdateEvent = (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
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
    duplicateEvent(id);
    toast({
      title: "Evento duplicado",
      description: "Uma cópia do evento foi criada.",
    });
  };

  const handleMarkRealizado = (id: string) => {
    markEventAsRealizado(id);
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
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local)}`;
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

  const modifiers = {
    hasEvents: events.map(e => new Date(e.date + 'T00:00:00'))
  };

  const modifiersClassNames = {
    hasEvents: 'font-bold text-primary'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">Gerencie seus eventos e compromissos</p>
        </div>
        <Button onClick={() => { setEditingEvent(null); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
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
            {dayEvents.length === 0 ? (
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setEditingEvent(event); setIsFormOpen(true); }}
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

                          {event.local && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMaps(event.local!)}
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              Maps
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

      <EventForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent}
        initialData={editingEvent || undefined}
      />

      <AlertDialog open={!!deletingEventId} onOpenChange={() => setDeletingEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
