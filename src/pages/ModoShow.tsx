import { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepertoire } from '@/hooks/useRepertoire';
import { useAccessibility } from '@/lib/accessibility';
import { cacheSetlistForShow, getCachedSetlist } from '@/lib/performance';
import { transposeCifraText, getSemitoneDistance } from '@/lib/transposeChord';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Settings2, Maximize, Minimize } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Loading skeleton for song content
function SongSkeleton() {
  return (
    <Card className="p-8">
      <div className="text-center mb-6">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-6 w-32 mx-auto mb-4" />
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </Card>
  );
}

export default function ModoShow() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { setlists, songs } = useRepertoire();
  const { settings, updateSettings } = useAccessibility();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useCache, setUseCache] = useState(false);

  // Try to get cached version first for offline support
  const cachedData = useMemo(() => {
    if (!playlistId) return null;
    return getCachedSetlist(playlistId);
  }, [playlistId]);

  // Use cached or live data
  const setlist = useMemo(() => {
    if (cachedData?.setlist) return cachedData.setlist;
    return setlists.find(s => s.id === playlistId);
  }, [cachedData, setlists, playlistId]);

  const availableSongs = useMemo(() => {
    if (cachedData?.songs) return cachedData.songs;
    return songs;
  }, [cachedData, songs]);

  // Cache setlist when loaded (for offline use later)
  useEffect(() => {
    if (setlist && songs.length > 0 && !cachedData) {
      const setlistSongs = setlist.musicas
        .map(m => songs.find(s => s.id === m.songId))
        .filter(Boolean);
      cacheSetlistForShow(setlist, setlistSongs as typeof songs);
    }
    setIsLoading(false);
  }, [setlist, songs, cachedData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          handleToggleFullscreen();
        } else {
          navigate(-1);
        }
      } else if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, setlist, isFullscreen]);

  // Fullscreen handling
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <SongSkeleton />
      </div>
    );
  }

  if (!setlist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-6">
          <p className="text-muted-foreground">Setlist não encontrado</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  const currentSongEntry = setlist.musicas[currentIndex];
  const currentSong = availableSongs.find(s => s.id === currentSongEntry?.songId);

  const handleNext = () => {
    if (currentIndex < setlist.musicas.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    (e.currentTarget as HTMLElement).dataset.touchStartX = touch.clientX.toString();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchStartX = parseFloat((e.currentTarget as HTMLElement).dataset.touchStartX || '0');
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  // Calculate transposed cifra if needed
  const getDisplayedCifra = () => {
    if (!currentSong?.cifraText) return null;
    if (!currentSongEntry?.tomEscolhido) return currentSong.cifraText;

    const steps = getSemitoneDistance(currentSong.tone, currentSongEntry.tomEscolhido);
    return transposeCifraText(currentSong.cifraText, steps);
  };

  const displayedCifra = getDisplayedCifra();

  // Font size based on accessibility settings
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'large': return 'text-base';
      case 'larger': return 'text-lg';
      default: return 'text-sm';
    }
  };

  return (
    <div 
      className="min-h-screen bg-background text-foreground flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="main"
      aria-label="Modo Show - Visualização de setlist"
    >
      {/* Header */}
      <header 
        className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-b border-border z-50 p-4"
        role="banner"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Voltar para repertório"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="font-semibold text-lg">{setlist.name}</h1>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {currentIndex + 1} / {setlist.musicas.length}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFullscreen}
              aria-label={isFullscreen ? 'Sair do modo tela cheia' : 'Ativar modo tela cheia'}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Configurações de acessibilidade">
                  <Settings2 className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Acessibilidade</SheetTitle>
                  <SheetDescription>
                    Ajuste as configurações para melhor leitura
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Tamanho da Fonte</Label>
                    <Select
                      value={settings.fontSize}
                      onValueChange={(value) => updateSettings({ fontSize: value as any })}
                    >
                      <SelectTrigger id="font-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                        <SelectItem value="larger">Muito Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">Alto Contraste</Label>
                    <Switch
                      id="high-contrast"
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduced-motion">Reduzir Animações</Label>
                    <Switch
                      id="reduced-motion"
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 pt-24 pb-24">
        {currentSong ? (
          <article className="max-w-4xl w-full" aria-label={`Música: ${currentSong.title}`}>
            <Card className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">{currentSong.title}</h2>
                <p className="text-xl text-muted-foreground mb-1">{currentSong.artist}</p>
                <div className="flex gap-4 justify-center items-center mt-4 flex-wrap">
                  <span className="text-sm">
                    Tom original: <span className="font-semibold">{currentSong.tone}</span>
                  </span>
                  {currentSongEntry.tomEscolhido && (
                    <span className="text-sm text-primary">
                      Tom escolhido: <span className="font-semibold">{currentSongEntry.tomEscolhido}</span>
                    </span>
                  )}
                  {currentSong.howYouPlay && (
                    <span className="text-sm">
                      Como tocar: <span className="font-semibold">{currentSong.howYouPlay}</span>
                    </span>
                  )}
                </div>
              </div>

              {displayedCifra && (
                <pre 
                  className={`whitespace-pre-wrap font-mono ${getFontSizeClass()} leading-relaxed overflow-x-auto`}
                  role="article"
                  aria-label="Cifra da música"
                >
                  {displayedCifra}
                </pre>
              )}

              {currentSong.notes && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold mb-2">Notas:</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{currentSong.notes}</p>
                </div>
              )}

              {currentSong.cifraClubLink && (
                <div className="mt-4">
                  <a 
                    href={currentSong.cifraClubLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Ver no Cifra Club →
                  </a>
                </div>
              )}
            </Card>
          </article>
        ) : (
          <Card className="p-6">
            <p className="text-muted-foreground">Música não encontrada</p>
          </Card>
        )}
      </main>

      {/* Navigation Footer */}
      <footer 
        className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4"
        role="navigation"
        aria-label="Navegação entre músicas"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            aria-label="Música anterior"
          >
            <ChevronLeft className="h-5 w-5 mr-2" aria-hidden="true" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === setlist.musicas.length - 1}
            aria-label="Próxima música"
          >
            Próxima
            <ChevronRight className="h-5 w-5 ml-2" aria-hidden="true" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
