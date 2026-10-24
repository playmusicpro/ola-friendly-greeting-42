import type { Show } from '@/types';

/** Floating local date-times plus explicit zone prevent date-only UTC shifts. */
export function buildGoogleCalendarLink(show: Pick<Show, 'date' | 'time' | 'local' | 'title' | 'address' | 'notes' | 'endTime'>): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(show.date) || !/^\d{2}:\d{2}$/.test(show.time)) throw new Error('Preencha data e horário do show.');
  const start = new Date(`${show.date}T${show.time}:00`);
  const end = new Date(`${show.date}T${show.endTime || show.time}:00`);
  if (!show.endTime) end.setHours(end.getHours() + 2);
  else if (end <= start) end.setDate(end.getDate() + 1);
  const stamp = (d: Date) => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}00`;
  const params = new URLSearchParams({ action: 'TEMPLATE', text: show.title || `Show — ${show.local}`, dates: `${stamp(start)}/${stamp(end)}`, ctz: 'America/Sao_Paulo', location: show.address || show.local, details: show.notes || 'Show cadastrado no Play Pro.' });
  return `https://calendar.google.com/calendar/render?${params}`;
}