import { useEffect } from 'react';
import { Show } from '@/types';
import { scheduleShowReminders, initializeNotifications } from '@/lib/notificationUtils';

/**
 * Hook to monitor shows and trigger notifications
 */
export function useShowNotifications(shows: Show[]) {
  useEffect(() => {
    // Initialize notifications on mount
    initializeNotifications();

    // Check for upcoming shows every minute
    const interval = setInterval(() => {
      shows.forEach((show) => {
        scheduleShowReminders(show);
      });
    }, 60000); // Check every minute

    // Initial check
    shows.forEach((show) => {
      scheduleShowReminders(show);
    });

    return () => clearInterval(interval);
  }, [shows]);
}
