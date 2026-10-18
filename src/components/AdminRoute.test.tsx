import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, it, expect } from 'vitest';
import AdminRoute from './AdminRoute';

const state = vi.hoisted(() => ({ isAdmin: false, isLoading: false }));
vi.mock('@/hooks/useAdmin', () => ({ useAdmin: () => state }));

function mount() {
  render(<MemoryRouter initialEntries={['/admin']}><Routes>
    <Route path="/admin" element={<AdminRoute><div>Dados administrativos</div></AdminRoute>} />
    <Route path="/" element={<div>Área do músico</div>} />
  </Routes></MemoryRouter>);
}

it('nega acesso quando o servidor não reconhece administrador', () => {
  state.isAdmin = false;
  mount();
  expect(screen.queryByText('Dados administrativos')).toBeNull();
  expect(screen.getByText('Área do músico')).toBeInTheDocument();
});

it('permite acesso com administrador confirmado pelo servidor', () => {
  state.isAdmin = true;
  mount();
  expect(screen.getByText('Dados administrativos')).toBeInTheDocument();
});