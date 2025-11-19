import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Event } from '@/types';
import { useRepertoire } from '@/hooks/useRepertoire';
import { useFinancialData } from '@/hooks/useFinancialData';

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: Omit<Event, 'id'>) => void;
  initialData?: Event;
}

export function EventForm({ open, onOpenChange, onSubmit, initialData }: EventFormProps) {
  const { setlists } = useRepertoire();
  const { shows } = useFinancialData();
  
  const [formData, setFormData] = useState<Omit<Event, 'id'>>({
    title: '',
    tipo: 'Outro',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '',
    local: '',
    notes: '',
    linkedShowId: undefined,
    playlistId: undefined,
    realizado: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        tipo: initialData.tipo,
        date: initialData.date,
        startTime: initialData.startTime,
        endTime: initialData.endTime || '',
        local: initialData.local || '',
        notes: initialData.notes || '',
        linkedShowId: initialData.linkedShowId,
        playlistId: initialData.playlistId,
        realizado: initialData.realizado,
      });
    } else {
      setFormData({
        title: '',
        tipo: 'Outro',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '',
        local: '',
        notes: '',
        linkedShowId: undefined,
        playlistId: undefined,
        realizado: false,
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: Event['tipo']) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="Show">Show</SelectItem>
              <SelectItem value="Ensaio">Ensaio</SelectItem>
              <SelectItem value="Aula">Aula</SelectItem>
              <SelectItem value="Gravação">Gravação</SelectItem>
              <SelectItem value="Compromisso">Compromisso</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="startTime">Horário Início</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="endTime">Horário Fim (opcional)</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="local">Local (opcional)</Label>
            <Input
              id="local"
              value={formData.local}
              onChange={(e) => setFormData({ ...formData, local: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="playlistId">Setlist (opcional)</Label>
            <Select
              value={formData.playlistId || ''}
              onValueChange={(value) => setFormData({ ...formData, playlistId: value || undefined })}
            >
              <SelectTrigger id="playlistId">
                <SelectValue placeholder="Selecionar setlist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {setlists.map((setlist) => (
                  <SelectItem key={setlist.id} value={setlist.id}>
                    {setlist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.tipo === 'Show' && (
            <div>
              <Label htmlFor="linkedShowId">Vincular a Show existente (opcional)</Label>
              <Select
                value={formData.linkedShowId || ''}
                onValueChange={(value) => setFormData({ ...formData, linkedShowId: value || undefined })}
              >
                <SelectTrigger id="linkedShowId">
                  <SelectValue placeholder="Selecionar show" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {shows.map((show) => (
                    <SelectItem key={show.id} value={show.id}>
                      {show.local} - {show.date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Atualizar' : 'Criar'} Evento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
