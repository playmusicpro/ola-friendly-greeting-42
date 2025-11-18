/**
 * Date utility functions for monthly control and filtering
 */

/**
 * Get the start date of a given month (YYYY-MM-DD format)
 */
export function getMonthStart(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

/**
 * Get the end date of a given month (YYYY-MM-DD format)
 */
export function getMonthEnd(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const monthStr = String(month).padStart(2, '0');
  return `${year}-${monthStr}-${lastDay}`;
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Check if a date string (YYYY-MM-DD) is within a month
 */
export function isDateInMonth(dateStr: string, monthStart: string, monthEnd: string): boolean {
  return dateStr >= monthStart && dateStr <= monthEnd;
}

/**
 * Get formatted month name (e.g., "Janeiro 2024")
 */
export function getMonthName(date: Date = new Date()): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/**
 * Get last N months as array of { start, end, label }
 */
export function getLastMonths(count: number): Array<{ start: string; end: string; label: string }> {
  const months = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      start: getMonthStart(date),
      end: getMonthEnd(date),
      label: getMonthName(date),
    });
  }
  
  return months;
}

/**
 * Check if date is in the past
 */
export function isPastDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = parseDate(dateStr);
  return checkDate < today;
}

/**
 * Get hours until a date-time
 */
export function getHoursUntil(dateStr: string, timeStr: string): number {
  const eventDate = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  return Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60));
}

/**
 * Format date for display (DD/MM/YYYY)
 */
export function formatDateBR(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
