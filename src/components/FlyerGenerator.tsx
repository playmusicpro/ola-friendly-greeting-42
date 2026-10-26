import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, Check, ArrowLeft, Sparkles, Image, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { FlyerData, FLYER_PROMPTS } from "@/types/challenges";
import { useChallenges } from "@/hooks/useChallenges";
import { shareViaWhatsApp } from "@/lib/shareUtils";
import { recordAppUsage } from '@/lib/appUsage';

interface FlyerGeneratorProps {
  onBack: () => void;
}

const ESTILOS_VISUAIS = [
  { value: 'moderno', label: 'Moderno', description: 'Clean, tipografia bold, formas geométricas' },
  { value: 'minimalista', label: 'Minimalista', description: 'Elegante, muito espaço em branco' },
  { value: 'vintage', label: 'Vintage', description: 'Retrô, texturas, paleta nostálgica' },
  { value: 'neon', label: 'Neon', description: 'Cyberpunk, brilhos, cores vibrantes' },
  { value: 'elegante', label: 'Elegante', description: 'Luxuoso, dourado, sofisticado' }
] as const;

const FORMATOS = [
  { value: 'instagram-feed', label: 'Instagram Feed', size: '1080x1080' },
  { value: 'instagram-story', label: 'Instagram Story', size: '1080x1920' },
  { value: 'facebook', label: 'Facebook', size: '1200x630' },
  { value: 'whatsapp', label: 'WhatsApp Status', size: '1080x1920' }
] as const;

