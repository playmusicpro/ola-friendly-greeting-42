import { useState, useEffect } from 'react';

interface GoogleCalendarSettings {
  enabled: boolean;
  status: 'disconnected' | 'connected' | 'syncing' | 'error';
  connectedAt?: string;
  lastSyncAt?: string;
  defaultCalendarId?: string;
  syncDirection: 'export_only' | 'import_only' | 'bidirectional';
  autoSync: boolean;
  syncIntervalMinutes: number;
}

interface UserSettings {
  nomeArtistico: string;
  email: string;
  generoMusical: string;
  cidade: string;
  telefone: string;
  hotmartUrl: string;
  autoBackup: boolean;
  googleCalendar: GoogleCalendarSettings;
}

const SETTINGS_KEY = 'playpro_settings';

const defaultGoogleCalendarSettings: GoogleCalendarSettings = {
  enabled: false,
  status: 'disconnected',
  syncDirection: 'export_only',
  autoSync: false,
  syncIntervalMinutes: 30,
};

const defaultSettings: UserSettings = {
  nomeArtistico: '',
  email: '',
  generoMusical: '',
  cidade: '',
  telefone: '',
  hotmartUrl: '',
  autoBackup: true,
  googleCalendar: defaultGoogleCalendarSettings,
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch {
        setSettings(defaultSettings);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    updateSettings({ [key]: value });
  };

  return {
    settings,
    isLoaded,
    updateSettings,
    updateSetting,
  };
}
