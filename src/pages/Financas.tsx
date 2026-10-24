import { Fuel, Shirt, Music, PiggyBank, Home as HomeIcon, TrendingDown, TrendingUp, AlertTriangle, Plus, Trash2, ArrowUp, ArrowDown, Edit } from "lucide-react";
import { FixedExpenseForm } from '@/components/FixedExpenseForm';
import type { FixedExpense } from '@/types';
import StatCard from "@/components/StatCard";
import ModuleArtwork from "@/components/ModuleArtwork";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/hooks/use-toast";
import { calculateMonthlyFinancials, formatCurrency, formatPercentage } from "@/lib/calculations";
import { ExpenseForm } from "@/components/ExpenseForm";
import { PiggyBankForm } from "@/components/PiggyBankForm";
import { PiggyBankTransactionForm } from "@/components/PiggyBankTransactionForm";
import { formatDateBR } from "@/lib/dateUtils";
import { useState } from "react";

const Financas = () => {
  const { toast } = useToast();
  const {
    shows, expenses, fixedExpenses, incomes, saveFixedExpense,
    generalExpenses, piggyBanks,
    addGeneralExpense, deleteGeneralExpense,
    addPiggyBank, addToPiggyBank, withdrawFromPiggyBank, deletePiggyBank,
  } = useFinancialData();

  const [showFixedForm, setShowFixedForm] = useState(false);
  const [editingFixed, setEditingFixed] = useState<FixedExpense | undefined>();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showPiggyForm, setShowPiggyForm] = useState(false);
  const [transactionPiggyId, setTransactionPiggyId] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'deposito' | 'retirada'>('deposito');

  const monthly = calculateMonthlyFinancials(shows, expenses, fixedExpenses, incomes);
  const totalFixas = monthly.despesasFixas;
  const totalGeneralExpenses = generalExpenses.reduce((sum, e) => sum + e.valor, 0);
  const totalPiggyBanks = piggyBanks.reduce((sum, pb) => sum + pb.valorAtual, 0);
  const dre = monthly.dre;

  const selectedPiggy = piggyBanks.find(pb => pb.id === transactionPiggyId);

  const fuelExpenses = generalExpenses.filter(e => e.categoria === 'combustivel');
  const totalFuel = fuelExpenses.reduce((sum, e) => sum + e.valor, 0);
  const gearExpenses = generalExpenses.filter(e => e.categoria === 'equipamentos');
  const totalGear = gearExpenses.reduce((sum, e) => sum + e.valor, 0);

  return (
    <div className="space-y-6">
      <FixedExpenseForm open={showFixedForm} onOpenChange={setShowFixedForm} initialData={editingFixed} onSubmit={async data => { const ok = await saveFixedExpense(data, editingFixed?.id); if (ok) toast({ title: 'Despesa fixa salva' }); return ok; }} />
      <ExpenseForm
        open={showExpenseForm}
        onOpenChange={setShowExpenseForm}
        onSubmit={(data) => {
          addGeneralExpense(data);
          toast({ title: "Gasto registrado!", description: "O gasto foi salvo com sucesso." });
        }}
      />
      <PiggyBankForm
        open={showPiggyForm}
        onOpenChange={setShowPiggyForm}
        onSubmit={(data) => {
          addPiggyBank(data);
          toast({ title: "Cofrinho criado!", description: "Seu cofrinho foi salvo." });
        }}
      />
      <PiggyBankTransactionForm
        open={!!transactionPiggyId}
        onOpenChange={(open) => { if (!open) setTransactionPiggyId(null); }}
        onSubmit={(valor) => {
          if (!transactionPiggyId) return;
          if (transactionType === 'deposito') {
            addToPiggyBank(transactionPiggyId, valor);
            toast({ title: "Depósito realizado!", description: `${formatCurrency(valor)} adicionado.` });
          } else {
            withdrawFromPiggyBank(transactionPiggyId, valor);
            toast({ title: "Retirada realizada!", description: `${formatCurrency(valor)} retirado.` });
          }
          setTransactionPiggyId(null);
        }}
        tipo={transactionType}
        piggyBankName={selectedPiggy?.nome || ''}
      />

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gold via-primary to-gold bg-clip-text text-transparent">
          Consultor Financeiro
        </h1>
        <p className="text-muted-foreground text-lg">Acompanhe seus gastos e economias de forma profissional</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total de Gastos do Mês" value={formatCurrency(monthly.totalGastos)} icon={TrendingDown} trend={`${generalExpenses.length} gasto(s) registrado(s)`} variant="default" artwork="/receitas" />
        <StatCard title="Cofrinhos" value={formatCurrency(totalPiggyBanks)} icon={PiggyBank} trend={`${piggyBanks.length} cofrinho(s) ativo(s)`} variant="gold" artwork="savings" />
        <StatCard title="Despesas Fixas" value={formatCurrency(totalFixas)} icon={HomeIcon} trend="Compromissos recorrentes" variant="default" artwork="/agenda" />
      </div>

      {/* DRE Simplificado */}
      <Card className="thematic-card p-6 border-gold/20">
        <ModuleArtwork module="/financas" />
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gold/10">
            <TrendingUp className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">DRE Simplificado</h2>
            <p className="text-xs text-muted-foreground">Demonstrativo de Resultado do Mês</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Receita Bruta</p>
              <p className="text-xs text-muted-foreground mt-1">Soma de todos os cachês</p>
            </div>
            <span className="text-2xl font-bold text-success">{formatCurrency(dre.receitaBruta)}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Custos Diretos</p>
              <p className="text-xs text-muted-foreground mt-1">Gastos relacionados aos shows</p>
            </div>
            <span className="text-2xl font-bold text-destructive">-{formatCurrency(dre.custosDirectos)}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Despesas Fixas e Saídas Avulsas</p>
              <p className="text-xs text-muted-foreground mt-1">Aluguel, pensão, parcelas, etc.</p>
            </div>
            <span className="text-2xl font-bold text-destructive">-{formatCurrency(dre.despesasFixas)}</span>
          </div>
          <div className="h-px bg-gold/20 my-4"></div>
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-primary/10 to-gold/10 rounded-xl border-2 border-gold/30">
            <div>
              <p className="font-semibold text-lg">Resultado Operacional</p>
              <p className="text-xs text-muted-foreground mt-1">Lucro líquido do período</p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${dre.resultadoOperacional >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(dre.resultadoOperacional)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Margem: {formatPercentage(dre.margemFinal)}</p>
            </div>
          </div>
          {dre.margemFinal < 0 && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive font-medium">Atenção: Suas despesas superaram sua receita este mês</p>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="gastos" className="space-y-4">
        <TabsList className="financial-tabs grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger className="thematic-tab" value="gastos"><ModuleArtwork module="/receitas" />Gastos</TabsTrigger>
          <TabsTrigger value="combustivel">Combustível</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger className="thematic-tab" value="cofrinho"><ModuleArtwork module="savings" />Cofrinhos</TabsTrigger>
          <TabsTrigger className="thematic-tab" value="fixas"><ModuleArtwork module="/agenda" />Despesas Fixas</TabsTrigger>
        </TabsList>

        {/* Gastos Gerais */}
        <TabsContent value="gastos" className="space-y-4">
          <Card className="thematic-card p-6 border-primary/10">
            <ModuleArtwork module="/receitas" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <TrendingDown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Gastos Gerais</h2>
                  <p className="text-xs text-muted-foreground">Todos os gastos registrados</p>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2" onClick={() => setShowExpenseForm(true)}>
                <Plus className="h-4 w-4" />
                Adicionar Gasto
              </Button>
            </div>

            {generalExpenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingDown className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Nenhum gasto registrado</p>
                <p className="text-sm mt-2">Clique em "Adicionar Gasto" para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {generalExpenses.map(exp => (
                  <div key={exp.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                    <div>
                      <p className="font-medium">{exp.descricao}</p>
                      <p className="text-xs text-muted-foreground">{formatDateBR(exp.data)} • {exp.categoria}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-destructive">{formatCurrency(exp.valor)}</span>
                      <Button size="icon" variant="ghost" onClick={() => { deleteGeneralExpense(exp.id); toast({ title: "Gasto removido" }); }}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {generalExpenses.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gold/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total de gastos gerais</span>
                  <span className="text-2xl font-bold text-destructive">{formatCurrency(totalGeneralExpenses)}</span>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="combustivel" className="space-y-4">
          <Card className="p-6 shadow-lg border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10"><Fuel className="h-6 w-6 text-primary" /></div>
                <div>
                  <h2 className="text-xl font-semibold">Combustível</h2>
                  <p className="text-xs text-muted-foreground">Gastos com transporte para shows</p>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" onClick={() => setShowExpenseForm(true)}>Adicionar Gasto</Button>
            </div>
            {fuelExpenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Fuel className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Nenhum gasto de combustível registrado</p>
                <p className="text-sm mt-2">Clique em "Adicionar Gasto" para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fuelExpenses.map(exp => (
                  <div key={exp.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                    <div>
                      <p className="font-medium">{exp.descricao}</p>
                      <p className="text-xs text-muted-foreground">{formatDateBR(exp.data)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-destructive">{formatCurrency(exp.valor)}</span>
                      <Button size="icon" variant="ghost" onClick={() => { deleteGeneralExpense(exp.id); toast({ title: "Gasto removido" }); }}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-gold/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total em combustível</span>
                <span className="text-2xl font-bold text-destructive">{formatCurrency(totalFuel)}</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="equipamentos" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10"><Music className="h-6 w-6 text-primary" /></div>
                <div>
                  <h2 className="text-xl font-semibold">Equipamentos</h2>
                  <p className="text-sm text-muted-foreground">Manutenção e acessórios</p>
                </div>
              </div>
              <Button onClick={() => setShowExpenseForm(true)}>Adicionar Gasto</Button>
            </div>
            {gearExpenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Nenhum gasto de equipamentos registrado</p>
                <p className="text-sm mt-2">Clique em "Adicionar Gasto" para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gearExpenses.map(exp => (
                  <div key={exp.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{exp.descricao}</p>
                      <p className="text-sm text-muted-foreground">{formatDateBR(exp.data)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-destructive">{formatCurrency(exp.valor)}</span>
                      <Button size="icon" variant="ghost" onClick={() => { deleteGeneralExpense(exp.id); toast({ title: "Gasto removido" }); }}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total em equipamentos</span>
                <span className="text-2xl font-bold text-destructive">{formatCurrency(totalGear)}</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Cofrinhos */}
        <TabsContent value="cofrinho" className="space-y-4">
          <Card className="thematic-card p-6">
            <ModuleArtwork module="savings" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gold/10"><PiggyBank className="h-6 w-6 text-gold" /></div>
                <div>
                  <h2 className="text-xl font-semibold">Cofrinhos</h2>
                  <p className="text-sm text-muted-foreground">Reservas financeiras</p>
                </div>
              </div>
              <Button className="bg-gold text-accent-foreground hover:bg-gold/90 gap-2" onClick={() => setShowPiggyForm(true)}>
                <Plus className="h-4 w-4" />
                Novo Cofrinho
              </Button>
            </div>

            {piggyBanks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PiggyBank className="h-16 w-16 mx-auto mb-4 opacity-30 text-gold" />
                <p className="text-lg">Nenhum cofrinho criado</p>
                <p className="text-sm mt-2">Crie seu primeiro cofrinho para guardar dinheiro</p>
              </div>
            ) : (
              <div className="space-y-4">
                {piggyBanks.map(pb => (
                  <div key={pb.id} className="p-5 rounded-xl border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{pb.nome}</h3>
                      <Button size="icon" variant="ghost" onClick={() => { deletePiggyBank(pb.id); toast({ title: "Cofrinho removido" }); }}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <p className="text-3xl font-bold text-gold mb-3">{formatCurrency(pb.valorAtual)}</p>
                    {pb.objetivo && (
                      <div className="mb-3">
                        <Progress value={(pb.valorAtual / pb.objetivo) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Objetivo: {formatCurrency(pb.objetivo)} • {formatPercentage((pb.valorAtual / pb.objetivo) * 100)}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1" onClick={() => { setTransactionPiggyId(pb.id); setTransactionType('deposito'); }}>
                        <ArrowUp className="h-3 w-3" /> Depositar
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => { setTransactionPiggyId(pb.id); setTransactionType('retirada'); }}>
                        <ArrowDown className="h-3 w-3" /> Retirar
                      </Button>
                    </div>
                    {pb.historico.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border space-y-2">
                        {pb.historico.slice(-3).map(h => (
                          <div key={h.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{formatDateBR(h.data)}</span>
                            <span className={h.tipo === 'deposito' ? 'text-success' : 'text-destructive'}>
                              {h.tipo === 'deposito' ? '+' : '-'}{formatCurrency(h.valor)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gold/20">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total guardado</span>
                    <span className="text-2xl font-bold text-gold">{formatCurrency(totalPiggyBanks)}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="fixas" className="space-y-4">
          <Card className="thematic-card p-6">
            <ModuleArtwork module="/agenda" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10"><HomeIcon className="h-6 w-6 text-primary" /></div>
                <div>
                  <h2 className="text-xl font-semibold">Despesas Fixas</h2>
                  <p className="text-sm text-muted-foreground">Compromissos mensais</p>
                </div>
              </div>
              <Button onClick={() => { setEditingFixed(undefined); setShowFixedForm(true); }}>Adicionar</Button>
            </div>
            <div className="space-y-3">
              {fixedExpenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">{exp.description}</p>
                    <p className="text-sm text-muted-foreground">Vence dia {exp.dueDay} • {exp.active === false ? 'Inativa' : 'Ativa'}</p>
                  </div>
                  <div className="flex items-center gap-2"><span className="text-lg font-semibold text-destructive">{formatCurrency(exp.amount)}</span><Button size="icon" variant="ghost" aria-label={`Editar ${exp.description}`} onClick={() => { setEditingFixed(exp); setShowFixedForm(true); }}><Edit className="h-4 w-4" /></Button></div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total mensal</span>
                <span className="text-2xl font-bold text-destructive">{formatCurrency(totalFixas)}</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financas;
