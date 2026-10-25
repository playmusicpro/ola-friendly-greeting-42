import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

const mocks = vi.hoisted(() => ({ from: vi.fn(), update: vi.fn(), eq: vi.fn(), single: vi.fn(), row: { id: 'musician-1', name: 'Nome anterior', email: 'music@example.test', whatsapp: null, genero_musical: 'MPB', cidade: 'Recife', estado: 'PE', tipo_musico: 'Cantor(a) solo', onboarding_completed: true } }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'musician-1' }, isAuthenticated: true }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: mocks.from } }));
import { useProfile } from './useProfile';

describe('Atualização do perfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.row.name = 'Nome anterior';
    const query = { select: vi.fn(() => query), eq: mocks.eq, maybeSingle: vi.fn(async () => ({ data: { ...mocks.row }, error: null })), single: mocks.single, update: mocks.update };
    mocks.from.mockReturnValue(query);
    mocks.eq.mockReturnValue(query);
    mocks.update.mockImplementation((values) => { Object.assign(mocks.row, { ...values }); return query; });
    mocks.single.mockImplementation(async () => ({ data: { ...mocks.row }, error: null }));
  });

  const setup = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    return { client, ...renderHook(() => useProfile(), { wrapper }) };
  };
  const values = { name: 'Lia Rosa', email: 'music@example.test', generoMusical: 'MPB', cidade: 'Recife', telefone: '' };

  it('faz UPDATE no perfil do usuário e publica o nome retornado no cache e na interface', async () => {
    const { result, client } = setup();
    await waitFor(() => expect(result.current.profile?.name).toBe('Nome anterior'));
    await act(async () => { await result.current.updateProfile.mutateAsync(values); });
    expect(mocks.from).toHaveBeenCalledWith('profiles');
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Lia Rosa' }));
    expect(mocks.eq).toHaveBeenCalledWith('id', 'musician-1');
    expect(client.getQueryData(['profile', 'musician-1'])).toMatchObject({ name: 'Lia Rosa', estado: 'PE', onboardingCompleted: true });
    await waitFor(() => expect(result.current.profile?.name).toBe('Lia Rosa'));
  });

  it('não informa sucesso nem substitui o perfil quando o Supabase recusa a alteração', async () => {
    const { result, client } = setup();
    await waitFor(() => expect(result.current.profile?.name).toBe('Nome anterior'));
    mocks.single.mockResolvedValueOnce({ data: null, error: new Error('Update refused') });
    await act(async () => { await expect(result.current.updateProfile.mutateAsync(values)).rejects.toThrow('Update refused'); });
    expect(client.getQueryData(['profile', 'musician-1'])).toMatchObject({ name: 'Nome anterior' });
  });
});