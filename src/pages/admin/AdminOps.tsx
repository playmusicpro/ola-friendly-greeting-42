 import { useState } from "react";
 import { useAdminOperations } from "@/hooks/useAdminData";
 import { AdminDataState } from "@/components/AdminDataState";
 import AdminLayout from "@/components/AdminLayout";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Textarea } from "@/components/ui/textarea";
 import { Separator } from "@/components/ui/separator";
 import { 
 CheckCircle2, 
 Clock, 
 AlertTriangle, 
 Calendar,
 Shield,
 CreditCard,
 MessageSquare,
 Database,
 FileText,
 Smartphone,
 RotateCcw,
 Activity,
 BarChart3,
 Settings,
 AlertCircle
 } from "lucide-react";
 
 type ChecklistStatus = 'pending' | 'approved' | 'blocked';
 
 interface ChecklistItem {
   id: string;
   title: string;
   description: string;
   status: ChecklistStatus;
   responsible: string;
   notes: string;
   icon: React.ElementType;
 }
 
 interface MaintenanceTask {
   id: string;
   title: string;
   frequency: 'weekly' | 'monthly' | 'quarterly';
   responsible: string;
   lastCompleted?: string;
   icon: React.ElementType;
 }
 
 const initialChecklist: ChecklistItem[] = [
   {
     id: 'qa',
     title: 'QA Aprovado',
     description: 'Testes manuais e automatizados executados com sucesso',
     status: 'pending',
     responsible: 'Tech Lead',
     notes: '',
     icon: CheckCircle2
   },
   {
     id: 'stripe',
     title: 'Stripe Billing Ativo',
     description: 'Webhooks validados e sistema de cobrança operacional',
     status: 'pending',
     responsible: 'Backend Dev',
     notes: '',
     icon: CreditCard
   },
   {
     id: 'whatsapp',
     title: 'Templates WhatsApp Aprovados',
     description: 'Templates de mensagem aprovados e operacionais',
     status: 'pending',
     responsible: 'Product Owner',
     notes: '',
     icon: MessageSquare
   },
   {
     id: 'security',
     title: 'Regras de Segurança Revisadas',
     description: 'Políticas de acesso do Supabase validadas',
     status: 'pending',
     responsible: 'Security Lead',
     notes: '',
     icon: Shield
   },
   {
     id: 'backup',
     title: 'Sistema de Backup Testado',
     description: 'Backup executado com restore bem-sucedido',
     status: 'pending',
     responsible: 'DevOps',
     notes: '',
     icon: Database
   },
   {
     id: 'pdf',
     title: 'Exportação PDF Validada',
     description: 'Serviço de PDF testado em ambiente similar a produção',
     status: 'pending',
     responsible: 'Frontend Dev',
     notes: '',
     icon: FileText
   },
   {
     id: 'stores',
     title: 'Metadata das Lojas Preparado',
     description: 'Screenshots (dark theme), descrições e assets prontos',
     status: 'pending',
     responsible: 'Product Owner',
     notes: '',
     icon: Smartphone
   }
 ];
 
 const maintenanceTasks: MaintenanceTask[] = [
   {
     id: 'error-logs',
     title: 'Monitorar logs de erro',
     frequency: 'weekly',
     responsible: 'DevOps',
     icon: AlertCircle
   },
   {
     id: 'backup-verify',
     title: 'Verificar execução e integridade do backup',
     frequency: 'weekly',
     responsible: 'DevOps',
     icon: Database
   },
   {
     id: 'data-export',
     title: 'Exportar dados core',
     frequency: 'monthly',
     responsible: 'Data Analyst',
     icon: FileText
   },
   {
     id: 'analytics',
     title: 'Gerar relatórios de analytics e performance',
     frequency: 'monthly',
     responsible: 'Product Owner',
     icon: BarChart3
   },
   {
     id: 'pricing-review',
     title: 'Revisar estratégia de pricing',
     frequency: 'quarterly',
     responsible: 'Founder/CEO',
     icon: CreditCard
   },
   {
     id: 'feature-usage',
     title: 'Analisar uso de features',
     frequency: 'quarterly',
     responsible: 'Product Owner',
     icon: Activity
   },
   {
     id: 'upgrade-plan',
     title: 'Planejar upgrades ou deprecações',
     frequency: 'quarterly',
     responsible: 'Tech Lead',
     icon: Settings
   }
 ];
 
 const rollbackPlan = [
   "1. Identificar o problema e documentar evidências",
   "2. Comunicar stakeholders sobre o rollback",
   "3. Reverter deploy para última versão estável",
   "4. Verificar integridade dos dados",
   "5. Executar smoke tests pós-rollback",
   "6. Documentar causa raiz e ações corretivas",
   "7. Agendar nova tentativa de release"
 ];
 
 const getStatusBadge = (status: ChecklistStatus) => {
   switch (status) {
     case 'approved':
       return <Badge className="bg-success/20 text-success border-success/30">Aprovado</Badge>;
     case 'blocked':
       return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Bloqueado</Badge>;
     default:
       return <Badge className="bg-gold/20 text-gold border-gold/30">Pendente</Badge>;
   }
 };
 
 const getFrequencyBadge = (frequency: string) => {
   switch (frequency) {
     case 'weekly':
       return <Badge variant="outline" className="text-primary border-primary/30">Semanal</Badge>;
     case 'monthly':
       return <Badge variant="outline" className="text-gold border-gold/30">Mensal</Badge>;
     case 'quarterly':
       return <Badge variant="outline" className="text-muted-foreground border-border">Trimestral</Badge>;
     default:
       return null;
   }
 };
 
 const AdminOps = () => {
   const operations = useAdminOperations();
   const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
   const checklist: ChecklistItem[] = (operations.data ?? []).filter(row => row.kind === 'checklist').map(row => ({
     id: row.id, title: row.title, description: row.description,
     status: row.status === 'approved' ? 'approved' : row.status === 'blocked' ? 'blocked' : 'pending',
     responsible: row.responsible, notes: row.notes,
     icon: initialChecklist.find(item => item.id === row.id)?.icon ?? CheckCircle2,
   }));
   const tasks = (operations.data ?? []).filter(row => row.kind === 'maintenance');
   const updateStatus = (id: string, status: ChecklistStatus) => {
     const row = operations.data?.find(item => item.id === id);
     if (row) void operations.save([{ ...row, status, notes: draftNotes[id] ?? row.notes }]).catch(() => {});
   };
   const saveNotes = (id: string) => {
     const row = operations.data?.find(item => item.id === id);
     if (row) void operations.save([{ ...row, notes: draftNotes[id] ?? row.notes }]).catch(() => {});
   };
   const initialize = () => void operations.save([
     ...initialChecklist.map(({ icon, ...item }) => ({ ...item, kind: 'checklist' })),
     ...maintenanceTasks.map(({ icon, lastCompleted, ...task }) => ({ ...task, kind: 'maintenance' })),
   ]).catch(() => {});

   const approvedCount = checklist.filter(item => item.status === 'approved').length;
   const blockedCount = checklist.filter(item => item.status === 'blocked').length;
   const pendingCount = checklist.filter(item => item.status === 'pending').length;
 
   return (
     <AdminLayout title="Operações & Lançamento">
       <AdminDataState loading={operations.isLoading} error={operations.error} retry={operations.refetch} />
       {!operations.isLoading && !operations.error && operations.data?.length === 0 && <div className="mb-6 space-y-3"><p className="text-muted-foreground">Nenhuma operação registrada.</p><Button onClick={initialize} disabled={operations.isSaving}>Criar checklist e plano de manutenção</Button></div>}
       {/* Launch Readiness Summary */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <Card className="bg-card border-border/50">
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-success/10">
                 <CheckCircle2 className="h-5 w-5 text-success" />
               </div>
               <div>
                 <p className="text-2xl font-bold text-success">{approvedCount}</p>
                 <p className="text-xs text-muted-foreground">Aprovados</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card className="bg-card border-border/50">
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-gold/10">
                 <Clock className="h-5 w-5 text-gold" />
               </div>
               <div>
                 <p className="text-2xl font-bold text-gold">{pendingCount}</p>
                 <p className="text-xs text-muted-foreground">Pendentes</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card className="bg-card border-border/50">
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-destructive/10">
                 <AlertTriangle className="h-5 w-5 text-destructive" />
               </div>
               <div>
                 <p className="text-2xl font-bold text-destructive">{blockedCount}</p>
                 <p className="text-xs text-muted-foreground">Bloqueados</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card className="bg-card border-border/50">
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-primary/10">
                 <Activity className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{checklist.length ? Math.round((approvedCount / checklist.length) * 100) : 0}%</p>
                 <p className="text-xs text-muted-foreground">Progresso</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Launch Checklist */}
         <Card className="bg-card border-border/50">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <CheckCircle2 className="h-5 w-5 text-primary" />
               Checklist de Lançamento
             </CardTitle>
             <CardDescription>
               Validações obrigatórias antes de publicar o SaaS
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             {checklist.map((item) => (
               <div key={item.id} className="p-4 rounded-lg bg-muted/30 border border-border/30">
                 <div className="flex items-start gap-3">
                   <Checkbox 
                     checked={item.status === 'approved'}
                     onCheckedChange={(checked) => 
                       updateStatus(item.id, checked ? 'approved' : 'pending')
                     }
                     className="mt-1"
                   />
                   <div className="flex-1 space-y-2">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <item.icon className="h-4 w-4 text-muted-foreground" />
                         <span className="font-medium">{item.title}</span>
                       </div>
                       {getStatusBadge(item.status)}
                     </div>
                     <p className="text-sm text-muted-foreground">{item.description}</p>
                     <div className="flex items-center gap-4 text-xs text-muted-foreground">
                       <span>Responsável: <span className="text-foreground">{item.responsible}</span></span>
                     </div>
                     <div className="flex gap-2 pt-2">
                       <Button
                         size="sm"
                         variant={item.status === 'approved' ? 'default' : 'outline'}
                         onClick={() => updateStatus(item.id, 'approved')}
                         className="h-7 text-xs"
                       >
                         Aprovar
                       </Button>
                       <Button
                         size="sm"
                         variant={item.status === 'blocked' ? 'destructive' : 'outline'}
                         onClick={() => updateStatus(item.id, 'blocked')}
                         className="h-7 text-xs"
                       >
                         Bloquear
                       </Button>
                     </div>
                     <Textarea
                       placeholder="Notas de validação..."
                       value={draftNotes[item.id] ?? item.notes}
                       onChange={(e) => setDraftNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                       className="mt-2 text-sm min-h-[60px]"
                     />
                     <Button size="sm" variant="outline" disabled={operations.isSaving} onClick={() => saveNotes(item.id)}>Salvar notas</Button>
                   </div>
                 </div>
               </div>
             ))}
           </CardContent>
         </Card>
 
         {/* Maintenance Schedule & Rollback */}
         <div className="space-y-6">
           {/* Maintenance Schedule */}
           <Card className="bg-card border-border/50">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Calendar className="h-5 w-5 text-primary" />
                 Plano de Manutenção
               </CardTitle>
               <CardDescription>
                 Rotinas operacionais recorrentes
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-3">
               {tasks.map((task) => (
                 <div 
                   key={task.id} 
                   className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                 >
                   <div className="flex items-center gap-3">
                     <Calendar className="h-4 w-4 text-muted-foreground" />
                     <div>
                       <p className="text-sm font-medium">{task.title}</p>
                       <p className="text-xs text-muted-foreground">
                         Responsável: {task.responsible}
                       </p>
                     </div>
                   </div>
                   <div className="space-y-2 text-right">
                     {getFrequencyBadge(task.frequency ?? '')}
                     <p className="text-xs text-muted-foreground">{task.last_completed_at ? new Date(task.last_completed_at).toLocaleString('pt-BR') : 'Não executada'}</p>
                     <Button size="sm" variant="outline" disabled={operations.isSaving} onClick={() => void operations.save([{ ...task, last_completed_at: new Date().toISOString(), status: 'approved' }]).catch(() => {})}>Registrar conclusão</Button>
                   </div>
                 </div>
               ))}
             </CardContent>
           </Card>
 
           {/* Rollback Plan */}
           <Card className="bg-card border-border/50">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <RotateCcw className="h-5 w-5 text-destructive" />
                 Plano de Rollback
               </CardTitle>
               <CardDescription>
                 Procedimento em caso de falha no release
               </CardDescription>
             </CardHeader>
             <CardContent>
               <ol className="space-y-2">
                 {rollbackPlan.map((step, index) => (
                   <li 
                     key={index}
                     className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                   >
                     <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 text-destructive text-xs flex items-center justify-center font-medium">
                       {index + 1}
                     </span>
                     <span className="text-sm text-muted-foreground pt-0.5">
                       {step.substring(3)}
                     </span>
                   </li>
                 ))}
               </ol>
             </CardContent>
           </Card>
         </div>
       </div>
     </AdminLayout>
   );
 };
 
 export default AdminOps;