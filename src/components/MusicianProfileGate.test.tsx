import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from 'next-themes';
import { MemoryRouter, useLocation } from 'react-router-dom';
const mocks = vi.hoisted(() => ({ save: vi.fn(), toast: vi.fn(), needsOnboarding: true }));
vi.mock('@/hooks/useProfile', () => ({ useProfile: () => ({ needsOnboarding: mocks.needsOnboarding, isLoading: false, profile: { name: 'Ana' }, saveProfile: { mutateAsync: mocks.save, isPending: false } }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => <select value={value} onChange={e => onValueChange(e.target.value)}>{children}</select>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  SelectTrigger: () => <option value="">Selecione</option>, SelectValue: () => null,
}));
import MusicianProfileGate from './MusicianProfileGate';

describe('Tema na segunda etapa do cadastro', () => {
  beforeEach(() => {
    vi.clearAllMocks(); mocks.needsOnboarding = true;
    const storage = new Map<string, string>();
    vi.mocked(localStorage.getItem).mockImplementation(key => storage.get(key) ?? null);
    vi.mocked(localStorage.setItem).mockImplementation((key, value) => { storage.set(key, value); });
  });
  const Location = () => <p data-testid="location">{useLocation().pathname}</p>;
  const setup = () => render(<ThemeProvider attribute="data-theme" defaultTheme="classic" themes={['classic', 'soft-pink']} enableSystem={false} storageKey="playpro_appearance"><MemoryRouter initialEntries={['/agenda']}><MusicianProfileGate><p>Painel</p></MusicianProfileGate><Location /></MemoryRouter></ThemeProvider>);
  const questions = () => {
    fireEvent.change(screen.getByLabelText('Cidade *'), { target: { value: 'São Paulo' } });
    const fields = screen.getAllByRole('combobox');
    fireEvent.change(fields[0], { target: { value: 'MPB' } });
    fireEvent.change(fields[1], { target: { value: 'SP' } });
    fireEvent.change(fields[2], { target: { value: 'Cantor(a) solo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  };

  it('não conclui nem salva o perfil antes das perguntas e da segunda etapa', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    questions();
    expect(mocks.save).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Salvar e entrar' })).toBeEnabled();
  });

  it.each([['Rosa Neon Suave', 'soft-pink'], ['Dark Premium', 'classic']])('aplica e persiste %s imediatamente e abre o Painel após confirmação', async (label, theme) => {
    const view = setup(); questions();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(label) }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe(theme));
    expect(localStorage.getItem('playpro_appearance')).toBe(theme);
    let resolve: (() => void) | undefined;
    mocks.save.mockReturnValue(new Promise<void>(done => { resolve = done; }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar e entrar' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/agenda');
    await act(async () => { resolve?.(); });
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/));
    expect(JSON.parse(localStorage.getItem('playPro_onboarding') ?? '{}').hasCompletedOnboarding).toBe(true);
    mocks.needsOnboarding = false;
    view.rerender(<ThemeProvider attribute="data-theme" defaultTheme="classic" enableSystem={false} storageKey="playpro_appearance"><MemoryRouter><MusicianProfileGate><p>Painel</p></MusicianProfileGate></MemoryRouter></ThemeProvider>);
    expect(screen.getByText('Painel')).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe(theme);
  });

  it('mantém a escolha e as perguntas se o salvamento falhar', async () => {
    mocks.save.mockRejectedValue(new Error('Falha de conexão'));
    setup(); questions();
    fireEvent.click(screen.getByRole('button', { name: /Rosa Neon Suave/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar e entrar' }));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
    expect(screen.getByTestId('location')).toHaveTextContent('/agenda');
    expect(document.documentElement.dataset.theme).toBe('soft-pink');
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByLabelText('Cidade *')).toHaveValue('São Paulo');
  });
});