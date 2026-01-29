import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Rocket, 
  Calendar,
  Shield,
  CreditCard,
  MessageSquare,
  Database,
  FileText,
  Smartphone,
  RefreshCw,
  BarChart3,
  Download,
  AlertCircle,
  Clock
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'qa' | 'billing' | 'notifications' | 'security' | 'backup' | 'export' | 'stores';
  responsible?: string;
  completed: boolean;
}

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  responsible?: string;
  lastCompleted?: string;
}

const initialChecklist: ChecklistItem[] = [
  // QA
  { id: 'qa-1', title: 'Testes unitários passando', description: 'Todos os testes automatizados devem estar verdes', category: 'qa', responsible: 'Dev Team', completed: false },
  { id: 'qa-2', title: 'Testes de integração concluídos', description: 'Fluxos principais testados end-to-end', category: 'qa', responsible: 'QA Team', completed: false },
  { id: 'qa-3', title: 'Testes em dispositivos reais', description: 'Testado em iOS e Android físicos', category: 'qa', responsible: 'QA Team', completed: false },
  { id: 'qa-4', title: 'Performance validada', description: 'Tempo de carregamento < 3s, sem memory leaks', category: 'qa', responsible: 'Dev Team', completed: false },
  
  // Billing
  { id: 'billing-1', title: 'Stripe configurado', description: 'Chaves de produção ativas', category: 'billing', responsible: 'Admin', completed: false },
  { id: 'billing-2', title: 'Webhooks ativos', description: 'Endpoints de webhook configurados e testados', category: 'billing', responsible: 'Dev Team', completed: false },
  { id: 'billing-3', title: 'Planos de assinatura criados', description: 'Todos os planos configurados no Stripe', category: 'billing', responsible: 'Product', completed: false },
  { id: 'billing-4', title: 'Fluxo de pagamento testado', description: 'Compra teste realizada com sucesso', category: 'billing', responsible: 'QA Team', completed: false },
  
  // Notifications
  { id: 'notif-1', title: 'Templates WhatsApp aprovados', description: 'Templates enviados e aprovados pela Meta', category: 'notifications', responsible: 'Marketing', completed: false },
  { id: 'notif-2', title: 'Push notifications configuradas', description: 'Firebase Cloud Messaging ativo', category: 'notifications', responsible: 'Dev Team', completed: false },
  { id: 'notif-3', title: 'Email transacional ativo', description: 'Serviço de email configurado (SendGrid/Resend)', category: 'notifications', responsible: 'Dev Team', completed: false },
  
  // Security
  { id: 'sec-1', title: 'RLS policies revisadas', description: 'Todas as tabelas com Row Level Security', category: 'security', responsible: 'Dev Team', completed: false },
  { id: 'sec-2', title: 'API keys rotacionadas', description: 'Chaves de produção diferentes de desenvolvimento', category: 'security', responsible: 'Admin', completed: false },
  { id: 'sec-3', title: 'Certificado SSL válido', description: 'HTTPS ativo em todos os endpoints', category: 'security', responsible: 'DevOps', completed: false },
  { id: 'sec-4', title: 'Auditoria de dependências', description: 'npm audit sem vulnerabilidades críticas', category: 'security', responsible: 'Dev Team', completed: false },
  
  // Backup
  { id: 'backup-1', title: 'Backup automático ativo', description: 'Snapshots diários configurados', category: 'backup', responsible: 'DevOps', completed: false },
  { id: 'backup-2', title: 'Restore testado', description: 'Procedimento de restauração validado', category: 'backup', responsible: 'DevOps', completed: false },
  { id: 'backup-3', title: 'Retenção configurada', description: 'Política de retenção de 30 dias', category: 'backup', responsible: 'Admin', completed: false },
  
  // Export
  { id: 'export-1', title: 'PDF export testado', description: 'Geração de PDF funcionando corretamente', category: 'export', responsible: 'Dev Team', completed: false },
  { id: 'export-2', title: 'Compartilhamento WhatsApp', description: 'Deep links funcionando', category: 'export', responsible: 'Dev Team', completed: false },
  
  // App Stores
  { id: 'store-1', title: 'Screenshots App Store', description: 'Screenshots com tema escuro prontas', category: 'stores', responsible: 'Design', completed: false },
  { id: 'store-2', title: 'Screenshots Play Store', description: 'Screenshots para Android prontas', category: 'stores', responsible: 'Design', completed: false },
  { id: 'store-3', title: 'Metadados das lojas', description: 'Descrições, keywords, categorias definidas', category: 'stores', responsible: 'Marketing', completed: false },
  { id: 'store-4', title: 'Privacy Policy publicada', description: 'Política de privacidade acessível', category: 'stores', responsible: 'Legal', completed: false },
];

