import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MessageCircle,
  Database,
  AlertCircle,
  Settings,
  Filter
} from "lucide-react";
import type { LogEntry } from "@/types/admin";
import { useAdminRows } from "@/hooks/useAdminData";
import { AdminDataState } from "@/components/AdminDataState";

const AdminLogs = () => {
  const notifications = useAdminRows('notification_logs');
  const audits = useAdminRows('admin_audit_logs');
  const logs: LogEntry[] = [
    ...(notifications.data ?? []).map((row): LogEntry => ({
      id: row.id, type: row.delivery_status === 'failed' ? 'error' : 'whatsapp',
      message: row.message_body ?? `Notificação ${row.event_type}`, userId: row.user_id,
      timestamp: row.created_at, details: row.error ?? undefined,
      status: row.delivery_status === 'sent' ? 'success' : row.delivery_status === 'failed' ? 'failed' : 'pending',
    })),
    ...(audits.data ?? []).map((row): LogEntry => ({
      id: row.id, type: 'system', message: `${row.resource}: ${row.action === 'INSERT' ? 'criação' : row.action === 'UPDATE' ? 'alteração' : 'exclusão'}`,
      userName: row.actor_id ?? 'Sistema', timestamp: row.created_at, status: 'success',
      details: `Registro: ${row.record_id}`,
    })),
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<LogEntry['type'] | 'all'>('all');

  const filteredLogs = useMemo(() => {
    let result = logs;
    
    if (selectedType !== 'all') {
      result = result.filter(log => log.type === selectedType);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        log => 
          log.message.toLowerCase().includes(query) ||
          log.userName?.toLowerCase().includes(query) ||
          log.details?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [logs, searchQuery, selectedType]);

  const getTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
      case 'backup': return <Database className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: LogEntry['type']) => {
    switch (type) {
      case 'whatsapp': return 'default';
      case 'backup': return 'secondary';
      case 'error': return 'destructive';
      case 'system': return 'outline';
    }
  };

  const getStatusColor = (status: LogEntry['status']) => {
    switch (status) {
      case 'success': return 'text-success';
      case 'failed': return 'text-destructive';
      case 'pending': return 'text-gold';
    }
  };

  const logTypeCounts = useMemo(() => ({
    all: logs.length,
    whatsapp: logs.filter(l => l.type === 'whatsapp').length,
    backup: logs.filter(l => l.type === 'backup').length,
    error: logs.filter(l => l.type === 'error').length,
    system: logs.filter(l => l.type === 'system').length
  }), [logs]);

  return (
    <AdminLayout title="Logs do Sistema">
      <AdminDataState loading={notifications.isLoading || audits.isLoading} error={notifications.error || audits.error} retry={() => { void notifications.refetch(); void audits.refetch(); }} />
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nos logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('all')}
              >
                <Filter className="h-3 w-3 mr-1" />
                Todos ({logTypeCounts.all})
              </Button>
              <Button
                variant={selectedType === 'whatsapp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('whatsapp')}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                WhatsApp ({logTypeCounts.whatsapp})
              </Button>
              <Button
                variant={selectedType === 'backup' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('backup')}
              >
                <Database className="h-3 w-3 mr-1" />
                Backup ({logTypeCounts.backup})
              </Button>
              <Button
                variant={selectedType === 'error' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('error')}
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Erros ({logTypeCounts.error})
              </Button>
              <Button
                variant={selectedType === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('system')}
              >
                <Settings className="h-3 w-3 mr-1" />
                Sistema ({logTypeCounts.system})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Logs ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      log.type === 'error' ? 'bg-destructive/10 text-destructive' :
                      log.type === 'whatsapp' ? 'bg-success/10 text-success' :
                      log.type === 'backup' ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {getTypeIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getTypeBadgeVariant(log.type)} className="text-xs capitalize">
                          {log.type}
                        </Badge>
                        <span className={`text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status === 'success' ? '✓ Sucesso' : 
                           log.status === 'failed' ? '✗ Falhou' : '○ Pendente'}
                        </span>
                      </div>
                      <p className="font-medium">{log.message}</p>
                      {log.userName && (
                        <p className="text-sm text-muted-foreground">
                          Usuário: {log.userName}
                        </p>
                      )}
                      {log.details && (
                        <p className="text-sm text-muted-foreground mt-1 font-mono bg-muted/50 px-2 py-1 rounded">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum log encontrado para os filtros selecionados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminLogs;
