import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AdminTable = 'profiles' | 'shows' | 'notification_logs' | 'admin_audit_logs' | 'admin_operations';
type Row<T extends AdminTable> = Database['public']['Tables'][T]['Row'];

export function useAdminRows<T extends AdminTable>(table: T) {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  return useQuery<Row<T>[]>({
    queryKey: ['admin-data', table, user?.id],
    enabled: isAdmin && !!user?.id,
    staleTime: 0,
    refetchInterval: 30_000,
    queryFn: async () => {
      if (!user?.id || !isAdmin) throw new Error('Acesso restrito a administradores.');
      const rows: Row<T>[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase.from(table).select('*')
          .order('id').range(offset, offset + 499);
        if (error) throw error;
        const page = (data ?? []) as Row<T>[];
        rows.push(...page);
        if (page.length < 500) break;
      }
      return rows;
    },
  });
}

export function useAdminOperations() {
  const query = useAdminRows('admin_operations');
  const client = useQueryClient();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const save = useMutation({
    mutationFn: async (rows: Database['public']['Tables']['admin_operations']['Insert'][]) => {
      if (!isAdmin || !user?.id) throw new Error('Acesso restrito a administradores.');
      const { error } = await supabase.from('admin_operations')
        .upsert(rows.map(row => ({ ...row, updated_by: user.id })));
      if (error) throw error;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['admin-data'] });
      toast({ title: 'Operação salva' });
    },
    onError: (error) => toast({ title: 'Não foi possível salvar', description: error.message, variant: 'destructive' }),
  });
  return { ...query, save: save.mutateAsync, isSaving: save.isPending };
}