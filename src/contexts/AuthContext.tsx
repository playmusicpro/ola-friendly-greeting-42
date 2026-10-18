import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Login real no Supabase. Se a conta não existir, cria automaticamente. */
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  getSession: () => AuthUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const mapUser = (u: SupabaseUser | null | undefined): AuthUser | null =>
  u ? { id: u.id, email: u.email ?? '', role: 'user' } : null;

const translateError = (message: string): string => {
  const m = message.toLowerCase();
  if (m.includes('email logins are disabled') || m.includes('email_provider_disabled') || m.includes('signups not allowed'))
    return 'Login por email está desativado no servidor. O administrador precisa ativar o provedor Email no Supabase.';
  if (m.includes('invalid login credentials')) return 'Email ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu email antes de entrar.';
  if (m.includes('password should be at least')) return 'A senha deve ter no mínimo 6 caracteres.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Tente novamente em instantes.';
  if (m.includes('user already registered')) return 'Email ou senha incorretos.';
  return message;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1) Listener primeiro (evita perder eventos durante o boot)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(mapUser(newSession?.user));
      setIsLoading(false);
    });

    // 2) Depois recupera a sessão persistida
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(mapUser(existing?.user));
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return { error: 'Por favor, insira um email válido' };
    }
    if (!password || password.length < 6) {
      return { error: 'A senha deve ter no mínimo 6 caracteres' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

    if (!error) return { error: null };

    // Conta ainda não existe: cria e já autentica (fluxo de acesso por email do Play Pro)
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });

      if (signUpError) return { error: translateError(signUpError.message) };

      if (!signUpData.session) {
        return { error: 'Conta criada! Confirme seu email para entrar.' };
      }
      return { error: null };
    }

    return { error: translateError(error.message) };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const getSession = (): AuthUser | null => user;

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    login,
    logout,
    getSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { AuthUser as User, AuthContextType };
