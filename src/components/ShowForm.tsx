import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign } from "lucide-react";
import { Show } from "@/types";
import { calculateShow, formatCurrency, formatPercentage } from "@/lib/calculations";
import { useEffect, useState } from "react";

const showSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
  local: z.string().trim().min(1, "Local é obrigatório").max(200, "Local deve ter no máximo 200 caracteres"),
  tipo: z.string().min(1, "Tipo de evento é obrigatório"),
  cache: z.number().min(0, "Cachê deve ser maior ou igual a zero"),
  numMusicos: z.number().min(1, "Número de músicos deve ser pelo menos 1").max(50, "Número muito alto"),
  consumacao: z.number().min(0, "Valor não pode ser negativo"),
  kmRodados: z.number().min(0, "Valor não pode ser negativo"),
  combustivel: z.number().min(0, "Valor não pode ser negativo"),
  pedagio: z.number().min(0, "Valor não pode ser negativo"),
  roupas: z.number().min(0, "Valor não pode ser negativo"),
  equipamentos: z.number().min(0, "Valor não pode ser negativo"),
  outrosCustos: z.number().min(0, "Valor não pode ser negativo"),
  pagamentoMusicos: z.number().min(0, "Valor não pode ser negativo"),
  realizado: z.boolean().default(false),
});

type ShowFormData = z.infer<typeof showSchema>;

interface ShowFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (show: Omit<Show, 'id'>) => void;
  initialData?: Show;
}

