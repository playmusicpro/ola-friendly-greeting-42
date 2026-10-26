import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from 'next-themes';
import Onboarding from './Onboarding';
import { onboardingSteps } from '@/lib/helpContent';

describe('Boas-vindas com etapa adicional de tema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const storage = new Map<string, string>();
    vi.mocked(localStorage.getItem).mockImplementation(key => storage.get(key) ?? null);
    vi.mocked(localStorage.setItem).mockImplementation((key, value) => { storage.set(key, value); });
  });
  const setup = () => {
    const complete = vi.fn(); const close = vi.fn();
    render(<ThemeProvider attribute="data-theme" defaultTheme="classic" themes={['classic', 'soft-pink']} enableSystem={false} storageKey="playpro_appearance"><Onboarding isOpen onComplete={complete} onClose={close} /></ThemeProvider>);
    return { complete, close };
  };
  const next = () => fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));

  it.each([['Rosa Neon Suave', 'soft-pink'], ['Dark Premium', 'classic']])('preserva as quatro etapas e só conclui após o passo extra com %s', async (label, theme) => {
    const { complete } = setup();
    next();
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeDisabled();
    const activity = onboardingSteps.activity.options[0];
    fireEvent.click(screen.getByText(activity.label));
    next();
    // Returning to activity must retain the answer and validation behavior.
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeEnabled();
    next(); next();
    expect(complete).not.toHaveBeenCalled();
    next();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(label) }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe(theme));
    expect(localStorage.getItem('playpro_appearance')).toBe(theme);
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    next();
    expect(document.documentElement.dataset.theme).toBe(theme);
    fireEvent.click(screen.getByRole('button', { name: 'Começar' }));
    expect(complete).toHaveBeenCalledExactlyOnceWith(activity.id);
  });

  it('preserva Pular e fechar sem criar restrições novas', () => {
    const { complete, close } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
    expect(complete).toHaveBeenCalledExactlyOnceWith(null);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
  });
});