const maintenanceTasks: MaintenanceTask[] = [
  // Weekly
  { id: 'maint-w1', title: 'Monitorar erros', description: 'Revisar logs de erro e exceções', frequency: 'weekly', responsible: 'Dev Team' },
  { id: 'maint-w2', title: 'Verificar backups', description: 'Confirmar que backups estão sendo executados', frequency: 'weekly', responsible: 'DevOps' },
  { id: 'maint-w3', title: 'Revisar métricas', description: 'Verificar performance e uptime', frequency: 'weekly', responsible: 'Dev Team' },
  
  // Monthly
  { id: 'maint-m1', title: 'Export de dados', description: 'Gerar relatório mensal de analytics', frequency: 'monthly', responsible: 'Product' },
  { id: 'maint-m2', title: 'Atualizar dependências', description: 'Revisar e atualizar packages', frequency: 'monthly', responsible: 'Dev Team' },
  { id: 'maint-m3', title: 'Revisar custos', description: 'Verificar gastos com infraestrutura', frequency: 'monthly', responsible: 'Admin' },
  { id: 'maint-m4', title: 'Relatório de uso', description: 'Analisar métricas de engajamento', frequency: 'monthly', responsible: 'Product' },
  
  // Quarterly
  { id: 'maint-q1', title: 'Revisar pricing', description: 'Avaliar preços vs concorrência', frequency: 'quarterly', responsible: 'Product' },
  { id: 'maint-q2', title: 'Análise de features', description: 'Revisar uso de funcionalidades', frequency: 'quarterly', responsible: 'Product' },
  { id: 'maint-q3', title: 'Auditoria de segurança', description: 'Revisão completa de segurança', frequency: 'quarterly', responsible: 'Security' },
  { id: 'maint-q4', title: 'Planejamento de upgrades', description: 'Definir roadmap do próximo trimestre', frequency: 'quarterly', responsible: 'Product' },
  { id: 'maint-q5', title: 'Teste de disaster recovery', description: 'Simular recuperação de desastre', frequency: 'quarterly', responsible: 'DevOps' },
];

const rollbackPlan = [
  { step: 1, action: 'Identificar problema', description: 'Analisar logs e métricas para identificar a causa' },
  { step: 2, action: 'Comunicar equipe', description: 'Notificar stakeholders sobre o incidente' },
  { step: 3, action: 'Reverter deploy', description: 'Usar versão anterior estável do código' },
  { step: 4, action: 'Restaurar dados', description: 'Se necessário, restaurar backup mais recente' },
  { step: 5, action: 'Validar sistema', description: 'Executar smoke tests para confirmar estabilidade' },
  { step: 6, action: 'Documentar incidente', description: 'Criar post-mortem com lições aprendidas' },
];

