import { describe, expect, it } from 'vitest';
import { calculateMonthlyFinancials, financialDiagnosis, showOutstanding, calculateGoalProgress } from '../calculations';
import { buildDashboardFinancialCharts } from '../dashboardFinancialCharts';
import type { Show, GoalMovement, PiggyBank } from '@/types';

const now = new Date(2026, 9, 25);
const show: Show = { id:'s', date:'2026-10-28', time:'20:00', local:'Palco', tipo:'Bar', cache:1000, numMusicos:2, consumacao:50, combustivel:100, kmRodados:0, pedagio:0, roupas:0, equipamentos:0, outrosCustos:0, pagamentoMusicos:200, cashTracking:true, depositAmount:500, depositReceived:true, depositDate:'2026-10-20', realizado:false, settled:false, deductTeam:false };
const calc = (s: Show = show, goals: GoalMovement[] = [], banks: PiggyBank[] = []) => calculateMonthlyFinancials([s], [], [], [], now, { goalMovements:goals, piggyBanks:banks });
describe('Matriz financeira de caixa', () => {
  it('sinal de 50% recebido reconhece 500 reais e projeta os outros 500 antes da realização', () => {
    expect(calc().faturamentoBruto).toBe(500);
    expect(calc().projecaoCaixa).toBe(500);
  });
  it('aceita sinal editável de 300 sem impor 50%', () => {
    expect(calc({...show,depositAmount:300}).faturamentoBruto).toBe(300);
    expect(showOutstanding({...show,depositAmount:300})).toBe(700);
  });
  it('realização não implica quitação', () => {
    expect(calc({...show,realizado:true}).faturamentoBruto).toBe(500);
    expect(calc({...show,realizado:true}).projecaoCaixa).toBe(500);
  });
  it('quitação transfere restante para faturamento sem duplicar sinal', () => {
    const result=calc({...show,realizado:true,settled:true,settlementDate:'2026-10-28'});
    expect(result.faturamentoBruto).toBe(1000);
    expect(result.projecaoCaixa).toBe(0);
  });
  it('respeita mês de recebimento mesmo se show ocorre em outro mês', () => {
    expect(calc({...show,date:'2026-11-28'}).faturamentoBruto).toBe(500);
    expect(calc({...show,date:'2026-11-28'}).projecaoCaixa).toBe(0);
  });
  it('checkbox de equipe desconta 200 uma vez sem duplicar despesa espelhada', () => {
    const paid={...show,realizado:true,deductTeam:true,teamPaymentDate:'2026-10-28'};
    const expense={id:'e',showId:'s',origin:'team_payment',amount:200,date:'2026-10-28',category:'equipamentos' as const,description:'Equipe'};
    expect(calculateMonthlyFinancials([paid],[expense],[],[],now).totalGastos).toBe(350);
    expect(buildDashboardFinancialCharts([paid],[expense],[],[],[],'month',now).totalGastos).toBe(350);
    expect(calc({...paid,deductTeam:false}).totalGastos).toBe(150);
  });
  it('calcula FB, MC, DF e LL descontando aporte de meta', () => {
    const paid={...show,realizado:true,settled:true,settlementDate:'2026-10-28',deductTeam:true,teamPaymentDate:'2026-10-28'};
    const result=calculateMonthlyFinancials([paid],[],[{id:'f',description:'MEI',amount:100,dueDay:1}],[{id:'i',description:'Aula',amount:200,date:'2026-10-24',source:'lessons'}],now,{goalMovements:[{id:'g',goalId:'g',tipo:'deposito',valor:150,date:'2026-10-24'}]});
    expect(result.faturamentoBruto).toBe(1200);
    expect(result.margemContribuicao).toBe(850);
    expect(result.lucroLiquidoReal).toBe(600);
    expect(result.dre.margemFinal).toBe(50);
  });
  it('cofrinho reduz apenas saldo disponível e resgate o devolve sem receita nova', () => {
    const bank:PiggyBank={id:'b',nome:'Reserva',criadoEm:'',valorAtual:80,historico:[{id:'d',tipo:'deposito',valor:100,data:'2026-10-24'},{id:'r',tipo:'retirada',valor:20,data:'2026-10-25'}]};
    const result=calc(show,[],[bank]);
    expect(result.lucroLiquidoReal).toBe(500);
    expect(result.saldoDisponivel).toBe(420);
    expect(result.faturamentoBruto).toBe(500);
  });
  it('não transforma faturamento em saldo reservado da meta',()=>{
    expect(calculateGoalProgress({id:'g',nome:'Meta',valorMeta:1000,periodo:'mensal',dataInicio:'2026-10-01',dataFim:'2026-10-31',criadoEm:'',saldoAjuste:100},[{...show,realizado:true}],[],now).realizado).toBe(100);
  });
  it('margem abaixo de 40 gera alerta, 40 não gera alerta baixo',()=>{
    expect(financialDiagnosis(39.99,1000).tone).toBe('warning');
    expect(financialDiagnosis(40,1000).tone).toBe('neutral');
  });
  it('margem a partir de 60 gera mensagem verde, 59.99 não',()=>{
    expect(financialDiagnosis(60,1000).tone).toBe('success');
    expect(financialDiagnosis(59.99,1000).tone).toBe('neutral');
  });
});