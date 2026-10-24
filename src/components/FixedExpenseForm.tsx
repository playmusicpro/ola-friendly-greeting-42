import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { FixedExpense } from '@/types';

export function FixedExpenseForm({ open, onOpenChange, initialData, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; initialData?: FixedExpense; onSubmit: (data: Omit<FixedExpense, 'id'>) => Promise<boolean> }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) { setDescription(initialData?.description ?? ''); setAmount(String(initialData?.amount ?? '')); setDueDay(String(initialData?.dueDay ?? 1)); setActive(initialData?.active !== false); } }, [open, initialData]);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{initialData ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}</DialogTitle></DialogHeader>
    <form className="space-y-4" onSubmit={async e => { e.preventDefault(); setSaving(true); try { if (await onSubmit({ description: description.trim(), amount: Number(amount), dueDay: Number(dueDay), active })) onOpenChange(false); } finally { setSaving(false); } }}>
      <div><Label htmlFor="fixed-description">Descrição</Label><Input id="fixed-description" required value={description} onChange={e => setDescription(e.target.value)} placeholder="Aluguel, assinatura, seguro" /></div>
      <div><Label htmlFor="fixed-amount">Valor mensal (R$)</Label><Input id="fixed-amount" type="number" min="0.01" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} /></div>
      <div><Label htmlFor="fixed-day">Dia de vencimento</Label><Input id="fixed-day" type="number" min="1" max="31" step="1" required value={dueDay} onChange={e => setDueDay(e.target.value)} /></div>
      <div className="flex items-center justify-between"><Label htmlFor="fixed-active">Despesa ativa</Label><Switch id="fixed-active" checked={active} onCheckedChange={setActive} /></div>
      <Button type="submit" disabled={saving} className="w-full">{saving ? 'Salvando…' : 'Salvar Despesa'}</Button>
    </form></DialogContent></Dialog>;
}