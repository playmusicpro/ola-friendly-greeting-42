import { useEffect, useState } from "react";
import { Video, Target, FileText, Plus, Calendar, Save, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/hooks/use-toast";
import { calculateProjectProgress, formatCurrency, formatPercentage } from "@/lib/calculations";

const Projeto = () => {
  const { project, saveProject, depositToProject, withdrawFromProject } = useFinancialData();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    totalValue: 0,
    weeklyDeposit: 0,
    roteiro: "",
    referencias: "",
    cronograma: "",
  });
  const [valorMovimento, setValorMovimento] = useState("");

  useEffect(() => {
    setForm({
      name: project.name ?? "",
      description: project.description ?? "",
      totalValue: project.totalValue ?? 0,
      weeklyDeposit: project.weeklyDeposit ?? 0,
      roteiro: project.roteiro ?? "",
      referencias: project.referencias ?? "",
      cronograma: project.cronograma ?? "",
    });
  }, [project.id, project.name, project.description, project.totalValue, project.weeklyDeposit, project.roteiro, project.referencias, project.cronograma]);

  const calc = calculateProjectProgress({ ...project, totalValue: form.totalValue || project.totalValue });
  const progress = calc.progressPercentual;

  const handleSave = async () => {
    await saveProject({
      name: form.name,
      description: form.description,
      totalValue: Number(form.totalValue) || 0,
      weeklyDeposit: Number(form.weeklyDeposit) || undefined,
      roteiro: form.roteiro,
      referencias: form.referencias,
      cronograma: form.cronograma,
    });
    toast({ title: "Projeto salvo!", description: "As informações foram gravadas." });
  };

  const handleMovimento = async (tipo: "deposito" | "retirada") => {
    const valor = Number(valorMovimento.replace(",", "."));
    if (!valor || valor <= 0) {
      toast({ variant: "destructive", title: "Informe um valor", description: "Digite um valor maior que zero." });
      return;
    }
    if (tipo === "deposito") await depositToProject(valor);
    else await withdrawFromProject(valor);
    setValorMovimento("");
    toast({
      title: tipo === "deposito" ? "Depósito registrado!" : "Retirada registrada!",
      description: `${formatCurrency(valor)} ${tipo === "deposito" ? "guardado" : "retirado"} do cofrinho do projeto.`,
    });
  };

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

      {/* Dados do projeto */}
      <Card className="p-6 border-gold/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gold/10">
              <Video className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{form.name || "Seu Projeto Audiovisual"}</h2>
              <p className="text-sm text-muted-foreground">{form.description || "Defina o objetivo e comece a guardar"}</p>
            </div>
          </div>
          {calc.metaAlcancada && (
            <Badge className="bg-success text-white border-success px-4 py-2 text-sm font-semibold shadow-md">
              ✓ Meta alcançada!
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="nome">Nome do projeto</Label>
            <Input
              id="nome"
              value={form.name}
              placeholder="Ex: Clipe da música nova"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={form.description}
              placeholder="Ex: Gravação em estúdio + externas"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="totalValue">Orçamento total (R$)</Label>
            <Input
              id="totalValue"
              type="number"
              step="0.01"
              value={form.totalValue || ""}
              placeholder="0,00"
              onChange={(e) => setForm({ ...form, totalValue: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="weeklyDeposit">Quanto pretende guardar por semana (R$)</Label>
            <Input
              id="weeklyDeposit"
              type="number"
              step="0.01"
              value={form.weeklyDeposit || ""}
              placeholder="0,00"
              onChange={(e) => setForm({ ...form, weeklyDeposit: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
        </div>

        {/* Progresso */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Orçamento do Projeto</span>
              <span className="text-sm font-semibold">
                {formatCurrency(project.savedValue)} de {formatCurrency(form.totalValue || project.totalValue)}
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
              <p className="text-xl font-bold text-gold">{formatCurrency(form.totalValue || project.totalValue)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Guardado</p>
              <p className="text-xl font-bold text-success">{formatCurrency(project.savedValue)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Progresso</p>
              <p className="text-xl font-bold text-primary">{formatPercentage(progress)}</p>
            </div>
          </div>

          {calc.weeksToComplete && !calc.metaAlcancada && form.weeklyDeposit > 0 && (
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20 mt-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Tempo estimado para completar</p>
                  <p className="text-xs text-muted-foreground">
                    Guardando {formatCurrency(form.weeklyDeposit)} por semana
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {Math.ceil(Math.max(0, (form.totalValue || project.totalValue) - project.savedValue) / form.weeklyDeposit)}
                </p>
                <p className="text-xs text-muted-foreground">semanas</p>
              </div>
            </div>
          )}
        </div>

        {/* Cofrinho */}
        <div className="mt-6 p-4 rounded-xl border border-gold/20 bg-gold/5 space-y-3">
          <p className="font-semibold text-gold">Cofrinho do projeto</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="number"
              step="0.01"
              value={valorMovimento}
              placeholder="Valor (R$)"
              onChange={(e) => setValorMovimento(e.target.value)}
            />
            <Button
              className="bg-gold text-black hover:bg-gold/90 font-semibold"
              onClick={() => handleMovimento("deposito")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            <Button variant="outline" onClick={() => handleMovimento("retirada")}>
              <Minus className="h-4 w-4 mr-2" />
              Retirar
            </Button>
          </div>
          {!project.id && (
            <p className="text-xs text-muted-foreground">
              Salve o projeto antes de movimentar o cofrinho.
            </p>
          )}
        </div>
      </Card>

      {/* Roteiro e Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Roteiro e Conceito</h3>
          </div>
          <Textarea
            value={form.roteiro}
            onChange={(e) => setForm({ ...form, roteiro: e.target.value })}
            placeholder="Descreva o conceito do clipe, cenas principais, roteiro..."
            className="min-h-[200px] resize-none"
          />
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Equipe e Fornecedores</h3>
          </div>
          <Textarea
            value={form.referencias}
            onChange={(e) => setForm({ ...form, referencias: e.target.value })}
            placeholder="Anote contatos da equipe, fornecedores, links de referência e inspirações..."
            className="min-h-[200px] resize-none"
          />
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cronograma e Ideias</h3>
        <Textarea
          value={form.cronograma}
          onChange={(e) => setForm({ ...form, cronograma: e.target.value })}
          placeholder="Anote o cronograma de produção, ideias soltas, lembretes importantes..."
          className="min-h-[150px] resize-none"
        />
      </Card>

      <Button
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg py-6"
        onClick={handleSave}
      >
        <Save className="h-5 w-5 mr-2" />
        Salvar projeto
      </Button>
    </div>
  );
};

export default Projeto;
