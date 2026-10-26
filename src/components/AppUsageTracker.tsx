import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { moduleForPath, recordAppUsage } from '@/lib/appUsage';

export function AppUsageTracker() {
  const { user, isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const lastRoute = useRef('');
  useEffect(() => {
    if (!isAuthenticated || !user?.id) { lastRoute.current = ''; return; }
    const key = `${user.id}:${pathname}`;
    if (lastRoute.current === key) return;
    lastRoute.current = key;
    const module = moduleForPath(pathname);
    void recordAppUsage(module, module ? 'navigation' : 'app_open');
  }, [user?.id, isAuthenticated, pathname]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const onReturn = () => {
      if (document.visibilityState === 'visible') void recordAppUsage(null, 'app_open');
    };
    document.addEventListener('visibilitychange', onReturn);
    return () => document.removeEventListener('visibilitychange', onReturn);
  }, [user?.id, isAuthenticated]);
  return null;
}