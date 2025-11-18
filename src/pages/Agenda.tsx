import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFinancialData } from '@/hooks/useFinancialData';
import { EventForm } from '@/components/EventForm';
import { Event } from '@/types';
import { Plus, Music, Users, GraduationCap, Mic, Calendar as CalendarIcon, MapPin, Clock, ExternalLink, Copy, CheckCircle, Trash2 } from 'lucide-react';
import { formatDateBR } from '@/lib/dateUtils';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Agenda() {
  const { events, addEvent, updateEvent, deleteEvent, duplicateEvent, markEventAsRealizado } = useFinancialData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const getEventIcon = (tipo: Event['tipo']) => {
    switch (tipo) {
      case 'Show': return <Music className="h-4 w-4" />;
      case 'Ensaio': return <Users className="h-4 w-4" />;
      case 'Aula': return <GraduationCap className="h-4 w-4" />;
      case 'Gravação': return <Mic className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getEventColor = (tipo: Event['tipo']) => {
    switch (tipo) {
      case 'Show': return 'bg-primary text-primary-foreground';
      case 'Ensaio': return 'bg-secondary text-secondary-foreground';
      case 'Aula': return 'bg-accent text-accent-foreground';
      case 'Gravação': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const selectedDateStr = selectedDate?.toISOString().split('T')[0] || '';
  const dayEvents = events.filter(event => event.date === selectedDateStr);

  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    addEvent(eventData);
    toast({ title: 'Evento criado com sucesso!' });
  };

  const handleUpdateEvent = (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
      toast({ title: 'Evento atualizado com sucesso!' });
    }
  };

  const handleDeleteEvent = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete);
      toast({ title: 'Evento excluído com sucesso!' });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateEvent(id);
    toast({ title: 'Evento duplicado com sucesso!' });
  };

  const handleMarkRealizado = (id: string) => {
    markEventAsRealizado(id);
    toast({ title: 'Evento marcado como realizado!' });
  };

  const handleWhatsApp = (event: Event) => {
    const message = `Evento: ${event.title}\nTipo: ${event.tipo}\nData: ${formatDateBR(event.date)}\nHorário: ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}\n${event.local ? `Local: ${event.local}` : ''}${event.notes ? `\nNotas: ${event.notes}` : ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleMaps = (event: Event) => {
    if (event.local) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.local)}`, '_blank');
    }
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
        <Button onClick={() => { setEditingEvent(undefined); setFormOpen(true); }}>
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
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? formatDateBR(selectedDateStr) : 'Selecione uma data'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum evento agendado para este dia
              </p>
            ) : (
              <div className="space-y-4">
                {dayEvents.map(event => (
                  <Card key={event.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getEventColor(event.tipo)}>
                              {getEventIcon(event.tipo)}
                              <span className="ml-1">{event.tipo}</span>
                            </Badge>
                            {event.realizado && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Realizado
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</span>
                          </div>

                          {event.local && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{event.local}</span>
                            </div>
                          )}

                          {event.notes && (
                            <p className="text-sm text-muted-foreground">{event.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditingEvent(event); setFormOpen(true); }}
                        >
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
                            onClick={() => handleMaps(event)}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Maps
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setEventToDelete(event.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EventForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent}
        initialData={editingEvent}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
