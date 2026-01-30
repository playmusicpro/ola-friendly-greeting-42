import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Music, Play, ChevronUp, ChevronDown, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Song, Setlist } from "@/types";
import { transposeCifraText, getSemitoneDistance, getAllKeys } from "@/lib/transposeChord";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ExportShareModal } from "@/components/ExportShareModal";
import { useSettings } from "@/hooks/useSettings";

interface SetlistDetailsProps {
  setlist: Setlist;
  songs: Song[];
  onUpdateSetlistSongTone: (setlistId: string, songId: string, tomEscolhido: string | null) => void;
}

export function SetlistDetails({ setlist, songs, onUpdateSetlistSongTone }: SetlistDetailsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const allKeys = getAllKeys();

  // Obter músicas ordenadas com tom escolhido
  const orderedSongs = setlist.order.map(songId => {
    const song = songs.find(s => s.id === songId);
    const musicaData = setlist.musicas.find(m => m.songId === songId);
    return {
      song,
      tomEscolhido: musicaData?.tomEscolhido || null,
    };
  }).filter(item => item.song);

  const handleTransposeAll = (targetKey: string) => {
    orderedSongs.forEach(({ song, tomEscolhido }) => {
      if (!song) return;
      
      const currentKey = tomEscolhido || song.tone;
      if (currentKey !== targetKey) {
        onUpdateSetlistSongTone(setlist.id, song.id, targetKey);
      }
    });

    toast({
      title: "Setlist transposta!",
      description: `Todas as músicas foram transpostas para ${targetKey}`,
    });
  };

  const handleResetTone = (songId: string) => {
    onUpdateSetlistSongTone(setlist.id, songId, null);
    toast({
      title: "Tom resetado",
      description: "A música voltou ao tom original",
    });
  };

  const getExportItems = () => {
    return orderedSongs.map(({ song, tomEscolhido }) => ({
      title: song!.title,
      artist: song!.artist,
      tone: tomEscolhido || song!.tone,
      notes: song!.notes,
    }));
  };

  const currentPresentationSong = orderedSongs[currentSongIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/repertorio")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              {setlist.name}
            </h1>
            <p className="text-muted-foreground">
              {orderedSongs.length} música(s) • Criada em {new Date(setlist.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setExportModalOpen(true)}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Exportar
          </Button>
          <Button
            onClick={() => setPresentationMode(true)}
            className="gap-2 bg-gold hover:bg-gold/90 text-black"
          >
            <Play className="h-4 w-4" />
            Modo Apresentação
          </Button>
        </div>
      </div>

      {/* Transpor Setlist Inteiro */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Transpor setlist inteiro</h3>
            <p className="text-sm text-muted-foreground">
              Ajuste o tom de todas as músicas de uma vez
            </p>
          </div>
          <Select onValueChange={handleTransposeAll}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Escolher tom" />
            </SelectTrigger>
            <SelectContent>
              {allKeys.map(key => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de Músicas */}
      <div className="space-y-3">
        {orderedSongs.map(({ song, tomEscolhido }, index) => {
          if (!song) return null;

          const currentKey = tomEscolhido || song.tone;
          const isTransposed = tomEscolhido !== null;
          const semitones = tomEscolhido ? getSemitoneDistance(song.tone, tomEscolhido) : 0;

          return (
            <Card key={song.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-lg font-bold text-gold">{index + 1}.</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{song.title}</h3>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant={isTransposed ? "default" : "outline"} className="bg-primary/20 text-primary border-primary/30">
                    Original: {song.tone}
                  </Badge>
                  {isTransposed && (
                    <Badge className="bg-gold/20 text-gold border-gold/30">
                      Transposto: {currentKey} ({semitones > 0 ? '+' : ''}{semitones})
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newSteps = semitones - 1;
                    const newIndex = (allKeys.indexOf(song.tone) + newSteps + 12) % 12;
                    onUpdateSetlistSongTone(setlist.id, song.id, allKeys[newIndex]);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newSteps = semitones + 1;
                    const newIndex = (allKeys.indexOf(song.tone) + newSteps + 12) % 12;
                    onUpdateSetlistSongTone(setlist.id, song.id, allKeys[newIndex]);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>

                <Select
                  value={currentKey}
                  onValueChange={(value) => {
                    if (value === song.tone) {
                      handleResetTone(song.id);
                    } else {
                      onUpdateSetlistSongTone(setlist.id, song.id, value);
                    }
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allKeys.map(key => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isTransposed && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleResetTone(song.id)}
                  >
                    Resetar
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modo Apresentação */}
      <Dialog open={presentationMode} onOpenChange={setPresentationMode}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              {currentPresentationSong?.song?.title || ""}
            </DialogTitle>
          </DialogHeader>

          {currentPresentationSong?.song && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl text-muted-foreground">{currentPresentationSong.song.artist}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Música {currentSongIndex + 1} de {orderedSongs.length}
                  </p>
                </div>
                <Badge className="text-xl py-2 px-4 bg-gold/20 text-gold border-gold/30">
                  Tom: {currentPresentationSong.tomEscolhido || currentPresentationSong.song.tone}
                </Badge>
              </div>

              {currentPresentationSong.song.cifraText ? (
                <div className="bg-muted/30 p-6 rounded-lg">
                  <pre className="font-mono text-lg whitespace-pre-wrap leading-relaxed">
                    {currentPresentationSong.tomEscolhido
                      ? transposeCifraText(
                          currentPresentationSong.song.cifraText,
                          getSemitoneDistance(
                            currentPresentationSong.song.tone,
                            currentPresentationSong.tomEscolhido
                          )
                        )
                      : currentPresentationSong.song.cifraText}
                  </pre>
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Music className="h-16 w-16 mx-auto mb-4 opacity-30 text-gold" />
                  <p className="text-muted-foreground">
                    Cifra não disponível para esta música
                  </p>
                </Card>
              )}

              {currentPresentationSong.song.notes && (
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <p className="text-sm font-semibold mb-1">Observações:</p>
                  <p className="text-sm">{currentPresentationSong.song.notes}</p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSongIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentSongIndex === 0}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentSongIndex(prev => Math.min(orderedSongs.length - 1, prev + 1))}
                  disabled={currentSongIndex === orderedSongs.length - 1}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export/Share Modal */}
      <ExportShareModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        type="setlist"
        title={setlist.name}
        content={getExportItems().map((item, i) => `${i + 1}. ${item.title} - ${item.artist} (Tom: ${item.tone})`).join('\n')}
        items={getExportItems()}
        hotmartLink={settings.hotmartUrl || undefined}
      />
    </div>
  );
}
