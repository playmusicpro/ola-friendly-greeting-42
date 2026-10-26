import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type PagedRpc = 'admin_activity_page' | 'admin_usage_logs_page';
export function useAdminIntelligenceRows<T extends PagedRpc>(rpc: T) {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  return useQuery<Database['public']['Functions'][T]['Returns']>({
    queryKey: ['admin-intelligence', rpc, user?.id], enabled: isAdmin && !!user?.id,
    staleTime: 0, refetchInterval: 30_000,
    queryFn: async () => {
      if (!isAdmin || !user?.id) throw new Error('Acesso restrito.');
      const rows = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase.rpc(rpc, { p_offset: offset });
        if (error) throw error;
        rows.push(...(data ?? []));
        if ((data?.length ?? 0) < 500) break;
      }
      return rows as Database['public']['Functions'][T]['Returns'];
    },
  });
}

export function useAdminModuleUsage(since: string) {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  return useQuery({
    queryKey: ['admin-intelligence', 'modules', user?.id, since], enabled: isAdmin && !!user?.id,
    staleTime: 0, refetchInterval: 30_000,
    queryFn: async () => {
      if (!isAdmin || !user?.id) throw new Error('Acesso restrito.');
      const { data, error } = await supabase.rpc('admin_module_usage', { p_since: since });
      if (error) throw error;
      return data ?? [];
    },
  });
}