const FlyerGenerator = ({ onBack }: FlyerGeneratorProps) => {
  const { saveFlyerData, completeChallenge } = useChallenges();
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  
  const [formData, setFormData] = useState<FlyerData>({
    nomeArtista: "",
    nomeEvento: "",
    data: "",
    horario: "",
    local: "",
    endereco: "",
    estiloVisual: "moderno",
    corPrincipal: "",
    valorIngresso: "",
    informacoesExtras: "",
    formato: "instagram-feed"
  });

  const updateField = (field: keyof FlyerData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyPrompt = (promptKey: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(promptKey);
    toast.success("Prompt copiado! Cole no MidJourney, DALL-E ou Canva AI.");
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const handleGenerate = () => {
    if (!formData.nomeArtista || !formData.data || !formData.horario || !formData.local) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    
    saveFlyerData(formData);
    completeChallenge('create-flyer');
    setShowPrompts(true);
    void recordAppUsage('prompts', 'action');
    toast.success("Dados salvos! Agora use os prompts para criar seu flyer.");
  };

  const handleShareWhatsApp = () => {
    const message = `🎤 ${formData.nomeEvento || formData.nomeArtista + ' ao vivo!'}\n\n📅 ${formData.data}\n⏰ ${formData.horario}\n📍 ${formData.local}\n${formData.endereco ? `🗺️ ${formData.endereco}\n` : ''}${formData.valorIngresso ? `💰 ${formData.valorIngresso}\n` : ''}\n— Criado com Play Pro`;
    shareViaWhatsApp(message);
  };

  const getPromptForStyle = () => {
    const promptFn = FLYER_PROMPTS[formData.estiloVisual];
    return promptFn ? promptFn(formData) : '';
  };

  const isFormValid = formData.nomeArtista && formData.data && formData.horario && formData.local;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="-ml-2">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Voltar para Desafios
      </Button>

      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gold to-primary bg-clip-text text-transparent">
          Gerador de Flyers
        </h1>
        <p className="text-muted-foreground">
          Crie flyers profissionais para seus shows usando IA
        </p>
      </div>

      {!showPrompts ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-gold" />
              Informações do Evento
            </h2>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Nome do Artista/Banda *</Label>
                <Input
                  value={formData.nomeArtista}
                  onChange={(e) => updateField('nomeArtista', e.target.value)}
                  placeholder="Seu nome artístico"
                />
              </div>

              <div className="space-y-2">
                <Label>Nome do Evento (opcional)</Label>
                <Input
                  value={formData.nomeEvento || ''}
                  onChange={(e) => updateField('nomeEvento', e.target.value)}
                  placeholder="Ex: Noite de Jazz, Acústico Especial"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input
                    value={formData.data}
                    onChange={(e) => updateField('data', e.target.value)}
                    placeholder="Ex: 15 de Março"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário *</Label>
                  <Input
                    value={formData.horario}
                    onChange={(e) => updateField('horario', e.target.value)}
                    placeholder="Ex: 21h"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Local *</Label>
                <Input
                  value={formData.local}
                  onChange={(e) => updateField('local', e.target.value)}
                  placeholder="Nome do estabelecimento"
                />
              </div>

              <div className="space-y-2">
                <Label>Endereço (opcional)</Label>
                <Input
                  value={formData.endereco || ''}
                  onChange={(e) => updateField('endereco', e.target.value)}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="space-y-2">
                <Label>Valor do Ingresso (opcional)</Label>
                <Input
                  value={formData.valorIngresso || ''}
                  onChange={(e) => updateField('valorIngresso', e.target.value)}
                  placeholder="Ex: R$ 30 ou Entrada Franca"
                />
              </div>

              <div className="space-y-2">
                <Label>Cor Principal (opcional)</Label>
                <Input
                  value={formData.corPrincipal || ''}
                  onChange={(e) => updateField('corPrincipal', e.target.value)}
                  placeholder="Ex: Azul royal, Vermelho vibrante"
                />
              </div>
            </div>
          </Card>

          {/* Style Selection */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Image className="h-5 w-5 text-gold" />
                Estilo Visual
              </h2>

              <RadioGroup
                value={formData.estiloVisual}
                onValueChange={(v) => updateField('estiloVisual', v as FlyerData['estiloVisual'])}
                className="space-y-3"
              >
                {ESTILOS_VISUAIS.map((estilo) => (
                  <div
                    key={estilo.value}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.estiloVisual === estilo.value
                        ? 'border-gold bg-gold/10'
                        : 'border-border hover:border-gold/50'
                    }`}
                    onClick={() => updateField('estiloVisual', estilo.value)}
                  >
                    <RadioGroupItem value={estilo.value} id={estilo.value} className="mt-1" />
                    <div>
                      <label htmlFor={estilo.value} className="font-medium cursor-pointer">
                        {estilo.label}
                      </label>
                      <p className="text-sm text-muted-foreground">{estilo.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Formato</h2>

              <RadioGroup
                value={formData.formato}
                onValueChange={(v) => updateField('formato', v as FlyerData['formato'])}
                className="grid grid-cols-2 gap-3"
              >
                {FORMATOS.map((formato) => (
                  <div
                    key={formato.value}
                    className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.formato === formato.value
                        ? 'border-gold bg-gold/10'
                        : 'border-border hover:border-gold/50'
                    }`}
                    onClick={() => updateField('formato', formato.value)}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={formato.value} id={formato.value} />
                      <label htmlFor={formato.value} className="font-medium cursor-pointer text-sm">
                        {formato.label}
                      </label>
                    </div>
                    <span className="text-xs text-muted-foreground ml-6">{formato.size}</span>
                  </div>
                ))}
              </RadioGroup>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={!isFormValid}
              className="w-full gap-2 bg-gold hover:bg-gold/90 text-black font-semibold"
              size="lg"
            >
              <Sparkles className="h-5 w-5" />
              Gerar Prompts para Flyer
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="p-6 border-gold/30 bg-gradient-to-br from-gold/10 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-6 w-6 text-gold" />
              <h3 className="text-xl font-semibold text-gold">Prompt Gerado</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Use este prompt no MidJourney, DALL-E, Leonardo AI ou Canva AI para criar seu flyer.
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-lg">Flyer {ESTILOS_VISUAIS.find(e => e.value === formData.estiloVisual)?.label}</h4>
                <p className="text-sm text-muted-foreground">
                  {FORMATOS.find(f => f.value === formData.formato)?.label} ({FORMATOS.find(f => f.value === formData.formato)?.size})
                </p>
              </div>
              <Button
                onClick={() => copyPrompt('flyer', getPromptForStyle())}
                className="gap-2 bg-gold hover:bg-gold/90 text-black"
              >
                {copiedPrompt === 'flyer' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedPrompt === 'flyer' ? 'Copiado!' : 'Copiar Prompt'}
              </Button>
            </div>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/50 p-5 rounded-xl border leading-relaxed">
              {getPromptForStyle()}
            </pre>
          </Card>

          <Card className="p-5 border-primary/20">
            <h4 className="font-semibold mb-3">Informações do Evento (para adicionar no Canva)</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Artista:</span>
                <p className="font-medium">{formData.nomeArtista}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Evento:</span>
                <p className="font-medium">{formData.nomeEvento || 'Ao vivo'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Data:</span>
                <p className="font-medium">{formData.data}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Horário:</span>
                <p className="font-medium">{formData.horario}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Local:</span>
                <p className="font-medium">{formData.local}</p>
              </div>
              {formData.valorIngresso && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Ingresso:</span>
                  <p className="font-medium">{formData.valorIngresso}</p>
                </div>
              )}
            </div>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setShowPrompts(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Editar Informações
            </Button>
            <Button variant="outline" onClick={handleShareWhatsApp} className="gap-2">
              Compartilhar via WhatsApp
            </Button>
          </div>

          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <div className="flex items-center gap-3">
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">🏆 Conquista!</span>
              <span className="text-sm">Você desbloqueou o badge <strong>Designer de Flyers</strong>!</span>
            </div>
          </Card>

          <Card className="p-5 border-gold/20">
            <h4 className="font-semibold text-gold mb-3">💡 Dicas de Uso</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>MidJourney:</strong> Cole o prompt e adicione --ar 1:1 ou --ar 9:16</li>
              <li>• <strong>DALL-E/Leonardo:</strong> Cole direto e ajuste o tamanho</li>
              <li>• <strong>Canva:</strong> Use "Magic Media" e cole o prompt para gerar a imagem base</li>
              <li>• <strong>Finalize:</strong> Adicione os textos do evento sobre a imagem gerada</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FlyerGenerator;
