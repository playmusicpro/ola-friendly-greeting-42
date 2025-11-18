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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Income } from "@/types";

const incomeSchema = z.object({
  description: z.string().min(3, "Descrição deve ter ao menos 3 caracteres"),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  date: z.string().min(1, "Data é obrigatória"),
  source: z.enum(['lessons', 'freelance', 'other']),
  category: z.string().optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  onSubmit: (data: Omit<Income, 'id'>) => void;
  onCancel: () => void;
  initialData?: Income;
}

export function IncomeForm({ onSubmit, onCancel, initialData }: IncomeFormProps) {
  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: initialData ? {
      description: initialData.description,
      amount: initialData.amount,
      date: initialData.date,
      source: initialData.source,
      category: initialData.category || '',
    } : {
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      source: 'other',
      category: '',
    },
  });

  const handleSubmit = (data: IncomeFormData) => {
    const incomeData: Omit<Income, 'id'> = {
      description: data.description,
      amount: data.amount,
      date: data.date,
      source: data.source,
      category: data.category,
    };
    onSubmit(incomeData);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Aula de violão - João" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
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

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origem</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="lessons">Aulas de Música</SelectItem>
                  <SelectItem value="freelance">Freelance / Bico</SelectItem>
                  <SelectItem value="other">Outras Fontes</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Ensino, Produção, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
            {initialData ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
