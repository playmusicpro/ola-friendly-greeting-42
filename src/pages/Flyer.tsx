import { Copy, Check, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Flyer = () => {
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const prompts = [
    {
      title: "Flyer de Show Moderno",
      prompt: `Crie um flyer moderno para show de [SEU NOME].

Informações do evento:
- Nome do artista: [SEU NOME]
- Data: [DIA E MÊS]
- Horário: [HORA]
- Local: [NOME DO LOCAL]
- Endereço: [ENDEREÇO COMPLETO]
- Estilo de música: [GÊNERO]
- Vibe do evento: [DESCONTRAÍDO/ELEGANTE/FESTA/INTIMISTA]

Gere um design para Instagram (1080x1080px) com:
- Tipografia moderna e legível
- Paleta de cores que combine com [SUAS CORES OU MOOD]
- Hierarquia visual clara
- Elementos gráficos minimalistas

Formato: Descreva o layout completo para ser criado em Canva, Photoshop ou MidJourney.`,
    },
    {
      title: "Flyer Minimalista Elegante",
      prompt: `Crie um flyer minimalista e elegante para [TIPO DE EVENTO] de [SEU NOME].

Detalhes:
- Nome do artista: [SEU NOME]
- Data: [DATA COMPLETA]
- Local: [LOCAL]
- Horário: [HORA]
- Valor do ingresso: [PREÇO OU "ENTRADA FRANCA"]

Especificações de design:
- Estilo: Minimalista e sofisticado
- Tons: Preto, branco e [UMA COR DE DESTAQUE]
- Layout: Clean com muito espaço em branco
- Tipografia: Elegante e moderna

Descreva o layout detalhadamente para implementação.`,
    },
    {
      title: "Story Animado (Prompt para Descrição)",
      prompt: `Crie uma sequência de 3 stories para Instagram anunciando show de [SEU NOME].

Informações:
- Nome: [SEU NOME]
- Data: [DATA]
- Local: [LOCAL]
- Horário: [HORA]
- Tipo de show: [DESCRIÇÃO]

Story 1 - Teaser:
[Descreva visual misterioso que gera curiosidade]

Story 2 - Revelação:
[Descreva visual com todas as informações do show]

Story 3 - Call to Action:
[Descreva visual incentivando reservas/ingressos]

Inclua ideias de elementos visuais, cores, movimento e textos para cada story.`,
    },
    {
      title: "Flyer Retrô/Vintage",
      prompt: `Crie um flyer estilo retrô/vintage para show de [SEU NOME].

Informações:
- Artista: [SEU NOME]
- Data: [DATA]
- Local: [NOME E ENDEREÇO]
- Horário: [HORA]
- Gênero musical: [GÊNERO]
- Década de inspiração: [60s/70s/80s/90s]

Design retrô com:
- Estética da década [ESCOLHIDA]
- Texturas vintage
- Paleta de cores retrô
- Tipografia clássica
- Elementos gráficos da época

Descreva todo o conceito visual para implementação manual ou com IA de imagens.`,
    },
    {
      title: "Prompt para MidJourney/DALL-E",
      prompt: `Generate a professional music event poster with these specifications:

Subject: [YOUR ARTIST NAME] live concert
Style: [MODERN/VINTAGE/MINIMALIST/ARTISTIC]
Color palette: [YOUR COLORS]
Mood: [ENERGETIC/INTIMATE/ELEGANT/PARTY]
Elements: musical instruments silhouettes, geometric shapes, dynamic composition
Text spaces: Title area top, event details bottom center
Aspect ratio: 1:1 for Instagram
Quality: High resolution, print-ready aesthetic

Additional notes: [ANY SPECIFIC VISUAL ELEMENTS YOU WANT]

--ar 1:1 --v 6 --style raw --s 250

Nota: Cole no MidJourney e depois adicione os textos no Canva.`,
    },
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Prompt copiado!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/desafios")}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Desafios
        </Button>
        <h1 className="text-3xl font-bold mb-2">Nunca mais pague por flyer</h1>
        <p className="text-muted-foreground">
          Prompts para criar flyers profissionais com IA e ferramentas gratuitas
        </p>
      </div>

      {/* Instructions */}
      <Card className="p-6 border-gold/20 bg-gold/5">
        <h2 className="text-lg font-semibold mb-3">Ferramentas recomendadas:</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• <strong>ChatGPT/Claude:</strong> Para layouts descritivos e conceitos</li>
          <li>• <strong>MidJourney/DALL-E:</strong> Para gerar imagens base</li>
          <li>• <strong>Canva (grátis):</strong> Para adicionar textos sobre a imagem</li>
          <li>• <strong>Remove.bg:</strong> Para remover fundos de fotos</li>
          <li>• <strong>Coolors.co:</strong> Para paletas de cores harmoniosas</li>
        </ul>
      </Card>

      {/* Prompts */}
      <div className="space-y-4">
        {prompts.map((item, index) => (
          <Card key={index} className="p-6 hover:border-gold/40 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(item.prompt, index)}
                className="gap-2"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar Prompt
                  </>
                )}
              </Button>
            </div>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-secondary p-4 rounded-lg">
              {item.prompt}
            </pre>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border-primary/20">
          <h3 className="font-semibold mb-2 text-primary">💡 Dica de Design</h3>
          <p className="text-sm text-muted-foreground">
            Mantenha suas informações essenciais grandes e legíveis: Nome, Data, Local e Hora. 
            O resto é complemento.
          </p>
        </Card>
        <Card className="p-6 border-gold/20">
          <h3 className="font-semibold mb-2 text-gold">⚡ Dica Pro</h3>
          <p className="text-sm text-muted-foreground">
            Crie um template base no Canva e apenas troque as informações de cada show. 
            Economiza tempo e mantém sua identidade visual consistente.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Flyer;
