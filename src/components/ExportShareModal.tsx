import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Share2, 
  Copy, 
  ExternalLink,
  AlertTriangle,
  Check,
  Loader2
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { generatePDF, downloadPDF } from '@/lib/pdfGenerator';
import { createShareLink, shareViaWhatsApp, copyToClipboard, generateSharePreview } from '@/lib/shareUtils';

interface SetlistItem {
  title: string;
  artist: string;
  tone: string;
  notes?: string;
}

interface ExportShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'setlist' | 'song';
  title: string;
  content: string;
  items?: SetlistItem[];
  hotmartLink?: string;
}

// UI text in Portuguese
const UI_TEXT = {
  buttons: {
    export_pdf: "Exportar PDF",
    share_whatsapp: "Compartilhar no WhatsApp",
    copy_link: "Copiar link",
    open_hotmart: "Ir para a Área de Membros"
  },
  modals: {
    confirm_rights_title: "Confirmar exportação",
    confirm_rights_text: "Você confirma que tem os direitos sobre o conteúdo que será exportado?",
    confirm_yes: "Sim, exportar",
    confirm_no: "Cancelar"
  },
  toasts: {
    pdf_ready: "PDF gerado",
    link_copied: "Link copiado para a área de transferência"
  },
  errors: {
    pdf_error: "Falha ao gerar PDF. Tente novamente.",
    link_error: "Link temporariamente indisponível."
  },
  tooltips: {
    include_hotmart: "Incluir link da área de membros na primeira página do PDF"
  },
  help_text: "Observação: não inclua letras ou cifras protegidas por direitos autorais sem autorização."
};

export function ExportShareModal({ 
  open, 
  onOpenChange, 
  type, 
  title, 
  content,
  items,
  hotmartLink 
}: ExportShareModalProps) {
  const { toast } = useToast();
  const [includeHotmartLink, setIncludeHotmartLink] = useState(false);
  const [userNote, setUserNote] = useState('');
  const [showRightsConfirm, setShowRightsConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'pdf' | 'whatsapp' | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setPendingAction('pdf');
    setShowRightsConfirm(true);
  };

  const confirmExportPDF = async () => {
    setShowRightsConfirm(false);
    setIsExporting(true);

    try {
      const result = await generatePDF({
        type,
        title,
        content,
        items,
        hotmartLink,
        includeHotmartLink,
        userNote: userNote || undefined,
      });

      downloadPDF(result.blob, result.fileName);

      toast({
        title: UI_TEXT.toasts.pdf_ready,
        description: result.fileName,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Erro",
        description: UI_TEXT.errors.pdf_error,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = () => {
    setPendingAction('whatsapp');
    setShowRightsConfirm(true);
  };

  const confirmShareWhatsApp = () => {
    setShowRightsConfirm(false);
    
    const shareLink = createShareLink(type, title);
    
    shareViaWhatsApp({
      title,
      shortLink: shareLink.fullUrl,
      description: userNote || generateSharePreview(type, title, items?.length),
      hotmartLink,
      includeHotmart: includeHotmartLink,
    });
  };

  const handleCopyLink = async () => {
    try {
      const shareLink = createShareLink(type, title);
      const success = await copyToClipboard(shareLink.fullUrl);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: UI_TEXT.toasts.link_copied,
        });
      } else {
        throw new Error('Copy failed');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: UI_TEXT.errors.link_error,
        variant: "destructive",
      });
    }
  };

  const handleOpenHotmart = () => {
    if (hotmartLink) {
      window.open(hotmartLink, '_blank');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Exportar e Compartilhar
            </DialogTitle>
            <DialogDescription>
              {type === 'setlist' ? 'Setlist' : 'Música'}: {title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Notas adicionais</Label>
              <Textarea
                placeholder="Adicione observações para compartilhar..."
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {hotmartLink && (
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-gold/10 border border-gold/20">
                <Checkbox
                  id="include-hotmart"
                  checked={includeHotmartLink}
                  onCheckedChange={(checked) => setIncludeHotmartLink(checked as boolean)}
                />
                <Label htmlFor="include-hotmart" className="text-sm cursor-pointer flex-1">
                  {UI_TEXT.tooltips.include_hotmart}
                </Label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex-col h-auto py-4 hover:bg-primary/10 hover:border-primary/50"
              >
                {isExporting ? (
                  <Loader2 className="h-6 w-6 mb-2 animate-spin text-primary" />
                ) : (
                  <FileText className="h-6 w-6 mb-2 text-primary" />
                )}
                <span className="text-xs">{UI_TEXT.buttons.export_pdf}</span>
              </Button>

              <Button 
                variant="outline" 
                onClick={handleShareWhatsApp}
                className="flex-col h-auto py-4 hover:bg-green-500/10 hover:border-green-500/50"
              >
                <svg className="h-6 w-6 mb-2 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-xs">{UI_TEXT.buttons.share_whatsapp}</span>
              </Button>

              <Button 
                variant="outline" 
                onClick={handleCopyLink}
                className="flex-col h-auto py-4 hover:bg-gold/10 hover:border-gold/50"
              >
                <Copy className="h-6 w-6 mb-2 text-gold" />
                <span className="text-xs">{UI_TEXT.buttons.copy_link}</span>
              </Button>

              {hotmartLink && (
                <Button 
                  variant="outline" 
                  onClick={handleOpenHotmart}
                  className="flex-col h-auto py-4 hover:bg-gold/10 hover:border-gold/50"
                >
                  <ExternalLink className="h-6 w-6 mb-2 text-gold" />
                  <span className="text-xs">{UI_TEXT.buttons.open_hotmart}</span>
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
              {UI_TEXT.help_text}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRightsConfirm} onOpenChange={setShowRightsConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{UI_TEXT.modals.confirm_rights_title}</AlertDialogTitle>
            <AlertDialogDescription>
              {UI_TEXT.modals.confirm_rights_text}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{UI_TEXT.modals.confirm_no}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (pendingAction === 'pdf') {
                  confirmExportPDF();
                } else if (pendingAction === 'whatsapp') {
                  confirmShareWhatsApp();
                }
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Check className="h-4 w-4 mr-2" />
              {UI_TEXT.modals.confirm_yes}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
