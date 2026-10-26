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

describe('Preservação do cadastro original', () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Salvar e Continuar' }));
  };

  it('mantém a validação e salva todas as respostas sem concluir o tutorial', async () => {
    mocks.save.mockResolvedValue({});
    setup();
    expect(screen.getByRole('button', { name: 'Salvar e Continuar' })).toBeDisabled();
    questions();
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ name: 'Ana', generoMusical: 'MPB', cidade: 'São Paulo', estado: 'SP', tipoMusico: 'Cantor(a) solo' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/));
    expect(localStorage.getItem('playPro_onboarding')).toBeNull();
  });

  it('mantém as respostas para tentar novamente após erro', async () => {
    mocks.save.mockRejectedValue(new Error('Falha de conexão'));
    setup(); questions();
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
    expect(screen.getByTestId('location')).toHaveTextContent('/agenda');
    expect(screen.getByLabelText('Cidade *')).toHaveValue('São Paulo');
    expect(localStorage.getItem('playPro_onboarding')).toBeNull();
  });
});
