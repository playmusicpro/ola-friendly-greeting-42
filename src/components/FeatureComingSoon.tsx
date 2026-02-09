import { useState } from "react";
import { Rocket, Clock, Bell, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface FeatureComingSoonProps {
  featureName: string;
  children: React.ReactNode;
  customMessage?: string;
}

const FeatureComingSoon = ({ featureName, children, customMessage }: FeatureComingSoonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifyRequested, setNotifyRequested] = useState(false);

  const defaultMessage = `O módulo "${featureName}" está em desenvolvimento e estará disponível em breve. Estamos construindo isso com cuidado para manter a qualidade do sistema.`;

  const handleNotify = () => {
    setNotifyRequested(true);
    toast({
      title: "✅ Você será avisado!",
      description: `Quando "${featureName}" estiver disponível, você será notificado.`,
    });
    setIsOpen(false);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Função em desenvolvimento
            </DialogTitle>
            <DialogDescription className="text-base pt-3 leading-relaxed">
              {customMessage || defaultMessage}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              variant="outline"
              onClick={handleNotify}
              disabled={notifyRequested}
              className="w-full gap-2"
            >
              <Bell className="h-4 w-4" />
              {notifyRequested ? "Você será avisado!" : "Quero ser avisado"}
            </Button>
            <Button onClick={() => setIsOpen(false)} className="w-full">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeatureComingSoon;
