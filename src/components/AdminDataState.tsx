import { Button } from '@/components/ui/button';

export function AdminDataState({ loading, error, retry }: { loading: boolean; error: Error | null; retry: () => unknown }) {
  if (loading) return <p role="status" className="py-6 text-muted-foreground">Carregando registros…</p>;
  if (error) return <div role="alert" className="py-6 space-y-3 text-destructive"><p>Não foi possível carregar os registros: {error.message}</p><Button variant="outline" onClick={() => void retry()}>Tentar novamente</Button></div>;
  return null;
}