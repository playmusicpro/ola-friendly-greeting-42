import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppUsageTracker } from './AppUsageTracker';

const mocks = vi.hoisted(() => ({ record: vi.fn(), authenticated: true }));
vi.mock('@/lib/appUsage', async importOriginal => ({ ...await importOriginal<typeof import('@/lib/appUsage')>(), recordAppUsage: mocks.record }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'one' }, isAuthenticated: mocks.authenticated }) }));
describe('Rastreamento separado do fluxo principal', () => {
  beforeEach(() => { mocks.record.mockReset(); mocks.authenticated = true; });
  it('registra navegação autenticada uma vez e registra retorno ao app', () => {
    const view = render(<MemoryRouter initialEntries={['/agenda']}><AppUsageTracker /></MemoryRouter>);
    expect(mocks.record).toHaveBeenCalledWith('agenda', 'navigation');
    expect(mocks.record).toHaveBeenCalledTimes(1);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(mocks.record).toHaveBeenLastCalledWith(null, 'app_open');
    view.unmount();
    mocks.record.mockClear();
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(mocks.record).not.toHaveBeenCalled();
  });
  it('não registra visitantes sem sessão', () => {
    mocks.authenticated = false;
    render(<MemoryRouter initialEntries={['/agenda']}><AppUsageTracker /></MemoryRouter>);
    expect(mocks.record).not.toHaveBeenCalled();
  });
});