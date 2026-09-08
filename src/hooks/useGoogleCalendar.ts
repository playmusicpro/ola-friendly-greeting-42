import { useState, useCallback } from 'react';
import { useSettings } from './useSettings';
import { Event, GoogleCalendarEvent, SyncResult, GoogleCalendarStatus } from '@/types';
import { useToast } from './use-toast';

interface UseGoogleCalendarReturn {
  // Status
  isConnected: boolean;
  status: GoogleCalendarStatus;
  lastSyncAt: string | null;
  isSyncing: boolean;
  
  // Actions (mock - preparados para integração real)
  connect: () => Promise<boolean>;
  disconnect: () => void;
  syncNow: (events: Event[]) => Promise<SyncResult>;
  exportEvent: (event: Event) => Promise<{ success: boolean; googleEventId?: string }>;
  importEvents: () => Promise<GoogleCalendarEvent[]>;
  
  // Settings
  updateSyncSettings: (settings: Partial<{
    syncDirection: 'export_only' | 'import_only' | 'bidirectional';
    autoSync: boolean;
    syncIntervalMinutes: number;
  }>) => void;
  
  // Pending imports (eventos aguardando confirmação do usuário)
  pendingImports: GoogleCalendarEvent[];
  confirmImport: (events: GoogleCalendarEvent[]) => void;
  clearPendingImports: () => void;
}

export function useGoogleCalendar(): UseGoogleCalendarReturn {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingImports, setPendingImports] = useState<GoogleCalendarEvent[]>([]);

  const googleSettings = settings.googleCalendar;
  const isConnected = googleSettings?.status === 'connected';
  const status = googleSettings?.status || 'disconnected';
  const lastSyncAt = googleSettings?.lastSyncAt || null;

  // Mock connect - será substituído por OAuth real
  const connect = useCallback(async (): Promise<boolean> => {
    // MOCK: Simula processo de conexão
    // Em produção, isso iniciará o fluxo OAuth do Google
    
    toast({
      title: "Conexão com Google Calendar",
      description: "Esta funcionalidade será ativada em breve. A estrutura está preparada.",
    });
    
    // Para demonstração, podemos simular uma conexão bem-sucedida
    // Descomente abaixo para testar o fluxo de UI:
    /*
    updateSettings({
      googleCalendar: {
        ...googleSettings,
        enabled: true,
        status: 'connected',
        connectedAt: new Date().toISOString(),
      }
    });
    return true;
    */
    
    return false;
  }, [toast, googleSettings, updateSettings]);

  // Disconnect
  const disconnect = useCallback(() => {
    updateSettings({
      googleCalendar: {
        enabled: false,
        status: 'disconnected',
        connectedAt: undefined,
        lastSyncAt: undefined,
        defaultCalendarId: undefined,
        syncDirection: 'export_only',
        autoSync: false,
        syncIntervalMinutes: 30,
      }
    });
    
    toast({
      title: "Desconectado",
      description: "Google Calendar foi desconectado.",
    });
  }, [updateSettings, toast]);

  // Mock sync - será substituído por chamadas reais à API
  const syncNow = useCallback(async (events: Event[]): Promise<SyncResult> => {
    if (!isConnected) {
      return {
        success: false,
        eventsExported: 0,
        eventsImported: 0,
        errors: ['Google Calendar não está conectado'],
        timestamp: new Date().toISOString(),
      };
    }

    setIsSyncing(true);
    
    // MOCK: Simula sincronização
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result: SyncResult = {
      success: true,
      eventsExported: events.filter(e => !e.googleEventId).length,
      eventsImported: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };
    
    updateSettings({
      googleCalendar: {
        ...googleSettings,
        lastSyncAt: result.timestamp,
      }
    });
    
    setIsSyncing(false);
    
    toast({
      title: "Sincronização concluída",
      description: `${result.eventsExported} eventos exportados.`,
    });
    
    return result;
  }, [isConnected, googleSettings, updateSettings, toast]);

  // Export single event
  const exportEvent = useCallback(async (event: Event): Promise<{ success: boolean; googleEventId?: string }> => {
    if (!isConnected) {
      toast({
        title: "Erro",
        description: "Conecte o Google Calendar primeiro.",
        variant: "destructive",
      });
      return { success: false };
    }

    // MOCK: Simula exportação
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockGoogleEventId = `google_${event.id}_${Date.now()}`;
    
    toast({
      title: "Evento exportado",
      description: `"${event.title}" foi enviado para o Google Calendar.`,
    });
    
    return { success: true, googleEventId: mockGoogleEventId };
  }, [isConnected, toast]);

  // Importação real: exige credenciais OAuth do Google configuradas
  const importEvents = useCallback(async (): Promise<GoogleCalendarEvent[]> => {
    toast({
      title: "Importação indisponível",
      description:
        "A importação de eventos exige a autorização da sua conta Google. Conecte o Google Agenda para liberar.",
    });
    setPendingImports([]);
    return [];
  }, [toast]);

  // Confirm import
  const confirmImport = useCallback((events: GoogleCalendarEvent[]) => {
    // Aqui seria onde convertemos GoogleCalendarEvent para Event
    // e adicionamos ao sistema via useFinancialData.addEvent
    
    toast({
      title: "Eventos importados",
      description: `${events.length} eventos foram adicionados à sua agenda.`,
    });
    
    setPendingImports([]);
  }, [toast]);

  // Clear pending imports
  const clearPendingImports = useCallback(() => {
    setPendingImports([]);
  }, []);

  // Update sync settings
  const updateSyncSettings = useCallback((newSettings: Partial<{
    syncDirection: 'export_only' | 'import_only' | 'bidirectional';
    autoSync: boolean;
    syncIntervalMinutes: number;
  }>) => {
    updateSettings({
      googleCalendar: {
        ...googleSettings,
        ...newSettings,
      }
    });
  }, [googleSettings, updateSettings]);

  return {
    isConnected,
    status,
    lastSyncAt,
    isSyncing,
    connect,
    disconnect,
    syncNow,
    exportEvent,
    importEvents,
    updateSyncSettings,
    pendingImports,
    confirmImport,
    clearPendingImports,
  };
}