export default function LaunchChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [maintenance, setMaintenance] = useState<MaintenanceTask[]>(maintenanceTasks);

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  const getCategoryIcon = (category: ChecklistItem['category']) => {
    switch (category) {
      case 'qa': return CheckCircle2;
      case 'billing': return CreditCard;
      case 'notifications': return MessageSquare;
      case 'security': return Shield;
      case 'backup': return Database;
      case 'export': return FileText;
      case 'stores': return Smartphone;
      default: return Circle;
    }
  };

  const getCategoryLabel = (category: ChecklistItem['category']) => {
    switch (category) {
      case 'qa': return 'QA & Testes';
      case 'billing': return 'Faturamento';
      case 'notifications': return 'Notificações';
      case 'security': return 'Segurança';
      case 'backup': return 'Backup';
      case 'export': return 'Exportação';
      case 'stores': return 'App Stores';
      default: return category;
    }
  };

  const getFrequencyBadge = (frequency: MaintenanceTask['frequency']) => {
    switch (frequency) {
      case 'weekly':
        return <Badge variant="secondary">Semanal</Badge>;
      case 'monthly':
        return <Badge variant="outline">Mensal</Badge>;
      case 'quarterly':
        return <Badge>Trimestral</Badge>;
      default:
        return null;
    }
  };

  const categories: ChecklistItem['category'][] = ['qa', 'billing', 'notifications', 'security', 'backup', 'export', 'stores'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Launch Checklist</h1>
          <p className="text-muted-foreground">Checklist de lançamento e plano de manutenção</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold">{progressPercentage}%</p>
            <p className="text-sm text-muted-foreground">{completedCount}/{totalCount} itens</p>
          </div>
          {progressPercentage === 100 && (
            <Button className="gap-2">
              <Rocket className="h-4 w-4" />
              Pronto para Launch!
            </Button>
          )}
        </div>
      </div>

      <Progress value={progressPercentage} className="h-3" />

      <Tabs defaultValue="checklist" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checklist" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Checklist
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Manutenção
          </TabsTrigger>
          <TabsTrigger value="rollback" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Rollback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-6">
          {categories.map(category => {
            const categoryItems = checklist.filter(item => item.category === category);
            const categoryCompleted = categoryItems.filter(item => item.completed).length;
            const CategoryIcon = getCategoryIcon(category);

            return (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                      <CardTitle>{getCategoryLabel(category)}</CardTitle>
                    </div>
                    <Badge variant={categoryCompleted === categoryItems.length ? 'default' : 'secondary'}>
                      {categoryCompleted}/{categoryItems.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryItems.map(item => (
                    <div 
                      key={item.id} 
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox 
                        id={item.id}
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={item.id} 
                          className={`font-medium cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {item.title}
                        </label>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      {item.responsible && (
                        <Badge variant="outline" className="text-xs">
                          {item.responsible}
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Weekly */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle>Semanal</CardTitle>
                </div>
                <CardDescription>Tarefas de rotina</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {maintenance.filter(t => t.frequency === 'weekly').map(task => (
                  <div key={task.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    {task.responsible && (
                      <Badge variant="outline" className="text-xs">
                        {task.responsible}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Monthly */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle>Mensal</CardTitle>
                </div>
                <CardDescription>Revisões periódicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {maintenance.filter(t => t.frequency === 'monthly').map(task => (
                  <div key={task.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    {task.responsible && (
                      <Badge variant="outline" className="text-xs">
                        {task.responsible}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quarterly */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle>Trimestral</CardTitle>
                </div>
                <CardDescription>Análises estratégicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {maintenance.filter(t => t.frequency === 'quarterly').map(task => (
                  <div key={task.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    {task.responsible && (
                      <Badge variant="outline" className="text-xs">
                        {task.responsible}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rollback" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Plano de Rollback</CardTitle>
              </div>
              <CardDescription>
                Procedimento de emergência para reverter problemas críticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rollbackPlan.map((step, index) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1 pb-4 border-b last:border-0">
                      <h4 className="font-semibold">{step.action}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contatos de Emergência</CardTitle>
              <CardDescription>Responsáveis por área em caso de incidente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold">Dev Team Lead</h4>
                  <p className="text-sm text-muted-foreground">Problemas técnicos e deploy</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold">DevOps</h4>
                  <p className="text-sm text-muted-foreground">Infraestrutura e banco de dados</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold">Product Owner</h4>
                  <p className="text-sm text-muted-foreground">Decisões de negócio</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold">Suporte ao Cliente</h4>
                  <p className="text-sm text-muted-foreground">Comunicação com usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
