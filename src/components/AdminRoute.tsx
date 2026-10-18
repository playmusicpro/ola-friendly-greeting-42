import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAdmin();
  if (isLoading) return <p role="status" className="p-6 text-muted-foreground">Verificando acesso…</p>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}