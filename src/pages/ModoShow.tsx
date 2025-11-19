import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepertoire } from '@/hooks/useRepertoire';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ModoShow() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { setlists, songs } = useRepertoire();
  const [currentIndex, setCurrentIndex] = useState(0);

  const setlist = setlists.find(s => s.id === playlistId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'Escape') {
        navigate(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, setlist]);

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
  const currentSong = songs.find(s => s.id === currentSongEntry?.songId);

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

  return (
    <div 
      className="min-h-screen bg-background text-foreground flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-b border-border z-50 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="font-semibold text-lg">{setlist.name}</h1>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} / {setlist.musicas.length}
            </p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 pt-24 pb-24">
        {currentSong ? (
          <div className="max-w-4xl w-full">
            <Card className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">{currentSong.title}</h2>
                <p className="text-xl text-muted-foreground mb-1">{currentSong.artist}</p>
                <div className="flex gap-4 justify-center items-center mt-4">
                  <span className="text-sm">
                    Tom original: <span className="font-semibold">{currentSong.tone}</span>
                  </span>
                  {currentSongEntry.tomEscolhido && (
                    <span className="text-sm">
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

              {currentSong.cifraText && (
                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {currentSong.cifraText}
                </div>
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
                    className="text-primary hover:underline text-sm"
                  >
                    Ver no Cifra Club →
                  </a>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <Card className="p-6">
            <p className="text-muted-foreground">Música não encontrada</p>
          </Card>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === setlist.musicas.length - 1}
          >
            Próxima
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
