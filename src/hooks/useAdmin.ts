import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Verificação de admin baseada na tabela segura `user_roles` (server-side).
 * Um usuário é admin quando possui a role 'owner' ou 'admin'.
 */
export const useAdmin = () => {
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['is-admin', user?.id],
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_admin', { _user_id: user!.id });
      if (error) throw error;
      return !!data;
    },
  });

  return {
    isAdmin: data === true,
    isLoading: isAuthenticated ? isLoading : false,
    adminEmail: data === true ? user?.email ?? null : null,
  };
};
