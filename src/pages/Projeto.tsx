import { Video, Target, FileText, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const Projeto = () => {
  const projectValue = 10000;
  const savedValue = 3500;
  const progress = (savedValue / projectValue) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Projeto Audiovisual</h1>
        <p className="text-muted-foreground">
          Planeje e acompanhe seu próximo clipe ou álbum visual
        </p>
      </div>

      {/* Project Overview */}
      <Card className="p-6 border-gold/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gold/10">
            <Video className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Meu Primeiro Clipe Profissional</h2>
            <p className="text-sm text-muted-foreground">Clipe da música "Sem Você"</p>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Orçamento</span>
              <span className="text-sm font-medium">
                R$ {savedValue.toLocaleString()} de R$ {projectValue.toLocaleString()}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Objetivo</p>
              <p className="text-xl font-bold text-gold">R$ {projectValue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Guardado</p>
              <p className="text-xl font-bold text-success">R$ {savedValue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Progresso</p>
              <p className="text-xl font-bold text-primary">{progress.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <Button className="w-full mt-6 bg-gold text-black hover:bg-gold/90">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar ao Cofrinho
        </Button>
      </Card>

      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roteiro e Conceito */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Roteiro e Conceito</h3>
          </div>
          <Textarea
            placeholder="Descreva o conceito do clipe, cenas principais, roteiro..."
            className="min-h-[200px] resize-none"
            defaultValue="Clipe minimalista filmado em estúdio com iluminação dramática. História de superação após término de relacionamento. Cenas intercaladas entre performance e narrativa."
          />
        </Card>

        {/* Equipe */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Equipe e Fornecedores</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-secondary rounded-lg">
              <p className="font-medium">Diretor de Fotografia</p>
              <p className="text-sm text-muted-foreground">João Silva - R$ 2.500</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <p className="font-medium">Editor</p>
              <p className="text-sm text-muted-foreground">Maria Santos - R$ 1.500</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <p className="font-medium">Estúdio</p>
              <p className="text-sm text-muted-foreground">Studio Pro - R$ 3.000 (diária)</p>
            </div>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Contato
            </Button>
          </div>
        </Card>
      </div>

      {/* Músicas e Links */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Músicas e Referências</h3>
        <div className="space-y-3">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="font-medium mb-1">Música Principal</p>
            <p className="text-sm text-muted-foreground">"Sem Você" - 3:45min - Tom: Am</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="font-medium mb-1">Referências Visuais</p>
            <div className="space-y-1 mt-2">
              <a href="#" className="text-sm text-primary hover:underline block">
                → Clipe "Example 1" - Iluminação inspiradora
              </a>
              <a href="#" className="text-sm text-primary hover:underline block">
                → Mood board no Pinterest
              </a>
            </div>
          </div>
          <Textarea
            placeholder="Cole aqui links de referência, mood boards, inspirações..."
            className="min-h-[100px] resize-none"
          />
        </div>
      </Card>

      {/* Timeline Ideas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cronograma e Ideias</h3>
        <Textarea
          placeholder="Anote o cronograma de produção, ideias soltas, lembretes importantes..."
          className="min-h-[150px] resize-none"
          defaultValue="- Pré-produção: Janeiro 2025&#10;- Filmagem: Fevereiro 2025&#10;- Pós-produção: Março 2025&#10;- Lançamento: Abril 2025&#10;&#10;Lembrar: Contratar maquiador e figurinista"
        />
      </Card>
    </div>
  );
};

export default Projeto;
