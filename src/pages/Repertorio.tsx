import { useState } from "react";
import { Music, Plus, Edit, Trash2, ExternalLink, ChevronUp, ChevronDown, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRepertoire } from "@/hooks/useRepertoire";
import { SongForm } from "@/components/SongForm";
import { SetlistForm } from "@/components/SetlistForm";
import { Song, Setlist } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Repertorio = () => {
  const { songs, setlists, addSong, updateSong, deleteSong, updateSongTone, addSetlist, updateSetlist, deleteSetlist } = useRepertoire();
  const { toast } = useToast();
  const [isSongFormOpen, setIsSongFormOpen] = useState(false);
  const [isSetlistFormOpen, setIsSetlistFormOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | undefined>();
  const [editingSetlist, setEditingSetlist] = useState<Setlist | undefined>();
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  const [setlistToDelete, setSetlistToDelete] = useState<string | null>(null);
  const [viewingSong, setViewingSong] = useState<Song | null>(null);

  const handleAddSong = (songData: Omit<Song, 'id'>) => {
    addSong(songData);
    toast({
      title: "Música adicionada!",
      description: `${songData.title} foi adicionada ao seu repertório.`,
    });
  };

  const handleUpdateSong = (songData: Omit<Song, 'id'>) => {
    if (editingSong) {
      updateSong(editingSong.id, songData);
      toast({
        title: "Música atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      setEditingSong(undefined);
    }
  };

  const handleDeleteSong = () => {
    if (songToDelete) {
      deleteSong(songToDelete);
      toast({
        title: "Música removida",
        description: "A música foi removida do seu repertório.",
      });
      setSongToDelete(null);
      setViewingSong(null);
    }
  };

  const handleAddSetlist = (setlistData: Omit<Setlist, 'id' | 'createdAt'>) => {
    addSetlist(setlistData);
    toast({
      title: "Setlist criada!",
      description: `${setlistData.name} foi criada com sucesso.`,
    });
  };

  const handleUpdateSetlist = (setlistData: Omit<Setlist, 'id' | 'createdAt'>) => {
    if (editingSetlist) {
      updateSetlist(editingSetlist.id, setlistData);
      toast({
        title: "Setlist atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      setEditingSetlist(undefined);
    }
  };

  const handleDeleteSetlist = () => {
    if (setlistToDelete) {
      deleteSetlist(setlistToDelete);
      toast({
        title: "Setlist removida",
        description: "A setlist foi removida.",
      });
      setSetlistToDelete(null);
    }
  };

  const handleToneChange = (songId: string, direction: 'up' | 'down') => {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    const tones = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const minorTones = ['Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'];
    
    const isMinor = song.tone.includes('m');
    const toneList = isMinor ? minorTones : tones;
    const currentIndex = toneList.findIndex(t => t.toLowerCase() === song.tone.toLowerCase());
    
    if (currentIndex === -1) {
      toast({
        title: "Tom não reconhecido",
        description: "Não foi possível alterar o tom automaticamente.",
        variant: "destructive",
      });
      return;
    }

    const newIndex = direction === 'up' 
      ? (currentIndex + 1) % toneList.length 
      : (currentIndex - 1 + toneList.length) % toneList.length;
    
    updateSongTone(songId, toneList[newIndex]);
    toast({
      title: "Tom alterado!",
      description: `Tom mudou de ${song.tone} para ${toneList[newIndex]}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
            Repertório Inteligente
          </h1>
          <p className="text-muted-foreground text-lg">
            Organize suas músicas e setlists profissionalmente
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingSong(undefined);
            setIsSongFormOpen(true);
          }}
          className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Nova Música
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="songs">Músicas ({songs.length})</TabsTrigger>
          <TabsTrigger value="setlists">Setlists ({setlists.length})</TabsTrigger>
        </TabsList>

        {/* Songs Tab */}
        <TabsContent value="songs" className="space-y-4 mt-6">
          {songs.length === 0 ? (
            <Card className="p-12 text-center">
              <Music className="h-16 w-16 mx-auto mb-4 opacity-30 text-gold" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma música cadastrada</h3>
              <p className="text-muted-foreground mb-6">
                Adicione suas primeiras músicas para começar a montar seu repertório
              </p>
              <Button 
                onClick={() => setIsSongFormOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Música
              </Button>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Toque em uma música para ver detalhes
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {songs.map((song) => (
                  <Card 
                    key={song.id} 
                    className="p-5 hover:border-primary/40 transition-all cursor-pointer shadow-lg hover:shadow-xl"
                    onClick={() => setViewingSong(song)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                      <Badge className="bg-gold/20 text-gold border-gold/30">
                        Tom: {song.tone}
                      </Badge>
                    </div>
                    {song.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                        {song.notes}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Setlists Tab */}
        <TabsContent value="setlists" className="space-y-4 mt-6">
          <div className="flex justify-end mb-4">
            <Button 
              onClick={() => {
                setEditingSetlist(undefined);
                setIsSetlistFormOpen(true);
              }}
              className="gap-2 bg-gold hover:bg-gold/90 text-black"
            >
              <ListMusic className="h-4 w-4" />
              Nova Setlist
            </Button>
          </div>

          {setlists.length === 0 ? (
            <Card className="p-12 text-center">
              <ListMusic className="h-16 w-16 mx-auto mb-4 opacity-30 text-gold" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma setlist criada</h3>
              <p className="text-muted-foreground mb-6">
                Crie suas primeiras setlists para organizar seus shows
              </p>
              <Button 
                onClick={() => setIsSetlistFormOpen(true)}
                className="bg-gold hover:bg-gold/90 text-black"
              >
                <ListMusic className="h-4 w-4 mr-2" />
                Criar Primeira Setlist
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {setlists.map((setlist) => (
                <Card key={setlist.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2">{setlist.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {setlist.songIds.length} música(s) • Criada em {new Date(setlist.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingSetlist(setlist);
                          setIsSetlistFormOpen(true);
                        }}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSetlistToDelete(setlist.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {setlist.songIds.map((songId, index) => {
                      const song = songs.find(s => s.id === songId);
                      if (!song) return null;
                      return (
                        <div key={songId} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                          <span className="text-sm font-semibold text-gold w-6">{index + 1}.</span>
                          <span className="flex-1 text-sm">
                            {song.title} - {song.artist} <span className="text-muted-foreground">(Tom: {song.tone})</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Song Details Dialog */}
      <Dialog open={!!viewingSong} onOpenChange={() => setViewingSong(null)}>
        <DialogContent className="max-w-2xl">
          {viewingSong && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
                  {viewingSong.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Artista</p>
                  <p className="text-lg font-medium">{viewingSong.artist}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Tom atual</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gold/20 text-gold border-gold/30 text-xl py-2 px-4">
                        {viewingSong.tone}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToneChange(viewingSong.id, 'down')}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToneChange(viewingSong.id, 'up')}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {viewingSong.howYouPlay && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Como você toca</p>
                    <p className="text-base">{viewingSong.howYouPlay}</p>
                  </div>
                )}

                {viewingSong.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Observações</p>
                    <p className="text-base">{viewingSong.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {viewingSong.cifraClubLink && (
                    <Button
                      className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                      onClick={() => window.open(viewingSong.cifraClubLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir no Cifra Club
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingSong(viewingSong);
                      setViewingSong(null);
                      setIsSongFormOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSongToDelete(viewingSong.id)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Song Form Dialog */}
      <SongForm
        open={isSongFormOpen}
        onOpenChange={(open) => {
          setIsSongFormOpen(open);
          if (!open) setEditingSong(undefined);
        }}
        onSubmit={editingSong ? handleUpdateSong : handleAddSong}
        initialData={editingSong}
      />

      {/* Setlist Form Dialog */}
      <SetlistForm
        open={isSetlistFormOpen}
        onOpenChange={(open) => {
          setIsSetlistFormOpen(open);
          if (!open) setEditingSetlist(undefined);
        }}
        onSubmit={editingSetlist ? handleUpdateSetlist : handleAddSetlist}
        songs={songs}
        initialData={editingSetlist}
      />

      {/* Delete Song Confirmation */}
      <AlertDialog open={!!songToDelete} onOpenChange={() => setSongToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta música? Ela será removida de todas as setlists. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSong}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Setlist Confirmation */}
      <AlertDialog open={!!setlistToDelete} onOpenChange={() => setSetlistToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta setlist? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSetlist}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Repertorio;
