import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DayContentProps } from 'react-day-picker';
import './index.css';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Copy, Edit, ExternalLink, MapPin, Music, Trash2 } from 'lucide-react';

function DayContent({ date, activeModifiers }: DayContentProps) {
  const outside = activeModifiers.outside === true;
  const completed = activeModifiers.completed === true && !outside;
  const scheduled = activeModifiers.scheduled === true && !outside;
  const today = activeModifiers.today === true && !outside;
  return (
    <span className="agenda-day">
      <span className="agenda-day-number">{format(date, 'd')}</span>
      {(today || completed || scheduled) && (
        <span className="agenda-day-footer">
          {today && <span className="agenda-day-today">Hoje</span>}
          {(completed || scheduled) && (
            <span aria-hidden="true" className={`agenda-day-pill${completed ? ' agenda-day-pill-completed' : ''}`} />
          )}
        </span>
      )}
    </span>
  );
}

const now = new Date();
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const pending = new Date(now.getFullYear(), now.getMonth(), 12);
const done = new Date(now.getFullYear(), now.getMonth(), 19);

function Harness() {
  const [selected, setSelected] = useState(new Date());
  return (
    <div className="agenda-shell space-y-6 p-6">
      <div className="agenda-header flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="agenda-title">Agenda</h1>
          <p className="agenda-subtitle">Gerencie seus eventos e compromissos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="agenda-header-button" variant="outline">Novo Show</Button>
          <Button className="agenda-header-button">Novo Evento</Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="agenda-glass-card agenda-calendar-card">
          <CardHeader className="agenda-card-header"><CardTitle className="agenda-card-title">Calendário</CardTitle></CardHeader>
          <CardContent className="agenda-card-content">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(d) => d && setSelected(d)}
              modifiers={{ scheduled: [pending], completed: [done] }}
              modifiersClassNames={{ scheduled: 'agenda-day-scheduled', completed: 'agenda-day-completed' }}
              classNames={{
                day_selected: 'agenda-cell-selected',
                day_today: 'agenda-cell-today',
                day_outside: 'agenda-cell-outside',
                day_disabled: 'agenda-cell-disabled',
              }}
              components={{ DayContent }}
              className="agenda-calendar"
            />
          </CardContent>
        </Card>
        <Card className="agenda-glass-card agenda-events-card">
          <CardHeader className="agenda-card-header">
            <CardTitle className="agenda-card-title">Eventos - {format(selected, "dd 'de' MMMM", { locale: ptBR })}</CardTitle>
          </CardHeader>
          <CardContent className="agenda-card-content">
            <Card className="agenda-event-card mb-4">
              <CardContent className="agenda-event-content">
                <Badge className="agenda-event-badge bg-primary text-primary-foreground"><Music className="h-3 w-3 mr-1" />Show</Badge>
                <h3 className="agenda-event-title">Show no Bar</h3>
                <p className="agenda-event-meta"><Clock className="h-3 w-3 inline mr-1" />21:00 - 23:30 · Bar do Zé</p>
                <div className="agenda-event-actions">
                  <Button size="sm" variant="outline">Sincronizar com Google Agenda</Button>
                  <Button size="sm" variant="outline">Abrir no Maps</Button>
                  <Button size="sm" variant="outline"><Edit className="h-4 w-4 mr-2" />Editar</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="agenda-event-card">
              <CardContent className="agenda-event-content">
                <div className="flex items-center gap-2">
                  <Badge className="agenda-event-badge bg-secondary text-secondary-foreground">Ensaio</Badge>
                  <Badge variant="outline" className="agenda-status-realizado"><CheckCircle className="h-3 w-3 mr-1" />Realizado</Badge>
                </div>
                <h3 className="agenda-event-title">Ensaio geral</h3>
                <div className="agenda-event-meta space-y-1">
                  <p><Clock className="h-3 w-3 inline mr-1" />18:00</p>
                  <p><MapPin className="h-3 w-3 inline mr-1" />Estúdio Central</p>
                </div>
                <div className="agenda-event-actions">
                  <Button size="sm" variant="outline"><Copy className="h-3 w-3 mr-1" />Duplicar</Button>
                  <Button size="sm" variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Marcar Realizado</Button>
                  <Button size="sm" variant="outline"><ExternalLink className="h-3 w-3 mr-1" />WhatsApp</Button>
                  <Button size="sm" variant="destructive" className="agenda-action-danger"><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
      <Card className="agenda-glass-card agenda-upcoming-card">
        <CardHeader className="agenda-card-header"><CardTitle className="agenda-card-title">Próximos Shows</CardTitle></CardHeader>
        <CardContent className="agenda-card-content">
          <div className="agenda-upcoming-item">
            <button type="button" className="agenda-upcoming-trigger">
              <p className="agenda-upcoming-title">Show no Bar</p>
              <p className="agenda-upcoming-meta">12 de agosto de 2026 · 21:00 · Bar do Zé</p>
            </button>
            <div className="agenda-event-actions">
              <Button size="sm" variant="outline"><Edit className="h-3 w-3 mr-1" />Editar</Button>
              <Button size="sm" variant="outline"><Copy className="h-3 w-3 mr-1" />Duplicar</Button>
              <Button size="sm" variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Marcar Realizado</Button>
              <Button size="sm" variant="destructive" className="agenda-action-danger"><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
          <div className="agenda-upcoming-item">
            <button type="button" className="agenda-upcoming-trigger">
              <p className="agenda-upcoming-title">Casamento Silva</p>
              <p className="agenda-upcoming-meta">19 de agosto de 2026 · 20:00 · Salão Aurora</p>
            </button>
            <div className="agenda-event-actions">
              <Button size="sm" variant="outline"><Edit className="h-3 w-3 mr-1" />Editar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Harness />);
