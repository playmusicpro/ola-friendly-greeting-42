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
  it('abre Panorama Visual ao clicar no Play central', () => {
    render(<MemoryRouter initialEntries={['/']}><MobileNav /><CurrentPath /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Panorama Visual' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/panorama');
  });

  it('abre o afinador interno sem sair do Painel nem abrir sites externos', () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    render(<MemoryRouter initialEntries={['/']}><MobileNav /><CurrentPath /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir afinador' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ligar Microfone' })).toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
    expect(screen.getByTestId('current-path').textContent).toBe('/');
    vi.unstubAllGlobals();
  });

  it('restaura o Menu do Painel abrindo o drawer de módulos', () => {
    render(<MemoryRouter initialEntries={['/']}><MobileNav /><CurrentPath /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(screen.getByRole('button', { name: /Repertório/ })).toBeInTheDocument();
  });
  it('mantém Finanças acessível pelo Menu', () => {
    render(<MemoryRouter initialEntries={['/']}><MobileNav /><CurrentPath /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    fireEvent.click(screen.getByRole('button', { name: /^Finanças$/ }));
    expect(screen.getByTestId('current-path').textContent).toBe('/financas');
  });
});