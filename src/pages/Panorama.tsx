import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardFinancialCharts from '@/components/DashboardFinancialCharts';
import ModuleArtwork from '@/components/ModuleArtwork';
import DashboardTrend from '@/components/DashboardTrend';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useRepertoire } from '@/hooks/useRepertoire';
import { calculateMonthlyFinancials, calculateProjectedRevenue, formatCurrency, formatPercentage, generateAlerts, financialDiagnosis, calculateGoalProgress } from '@/lib/calculations';
import { PRIVATE_CURRENCY } from '@/lib/dashboardFinancialCharts';

export default function Panorama() {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const { shows, expenses, fixedExpenses, incomes, generalExpenses, piggyBanks, goalMovements, goals, project, events } = useFinancialData();
  const { songs, setlists } = useRepertoire();
  const monthly = calculateMonthlyFinancials(shows, expenses, fixedExpenses, incomes, new Date(), { goalMovements, piggyBanks });
  const projection = calculateProjectedRevenue(shows);
  const money = (value: number) => hidden ? PRIVATE_CURRENCY : formatCurrency(value);
  const diagnosis = financialDiagnosis(monthly.dre.margemFinal, monthly.faturamentoBruto);
  const alerts = generateAlerts(shows, monthly.dre);
  const trends = Array.from({ length: 6 }, (_, index) => {
    const now = new Date();
    const reference = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return { projection: calculateProjectedRevenue(shows, reference).faturamentoProjetado, result: calculateMonthlyFinancials(shows, expenses, fixedExpenses, incomes, reference, { goalMovements, piggyBanks }).dre.resultadoOperacional };
  });
  const metrics = [
    ['Lucro Líquido Real', money(monthly.lucroLiquidoReal)],
    ['Faturamento Bruto', money(monthly.faturamentoBruto)],
    ['Saldo Disponível no Caixa', money(monthly.saldoDisponivel)],
    ['Projeção de Caixa Futura', money(monthly.projecaoCaixa)],
    ['Faturamento Projetado', money(projection.faturamentoProjetado)],
    ['Custos Totais', money(monthly.totalGastos)],
    ['Reservas', money(piggyBanks.reduce((sum, bank) => sum + bank.valorAtual, 0))],
  ];
  return <div className="space-y-6 max-w-5xl mx-auto">
    <header className="flex items-center gap-3"><Button variant="ghost" size="icon" aria-label="Voltar ao Painel" onClick={() => navigate('/')}><ArrowLeft className="h-5 w-5" /></Button><div className="min-w-0"><h1 className="text-2xl font-semibold">Panorama Visual</h1><p className="text-sm text-muted-foreground">Analytics</p></div><Button className="ml-auto shrink-0 text-gold" variant="outline" size="icon" onClick={() => setHidden(value => !value)} aria-pressed={hidden} aria-label={hidden ? 'Mostrar valores' : 'Ocultar valores'} title={hidden ? 'Mostrar valores' : 'Ocultar valores'}>{hidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</Button></header>
    <div className="grid grid-cols-2 gap-3">{metrics.map(([title, value]) => <div className="thematic-card rounded-lg border p-4 min-w-0" key={title}><ModuleArtwork module="/financas" /><h2 className="text-xs text-muted-foreground">{title}</h2><p className="dashboard-financial-value mt-3 text-gold font-semibold tabular-nums">{value}</p></div>)}</div>
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-border py-5">{[['Shows realizados', shows.filter(s => s.realizado).length], ['Margem do mês', hidden ? '•••' : formatPercentage(monthly.dre.margemFinal)], ['Músicas', songs.length], ['Setlists', setlists.length]].map(([name, value]) => <div key={name}><dt className="text-xs text-muted-foreground">{name}</dt><dd className="mt-2 text-xl font-semibold">{value}</dd></div>)}</dl>
    <section className={`rounded-lg border p-5 space-y-3 ${hidden || diagnosis.tone === 'neutral' ? 'border-border text-muted-foreground' : diagnosis.tone === 'warning' ? 'border-gold/30 bg-gold/5 text-gold' : 'border-success/30 bg-success/5 text-success'}`}><h2 className="text-lg font-semibold">Diagnóstico do Play Pro</h2>{hidden ? <p>Valores ocultos</p> : <><p className="text-2xl font-semibold">{formatPercentage(monthly.dre.margemFinal)} de margem</p><p className="text-sm">{diagnosis.message}</p>{diagnosis.tone === 'success' && <><p className="text-sm">Caixa futuro a receber: {money(monthly.projecaoCaixa)}</p>{goals.map(goal => { const progress = calculateGoalProgress(goal, shows, incomes); return <p key={goal.id} className="text-sm">{goal.nome}: {progress.restante === 0 ? 'meta alcançada' : `${Math.ceil(progress.restante / monthly.lucroLiquidoReal)} mês(es) se todo o lucro atual for aportado`}</p>; })}</>}</>}</section>
    <DashboardFinancialCharts shows={shows} expenses={expenses} fixedExpenses={fixedExpenses} incomes={incomes} generalExpenses={generalExpenses} hidden={hidden} />
    {!hidden && <section className="grid grid-cols-2 gap-4 border-t border-border pt-4"><div><h2 className="text-xs text-muted-foreground">Projeção · 6 meses</h2><DashboardTrend values={trends.map(point => point.projection)} label="Tendência do faturamento projetado em seis meses" tone="gold" /></div><div><h2 className="text-xs text-muted-foreground">Resultado · 6 meses</h2><DashboardTrend values={trends.map(point => point.result)} label="Tendência dos resultados em seis meses" tone="blue" /></div></section>}
    {alerts.map(alert => <p key={alert.id} className="text-sm text-gold border-l-2 border-gold pl-3">{alert.message}</p>)}
    <section className="space-y-3"><h2 className="text-lg font-semibold">Agenda e Projeto</h2><p className="text-sm text-muted-foreground">{events.filter(event => !event.realizado).length} eventos pendentes</p>{project.id && <div><h3 className="font-medium">{project.name}</h3><p className="text-sm text-muted-foreground">{money(project.savedValue)} / {money(project.totalValue)}</p></div>}</section>
    <div className="flex flex-wrap gap-3"><Button onClick={() => navigate('/financas')}>Finanças</Button><Button variant="outline" onClick={() => navigate('/analises')}>Análise por Evento</Button><Button variant="outline" onClick={() => navigate('/agenda')}>Agenda</Button></div>
  </div>;
}