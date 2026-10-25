import { PiggyBank, Home as HomeIcon, TrendingDown, TrendingUp, AlertTriangle, Plus, Trash2, ArrowUp, ArrowDown, Edit } from "lucide-react";
import { FixedExpenseForm } from '@/components/FixedExpenseForm';
import type { FixedExpense, Show } from '@/types';
import { ShowForm } from '@/components/ShowForm';
import StatCard from "@/components/StatCard";
import ModuleArtwork from "@/components/ModuleArtwork";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/hooks/use-toast";
import { calculateMonthlyFinancials, showOutstanding, showCashReceipts, formatCurrency, formatPercentage } from "@/lib/calculations";
import { ExpenseForm } from "@/components/ExpenseForm";
import { PiggyBankForm } from "@/components/PiggyBankForm";
import { PiggyBankTransactionForm } from "@/components/PiggyBankTransactionForm";
import { formatDateBR } from "@/lib/dateUtils";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FinancialGoals from '@/components/FinancialGoals';

const Financas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    shows, expenses, fixedExpenses, incomes, saveFixedExpense, updateShow,
    generalExpenses, piggyBanks, goalMovements,
    addGeneralExpense, deleteGeneralExpense,
    addPiggyBank, addToPiggyBank, withdrawFromPiggyBank, deletePiggyBank,
  } = useFinancialData();

  const [showFixedForm, setShowFixedForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Show | undefined>();
  const [editingFixed, setEditingFixed] = useState<FixedExpense | undefined>();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showPiggyForm, setShowPiggyForm] = useState(false);
  const [transactionPiggyId, setTransactionPiggyId] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'deposito' | 'retirada'>('deposito');

  const monthly = calculateMonthlyFinancials(shows, expenses, fixedExpenses, incomes, new Date(), { goalMovements, piggyBanks });
  const totalFixas = monthly.despesasFixas;
  const [category, setCategory] = useState("todos");
  const filteredExpenses = generalExpenses.filter(exp => category === "todos" || exp.categoria === category);
  const totalFilteredExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.valor, 0);
  const totalPiggyBanks = piggyBanks.reduce((sum, pb) => sum + pb.valorAtual, 0);
  const dre = monthly.dre;

  const selectedPiggy = piggyBanks.find(pb => pb.id === transactionPiggyId);

  return (
    <div className="finance-page space-y-6">
      <ShowForm open={!!editingPayment} onOpenChange={open => { if (!open) setEditingPayment(undefined); }} initialData={editingPayment} onSubmit={data => editingPayment ? updateShow(editingPayment.id, data) : false} />
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
        onSubmit={async (valor) => {
          if (!transactionPiggyId) return false;
          if (transactionType === 'deposito') {
            if (!await addToPiggyBank(transactionPiggyId, valor)) return false;
            toast({ title: "Depósito realizado!", description: `${formatCurrency(valor)} adicionado.` });
          } else {
            if (!await withdrawFromPiggyBank(transactionPiggyId, valor)) return false;
            toast({ title: "Retirada realizada!", description: `${formatCurrency(valor)} retirado.` });
          }
          setTransactionPiggyId(null);
        }}
        tipo={transactionType}
        piggyBankName={selectedPiggy?.nome || ''}
      />

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold mb-2">
          Finanças
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Custos Totais" value={formatCurrency(monthly.totalGastos)} icon={TrendingDown} trend={`${generalExpenses.length} gasto(s) registrado(s)`} variant="default" artwork="/receitas" />
        <StatCard title="Faturamento Bruto" value={formatCurrency(monthly.faturamentoBruto)} icon={TrendingUp} artwork="/financas" />
        <StatCard title="Lucro Líquido Real" value={formatCurrency(monthly.lucroLiquidoReal)} icon={TrendingUp} trend={`${formatPercentage(dre.margemFinal)} de margem`} artwork="/financas" />
        <StatCard title="Saldo Disponível no Caixa" value={formatCurrency(monthly.saldoDisponivel)} icon={PiggyBank} artwork="savings" />
        <StatCard title="Projeção de Caixa Futura" value={formatCurrency(monthly.projecaoCaixa)} icon={TrendingUp} artwork="/agenda" />
        <StatCard title="Cofrinhos" value={formatCurrency(totalPiggyBanks)} icon={PiggyBank} trend={`${piggyBanks.length} cofrinho(s) ativo(s)`} variant="gold" artwork="savings" />
        <StatCard title="Despesas Fixas" value={formatCurrency(totalFixas)} icon={HomeIcon} trend="Compromissos recorrentes" variant="default" artwork="/agenda" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lancamentos" className="space-y-6">
        <TabsList aria-label="Áreas de Finanças" className="finance-segmented">
          <TabsTrigger value="lancamentos"><span className="sm:hidden">Extrato</span><span className="hidden sm:inline">Lançamentos / Extrato</span></TabsTrigger>
          <TabsTrigger value="planejamento">Planejamento</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* Gastos Gerais */}
        <TabsContent value="lancamentos" className="space-y-6">
      <section className="space-y-3"><h2 className="text-xl font-semibold text-gold">Cachês e Pagamentos</h2>{shows.length === 0 && <p className="text-muted-foreground">Nenhum show cadastrado</p>}{shows.map(show => <div key={show.id} className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-border"><div className="min-w-0"><h3 className="font-semibold break-words">{show.title || show.local}</h3><p className="text-xs text-muted-foreground">{formatDateBR(show.date)} · {show.realizado ? 'Realizado' : 'Agendado'} · {showOutstanding(show) === 0 ? 'Quitado' : 'A receber'}</p><p className="text-sm mt-1">Recebido: {formatCurrency(showCashReceipts(show).reduce((sum, receipt) => sum + receipt.amount, 0))} · Restante: {formatCurrency(showOutstanding(show))}</p>{!show.cashTracking && <p className="text-xs text-muted-foreground mt-1">Registro anterior · pagamentos a conferir</p>}</div><Button variant="outline" size="sm" onClick={() => setEditingPayment(show)}>Editar Pagamentos</Button></div>)}</section>

          <Card className="thematic-card p-4 sm:p-6 border-primary/10">
            <ModuleArtwork module="/receitas" />
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger aria-label="Filtrar gastos por categoria" className="finance-category-filter mb-5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os gastos</SelectItem>
                <SelectItem value="outros">Gastos Gerais</SelectItem>
                <SelectItem value="combustivel">Combustível</SelectItem>
                <SelectItem value="alimentacao">Alimentação</SelectItem>
                <SelectItem value="equipamentos">Equipamentos</SelectItem>
                <SelectItem value="musicos">Músicos</SelectItem>
                <SelectItem value="fixas">Despesas Fixas</SelectItem>
              </SelectContent>
            </Select>
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingDown className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Nenhum gasto registrado</p>
                <p className="text-sm mt-2">Clique em "Adicionar Gasto" para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map(exp => (
                  <div key={exp.id} className="flex flex-wrap items-center justify-between gap-3 p-4 bg-secondary/50 rounded-xl border border-border">
                    <div>
                      <p className="font-medium">{exp.descricao}</p>
                      <p className="text-xs text-muted-foreground">{formatDateBR(exp.data)} • {exp.categoria}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-destructive">{formatCurrency(exp.valor)}</span>
                      <Button size="icon" variant="ghost" disabled={exp.origin === 'team_payment'} onClick={() => { deleteGeneralExpense(exp.id); toast({ title: "Gasto removido" }); }}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredExpenses.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gold/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total da seleção</span>
                  <span className="text-2xl font-bold text-destructive">{formatCurrency(totalFilteredExpenses)}</span>
                </div>
              </div>
            )}
          </Card>

          <Card className="thematic-card p-4 sm:p-6">
            <ModuleArtwork module="/agenda" />
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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
                <div key={exp.id} className="flex flex-wrap items-center justify-between gap-3 p-4 bg-secondary rounded-lg">
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

        {/* Cofrinhos */}
        <TabsContent value="planejamento" className="space-y-6">
          <FinancialGoals />
          <Card className="thematic-card p-4 sm:p-6">
            <ModuleArtwork module="savings" />
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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

        <TabsContent value="relatorios" className="space-y-6">
      {/* DRE Simplificado */}
      <Card className="thematic-card p-4 sm:p-6 border-gold/20">
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
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-background/50 rounded-xl border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Receita Bruta</p>
              <p className="text-xs text-muted-foreground mt-1">Sinais e pagamentos recebidos</p>
            </div>
            <span className="text-2xl font-bold text-success">{formatCurrency(dre.receitaBruta)}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-background/50 rounded-xl border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Custos Diretos</p>
              <p className="text-xs text-muted-foreground mt-1">Gastos relacionados aos shows</p>
            </div>
            <span className="text-2xl font-bold text-destructive">-{formatCurrency(dre.custosDirectos)}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-background/50 rounded-xl border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Despesas Fixas e Saídas Avulsas</p>
              <p className="text-xs text-muted-foreground mt-1">Aluguel, pensão, parcelas, etc.</p>
            </div>
            <span className="text-2xl font-bold text-destructive">-{formatCurrency(dre.despesasFixas)}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-4"><span>Margem de Contribuição</span><strong>{formatCurrency(monthly.margemContribuicao)}</strong></div>
          <div className="flex flex-wrap justify-between gap-3"><span>Aportes líquidos em Metas</span><strong>{formatCurrency(monthly.aportesMetas)}</strong></div>
          <div className="h-px bg-gold/20 my-4"></div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 bg-gradient-to-r from-primary/10 to-gold/10 rounded-xl border-2 border-gold/30">
            <div>
              <p className="font-semibold text-lg">Lucro Líquido Real</p>
              <p className="text-xs text-muted-foreground mt-1">Lucro líquido do período</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${dre.resultadoOperacional >= 0 ? 'text-success' : 'text-destructive'}`}>
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

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Receitas e análises</h2>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/receitas')}>Gerenciar Receitas</Button>
              <Button variant="outline" onClick={() => navigate('/panorama')}>Panorama Visual</Button>
              <Button variant="outline" onClick={() => navigate('/analises')}>Análise por Evento</Button>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financas;
