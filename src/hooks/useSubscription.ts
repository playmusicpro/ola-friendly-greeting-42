import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { isSubscriptionActive } from '@/lib/subscription';

/**
 * Lê profiles.status (escrito apenas pelo stripe-webhook). Ao voltar do checkout
 * (?concluido=1) consulta a cada 3s até o webhook confirmar o pagamento.
 */
export function useSubscription(awaitingConfirmation = false) {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const query = useQuery({
    queryKey: ['subscription', user?.id],
    enabled: isAuthenticated && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle();
      if (error) throw error;
      return isSubscriptionActive(data as { status?: string | null; has_active_subscription?: boolean | null } | null);
    },
    refetchOnWindowFocus: true,
    refetchInterval: (q) => (awaitingConfirmation && q.state.data !== true ? 3000 : false),
  });
  return {
    isActive: isAdmin || query.data === true,
    isLoading: adminLoading || query.isLoading,
  };
}
