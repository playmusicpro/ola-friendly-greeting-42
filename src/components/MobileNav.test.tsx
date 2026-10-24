import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import MobileNav from './MobileNav';

vi.mock('@/components/HelpCenter', () => ({ default: () => null }));

function CurrentPath() {
  const { pathname } = useLocation();
  return <output data-testid="current-path">{pathname}</output>;
}

describe('Play do Painel', () => {
  it('abre Finanças ao clicar no Play central', () => {
    render(<MemoryRouter initialEntries={['/']}><MobileNav /><CurrentPath /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Finanças' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/financas');
  });

  it('abre o Afinador do Cifra Club em nova aba sem sair do Painel', () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    render(<MemoryRouter initialEntries={['/']}><MobileNav /><CurrentPath /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir afinador do Cifra Club' }));
    expect(open).toHaveBeenCalledWith('https://www.cifraclub.com.br/afinador/', '_blank', 'noopener,noreferrer');
    expect(screen.getByTestId('current-path').textContent).toBe('/');
    vi.unstubAllGlobals();
  });
});