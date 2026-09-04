import { Video, Target, FileText, Plus, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/hooks/use-toast";
import { calculateProjectProgress, formatCurrency, formatPercentage } from "@/lib/calculations";

const Projeto = () => {
  const { project } = useFinancialData();
  const { toast } = useToast();
  const calc = calculateProjectProgress(project);
  
  const handleComingSoon = (feature: string) => {
    toast({
      title: "Em desenvolvimento",
      description: `A função "${feature}" será disponibilizada em breve.`,
    });
  };
  const progress = calc.progressPercentual;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gold to-primary bg-clip-text text-transparent">
          Projeto Audiovisual
        </h1>
        <p className="text-muted-foreground text-lg">
          Planeje e acompanhe seu próximo clipe ou álbum visual
        </p>
      </div>

      {/* Project Overview */}
      <Card className="p-6 border-gold/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gold/10">
              <Video className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{project.name || "Seu Projeto Audiovisual"}</h2>
              <p className="text-sm text-muted-foreground">{project.description || "Defina o objetivo e comece a guardar"}</p>
            </div>
          </div>
          {calc.metaAlcancada && (
            <Badge className="bg-success text-white border-success px-4 py-2 text-sm font-semibold shadow-md">
              ✓ Meta alcançada!
            </Badge>
          )}
        </div>

        {/* Budget Progress */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Orçamento do Projeto</span>
              <span className="text-sm font-semibold">
                {formatCurrency(project.savedValue)} de {formatCurrency(project.totalValue)}
              </span>
            </div>
            <div className="relative h-4 bg-secondary rounded-full overflow-hidden shadow-inner">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-gold to-primary rounded-full transition-all duration-500 shadow-lg" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Objetivo</p>
              <p className="text-xl font-bold text-gold">{formatCurrency(project.totalValue)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Guardado</p>
              <p className="text-xl font-bold text-success">{formatCurrency(project.savedValue)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Progresso</p>
              <p className="text-xl font-bold text-primary">{formatPercentage(calc.progressPercentual)}</p>
            </div>
          </div>

          {/* Projeção de tempo */}
          {calc.weeksToComplete && !calc.metaAlcancada && project.weeklyDeposit && (
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20 mt-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Tempo estimado para completar</p>
                  <p className="text-xs text-muted-foreground">
                    Com depósitos semanais de {formatCurrency(project.weeklyDeposit)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{calc.weeksToComplete}</p>
                <p className="text-xs text-muted-foreground">semanas</p>
              </div>
            </div>
          )}
        </div>

        <Button 
          className="w-full mt-6 bg-gold text-black hover:bg-gold/90 font-semibold rounded-xl shadow-lg py-6"
          onClick={() => handleComingSoon("Adicionar ao Cofrinho")}
        >
          <Plus className="h-5 w-5 mr-2" />
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
          />
        </Card>

        {/* Equipe */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Equipe e Fornecedores</h3>
          </div>
          <div className="space-y-3">
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum contato cadastrado</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => handleComingSoon("Adicionar Contato")}>
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
        />
      </Card>
    </div>
  );
};

export default Projeto;
