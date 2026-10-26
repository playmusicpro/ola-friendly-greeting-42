import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/hooks/use-toast";

/** Confere o e-mail digitado com o da conta conectada (sem diferenciar maiúsculas/espaços). */
export const emailMatches = (typed: string, accountEmail?: string | null) =>
  !!accountEmail && typed.trim().toLowerCase() === accountEmail.trim().toLowerCase();

const ResetAllDataCard = () => {
  const { user } = useAuth();
  const { resetAllData } = useFinancialData();
  const { toast } = useToast();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const canConfirm = emailMatches(typed, user?.email) && !busy;

  const close = () => { setStep(0); setTyped(""); };

  const confirm = async () => {
    if (!canConfirm) return;
    setBusy(true);
    const ok = await resetAllData(typed.trim());
    setBusy(false);
    if (ok) { close(); toast({ title: "Todos os dados foram apagados" }); }
  };

  return (
    <Card className="p-6 border-destructive/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-lg bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Reset Geral</h2>
          <p className="text-sm text-muted-foreground">Zerar todos os dados da sua conta</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Apaga shows, agenda, finanças, metas, cofrinhos, projeto e repertório. Seu perfil e login são mantidos.
      </p>
      <Button variant="destructive" className="w-full sm:w-auto" onClick={() => setStep(1)}>
        Zerar Todos os Dados
      </Button>

      <AlertDialog open={step === 1} onOpenChange={(o) => { if (!o) close(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir todos os seus dados?</AlertDialogTitle>
            <AlertDialogDescription>
              A perda é definitiva e irreversível: todas as informações cadastradas no Play Pro serão apagadas e não poderão ser recuperadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={() => setStep(2)}>Entendo, continuar</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={step === 2} onOpenChange={(o) => { if (!o) close(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirme com seu e-mail</AlertDialogTitle>
            <AlertDialogDescription>
              Digite o e-mail cadastrado da sua conta para liberar a exclusão final.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reset-email">E-mail da conta</Label>
            <Input id="reset-email" type="email" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="seu@email.com" />
            {typed && !emailMatches(typed, user?.email) && (
              <p className="text-xs text-destructive">O e-mail não corresponde à conta conectada.</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" disabled={!canConfirm} onClick={confirm}>
              {busy ? "Apagando..." : "Confirmar Exclusão"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ResetAllDataCard;
