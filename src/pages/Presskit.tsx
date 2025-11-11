import { Copy, Check, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Presskit = () => {
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const prompts = [
    {
      title: "Bio Profissional",
      prompt: `Crie uma bio profissional de artista musical para [SEU NOME]. 
      
Informações:
- Nome artístico: [SEU NOME]
- Gênero musical: [SEU GÊNERO]
- Anos de carreira: [TEMPO]
- Principais conquistas: [SUAS CONQUISTAS]
- Estilo musical: [DESCREVA SEU ESTILO]

Crie 3 versões: curta (50 palavras), média (100 palavras) e longa (200 palavras). Mantenha tom profissional, objetivo e inspirador.`,
    },
    {
      title: "Press Release",
      prompt: `Escreva um press release para o lançamento de [NOME DA MÚSICA/ÁLBUM] por [SEU NOME ARTÍSTICO].

Detalhes:
- Título: [TÍTULO]
- Data de lançamento: [DATA]
- Gênero: [GÊNERO]
- Tema principal: [SOBRE O QUE FALA]
- Produção: [QUEM PRODUZIU]
- Curiosidades: [ALGO INTERESSANTE SOBRE A PRODUÇÃO]

Formato de press release profissional com título chamativo, lead forte e citações do artista.`,
    },
    {
      title: "Rider Técnico",
      prompt: `Crie um rider técnico básico para [SEU NOME/BANDA].

Formação:
- [LISTE OS INSTRUMENTOS E MÚSICOS]

Necessidades técnicas:
- [EQUIPAMENTOS ESSENCIAIS]
- [SISTEMA DE SOM]
- [ILUMINAÇÃO BÁSICA]

Organize em formato profissional, dividido por: Line Up, Necessidades de Palco, Backline, PA e Iluminação.`,
    },
    {
      title: "Kit de Mídia - Descrição",
      prompt: `Crie descrições curtas e impactantes de [SEU NOME ARTÍSTICO] para diferentes plataformas:

Informações:
- Estilo: [SEU ESTILO]
- Diferencial: [O QUE TE TORNA ÚNICO]
- Influências: [SUAS INFLUÊNCIAS]

Gere versões para:
1. Instagram Bio (150 caracteres)
2. Spotify Bio (bio curta)
3. YouTube About (descrição média)
4. Site oficial (descrição completa com call-to-action)`,
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
          className="mb-6 -ml-2 hover:text-primary"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar para Desafios
        </Button>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
          Como criar seu Presskit
        </h1>
        <p className="text-muted-foreground text-lg">
          Use estes prompts com ChatGPT, Claude ou qualquer IA para criar materiais profissionais
        </p>
      </div>

      {/* Instructions */}
      <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-primary">Como usar:</h2>
        <ol className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary">1.</span>
            <span>Clique em "Copiar Prompt" no card desejado</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary">2.</span>
            <span>Cole no ChatGPT, Claude ou sua IA favorita</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary">3.</span>
            <span>Substitua os campos entre [COLCHETES] com suas informações</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary">4.</span>
            <span>Refine o resultado até ficar perfeito</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary">5.</span>
            <span>Use em seu presskit, site e materiais de divulgação</span>
          </li>
        </ol>
      </Card>

      {/* Prompts */}
      <div className="space-y-5">
        {prompts.map((item, index) => (
          <Card key={index} className="p-6 hover:border-primary/40 transition-colors shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-primary">{item.title}</h3>
              <Button
                size="sm"
                onClick={() => copyToClipboard(item.prompt, index)}
                className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-lg"
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
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-secondary/50 p-5 rounded-xl border border-border leading-relaxed">
              {item.prompt}
            </pre>
          </Card>
        ))}
      </div>

      {/* Tip */}
      <Card className="p-6 border-gold/30 bg-gradient-to-br from-gold/10 to-transparent shadow-lg">
        <h3 className="font-bold mb-3 text-gold text-lg flex items-center gap-2">
          💡 Dica Profissional
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Depois de gerar o conteúdo, peça para a IA revisar e melhorar. 
          Você pode dizer: "Torne mais impactante" ou "Reduza para X palavras sem perder a essência".
        </p>
      </Card>
    </div>
  );
};

export default Presskit;
