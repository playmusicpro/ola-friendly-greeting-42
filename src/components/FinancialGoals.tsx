import { useState } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { calculateGoalProgress, formatCurrency, formatPercentage } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GoalForm } from '@/components/GoalForm';
import { GoalTransactionForm } from '@/components/GoalTransactionForm';

export default function FinancialGoals() {
  const { goals, shows, incomes, addGoal, deleteGoal, moveGoal } = useFinancialData();
  const [creating, setCreating] = useState(false);
  const [movement, setMovement] = useState<{ id: string; nome: string; tipo: 'deposito' | 'retirada' } | null>(null);
  const selected = goals.find(goal => goal.id === movement?.id);
  return <section className="space-y-4" aria-label="Metas financeiras">
    <div className="flex flex-wrap justify-between items-center gap-3"><h2 className="flex items-center gap-2 text-xl font-semibold text-gold"><Target className="h-5 w-5" />Metas Financeiras</h2><Button onClick={() => setCreating(true)} className="gap-2"><Plus className="h-4 w-4" />Adicionar Meta</Button></div>
    <GoalForm open={creating} onOpenChange={setCreating} onSubmit={data => { void addGoal(data); }} />
    <GoalTransactionForm goal={movement} tipo={movement?.tipo ?? 'deposito'} balance={selected ? calculateGoalProgress(selected, shows, incomes).realizado : 0} onClose={() => setMovement(null)} onSubmit={moveGoal} />
    {goals.length === 0 && <p className="py-8 text-center text-muted-foreground">Nenhuma meta cadastrada</p>}
    {goals.map(goal => {
      const gp = calculateGoalProgress(goal, shows, incomes);
      return <div key={goal.id} className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex justify-between gap-3 items-center"><h3 className="font-semibold break-words">{goal.nome}</h3><div className="flex gap-2 items-center"><Badge variant="outline">{goal.periodo}</Badge><Button variant="ghost" size="icon" aria-label={`Excluir meta ${goal.nome}`} onClick={() => { void deleteGoal(goal.id); }}><Trash2 className="h-4 w-4" /></Button></div></div>
        <Progress value={gp.progressoPercentual} className="h-2" />
        <p className="text-sm text-muted-foreground">{formatPercentage(gp.progressoPercentual)} · {formatCurrency(gp.realizado)} / {formatCurrency(goal.valorMeta)}</p>
        <p className="text-xs text-muted-foreground">Faltam {formatCurrency(gp.restante)}</p>
        <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => setMovement({ ...goal, tipo: 'deposito' })}>Aporte / Adicionar Valor</Button><Button size="sm" variant="outline" disabled={gp.realizado <= 0} onClick={() => setMovement({ ...goal, tipo: 'retirada' })}>Resgate / Retirar Valor</Button></div>
      </div>;
    })}
  </section>;
}