export function ShowForm({ open, onOpenChange, onSubmit, initialData }: ShowFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ShowFormData>({
    resolver: zodResolver(showSchema),
    defaultValues: initialData || {
      date: "",
      time: "",
      local: "",
      tipo: "",
      cache: 0,
      numMusicos: 1,
      consumacao: 0,
      kmRodados: 0,
      combustivel: 0,
      pedagio: 0,
      roupas: 0,
      equipamentos: 0,
      outrosCustos: 0,
      pagamentoMusicos: 0,
    },
  });

  const [calculations, setCalculations] = useState({
    totalGastos: 0,
    lucroReal: 0,
    margemPercentual: 0,
    valeuAPena: false,
    precoMedioCombustivel: 0,
  });

  const watchedValues = watch();

  useEffect(() => {
    const mockShow: Show = {
      id: "temp",
      date: watchedValues.date || "",
      time: watchedValues.time || "",
      local: watchedValues.local || "",
      tipo: watchedValues.tipo || "",
      cache: watchedValues.cache || 0,
      numMusicos: watchedValues.numMusicos || 1,
      consumacao: watchedValues.consumacao || 0,
      kmRodados: watchedValues.kmRodados || 0,
      combustivel: watchedValues.combustivel || 0,
      pedagio: watchedValues.pedagio || 0,
      roupas: watchedValues.roupas || 0,
      equipamentos: watchedValues.equipamentos || 0,
      outrosCustos: watchedValues.outrosCustos || 0,
      pagamentoMusicos: watchedValues.pagamentoMusicos || 0,
    };
    const calc = calculateShow(mockShow);
    setCalculations(calc);
  }, [watchedValues]);

  const handleFormSubmit = (data: ShowFormData) => {
    // Após validação do zod, todos os campos estarão presentes
    onSubmit(data as Omit<Show, 'id'>);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gold to-primary bg-clip-text text-transparent">
            {initialData ? "Editar Show" : "Novo Show"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Informações do Show</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                  className="mt-1"
                />
                {errors.date && (
                  <p className="text-xs text-destructive mt-1">{errors.date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  {...register("time")}
                  className="mt-1"
                />
                {errors.time && (
                  <p className="text-xs text-destructive mt-1">{errors.time.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="local">Local do Show *</Label>
                <Input
                  id="local"
                  placeholder="Ex: Bar do Zé, Casa de Shows Premium"
                  {...register("local")}
                  className="mt-1"
                  maxLength={200}
                />
                {errors.local && (
                  <p className="text-xs text-destructive mt-1">{errors.local.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="tipo">Tipo de Evento *</Label>
                <Select
                  onValueChange={(value) => setValue("tipo", value)}
                  defaultValue={initialData?.tipo}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bar">Bar</SelectItem>
                    <SelectItem value="Casa de Shows">Casa de Shows</SelectItem>
                    <SelectItem value="Particular">Festa Particular</SelectItem>
                    <SelectItem value="Casamento">Casamento</SelectItem>
                    <SelectItem value="Corporativo">Evento Corporativo</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-xs text-destructive mt-1">{errors.tipo.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cache">Valor do Cachê (R$) *</Label>
                <Input
                  id="cache"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("cache", { valueAsNumber: true })}
                  className="mt-1"
                />
                {errors.cache && (
                  <p className="text-xs text-destructive mt-1">{errors.cache.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="numMusicos">Número de Músicos *</Label>
                <Input
                  id="numMusicos"
                  type="number"
                  placeholder="1"
                  {...register("numMusicos", { valueAsNumber: true })}
                  className="mt-1"
                />
                {errors.numMusicos && (
                  <p className="text-xs text-destructive mt-1">{errors.numMusicos.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Gastos do Show */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Gastos do Show</h3>
            <p className="text-xs text-muted-foreground">
              Preencha todos os custos relacionados ao show para calcular o lucro real
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kmRodados">Quilometragem (km)</Label>
                <Input
                  id="kmRodados"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("kmRodados", { valueAsNumber: true })}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Distância percorrida até o show</p>
              </div>

              <div>
                <Label htmlFor="combustivel">Combustível (R$)</Label>
                <Input
                  id="combustivel"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("combustivel", { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="pedagio">Pedágio (R$)</Label>
                <Input
                  id="pedagio"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("pedagio", { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="consumacao">Consumação/Abate (R$)</Label>
                <Input
                  id="consumacao"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("consumacao", { valueAsNumber: true })}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Valor descontado do cachê</p>
              </div>

              <div>
                <Label htmlFor="roupas">Roupas/Figurino (R$)</Label>
                <Input
                  id="roupas"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("roupas", { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="equipamentos">Equipamentos (R$)</Label>
                <Input
                  id="equipamentos"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("equipamentos", { valueAsNumber: true })}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Cordas, cabos, manutenção</p>
              </div>

              <div>
                <Label htmlFor="pagamentoMusicos">Pagamento de Músicos (R$)</Label>
                <Input
                  id="pagamentoMusicos"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("pagamentoMusicos", { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="outrosCustos">Outros Custos (R$)</Label>
                <Input
                  id="outrosCustos"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("outrosCustos", { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Cálculo em Tempo Real */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-gold/5 border-gold/20">
            <h3 className="text-lg font-semibold text-gold mb-4">Resultado do Show</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Total de Gastos</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(calculations.totalGastos)}</p>
              </div>

              <div className="text-center p-4 bg-success/10 rounded-xl border border-success/20">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Lucro Real</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(calculations.lucroReal)}</p>
              </div>

              <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Margem</p>
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-2xl font-bold text-primary">{formatPercentage(calculations.margemPercentual)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center">
              {calculations.valeuAPena ? (
                <Badge className="bg-success text-white border-success px-4 py-2 text-sm font-semibold shadow-md">
                  ✓ Valeu a pena sair de casa!
                </Badge>
              ) : (
                <Badge variant="destructive" className="px-4 py-2 text-sm font-semibold shadow-md">
                  ✗ Este show não compensou
                </Badge>
              )}
            </div>

            {calculations.precoMedioCombustivel > 0 && (
              <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  Preço médio do combustível: {formatCurrency(calculations.precoMedioCombustivel)}/km
                </p>
              </div>
            )}
          </Card>

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {initialData ? "Salvar Alterações" : "Adicionar Show"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
