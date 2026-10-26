import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from 'next-themes';
const mocks = vi.hoisted(() => ({ save: vi.fn(), toast: vi.fn(), profile: { name: 'Nome Supabase', email: '', generoMusical: '', cidade: '', telefone: '' } }));
vi.mock('@/hooks/useProfile', () => ({ useProfile: () => ({ profile: mocks.profile, isLoading: false, updateProfile: { mutateAsync: mocks.save } }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/hooks/useOnboarding', () => ({ useOnboarding: () => ({}) }));
vi.mock('@/components/ResetAllDataCard', () => ({ default: () => null }));
vi.mock('@/components/Onboarding', () => ({ default: () => null }));
vi.mock('@/components/HelpCenter', () => ({ default: () => null }));
import Configuracoes from './Configuracoes';

describe('Configurações do perfil e aparência', () => {
  beforeEach(() => {
    vi.clearAllMocks(); localStorage.clear();
    const stored = new Map<string, string>();
    vi.mocked(localStorage.getItem).mockImplementation((key: string) => stored.get(key) ?? null);
    vi.mocked(localStorage.setItem).mockImplementation((key: string, value: string) => { stored.set(key, value); });
    HTMLElement.prototype.scrollIntoView = vi.fn();
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
    HTMLElement.prototype.releasePointerCapture = vi.fn();
  });
  const setup = () => render(<ThemeProvider attribute="data-theme" defaultTheme="classic" themes={['classic', 'soft-pink']} enableSystem={false} storageKey="playpro_appearance"><Configuracoes /></ThemeProvider>);

  it('salva o nome editado e aguarda a confirmação antes de mostrar sucesso', async () => {
    let resolveSave: (() => void) | undefined;
    mocks.save.mockReturnValue(new Promise<void>((resolve) => { resolveSave = resolve; }));
    setup();
    fireEvent.change(screen.getByLabelText('Nome Artístico'), { target: { value: 'Maria do Som' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Maria do Som' }));
    expect(mocks.toast).not.toHaveBeenCalled();
    await act(async () => { resolveSave?.(); });
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Configurações salvas!' })));
  });

  it('persiste a escolha Rosa Neon Suave e restaura a aparência após remontar', async () => {
    const ThemeControl = () => {
      const { setTheme } = useTheme();
      return <input aria-label="Tema de teste" onChange={() => setTheme('soft-pink')} />;
    };
    const renderTheme = () => render(<ThemeProvider attribute="data-theme" defaultTheme="classic" enableSystem={false} storageKey="playpro_appearance"><ThemeControl /></ThemeProvider>);
    const view = renderTheme();
    fireEvent.change(screen.getByLabelText('Tema de teste'), { target: { value: 'soft-pink' } });
    await waitFor(() => expect(localStorage.getItem('playpro_appearance')).toBe('soft-pink'));
    expect(document.documentElement.dataset.theme).toBe('soft-pink');
    view.unmount();
    renderTheme();
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('soft-pink'));
  });
});