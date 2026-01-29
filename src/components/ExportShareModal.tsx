import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface ExportShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'setlist' | 'song';
  title: string;
  content: string;
  hotmartLink?: string;
}

// UI text in Portuguese as per spec
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
  hotmartLink 
}: ExportShareModalProps) {
  const { toast } = useToast();
  const [includeHotmartLink, setIncludeHotmartLink] = useState(false);
  const [userNote, setUserNote] = useState('');
  const [showRightsConfirm, setShowRightsConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'pdf' | 'whatsapp' | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const generateFileName = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const slugTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const prefix = type === 'setlist' ? 'Setlist' : 'Musica';
    return `PlayPro_${prefix}_${slugTitle}_${date}.pdf`;
  };

  const generateShareLink = () => {
    // In production, this would call an API to generate a short link
    const slug = Math.random().toString(36).substring(2, 10);
    return {
      slug,
      route: `/${type}/${slug}`,
      fullUrl: `https://playpro.app/s/${slug}`,
      expiresAt: null
    };
  };

  const handleExportPDF = () => {
    setPendingAction('pdf');
    setShowRightsConfirm(true);
  };

  const confirmExportPDF = async () => {
    setShowRightsConfirm(false);
    setIsExporting(true);

    try {
      // Generate HTML content for PDF
      const htmlContent = generatePDFHTML();
      
      // Create a blob and download
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFileName().replace('.pdf', '.html');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: UI_TEXT.toasts.pdf_ready,
        description: generateFileName(),
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: UI_TEXT.errors.pdf_error,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDFHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #1a1a1a;
      color: #ffffff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 3px solid #d4af37;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #d4af37;
    }
    .title {
      font-size: 28px;
      margin: 20px 0;
    }
    .chord {
      font-weight: bold;
      color: #6b9fff;
      font-family: monospace;
    }
    .content {
      white-space: pre-wrap;
      line-height: 1.8;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #333;
      font-size: 12px;
      color: #888;
    }
    .hotmart-link {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background: #d4af37;
      color: #000;
      text-decoration: none;
      border-radius: 4px;
    }
    .note {
      background: #2a2a2a;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🎸 Play Pro</div>
  </div>
  
  <h1 class="title">${title}</h1>
  
  ${userNote ? `<div class="note"><strong>Notas:</strong> ${userNote}</div>` : ''}
  
  <div class="content">${content.replace(/\[([^\]]+)\]/g, '<code class="chord">$1</code>')}</div>
  
  <div class="footer">
    <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} via Play Pro</p>
    ${includeHotmartLink && hotmartLink ? `<a href="${hotmartLink}" class="hotmart-link">Acessar Área de Membros</a>` : ''}
  </div>
</body>
</html>
    `;
  };

  const handleShareWhatsApp = () => {
    setPendingAction('whatsapp');
    setShowRightsConfirm(true);
  };

  const confirmShareWhatsApp = () => {
    setShowRightsConfirm(false);
    
    const shareLink = generateShareLink();
    const message = `Fala! Eu quis compartilhar "${title}" com você. Dá uma olhada: ${shareLink.fullUrl}

${userNote ? `Descrição: ${userNote}` : ''}
${includeHotmartLink && hotmartLink ? `\nAcesse a área de membros: ${hotmartLink}` : ''}

— Enviado via Play Pro`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      const shareLink = generateShareLink();
      await navigator.clipboard.writeText(shareLink.fullUrl);
      toast({
        title: "Sucesso",
        description: UI_TEXT.toasts.link_copied,
      });
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
              <Share2 className="h-5 w-5" />
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
              />
            </div>

            {hotmartLink && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-hotmart"
                  checked={includeHotmartLink}
                  onCheckedChange={(checked) => setIncludeHotmartLink(checked as boolean)}
                />
                <Label htmlFor="include-hotmart" className="text-sm cursor-pointer">
                  {UI_TEXT.tooltips.include_hotmart}
                </Label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex-col h-auto py-4"
              >
                {isExporting ? (
                  <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                ) : (
                  <FileText className="h-6 w-6 mb-2" />
                )}
                {UI_TEXT.buttons.export_pdf}
              </Button>

              <Button 
                variant="outline" 
                onClick={handleShareWhatsApp}
                className="flex-col h-auto py-4"
              >
                <ExternalLink className="h-6 w-6 mb-2" />
                {UI_TEXT.buttons.share_whatsapp}
              </Button>

              <Button 
                variant="outline" 
                onClick={handleCopyLink}
                className="flex-col h-auto py-4"
              >
                <Copy className="h-6 w-6 mb-2" />
                {UI_TEXT.buttons.copy_link}
              </Button>

              {hotmartLink && (
                <Button 
                  variant="outline" 
                  onClick={handleOpenHotmart}
                  className="flex-col h-auto py-4"
                >
                  <ExternalLink className="h-6 w-6 mb-2" />
                  {UI_TEXT.buttons.open_hotmart}
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
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
