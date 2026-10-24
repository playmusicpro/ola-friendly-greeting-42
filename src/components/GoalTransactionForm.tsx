import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/calculations';

export function GoalTransactionForm({ goal, tipo, balance, onClose, onSubmit }: { goal: { id: string; nome: string } | null; tipo: 'deposito' | 'retirada'; balance: number; onClose: () => void; onSubmit: (id: string, value: number, tipo: 'deposito' | 'retirada') => Promise<boolean> }) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  return <Dialog open={!!goal} onOpenChange={open => { if (!open && !saving) { setValue(''); onClose(); } }}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>{tipo === 'deposito' ? 'Aporte' : 'Resgate'} — {goal?.nome}</DialogTitle></DialogHeader>
    <p className="text-sm text-muted-foreground">Saldo atual: {formatCurrency(balance)}</p>
    <form className="space-y-4" onSubmit={async e => { e.preventDefault(); if (!goal) return; setSaving(true); try { if (await onSubmit(goal.id, Number(value), tipo)) { setValue(''); onClose(); } } finally { setSaving(false); } }}>
      <div><Label htmlFor="goal-value">Valor (R$)</Label><Input id="goal-value" type="number" step="0.01" min="0.01" max={tipo === 'retirada' ? Math.max(0, balance) : undefined} required value={value} onChange={e => setValue(e.target.value)} /></div>
      <Button className="w-full" type="submit" disabled={saving}>{saving ? 'Salvando…' : tipo === 'deposito' ? 'Adicionar Valor' : 'Retirar Valor'}</Button>
    </form></DialogContent></Dialog>;
}