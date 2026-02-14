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
import { PiggyBank } from "@/types";

const piggyBankSchema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  valorAtual: z.coerce.number().min(0, "Valor não pode ser negativo"),
  objetivo: z.coerce.number().optional(),
});

type PiggyBankFormData = z.infer<typeof piggyBankSchema>;

interface PiggyBankFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<PiggyBank, "id" | "criadoEm" | "historico">) => void;
}

export function PiggyBankForm({ open, onOpenChange, onSubmit }: PiggyBankFormProps) {
  const form = useForm<PiggyBankFormData>({
    resolver: zodResolver(piggyBankSchema),
    defaultValues: {
      nome: "",
      valorAtual: 0,
      objetivo: undefined,
    },
  });

  const handleSubmit = (data: PiggyBankFormData) => {
    onSubmit({
      nome: data.nome,
      valorAtual: data.valorAtual,
      objetivo: data.objetivo || undefined,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Cofrinho</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cofrinho</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Equipamento novo, Turnê, Clipe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valorAtual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Inicial (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objetivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivo (R$) - Opcional</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Ex: 5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Criar Cofrinho
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
