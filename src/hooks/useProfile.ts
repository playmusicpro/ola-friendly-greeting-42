import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MusicianProfile {
  id: string;
  name: string;
  email: string | null;
  telefone: string | null;
  generoMusical: string | null;
  cidade: string | null;
  estado: string | null;
  tipoMusico: string | null;
  onboardingCompleted: boolean;
}

export const useProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    enabled: isAuthenticated && !!user?.id,
    queryFn: async (): Promise<MusicianProfile | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        console.error('[useProfile] erro ao carregar perfil:', error);
        throw error;
      }
      if (!data) return null;
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        telefone: data.whatsapp,
        generoMusical: data.genero_musical,
        cidade: data.cidade,
        estado: data.estado,
        tipoMusico: data.tipo_musico,
        onboardingCompleted: data.onboarding_completed,
      };
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (values: { name: string; email: string; generoMusical: string; cidade: string; telefone: string }) => {
      if (!user?.id) throw new Error('Sessão expirada. Faça login novamente.');
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          email: values.email,
          genero_musical: values.generoMusical,
          cidade: values.cidade,
          whatsapp: values.telefone,
        })
        .eq('id', user.id)
        .select('*')
        .single();
      if (error) throw error;
      if (!data) throw new Error('Perfil não encontrado. Não foi possível salvar.');
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<MusicianProfile>(['profile', data.id], {
        id: data.id,
        name: data.name,
        email: data.email,
        telefone: data.whatsapp,
        generoMusical: data.genero_musical,
        cidade: data.cidade,
        estado: data.estado,
        tipoMusico: data.tipo_musico,
        onboardingCompleted: data.onboarding_completed,
      });
      void queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
    },
  });

  const saveProfile = useMutation({
    mutationFn: async (values: {
      name?: string;
      generoMusical: string;
      cidade: string;
      estado: string;
      tipoMusico: string;
    }) => {
      if (!user?.id) throw new Error('Sessão expirada. Faça login novamente.');

      const payload = {
        id: user.id,
        email: user.email ?? null,
        ...(values.name ? { name: values.name } : {}),
        genero_musical: values.generoMusical,
        cidade: values.cidade,
        estado: values.estado,
        tipo_musico: values.tipoMusico,
        onboarding_completed: true,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (error) {
        console.error('[useProfile] erro ao salvar perfil:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          payload,
        });
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      if (!user?.id) return;
      // Atualiza o estado local imediatamente (onboarding concluído)
      queryClient.setQueryData(['profile', user?.id], (prev: MusicianProfile | null | undefined) => ({
        id: user.id,
        name: (data as any)?.name ?? prev?.name ?? '',
        email: (data as any)?.email ?? prev?.email ?? null,
        telefone: data?.whatsapp ?? prev?.telefone ?? null,
        generoMusical: (data as any)?.genero_musical ?? prev?.generoMusical ?? null,
        cidade: (data as any)?.cidade ?? prev?.cidade ?? null,
        estado: (data as any)?.estado ?? prev?.estado ?? null,
        tipoMusico: (data as any)?.tipo_musico ?? prev?.tipoMusico ?? null,
        onboardingCompleted: true,
      }));
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    needsOnboarding: query.isSuccess && (!query.data || !query.data.onboardingCompleted),
    saveProfile,
    updateProfile,
  };
};
