import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const transactionSchema = z.object({
  valor: z.coerce.number().positive("Valor deve ser positivo"),
});

interface PiggyBankTransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (valor: number) => void | boolean | Promise<void | boolean>;
  tipo: "deposito" | "retirada";
  piggyBankName: string;
}

export function PiggyBankTransactionForm({
  open,
  onOpenChange,
  onSubmit,
  tipo,
  piggyBankName,
}: PiggyBankTransactionFormProps) {
  const form = useForm<{ valor: number }>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { valor: 0 },
  });

  const handleSubmit = async (data: { valor: number }) => {
    if (await onSubmit(data.valor) === false) return;
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {tipo === "deposito" ? "Depositar em" : "Retirar de"} "{piggyBankName}"
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                {tipo === "deposito" ? "Depositar" : "Retirar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
