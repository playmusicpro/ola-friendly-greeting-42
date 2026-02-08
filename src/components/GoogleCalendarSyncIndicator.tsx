import { Calendar, RefreshCw, CheckCircle2, AlertCircle, Loader2, CloudOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function GoogleCalendarSyncIndicator() {
  const { isConnected, status, isSyncing, lastSyncAt } = useGoogleCalendar();
  const navigate = useNavigate();

  if (!isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/configuracoes')}
            >
              <CloudOff className="h-4 w-4" />
              <span className="hidden sm:inline">Google Calendar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clique para conectar o Google Calendar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getStatusIcon = () => {
    if (isSyncing) {
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    }
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    if (isSyncing) return 'Sincronizando...';
    switch (status) {
      case 'connected':
        return 'Sincronizado';
      case 'error':
        return 'Erro na sincronização';
      default:
        return 'Google Calendar';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
            {getStatusIcon()}
            <span className="text-sm hidden sm:inline">{getStatusText()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {lastSyncAt ? (
            <p>Última sincronização: {new Date(lastSyncAt).toLocaleString('pt-BR')}</p>
          ) : (
            <p>Google Calendar conectado</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
