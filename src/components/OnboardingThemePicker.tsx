import { Check, Music2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

const themes = [
  { id: 'classic', label: 'Dark Premium', description: 'Azul neon e dourado' },
  { id: 'soft-pink', label: 'Rosa Neon Suave', description: 'Rosa delicado e luminoso' },
] as const;

export default function OnboardingThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="group" aria-label="Tema de Interface">
      {themes.map(option => (
        <Button key={option.id} type="button" variant="outline"
          aria-pressed={(theme ?? 'classic') === option.id}
          onClick={() => setTheme(option.id)}
          className="onboarding-theme-option" data-preview-theme={option.id}>
          <span className="onboarding-theme-preview" aria-hidden="true">
            <span className="flex items-center gap-2 text-xs"><Music2 /><span>Meu palco</span></span>
            <span className="onboarding-preview-balance"><span className="text-xs">Saldo disponível</span><span className="text-lg font-semibold">R$ 2.450,00</span></span>
            <span className="flex items-center justify-between"><span className="onboarding-preview-line" /><span className="onboarding-preview-play"><Play /></span><span className="onboarding-preview-line" /></span>
          </span>
          <span className="flex items-center justify-between gap-2 w-full">
            <span className="min-w-0 text-left"><span className="block font-semibold">{option.label}</span><span className="block text-xs text-muted-foreground mt-1">{option.description}</span></span>
            <span className="onboarding-theme-check">{(theme ?? 'classic') === option.id && <Check className="text-primary" />}</span>
          </span>
        </Button>
      ))}
    </div>
  );
}