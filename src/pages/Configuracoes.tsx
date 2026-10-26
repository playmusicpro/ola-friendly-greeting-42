import { useState, useEffect } from "react";
import { User, Music, Bell, HelpCircle, Info, Save, Check, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import ResetAllDataCard from "@/components/ResetAllDataCard";
import HelpCenter from "@/components/HelpCenter";
import Onboarding from "@/components/Onboarding";
import { useOnboarding } from "@/hooks/useOnboarding";

const Configuracoes = () => {
  const { profile, updateProfile, isLoading } = useProfile();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { openOnboarding, showOnboarding, setShowOnboarding, completeOnboarding } = useOnboarding();
  
  const [formData, setFormData] = useState({
    nomeArtistico: '',
    email: '',
    generoMusical: '',
    cidade: '',
    telefone: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        nomeArtistico: profile.name,
        email: profile.email ?? '',
        generoMusical: profile.generoMusical ?? '',
        cidade: profile.cidade ?? '',
        telefone: profile.telefone ?? '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        name: formData.nomeArtistico,
        email: formData.email,
        generoMusical: formData.generoMusical,
        cidade: formData.cidade,
        telefone: formData.telefone,
      });
      toast({
        title: "Configurações salvas!",
        description: "Suas alterações foram salvas com sucesso.",
      });
    } catch {
      toast({
        title: "Não foi possível salvar",
        description: "Suas alterações não foram salvas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-muted-foreground text-lg">
          Personalize sua experiência no Play Pro
        </p>
      </div>

      {/* Profile */}
      <Card className="p-6 shadow-lg border-primary/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Perfil do Músico</h2>
            <p className="text-sm text-muted-foreground">Suas informações pessoais</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Artístico</Label>
              <Input 
                id="nome" 
                placeholder="Seu nome artístico" 
                value={formData.nomeArtistico}
                onChange={(e) => handleInputChange('nomeArtistico', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genero">Gênero Musical Principal</Label>
            <Input 
              id="genero" 
              placeholder="Ex: Sertanejo, Rock, MPB..." 
              value={formData.generoMusical}
              onChange={(e) => handleInputChange('generoMusical', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input 
                id="cidade" 
                placeholder="Sua cidade" 
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input 
                id="telefone" 
                placeholder="(11) 99999-9999" 
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={handleSave}
        disabled={isSaving || isLoading || !profile}
        className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md px-8 py-2 gap-2"
      >
        {isSaving ? (
          <>
            <Check className="h-4 w-4" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Salvar Alterações
          </>
        )}
      </Button>

      {/* Preferences */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <Music className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Preferências</h2>
            <p className="text-sm text-muted-foreground">Configure a experiência do app</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Idioma</p>
              <p className="text-sm text-muted-foreground">Português (Brasil)</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Fixo em PT-BR
            </Button>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <Label htmlFor="appearance-theme" className="font-medium">Tema / Aparência</Label>
              <p className="text-sm text-muted-foreground">Escuro</p>
            </div>
            <Select value={theme ?? 'classic'} onValueChange={(value) => {
              setTheme(value);
              toast({ title: "Tema atualizado" });
            }}>
              <SelectTrigger id="appearance-theme" className="w-full sm:w-60">
                <SelectValue placeholder="Selecione o tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic"><span className="inline-flex items-center gap-2"><span className="theme-swatch theme-swatch-classic" />Preto, Azul e Dourado</span></SelectItem>
                <SelectItem value="soft-pink"><span className="inline-flex items-center gap-2"><span className="theme-swatch theme-swatch-pink" />Rosa Neon Suave</span></SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Moeda</p>
              <p className="text-sm text-muted-foreground">Real (R$)</p>
            </div>
            <Button variant="outline" size="sm">
              BRL
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Notificações</h2>
            <p className="text-sm text-muted-foreground">Em breve</p>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          Em breve você poderá receber lembretes sobre shows, metas e gastos diretamente no app.
        </p>
      </Card>

      {/* Help */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gold/10">
            <HelpCircle className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Ajuda e Suporte</h2>
            <p className="text-sm text-muted-foreground">Precisa de ajuda?</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={openOnboarding}>
            <Info className="h-4 w-4 mr-2" />
            Tutorial: Como usar o Play Pro
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => setShowHelpCenter(true)}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Central de Ajuda
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="mailto:playmusicpro.oficial@gmail.com?subject=Suporte%20Play%20Music%20Pro">
              <Mail className="h-4 w-4 mr-2" />
              Falar com o Suporte
            </a>
          </Button>
        </div>
      </Card>
      
      {/* Modais */}
      <Onboarding
        isOpen={showOnboarding}
        onComplete={completeOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      
      <HelpCenter
        isOpen={showHelpCenter}
        onClose={() => setShowHelpCenter(false)}
      />

      <ResetAllDataCard />

      {/* About */}
      <Card className="p-8 text-center shadow-lg border-gold/20 bg-gradient-to-b from-card to-gold/5">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-gold to-primary bg-clip-text text-transparent mb-3">
          Play Pro
        </h1>
        <p className="text-sm text-muted-foreground mb-1 font-medium">Versão 1.0.0</p>
        <p className="text-xs text-muted-foreground/80">
          © 2024 Play Pro. Assistente para músicos profissionais.
        </p>
      </Card>
    </div>
  );
};

export default Configuracoes;
