import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Music2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const GENEROS = [
  "Sertanejo", "MPB", "Pagode/Samba", "Rock", "Pop", "Gospel",
  "Forró", "Funk", "Jazz/Blues", "Eletrônica", "Outro",
];

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const TIPOS = [
  "Cantor(a) solo",
  "Banda",
  "Dupla",
  "Instrumentista",
  "Professor(a) de música",
  "DJ / Produtor(a)",
];

interface Props {
  children: React.ReactNode;
}

const MusicianProfileGate = ({ children }: Props) => {
  const { needsOnboarding, isLoading, saveProfile, profile } = useProfile();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    generoMusical: "",
    cidade: "",
    estado: "",
    tipoMusico: "",
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!needsOnboarding) return <>{children}</>;

  const isValid =
    form.generoMusical && form.cidade.trim() && form.estado && form.tipoMusico;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      await saveProfile.mutateAsync({
        name: form.name.trim() || profile?.name || undefined,
        generoMusical: form.generoMusical,
        cidade: form.cidade.trim(),
        estado: form.estado,
        tipoMusico: form.tipoMusico,
      });
      toast({ title: "Perfil criado!", description: "Bem-vindo ao Play Pro." });
    } catch {
      toast({
        title: "Não foi possível salvar",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-6">
      <Card className="w-full max-w-xl p-6 md:p-8 border-gold/20 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-gold/20">
            <Music2 className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              Complete seu Perfil do Músico
            </h1>
            <p className="text-sm text-muted-foreground">
              Precisamos dessas informações para personalizar sua experiência.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Artístico</Label>
            <Input
              id="nome"
              placeholder="Como você é conhecido no palco"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Gênero Musical Principal *</Label>
            <Select
              value={form.generoMusical}
              onValueChange={(v) => setForm({ ...form, generoMusical: v })}
            >
              <SelectTrigger><SelectValue placeholder="Selecione o gênero" /></SelectTrigger>
              <SelectContent>
                {GENEROS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                placeholder="Sua cidade"
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado *</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {ESTADOS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Músico / Público *</Label>
            <Select
              value={form.tipoMusico}
              onValueChange={(v) => setForm({ ...form, tipoMusico: v })}
            >
              <SelectTrigger><SelectValue placeholder="Selecione o perfil" /></SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={!isValid || saveProfile.isPending}
            className="w-full bg-gradient-to-r from-primary to-gold text-white font-semibold rounded-xl py-6"
          >
            {saveProfile.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</>
            ) : (
              "Salvar e Continuar"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default MusicianProfileGate;
