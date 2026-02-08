import { Calendar, RefreshCw, Link2, Unlink, Clock, ArrowRightLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useSettings } from '@/hooks/useSettings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GoogleCalendarSettings() {
  const { 
    isConnected, 
    status, 
    lastSyncAt, 
    isSyncing,
    connect, 
    disconnect,
    updateSyncSettings,
  } = useGoogleCalendar();
  
  const { settings } = useSettings();
  const googleSettings = settings.googleCalendar;

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Conectado
          </Badge>
        );
      case 'syncing':
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Sincronizando
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Desconectado
          </Badge>
        );
    }
  };

  const getSyncDirectionLabel = (direction: string) => {
    switch (direction) {
      case 'export_only':
        return 'Apenas exportar (Play Pro → Google)';
      case 'import_only':
        return 'Apenas importar (Google → Play Pro)';
      case 'bidirectional':
        return 'Bidirecional';
      default:
        return direction;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-primary/10">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Google Calendar</h2>
          <p className="text-sm text-muted-foreground">Sincronize seus eventos</p>
        </div>
        {getStatusBadge()}
      </div>

      {!isConnected ? (
        // Estado desconectado
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Conecte sua conta Google para sincronizar automaticamente seus shows, ensaios e compromissos com o Google Calendar.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Com a integração você pode:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                Exportar eventos do Play Pro para o Google
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Importar eventos do Google para o Play Pro
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                Manter tudo sincronizado automaticamente
              </li>
            </ul>
          </div>

          <Button 
            onClick={connect}
            className="w-full gap-2"
          >
            <Link2 className="h-4 w-4" />
            Conectar Google Calendar
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Esta funcionalidade será ativada em breve. A estrutura está preparada para integração.
          </p>
        </div>
      ) : (
        // Estado conectado
        <div className="space-y-6">
          {/* Status e última sincronização */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Última sincronização:</span>
            <span className="font-medium">
              {lastSyncAt 
                ? format(new Date(lastSyncAt), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })
                : 'Nunca'
              }
            </span>
          </div>

          <Separator />

          {/* Direção de sincronização */}
          <div className="space-y-2">
            <Label>Direção da sincronização</Label>
            <Select 
              value={googleSettings?.syncDirection || 'export_only'}
              onValueChange={(value) => updateSyncSettings({ 
                syncDirection: value as 'export_only' | 'import_only' | 'bidirectional' 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="export_only">
                  Apenas exportar (Play Pro → Google)
                </SelectItem>
                <SelectItem value="import_only">
                  Apenas importar (Google → Play Pro)
                </SelectItem>
                <SelectItem value="bidirectional">
                  Bidirecional
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {googleSettings?.syncDirection === 'export_only' && 'Seus eventos do Play Pro serão enviados para o Google Calendar.'}
              {googleSettings?.syncDirection === 'import_only' && 'Eventos do Google serão importados para o Play Pro (com confirmação).'}
              {googleSettings?.syncDirection === 'bidirectional' && 'Eventos serão sincronizados em ambas as direções.'}
            </p>
          </div>

          <Separator />

          {/* Auto sync */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sincronização automática</Label>
              <p className="text-xs text-muted-foreground">
                Sincronizar periodicamente em segundo plano
              </p>
            </div>
            <Switch
              checked={googleSettings?.autoSync || false}
              onCheckedChange={(checked) => updateSyncSettings({ autoSync: checked })}
            />
          </div>

          {googleSettings?.autoSync && (
            <div className="space-y-2">
              <Label>Intervalo de sincronização</Label>
              <Select 
                value={String(googleSettings?.syncIntervalMinutes || 30)}
                onValueChange={(value) => updateSyncSettings({ syncIntervalMinutes: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">A cada 15 minutos</SelectItem>
                  <SelectItem value="30">A cada 30 minutos</SelectItem>
                  <SelectItem value="60">A cada hora</SelectItem>
                  <SelectItem value="120">A cada 2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sincronizar agora
            </Button>
            
            <Button 
              variant="destructive" 
              className="gap-2"
              onClick={disconnect}
            >
              <Unlink className="h-4 w-4" />
              Desconectar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
