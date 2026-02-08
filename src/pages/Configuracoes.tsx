import { useState, useEffect } from "react";
import { User, Music, Bell, HelpCircle, Info, Save, Check, Shield, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSettings } from "@/hooks/useSettings";
import { useAdmin, enableDemoAdminMode, disableDemoAdminMode } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import HelpCenter from "@/components/HelpCenter";
import Onboarding from "@/components/Onboarding";
import GoogleCalendarSettings from "@/components/GoogleCalendarSettings";
import { useOnboarding } from "@/hooks/useOnboarding";

const Configuracoes = () => {
  const { settings, updateSettings, isLoaded } = useSettings();
  const { isAdmin } = useAdmin();
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
    if (isLoaded) {
      setFormData({
        nomeArtistico: settings.nomeArtistico,
        email: settings.email,
        generoMusical: settings.generoMusical,
        cidade: settings.cidade,
        telefone: settings.telefone,
      });
    }
  }, [isLoaded, settings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    
    updateSettings(formData);
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configurações salvas!",
        description: "Suas alterações foram salvas com sucesso.",
      });
    }, 500);
  };

  const handleToggleAdmin = () => {
    if (isAdmin) {
      disableDemoAdminMode();
    } else {
      enableDemoAdminMode();
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
        disabled={isSaving}
        className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md px-8 py-2 gap-2"
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

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Tema</p>
              <p className="text-sm text-muted-foreground">Preto, Azul e Dourado</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Tema Fixo
            </Button>
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

      {/* Admin Mode (Demo) */}
      <Card className="p-6 border-destructive/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-destructive/10">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Modo Administrador (Demo)</h2>
            <p className="text-sm text-muted-foreground">Ativar painel administrativo para testes</p>
          </div>
        </div>

        <Alert className="mb-4 bg-destructive/5 border-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm">
            <strong>Atenção:</strong> Este é um modo de demonstração. Em produção, a autenticação de admin 
            deve ser feita via servidor com tabela user_roles segura no banco de dados.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              Status: {isAdmin ? (
                <span className="text-success">Ativo</span>
              ) : (
                <span className="text-muted-foreground">Inativo</span>
              )}
            </p>
          </div>
          <Button 
            variant={isAdmin ? "destructive" : "outline"}
            onClick={handleToggleAdmin}
          >
            {isAdmin ? "Desativar Admin" : "Ativar Admin Demo"}
          </Button>
        </div>
      </Card>

      {/* Google Calendar Integration */}
      <GoogleCalendarSettings />

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
