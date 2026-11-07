import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Crown, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isFounderPlan, planTitle } from "@/lib/billing";

/**
 * Boas-vindas exibida no Painel logo depois do pagamento confirmado.
 * O Stripe devolve o usuário em /dashboard?concluido=1&plano=<tipo>.
 */
export default function FounderVipDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const planType = searchParams.get("plano");

  useEffect(() => {
    if (searchParams.get("concluido") === "1") setOpen(true);
  }, [searchParams]);

  const close = () => {
    setOpen(false);
    const next = new URLSearchParams(searchParams);
    next.delete("concluido");
    next.delete("plano");
    next.delete("sessao");
    setSearchParams(next, { replace: true });
  };

  const founder = isFounderPlan(planType);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md border-gold/30 bg-card/80 backdrop-blur-xl">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/30 to-primary/30 border border-gold/30 flex items-center justify-center">
            {founder ? (
              <Crown className="h-8 w-8 text-gold" />
            ) : (
              <Sparkles className="h-8 w-8 text-gold" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gold to-primary bg-clip-text text-transparent">
            {founder ? "Você é Membro Fundador!" : `Bem-vindo ao ${planTitle(planType)}`}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {founder
              ? "Pagamento confirmado. Seu acesso vitalício do lote da Black Friday está ativado — obrigado por crescer com a gente desde o começo."
              : "Pagamento confirmado. Seu plano já está ativo no Painel e pode ser gerenciado quando quiser."}
          </DialogDescription>
        </div>
        <Button
          className="w-full bg-gradient-to-r from-gold to-primary hover:opacity-90 text-white font-semibold"
          onClick={close}
        >
          Ir para o Painel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
