import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CalendarDays, Clock, ArrowUpRight, Plus, ChevronRight, PiggyBank } from 'lucide-react';
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
import { calculateMonthlyFinancials, formatCurrency } from '@/lib/calculations';
import { formatDateBR } from '@/lib/dateUtils';
import Onboarding from '@/components/Onboarding';
import { GoogleCalendarShowButton } from '@/components/GoogleCalendarShowButton';
import { GoalForm } from '@/components/GoalForm';
import { ExpenseForm } from '@/components/ExpenseForm';
import { PiggyBankForm } from '@/components/PiggyBankForm';
import { EventQuickForm } from '@/components/EventQuickForm';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const displayName = profile?.name?.trim() || 'Músico';
  const { nextShow, shows, expenses, fixedExpenses, incomes, piggyBanks, addGoal, addGeneralExpense, addPiggyBank, addEvent } = useFinancialData();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showPiggyForm, setShowPiggyForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const { showOnboarding, setShowOnboarding, completeOnboarding } = useOnboarding();
  useShowNotifications(shows);
  const monthly = calculateMonthlyFinancials(shows, expenses, fixedExpenses, incomes);
  const handleAddEvent = (data: { nomeEvento: string; dataEvento: string; horaEvento: string; local?: string; observacoes?: string }) => addEvent({ title: data.nomeEvento, tipo: 'Show', date: data.dataEvento, startTime: data.horaEvento, local: data.local, notes: data.observacoes, realizado: false });
  return <>
    <Onboarding isOpen={showOnboarding} onComplete={completeOnboarding} onClose={() => setShowOnboarding(false)} />
    <GoalForm open={showGoalForm} onOpenChange={setShowGoalForm} onSubmit={data => { void addGoal(data); }} />
    <ExpenseForm open={showExpenseForm} onOpenChange={setShowExpenseForm} onSubmit={data => { void addGeneralExpense(data); }} />
    <PiggyBankForm open={showPiggyForm} onOpenChange={setShowPiggyForm} onSubmit={data => { void addPiggyBank(data); }} />
    <EventQuickForm open={showEventForm} onOpenChange={setShowEventForm} onSubmit={handleAddEvent} />
    <div className="dashboard-content space-y-5">
      <header className="flex items-center gap-3 pb-1"><ProfileAvatar name={displayName} /><h1 className="text-base font-bold min-w-0 truncate">Olá, {displayName.split(' ')[0].toUpperCase()}</h1></header>
        <Card className="dashboard-next-show relative overflow-hidden">
          <div className="dashboard-show-art" aria-hidden="true"><img src={concertImage} width={1024} height={768} alt="" /><CalendarDays className="dashboard-calendar-lit" /></div>
          <CardContent className="relative z-10 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2 text-gold text-sm font-medium"><Calendar className="h-4 w-4" />Próximo Show</div>
              <Badge variant="outline" className="border-gold/20 bg-gold/5 text-gold text-xs">{nextShow ? 'Agendado' : 'Sua agenda'}</Badge>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="dashboard-show-title text-2xl sm:text-3xl font-semibold break-words">{nextShow?.title || nextShow?.local || 'O palco espera por você'}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                  {nextShow ? <><span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDateBR(nextShow.date)}</span>{nextShow.time && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{nextShow.time}</span>}</> : <span>Nenhum show agendado</span>}
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label={nextShow ? 'Ver próximo show' : 'Adicionar show'} className="shrink-0 rounded-full border border-gold/20 text-gold" onClick={() => nextShow ? navigate('/agenda') : setShowEventForm(true)}>{nextShow ? <ArrowUpRight className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</Button>
            </div>
            {nextShow && <div className="mt-4"><GoogleCalendarShowButton show={nextShow} /></div>}
            <Button variant="outline" className="dashboard-itinerary mt-5 gap-2 text-xs" onClick={() => navigate('/agenda')}>Ver Roteiro do Show<ChevronRight className="h-4 w-4" /></Button>
          </CardContent>
        </Card>

        <Card className="thematic-card"><ModuleArtwork module="/financas" /><CardContent className="p-5"><div className="flex justify-between items-center gap-3"><h2 className="text-sm text-muted-foreground">Resumo do Saldo · Mês</h2><Button variant="ghost" size="icon" aria-label="Abrir Finanças" onClick={() => navigate('/financas')}><ArrowUpRight className="h-4 w-4 text-gold" /></Button></div><p className="dashboard-financial-value text-gold font-semibold mt-2">{formatCurrency(monthly.dre.resultadoOperacional)}</p><div className="flex flex-wrap justify-between gap-3 mt-4 text-xs text-muted-foreground"><span>Gastos: {formatCurrency(monthly.totalGastos)}</span><span>Reservas: {formatCurrency(piggyBanks.reduce((sum, bank) => sum + bank.valorAtual, 0))}</span></div></CardContent></Card>
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

    </div>
  </>;
}
