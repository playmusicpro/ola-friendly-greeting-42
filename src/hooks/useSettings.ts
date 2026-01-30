import { useState, useEffect } from 'react';

interface UserSettings {
  nomeArtistico: string;
  email: string;
  generoMusical: string;
  cidade: string;
  telefone: string;
  hotmartUrl: string;
  autoBackup: boolean;
}

const SETTINGS_KEY = 'playpro_settings';

const defaultSettings: UserSettings = {
  nomeArtistico: '',
  email: '',
  generoMusical: '',
  cidade: '',
  telefone: '',
  hotmartUrl: '',
  autoBackup: true,
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
