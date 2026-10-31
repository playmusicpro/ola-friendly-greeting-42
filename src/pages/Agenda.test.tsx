import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Agenda from './Agenda';

const today = new Date();
const pendingDay = new Date(today.getFullYear(), today.getMonth(), 12);
const doneDay = new Date(today.getFullYear(), today.getMonth(), 19);
const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const pendingShow = { id: 'show-1', title: 'Show no Bar', local: 'Bar do Zé', date: toISO(pendingDay), time: '21:00', realizado: false };
const doneShow = { id: 'show-2', title: 'Casamento Silva', local: 'Salão Aurora', date: toISO(doneDay), time: '20:00', realizado: true };

vi.mock('@/hooks/useFinancialData', () => ({
  useFinancialData: () => ({
    events: [],
    shows: [pendingShow, doneShow],
    addEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
    duplicateEvent: vi.fn(),
    markEventAsRealizado: vi.fn(),
    addShow: vi.fn(),
    updateShow: vi.fn(),
    deleteShow: vi.fn(),
    markShowRealizado: vi.fn(),
  }),
}));
vi.mock('@/hooks/useRepertoire', () => ({ useRepertoire: () => ({ setlists: [], songs: [] }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/lib/appUsage', () => ({ recordAppUsage: vi.fn() }));
vi.mock('@/components/EventForm', () => ({ EventForm: () => null }));
vi.mock('@/components/ShowForm', () => ({ ShowForm: () => null }));
vi.mock('@/components/GoogleCalendarSyncIndicator', () => ({ GoogleCalendarSyncIndicator: () => null }));

describe('Calendário da Agenda (reformulado sem alterar a lógica)', () => {
  it('mostra pílula âmbar no dia pendente, pílula verde no dia realizado e o selo Hoje', () => {
    const { container } = render(<Agenda />);
    expect(container.querySelectorAll('.agenda-day-scheduled .agenda-day-pill')).toHaveLength(1);
    expect(container.querySelectorAll('.agenda-day-completed .agenda-day-pill-completed')).toHaveLength(1);
    expect(container.querySelector('.agenda-cell-today .agenda-day-today')?.textContent).toBe('Hoje');
  });

  it('mantém a seleção de dia: clicar no dia pendente abre os lançamentos daquela data', () => {
    const { container } = render(<Agenda />);
    const pendingCell = container.querySelector('.agenda-day-scheduled');
    expect(pendingCell).not.toBeNull();
    fireEvent.click(pendingCell as Element);
    expect(screen.getByText(/^Eventos - /)).toHaveTextContent(`${pendingDay.getDate()} de`);
    expect(screen.getByText('Show no Bar')).toBeInTheDocument();
  });
});
