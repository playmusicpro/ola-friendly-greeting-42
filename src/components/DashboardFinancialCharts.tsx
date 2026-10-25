import { useId, useState } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildDashboardFinancialCharts, PRIVATE_CURRENCY, type FinancialRange } from '@/lib/dashboardFinancialCharts';
import { formatCurrency } from '@/lib/calculations';
import type { Show, Expense, FixedExpense, Income, GeneralExpense } from '@/types';

type Props = { shows: Show[]; expenses: Expense[]; fixedExpenses: FixedExpense[]; incomes: Income[]; generalExpenses: GeneralExpense[]; hidden: boolean };

export default function DashboardFinancialCharts({ shows, expenses, fixedExpenses, incomes, generalExpenses, hidden }: Props) {
  const [range, setRange] = useState<FinancialRange>('month');
  const id = useId().replace(/:/g, '');
  const data = buildDashboardFinancialCharts(shows, expenses, fixedExpenses, incomes, generalExpenses, range);
  const money = (value: number) => hidden ? PRIVATE_CURRENCY : formatCurrency(value);
  const privacy = <div className="flex h-full items-center justify-center gap-2 text-muted-foreground"><EyeOff className="h-5 w-5" /><span>Valores ocultos</span></div>;
  return <section className="dashboard-chart-section space-y-6" aria-label="Gráficos financeiros">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">Movimentação financeira</h2>
      <div className="glass-segmented flex gap-1" role="group" aria-label="Período dos gráficos">
        {([['month', 'Mês'], ['quarter', '3 Meses'], ['year', 'Ano']] as const).map(([value, label]) => <Button key={value} size="sm" variant={range === value ? 'secondary' : 'ghost'} aria-pressed={range === value} onClick={() => setRange(value)}>{label}</Button>)}
      </div>
    </div>
    <div className="dashboard-area-chart h-64 w-full min-w-0">
      {hidden ? privacy : <ResponsiveContainer width="100%" height="100%"><AreaChart data={data.trend} margin={{ top: 12, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`${id}-income`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" className="financial-income-stop" stopOpacity={0.35} /><stop offset="100%" className="financial-income-stop" stopOpacity={0} /></linearGradient>
          <linearGradient id={`${id}-expense`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" className="financial-expense-stop" stopOpacity={0.3} /><stop offset="100%" className="financial-expense-stop" stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 6" />
        <XAxis dataKey="label" stroke="var(--chart-axis)" tickLine={false} axisLine={false} minTickGap={18} fontSize={11} />
        <YAxis width={48} stroke="var(--chart-axis)" tickLine={false} axisLine={false} fontSize={10} tickFormatter={v => Number(v).toLocaleString('pt-BR', { notation: 'compact' })} />
        <Tooltip content={({ active, payload, label }) => active && payload?.length ? <div className="financial-chart-tooltip"><p className="text-xs text-muted-foreground mb-2">{range === 'month' ? `Dia ${label}` : label}</p>{payload.map(item => <p key={String(item.dataKey)} className="text-sm">{item.name}: <strong>{money(Number(item.value))}</strong></p>)}</div> : null} />
        <Area type="monotone" dataKey="receitas" name="Receitas" stroke="var(--chart-income)" strokeWidth={2} fill={`url(#${id}-income)`} isAnimationActive={false} />
        <Area type="monotone" dataKey="despesas" name="Despesas" stroke="var(--chart-expense)" strokeWidth={2} fill={`url(#${id}-expense)`} isAnimationActive={false} />
      </AreaChart></ResponsiveContainer>}
    </div>
    <div className="flex gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><i className="chart-dot chart-income-dot" />Receitas</span><span className="flex items-center gap-2"><i className="chart-dot chart-expense-dot" />Despesas</span></div>
    <div className="border-t border-border pt-5">
      <h2 className="text-lg font-semibold">Despesas por categoria</h2>
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-64 w-full max-w-sm min-w-0">
          {!hidden && data.totalGastos > 0 && <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.distribution.filter(item => item.value > 0)} dataKey="value" nameKey="name" innerRadius="72%" outerRadius="92%" paddingAngle={3} stroke="none" isAnimationActive={false}>{data.distribution.filter(item => item.value > 0).map(item => <Cell key={item.name} fill={`var(--chart-category-${data.distribution.findIndex(entry => entry.name === item.name)})`} />)}</Pie><Tooltip content={({ active, payload }) => active && payload?.length ? <div className="financial-chart-tooltip text-sm">{payload[0].name}: {money(Number(payload[0].value))}</div> : null} /></PieChart></ResponsiveContainer>}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center"><span className="text-xs text-muted-foreground">Total de Gastos</span><strong className="text-xl font-semibold text-gold tabular-nums">{money(data.totalGastos)}</strong>{!hidden && data.totalGastos === 0 && <span className="text-xs text-muted-foreground">Sem gastos no período</span>}</div>
        </div>
        <ul className="w-full max-w-sm space-y-3">{data.distribution.map((item, i) => <li key={item.name} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2"><i className={`chart-dot chart-category-${i}`} />{item.name}</span><span className="tabular-nums text-muted-foreground">{money(item.value)}</span></li>)}</ul>
      </div>
    </div>
  </section>;
}