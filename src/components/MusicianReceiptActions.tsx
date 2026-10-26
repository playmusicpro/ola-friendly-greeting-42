import { FileText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Show, ShowMusician } from '@/types';
import { buildReceiptHtml, buildReceiptWhatsApp } from '@/lib/musicianReceipt';

/** Recibo imprimível (salvar em PDF e assinar no Gov.br) e envio do resumo via WhatsApp. */
export function MusicianReceiptActions({ show, musician }: { show: Show; musician: ShowMusician }) {
  const { profile } = useProfile();
  const { user } = useAuth();
  const payer = { name: profile?.name || 'Artista', email: profile?.email || user?.email, phone: profile?.telefone };
  const ready = () => {
    if (!musician.name.trim() || !show.date || !(show.title || show.local)) {
      toast({ title: 'Complete os dados', description: 'Preencha o nome do músico, o evento e a data antes de gerar o recibo.', variant: 'destructive' });
      return false;
    }
    return true;
  };
  const openReceipt = () => {
    if (!ready()) return;
    const win = window.open('', '_blank');
    if (!win) { toast({ title: 'Janela bloqueada', description: 'Permita pop-ups para abrir o recibo.', variant: 'destructive' }); return; }
    win.document.open(); win.document.write(buildReceiptHtml(show, musician, payer)); win.document.close();
    toast({ title: 'Recibo gerado', description: 'Salve em PDF e assine pelo Gov.br antes de enviar.' });
  };
  const sendWhatsApp = () => {
    if (!ready()) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(buildReceiptWhatsApp(show, musician, payer))}`, '_blank', 'noopener');
  };
  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={openReceipt}><FileText className="h-4 w-4 mr-1" />Gerar Recibo do Músico</Button>
      <Button type="button" size="sm" variant="outline" onClick={sendWhatsApp}><MessageCircle className="h-4 w-4 mr-1" />Enviar Comprovante via WhatsApp</Button>
    </>
  );
}
