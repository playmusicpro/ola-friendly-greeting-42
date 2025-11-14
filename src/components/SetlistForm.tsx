import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Setlist, Song } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ListMusic, Download } from "lucide-react";
import { useState, useEffect } from "react";

const setlistSchema = z.object({
  name: z.string().min(1, "Nome da setlist é obrigatório"),
});

type SetlistFormData = z.infer<typeof setlistSchema>;

interface SetlistFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Setlist, 'id' | 'createdAt'>) => void;
  songs: Song[];
  initialData?: Setlist;
}

export function SetlistForm({ open, onOpenChange, onSubmit, songs, initialData }: SetlistFormProps) {
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>(initialData?.songIds || []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SetlistFormData>({
    resolver: zodResolver(setlistSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      setSelectedSongIds(initialData.songIds);
    } else {
      setSelectedSongIds([]);
    }
  }, [initialData]);

  const toggleSong = (songId: string) => {
    setSelectedSongIds(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const moveSongUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...selectedSongIds];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSelectedSongIds(newOrder);
  };

  const moveSongDown = (index: number) => {
    if (index === selectedSongIds.length - 1) return;
    const newOrder = [...selectedSongIds];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSelectedSongIds(newOrder);
  };

  const onFormSubmit = (data: SetlistFormData) => {
    onSubmit({
      name: data.name,
      songIds: selectedSongIds,
    });
    reset();
    setSelectedSongIds([]);
    onOpenChange(false);
  };

  const exportAsText = () => {
    const setlistName = (document.getElementById('setlist-name') as HTMLInputElement)?.value || 'Setlist';
    const selectedSongs = songs.filter(song => selectedSongIds.includes(song.id));
    
    let text = `${setlistName}\n\n`;
    selectedSongs.forEach((song, index) => {
      const songInOrder = songs.find(s => s.id === selectedSongIds[index]);
      if (songInOrder) {
        text += `${index + 1}. ${songInOrder.title} - ${songInOrder.artist} (Tom: ${songInOrder.tone})\n`;
      }
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${setlistName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent flex items-center gap-2">
            <ListMusic className="h-6 w-6 text-gold" />
            {initialData ? "Editar Setlist" : "Criar Setlist"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="setlist-name">Nome da Setlist *</Label>
            <Input
              id="setlist-name"
              {...register("name")}
              placeholder="Ex: Show Bar do Zé - Dezembro 2024"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Selecione as músicas</Label>
            <div className="border border-border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
              {songs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma música cadastrada ainda
                </p>
              ) : (
                songs.map((song) => (
                  <div key={song.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`song-${song.id}`}
                      checked={selectedSongIds.includes(song.id)}
                      onCheckedChange={() => toggleSong(song.id)}
                    />
                    <Label
                      htmlFor={`song-${song.id}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {song.title} - {song.artist} <span className="text-muted-foreground">(Tom: {song.tone})</span>
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedSongIds.length > 0 && (
            <div className="space-y-3">
              <Label>Ordem das músicas ({selectedSongIds.length} selecionadas)</Label>
              <div className="border border-border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                {selectedSongIds.map((songId, index) => {
                  const song = songs.find(s => s.id === songId);
                  if (!song) return null;
                  return (
                    <div key={songId} className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                      <span className="text-sm font-semibold text-gold w-6">{index + 1}.</span>
                      <span className="flex-1 text-sm">
                        {song.title} - {song.artist}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => moveSongUp(index)}
                          disabled={index === 0}
                          className="h-7 w-7 p-0"
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => moveSongDown(index)}
                          disabled={index === selectedSongIds.length - 1}
                          className="h-7 w-7 p-0"
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={exportAsText}
              disabled={selectedSongIds.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar como Texto
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setSelectedSongIds([]);
                  onOpenChange(false);
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
                disabled={selectedSongIds.length === 0}
              >
                {initialData ? "Salvar Alterações" : "Criar Setlist"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
