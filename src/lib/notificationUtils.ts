import { Show } from '@/types';
import { formatCurrency, formatPercentage, calculateShow } from './calculations';
import { getHoursUntil } from './dateUtils';

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Send local browser notification
 */
export function sendLocalNotification(title: string, options: NotificationOptions = {}) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }
}

/**
 * Schedule show reminders (24h, 2h, 30m before)
 */
export function scheduleShowReminders(show: Show) {
  const hoursUntil = getHoursUntil(show.date, show.time);
  
  // 24 hours before
  if (hoursUntil > 24 && hoursUntil <= 25) {
    sendLocalNotification('Show amanhã! 🎸', {
      body: `${show.local} - ${show.time}`,
      tag: `show-24h-${show.id}`,
    });
  }
  
  // 2 hours before
  if (hoursUntil > 2 && hoursUntil <= 3) {
    sendLocalNotification('Show daqui a 2 horas! 🎵', {
      body: `${show.local} - ${show.time}`,
      tag: `show-2h-${show.id}`,
    });
  }
  
  // 30 minutes before
  if (hoursUntil > 0.5 && hoursUntil <= 1) {
    sendLocalNotification('Show começando em 30 minutos! 🎤', {
      body: `${show.local} - ${show.time}`,
      tag: `show-30m-${show.id}`,
      requireInteraction: true,
    });
  }
}

/**
 * Generate WhatsApp message for completed show
 */
export function generateWhatsAppMessage(show: Show): string {
  const calc = calculateShow(show);
  const data = new Date(show.date).toLocaleDateString('pt-BR');
  
  return `Resumo do show: ${show.local} em ${data}. Cachê: ${formatCurrency(show.cache)}. Lucro líquido: ${formatCurrency(calc.lucroReal)} (Margem ${formatPercentage(calc.margemPercentual)}).`;
}

/**
 * Check if notifications are supported
 */
export function areNotificationsSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!areNotificationsSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Initialize notification system
 */
export async function initializeNotifications(): Promise<void> {
  if (areNotificationsSupported()) {
    await requestNotificationPermission();
  }
}
