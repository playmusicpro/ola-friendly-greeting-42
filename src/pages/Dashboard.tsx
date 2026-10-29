import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CalendarDays, Clock, ArrowUpRight, Plus, ChevronRight, PiggyBank, Eye, EyeOff, Edit, Copy, Share2 } from 'lucide-react';
import ProfileAvatar from '@/components/ProfileAvatar';
import ModuleArtwork from '@/components/ModuleArtwork';
import concertImage from '@/assets/dashboard-concert.jpg';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useShowNotifications } from '@/hooks/useShowNotifications';
import { useOnboarding } from '@/hooks/useOnboarding';
import { calculateMonthlyFinancials, calculateProjectedRevenue, formatCurrency, formatPercentage } from '@/lib/calculations';
import { PRIVATE_CURRENCY } from '@/lib/dashboardFinancialCharts';
import DashboardOperations from '@/components/DashboardOperations';
import { formatDateBR } from '@/lib/dateUtils';
import Onboarding from '@/components/Onboarding';
import { GoogleCalendarShowButton } from '@/components/GoogleCalendarShowButton';
import { OpenInMapsButton } from '@/components/OpenInMapsButton';
import { GoalForm } from '@/components/GoalForm';
import { ExpenseForm } from '@/components/ExpenseForm';
import { PiggyBankForm } from '@/components/PiggyBankForm';
import { ShowForm } from '@/components/ShowForm';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const displayName = profile?.name?.trim() || 'Músico';
  const { nextShow, shows, expenses, fixedExpenses, incomes, piggyBanks, goalMovements, addShow, updateShow, duplicateShow, addGoal, addGeneralExpense, addPiggyBank } = useFinancialData();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showPiggyForm, setShowPiggyForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingNextShow, setEditingNextShow] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Só permite editar/duplicar quando o próximo show é um registro real de show (não um evento legado sem financeiro).
  const nextShowRecord = nextShow ? shows.find(s => s.id === nextShow.id) : undefined;
  const nextShowDays = nextShow ? Math.ceil((new Date(`${nextShow.date}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000) : 0;
  const nextShowCountdown = !nextShow ? '' : nextShowDays <= 0 ? 'Hoje' : nextShowDays === 1 ? 'Amanhã' : `Em ${nextShowDays} dias`;
  const shareNextShow = () => {
    if (!nextShow) return;
    const msg = `*${nextShow.title || nextShow.local}*\nData: ${formatDateBR(nextShow.date)}\nHorário: ${nextShow.time}\nLocal: ${nextShow.local}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };
  const money = (value: number) => hidden ? PRIVATE_CURRENCY : formatCurrency(value);
  const { showOnboarding, setShowOnboarding, completeOnboarding } = useOnboarding();
  useShowNotifications(shows);
  const monthly = calculateMonthlyFinancials(shows, expenses, fixedExpenses, incomes, new Date(), { goalMovements, piggyBanks });
  const projection = calculateProjectedRevenue(shows);
  const metrics = [
    { title: 'Faturamento Bruto', value: monthly.faturamentoBruto, module: '/financas' },
    { title: 'Custos Totais', value: monthly.totalGastos, module: '/receitas' },
    { title: 'Lucro Líquido Real', value: monthly.lucroLiquidoReal, module: '/financas' },
    { title: 'Faturamento Projetado', value: projection.faturamentoProjetado, module: '/financas' },
    { title: 'Projeção de Caixa Futura', value: monthly.projecaoCaixa, module: '/financas' },
    { title: 'Reservas', value: piggyBanks.reduce((sum, bank) => sum + bank.valorAtual, 0), module: 'savings' },
  ];
  return <>
    <Onboarding isOpen={showOnboarding} onComplete={completeOnboarding} onClose={() => setShowOnboarding(false)} />
    <GoalForm open={showGoalForm} onOpenChange={setShowGoalForm} onSubmit={data => { void addGoal(data); }} />
    <ExpenseForm open={showExpenseForm} onOpenChange={setShowExpenseForm} onSubmit={data => { void addGeneralExpense(data); }} />
    <PiggyBankForm open={showPiggyForm} onOpenChange={setShowPiggyForm} onSubmit={data => { void addPiggyBank(data); }} />
    <ShowForm open={showEventForm} onOpenChange={setShowEventForm} onSubmit={addShow} />
    <ShowForm open={editingNextShow && !!nextShowRecord} onOpenChange={setEditingNextShow} initialData={nextShowRecord} onSubmit={data => nextShowRecord ? updateShow(nextShowRecord.id, data) : false} />
    <div className="dashboard-content space-y-5">
      <header className="flex items-center gap-3 pb-1"><ProfileAvatar name={displayName} /><h1 className="text-base font-bold min-w-0 truncate">Olá, {displayName.split(' ')[0].toUpperCase()}</h1><Button className="ml-auto shrink-0 text-gold" variant="ghost" size="icon" aria-label={hidden ? 'Mostrar valores' : 'Ocultar valores'} title={hidden ? 'Mostrar valores' : 'Ocultar valores'} aria-pressed={hidden} onClick={() => setHidden(value => !value)}>{hidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</Button></header>
        <div
          className="next-show-vip"
          data-status={nextShow?.realizado ? 'realizado' : 'agendado'}
          role="button"
          tabIndex={0}
          aria-label={nextShow ? `Próximo show: ${nextShow.title || nextShow.local}` : 'Adicionar show'}
          onClick={() => nextShow ? navigate('/agenda') : setShowEventForm(true)}
          onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); nextShow ? navigate('/agenda') : setShowEventForm(true); } }}
        >
          <div className="dashboard-show-art" aria-hidden="true"><img src={concertImage} width={1024} height={768} alt="" /><CalendarDays className="dashboard-calendar-lit" /></div>
          <div className="relative z-10 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2 text-gold text-sm font-medium"><Calendar className="h-4 w-4" />Próximo Show</div>
              {nextShow ? <span className="next-show-countdown" data-status={nextShow.realizado ? 'realizado' : 'agendado'}><Clock className="h-3.5 w-3.5" />{nextShowCountdown}</span> : <Badge variant="outline" className="border-gold/20 bg-gold/5 text-gold text-xs">Sua agenda</Badge>}
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="dashboard-show-title text-2xl sm:text-3xl font-semibold break-words">{nextShow?.title || nextShow?.local || 'O palco espera por você'}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                  {nextShow ? <><span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDateBR(nextShow.date)}</span>{nextShow.time && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{nextShow.time}</span>}</> : <span>Nenhum show agendado</span>}
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label={nextShow ? 'Ver próximo show' : 'Adicionar show'} className="shrink-0 rounded-full border border-gold/20 text-gold" onClick={event => { event.stopPropagation(); nextShow ? navigate('/agenda') : setShowEventForm(true); }}>{nextShow ? <ArrowUpRight className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</Button>
            </div>
            {nextShow && <div className="mt-4 flex flex-wrap gap-2" onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
              <GoogleCalendarShowButton show={nextShow} />
              <OpenInMapsButton destination={nextShow.address || nextShow.local} />
              {nextShowRecord && <>
                <Button variant="outline" size="sm" aria-label="Editar próximo show" onClick={() => setEditingNextShow(true)}><Edit className="h-4 w-4 mr-1" />Editar</Button>
                <Button variant="outline" size="sm" aria-label="Duplicar próximo show" onClick={() => duplicateShow(nextShowRecord.id)}><Copy className="h-4 w-4 mr-1" />Duplicar</Button>
              </>}
              <Button variant="outline" size="sm" aria-label="Compartilhar próximo show no WhatsApp" onClick={shareNextShow}><Share2 className="h-4 w-4 mr-1" />WhatsApp</Button>
            </div>}
            <Button variant="outline" className="dashboard-itinerary mt-5 gap-2 text-xs" onClick={event => { event.stopPropagation(); navigate('/agenda'); }}>Ver Roteiro do Show<ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <Card className="thematic-card"><ModuleArtwork module="/financas" /><CardContent className="p-5"><div className="flex justify-between items-center gap-3"><h2 className="text-sm text-muted-foreground">Saldo Disponível no Caixa · Mês</h2><Button variant="ghost" size="icon" aria-label="Abrir Finanças" onClick={() => navigate('/financas')}><ArrowUpRight className="h-4 w-4 text-gold" /></Button></div><p className="dashboard-financial-value text-gold font-semibold mt-2">{money(monthly.saldoDisponivel)}</p><div className="flex flex-wrap justify-between gap-3 mt-4 text-xs text-muted-foreground"><span>Gastos: {money(monthly.totalGastos)}</span><span>Reservas: {money(piggyBanks.reduce((sum, bank) => sum + bank.valorAtual, 0))}</span></div></CardContent></Card>
        {/* Quick Actions */}
        <Card className="p-6 shadow-lg border-primary/10">
          <h2 className="text-xl font-semibold mb-4 text-gold">Atalhos Rápidos</h2>
          <div className="dashboard-quick-actions grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button onClick={() => setShowEventForm(true)} className="module-navigation h-auto py-6 flex-col gap-3 w-full">
              <ModuleArtwork module="show" />
              <Plus className="h-7 w-7" />
              <span className="font-semibold">Adicionar Show</span>
            </Button>
            <Button onClick={() => setShowExpenseForm(true)} className="module-navigation h-auto py-6 flex-col gap-3 w-full">
              <ModuleArtwork module="/financas" />
              <Plus className="h-7 w-7" />
              <span className="font-semibold">Adicionar Gasto</span>
            </Button>
            <Button onClick={() => setShowGoalForm(true)} className="module-navigation h-auto py-6 flex-col gap-3 w-full">
              <ModuleArtwork module="/analises" />
              <Plus className="h-7 w-7" />
              <span className="font-semibold">Adicionar Meta</span>
            </Button>
            <Button onClick={() => setShowPiggyForm(true)} className="module-navigation h-auto py-6 flex-col gap-3 w-full">
              <ModuleArtwork module="savings" />
              <PiggyBank className="h-7 w-7" />
              <span className="font-semibold">Adicionar Cofrinho</span>
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:gap-5">{metrics.map(metric => <Card key={metric.title} className="thematic-card min-w-0"><ModuleArtwork module={metric.module} /><CardContent className="p-4 sm:p-5"><h2 className="text-sm text-muted-foreground">{metric.title}</h2><p className="dashboard-financial-value mt-3 font-semibold text-gold tabular-nums">{money(metric.value)}</p>{metric.title === 'Lucro Líquido Real' && !hidden && <Badge variant="outline" className="mt-3 text-xs text-gold">{formatPercentage(monthly.dre.margemFinal)} de margem</Badge>}</CardContent></Card>)}</div>
        <DashboardOperations hidden={hidden} />
    </div>
  </>;
}
