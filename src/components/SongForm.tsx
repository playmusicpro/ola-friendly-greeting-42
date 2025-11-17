import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Song } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Music } from "lucide-react";

const songSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  artist: z.string().min(1, "Artista é obrigatório"),
  tone: z.string().min(1, "Tom é obrigatório"),
  howYouPlay: z.string().optional(),
  cifraClubLink: z.string().url("Link inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
  acordesArray: z.array(z.string()).optional(),
  cifraText: z.string().optional(),
});

type SongFormData = z.infer<typeof songSchema>;

interface SongFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Song, 'id'>) => void;
  initialData?: Song;
}

export function SongForm({ open, onOpenChange, onSubmit, initialData }: SongFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SongFormData>({
    resolver: zodResolver(songSchema),
    defaultValues: initialData || {
      title: "",
      artist: "",
      tone: "",
      howYouPlay: "",
      cifraClubLink: "",
      notes: "",
      acordesArray: [],
      cifraText: "",
    },
  });

  const onFormSubmit = (data: SongFormData) => {
    onSubmit(data as Omit<Song, 'id'>);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent flex items-center gap-2">
            <Music className="h-6 w-6 text-gold" />
            {initialData ? "Editar Música" : "Adicionar Música"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da música *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Ex: Evidências"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artista *</Label>
              <Input
                id="artist"
                {...register("artist")}
                placeholder="Ex: Chitãozinho e Xororó"
              />
              {errors.artist && (
                <p className="text-sm text-destructive">{errors.artist.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tom *</Label>
              <Input
                id="tone"
                {...register("tone")}
                placeholder="Ex: G, Am, C#"
                className="uppercase"
              />
              {errors.tone && (
                <p className="text-sm text-destructive">{errors.tone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="howYouPlay">Como você toca (opcional)</Label>
              <Input
                id="howYouPlay"
                {...register("howYouPlay")}
                placeholder="Ex: Dedilhado, Batida, Arpejos"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cifraClubLink">Link do Cifra Club (opcional)</Label>
            <Input
              id="cifraClubLink"
              {...register("cifraClubLink")}
              placeholder="https://www.cifraclub.com.br/..."
              type="url"
            />
            {errors.cifraClubLink && (
              <p className="text-sm text-destructive">{errors.cifraClubLink.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Cole o link da cifra para abrir externamente depois
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cifraText">Cifra (opcional)</Label>
            <Textarea
              id="cifraText"
              {...register("cifraText")}
              placeholder="Cole a cifra aqui. Use colchetes para acordes: [C] [Am] [F] [G]"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use colchetes para marcar acordes que serão transpostos. Ex: [C] Hoje eu [Am] sinto
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Anotações pessoais sobre a música, arranjo, dicas..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {initialData ? "Salvar Alterações" : "Adicionar Música"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
