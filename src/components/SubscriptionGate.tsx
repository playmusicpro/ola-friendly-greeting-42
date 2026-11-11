import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { isPaywallAllowedPath } from '@/lib/subscription';

function Waiting({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

/** Paywall: sem assinatura ativa, só /planos (sem menus) é acessível. */
export default function SubscriptionGate({ children, lockedLayout }: { children: React.ReactNode; lockedLayout: React.ReactNode }) {
  const location = useLocation();
  const returningFromCheckout = new URLSearchParams(location.search).get('concluido') === '1';
  const { isActive, isLoading } = useSubscription(returningFromCheckout);

  if (isLoading) return <Waiting text="Carregando..." />;
  if (isActive) return <>{children}</>;
  if (returningFromCheckout) return <Waiting text="Confirmando seu pagamento…" />;
  if (!isPaywallAllowedPath(location.pathname)) return <Navigate to="/planos" replace />;
  return <>{lockedLayout}</>;
}
