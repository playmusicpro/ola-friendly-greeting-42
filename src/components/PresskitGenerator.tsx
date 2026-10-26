import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Download, Share2, Sparkles, ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { PresskitData, PRESSKIT_PROMPTS } from "@/types/challenges";
import { useChallenges } from "@/hooks/useChallenges";
import { generatePresskitPDF } from "@/lib/pdfGenerator";
import { shareViaWhatsApp } from "@/lib/shareUtils";
import { recordAppUsage } from '@/lib/appUsage';

interface PresskitGeneratorProps {
  onBack: () => void;
}

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const PresskitGenerator = ({ onBack }: PresskitGeneratorProps) => {
  const { presskitData, savePresskitData, completeChallenge } = useChallenges();
  const [step, setStep] = useState(1);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  
  const [formData, setFormData] = useState<PresskitData>(presskitData || {
    nomeArtistico: "",
    generoMusical: "",
    cidade: "",
    estado: "",
    bioResumida: "",
    historia: "",
    anosCarreira: 0,
    principaisConquistas: [""],
    estiloMusical: "",
    influencias: [""],
    diferenciais: [""],
    instagram: "",
    youtube: "",
    spotify: "",
    tiktok: "",
    facebook: "",
    site: "",
    emailContato: "",
    telefoneContato: ""
  });

  const updateField = (field: keyof PresskitData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: 'principaisConquistas' | 'influencias' | 'diferenciais', index: number, value: string) => {
    const updated = [...formData[field]];
    updated[index] = value;
    updateField(field, updated);
  };

  const addArrayItem = (field: 'principaisConquistas' | 'influencias' | 'diferenciais') => {
    updateField(field, [...formData[field], ""]);
  };

  const removeArrayItem = (field: 'principaisConquistas' | 'influencias' | 'diferenciais', index: number) => {
    const updated = formData[field].filter((_, i) => i !== index);
    updateField(field, updated.length > 0 ? updated : [""]);
  };

  const copyPrompt = (promptKey: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(promptKey);
    toast.success("Prompt copiado! Cole no ChatGPT ou Claude.");
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const handleSaveAndGenerate = () => {
    savePresskitData(formData);
    completeChallenge('create-presskit');
    toast.success("Presskit salvo! Agora use os prompts para gerar seu conteúdo.");
    setStep(4);
    void recordAppUsage('prompts', 'action');
  };

  const handleExportPDF = async () => {
    try {
      const pdfContent = `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color: #d4af37; font-size: 32px; margin-bottom: 10px;">${formData.nomeArtistico}</h1>
          <p style="color: #888; font-size: 14px;">${formData.generoMusical} • ${formData.cidade}, ${formData.estado}</p>
          
          <h2 style="color: #d4af37; margin-top: 30px;">Sobre</h2>
          <p>${formData.bioResumida || formData.historia}</p>
          
          <h2 style="color: #d4af37; margin-top: 20px;">Carreira</h2>
          <p><strong>Anos de carreira:</strong> ${formData.anosCarreira}</p>
          <p><strong>Estilo:</strong> ${formData.estiloMusical}</p>
          <p><strong>Influências:</strong> ${formData.influencias.filter(i => i).join(', ')}</p>
          
          <h2 style="color: #d4af37; margin-top: 20px;">Conquistas</h2>
          <ul>${formData.principaisConquistas.filter(c => c).map(c => `<li>${c}</li>`).join('')}</ul>
          
          <h2 style="color: #d4af37; margin-top: 20px;">Contato</h2>
          <p><strong>Email:</strong> ${formData.emailContato}</p>
          ${formData.telefoneContato ? `<p><strong>Telefone:</strong> ${formData.telefoneContato}</p>` : ''}
          
          <h2 style="color: #d4af37; margin-top: 20px;">Redes Sociais</h2>
          ${formData.instagram ? `<p><strong>Instagram:</strong> ${formData.instagram}</p>` : ''}
          ${formData.spotify ? `<p><strong>Spotify:</strong> ${formData.spotify}</p>` : ''}
          ${formData.youtube ? `<p><strong>YouTube:</strong> ${formData.youtube}</p>` : ''}
        </div>
      `;
      
      generatePresskitPDF(formData.nomeArtistico, pdfContent);
      toast.success("PDF do Presskit gerado!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
    }
  };

  const handleShareWhatsApp = () => {
    const message = `🎵 Confira o presskit de ${formData.nomeArtistico}!\n\n${formData.bioResumida}\n\n📧 Contato: ${formData.emailContato}\n${formData.instagram ? `📱 Instagram: ${formData.instagram}` : ''}\n\n— Criado com Play Pro`;
    shareViaWhatsApp(message);
  };

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return formData.nomeArtistico && formData.generoMusical && formData.cidade && formData.estado;
      case 2:
        return formData.bioResumida && formData.anosCarreira > 0 && formData.estiloMusical;
      case 3:
        return formData.emailContato;
      default:
        return true;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome Artístico *</Label>
          <Input
            value={formData.nomeArtistico}
            onChange={(e) => updateField('nomeArtistico', e.target.value)}
            placeholder="Como você é conhecido"
          />
        </div>
        <div className="space-y-2">
          <Label>Gênero Musical *</Label>
          <Input
            value={formData.generoMusical}
            onChange={(e) => updateField('generoMusical', e.target.value)}
            placeholder="Ex: MPB, Rock, Sertanejo"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cidade *</Label>
          <Input
            value={formData.cidade}
            onChange={(e) => updateField('cidade', e.target.value)}
            placeholder="Sua cidade"
          />
        </div>
        <div className="space-y-2">
          <Label>Estado *</Label>
          <select
            value={formData.estado}
            onChange={(e) => updateField('estado', e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">Selecione</option>
            {ESTADOS_BR.map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Bio Resumida * (máx. 100 palavras)</Label>
        <Textarea
          value={formData.bioResumida}
          onChange={(e) => updateField('bioResumida', e.target.value)}
          placeholder="Resumo da sua trajetória..."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Anos de Carreira *</Label>
          <Input
            type="number"
            value={formData.anosCarreira || ''}
            onChange={(e) => updateField('anosCarreira', parseInt(e.target.value) || 0)}
            placeholder="0"
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label>Estilo Musical *</Label>
          <Input
            value={formData.estiloMusical}
            onChange={(e) => updateField('estiloMusical', e.target.value)}
            placeholder="Descreva seu estilo único"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Principais Conquistas</Label>
        {formData.principaisConquistas.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateArrayField('principaisConquistas', index, e.target.value)}
              placeholder="Ex: Primeiro lugar no festival..."
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeArrayItem('principaisConquistas', index)}
              disabled={formData.principaisConquistas.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addArrayItem('principaisConquistas')}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Influências Musicais</Label>
        {formData.influencias.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateArrayField('influencias', index, e.target.value)}
              placeholder="Ex: Tom Jobim, Chico Buarque"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeArrayItem('influencias', index)}
              disabled={formData.influencias.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addArrayItem('influencias')}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Diferenciais</Label>
        {formData.diferenciais.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateArrayField('diferenciais', index, e.target.value)}
              placeholder="O que te torna único?"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeArrayItem('diferenciais', index)}
              disabled={formData.diferenciais.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addArrayItem('diferenciais')}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email de Contato *</Label>
          <Input
            type="email"
            value={formData.emailContato}
            onChange={(e) => updateField('emailContato', e.target.value)}
            placeholder="seu@email.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input
            value={formData.telefoneContato || ''}
            onChange={(e) => updateField('telefoneContato', e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Instagram</Label>
          <Input
            value={formData.instagram || ''}
            onChange={(e) => updateField('instagram', e.target.value)}
            placeholder="@seuartista"
          />
        </div>
        <div className="space-y-2">
          <Label>Spotify</Label>
          <Input
            value={formData.spotify || ''}
            onChange={(e) => updateField('spotify', e.target.value)}
            placeholder="Link do perfil"
          />
        </div>
        <div className="space-y-2">
          <Label>YouTube</Label>
          <Input
            value={formData.youtube || ''}
            onChange={(e) => updateField('youtube', e.target.value)}
            placeholder="Link do canal"
          />
        </div>
        <div className="space-y-2">
          <Label>TikTok</Label>
          <Input
            value={formData.tiktok || ''}
            onChange={(e) => updateField('tiktok', e.target.value)}
            placeholder="@seuartista"
          />
        </div>
        <div className="space-y-2">
          <Label>Facebook</Label>
          <Input
            value={formData.facebook || ''}
            onChange={(e) => updateField('facebook', e.target.value)}
            placeholder="Link da página"
          />
        </div>
        <div className="space-y-2">
          <Label>Site Oficial</Label>
          <Input
            value={formData.site || ''}
            onChange={(e) => updateField('site', e.target.value)}
            placeholder="www.seusite.com"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const bioPrompt = PRESSKIT_PROMPTS.bioProfissional(formData);
    const captionsPrompt = PRESSKIT_PROMPTS.legendasRedes(formData);
    
    return (
      <div className="space-y-6">
        <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold text-primary">Prompts Prontos para IA</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Copie os prompts abaixo e cole no ChatGPT, Claude ou sua IA favorita para gerar conteúdo profissional.
          </p>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-lg">Bio Profissional</h4>
              <Button
                size="sm"
                onClick={() => copyPrompt('bio', bioPrompt)}
                className="gap-2"
              >
                {copiedPrompt === 'bio' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedPrompt === 'bio' ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/50 p-4 rounded-lg max-h-48 overflow-y-auto">
              {bioPrompt}
            </pre>
          </Card>

          <Card className="p-5">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-lg">Legendas para Redes Sociais</h4>
              <Button
                size="sm"
                onClick={() => copyPrompt('captions', captionsPrompt)}
                className="gap-2"
              >
                {copiedPrompt === 'captions' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedPrompt === 'captions' ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/50 p-4 rounded-lg max-h-48 overflow-y-auto">
              {captionsPrompt}
            </pre>
          </Card>
        </div>

        <Card className="p-5 border-gold/30">
          <h4 className="font-semibold text-gold mb-3">Cole aqui o conteúdo gerado</h4>
          <Textarea
            value={generatedContent}
            onChange={(e) => setGeneratedContent(e.target.value)}
            placeholder="Após gerar o conteúdo na IA, cole aqui para salvar..."
            rows={6}
          />
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleShareWhatsApp} className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar WhatsApp
          </Button>
        </div>

        <Card className="p-4 bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500">🏆 Conquista!</Badge>
            <span className="text-sm">Você desbloqueou o badge <strong>Presskit Master</strong>!</span>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="-ml-2">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Voltar para Desafios
      </Button>

      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
          Gerador de Presskit
        </h1>
        <p className="text-muted-foreground">
          Preencha suas informações e gere um presskit profissional com IA
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 py-4">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : step > s
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 4 && <div className={`w-12 h-1 ${step > s ? 'bg-green-500' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">
            {step === 1 && 'Informações Básicas'}
            {step === 2 && 'Carreira e Estilo'}
            {step === 3 && 'Contato e Redes'}
            {step === 4 && 'Gerar Conteúdo'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {step === 1 && 'Como você quer ser apresentado ao mundo'}
            {step === 2 && 'Sua história e o que te faz único'}
            {step === 3 && 'Como as pessoas podem te encontrar'}
            {step === 4 && 'Use IA para criar seu conteúdo profissional'}
          </p>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {step < 4 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <Button
              onClick={() => step === 3 ? handleSaveAndGenerate() : setStep(step + 1)}
              disabled={!isStepValid(step)}
            >
              {step === 3 ? 'Salvar e Gerar' : 'Próximo'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PresskitGenerator;
