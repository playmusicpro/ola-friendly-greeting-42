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
import { Switch } from "@/components/ui/switch";
import { TrendingUp, DollarSign, Users } from "lucide-react";
import { Show } from "@/types";
import { calculateShow, formatCurrency, formatPercentage, toISODate } from "@/lib/calculations";
import { useEffect, useState } from "react";

const showSchema = z.object({
  title: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  endTime: z.string().optional(),
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
  cashTracking: z.boolean().default(true),
  depositAmount: z.number().min(0).default(0),
  depositReceived: z.boolean().default(false),
  depositDate: z.string().optional(),
  settled: z.boolean().default(false),
  settlementDate: z.string().optional(),
  deductTeam: z.boolean().default(false),
  teamPaymentDate: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.depositAmount > data.cache) ctx.addIssue({ code: 'custom', path: ['depositAmount'], message: 'Sinal não pode superar o cachê' });
  if (data.depositReceived && !data.depositDate) ctx.addIssue({ code: 'custom', path: ['depositDate'], message: 'Informe a data do sinal' });
  if (data.settled && !data.settlementDate) ctx.addIssue({ code: 'custom', path: ['settlementDate'], message: 'Informe a data da quitação' });
});

type ShowFormData = z.infer<typeof showSchema>;

interface ShowFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (show: Omit<Show, 'id'>) => boolean | void | Promise<boolean | void>;
  initialData?: Show;
}

export function ShowForm({ open, onOpenChange, onSubmit, initialData }: ShowFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
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
      realizado: false,
      cashTracking: true, depositAmount: 0, depositReceived: false, settled: false, deductTeam: false,
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
    if (!open) return;
    reset(initialData ? { ...initialData, cashTracking: true, depositAmount: initialData.depositAmount ?? 0 } : {
      date: '', time: '', local: '', tipo: '', cache: 0, numMusicos: 1, consumacao: 0, kmRodados: 0,
      combustivel: 0, pedagio: 0, roupas: 0, equipamentos: 0, outrosCustos: 0, pagamentoMusicos: 0,
      realizado: false, cashTracking: true, depositAmount: 0, depositReceived: false, settled: false, deductTeam: false,
    });
  }, [open, initialData, reset]);

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

  const handleFormSubmit = async (data: ShowFormData) => {
    // Após validação do zod, todos os campos estarão presentes
    if (await onSubmit({ ...data, cashTracking: true } as Omit<Show, 'id'>) === false) return;
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
              <div className="md:col-span-2"><Label htmlFor="show-title">Título do Show</Label><Input id="show-title" {...register('title')} placeholder="Nome da apresentação" /></div>
              <div><Label htmlFor="show-end">Horário de término</Label><Input id="show-end" type="time" {...register('endTime')} /><p className="text-xs text-muted-foreground">Sem término informado: duração de 2 horas no Google Agenda.</p></div>
              <div><Label htmlFor="show-address">Endereço</Label><Input id="show-address" {...register('address')} placeholder="Rua, número e cidade" /></div>
              <div className="md:col-span-2"><Label htmlFor="show-notes">Descrição</Label><Input id="show-notes" {...register('notes')} /></div>
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
                <Label htmlFor="cache">Valor Total do Cachê (R$) *</Label>
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

              <div className="md:col-span-2 space-y-4 border-y border-border py-4">
                <h3 className="font-semibold text-gold">Recebimentos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label htmlFor="depositAmount">Sinal (R$)</Label><div className="flex gap-2"><Input id="depositAmount" type="number" step="0.01" {...register('depositAmount', { valueAsNumber: true })} /><Button type="button" variant="outline" onClick={() => setValue('depositAmount', Math.round((watchedValues.cache || 0) * 50) / 100)}>50%</Button></div>{errors.depositAmount && <p className="text-xs text-destructive">{errors.depositAmount.message}</p>}</div>
                  <div><Label>Valor Restante</Label><p className="text-xl font-semibold text-gold mt-2">{formatCurrency(Math.max(0, (watchedValues.cache || 0) - (watchedValues.depositAmount || 0)))}</p></div>
                </div>
                <div className="flex items-center justify-between gap-3"><Label htmlFor="depositReceived">Sinal recebido</Label><Switch id="depositReceived" checked={!!watchedValues.depositReceived} onCheckedChange={value => { setValue('depositReceived', value); if (value && !watchedValues.depositDate) setValue('depositDate', toISODate(new Date())); }} /></div>
                {watchedValues.depositReceived && <div><Label htmlFor="depositDate">Data de recebimento do sinal</Label><Input id="depositDate" type="date" {...register('depositDate')} />{errors.depositDate && <p className="text-xs text-destructive">{errors.depositDate.message}</p>}</div>}
                <div className="flex items-center justify-between gap-3"><Label htmlFor="settled">Quitado (100% Pago)</Label><Switch id="settled" checked={!!watchedValues.settled} onCheckedChange={value => { setValue('settled', value); if (value && !watchedValues.settlementDate) setValue('settlementDate', toISODate(new Date())); }} /></div>
                {watchedValues.settled && <div><Label htmlFor="settlementDate">Data da quitação</Label><Input id="settlementDate" type="date" {...register('settlementDate')} />{errors.settlementDate && <p className="text-xs text-destructive">{errors.settlementDate.message}</p>}</div>}
              </div>

              <div className="md:col-span-2 p-4 rounded-xl border-2 border-gold/40 bg-gold/5">
                <Label htmlFor="numMusicos" className="flex items-center gap-2 text-base font-semibold text-gold">
                  <Users className="h-4 w-4" />
                  Quantidade de Músicos *
                </Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Inclua você e todos os músicos que sobem ao palco neste show
                </p>
                <Input
                  id="numMusicos"
                  type="number"
                  min={1}
                  placeholder="1"
                  {...register("numMusicos", { valueAsNumber: true })}
                  className="max-w-[160px] text-lg font-semibold"
                />
                {errors.numMusicos && (
                  <p className="text-xs text-destructive mt-1">{errors.numMusicos.message}</p>
                )}
              </div>

              <div className="md:col-span-2 flex items-center justify-between p-4 rounded-xl border border-border bg-background/50">
                <div>
                  <Label htmlFor="realizado" className="text-base font-semibold">Show finalizado</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show realizado
                  </p>
                </div>
                <Switch
                  id="realizado"
                  checked={!!watchedValues.realizado}
                  onCheckedChange={(checked) => setValue("realizado", checked)}
                />
              </div>
            </div>
          </div>

          {/* Gastos do Show */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Gastos do Show</h3>
            <p className="text-xs text-muted-foreground">
              Preencha todos os custos relacionados ao show para calcular o faturamento real
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
                <Label htmlFor="pagamentoMusicos">Cachê da Equipe/Músicos (R$)</Label>
                <Input
                  id="pagamentoMusicos"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("pagamentoMusicos", { valueAsNumber: true })}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Total pago aos demais músicos e equipe</p>
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
          <div className="space-y-3 border-y border-border py-4"><div className="flex items-start gap-3"><input id="deductTeam" type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={!!watchedValues.deductTeam} onChange={event => { setValue('deductTeam', event.target.checked); if (event.target.checked && !watchedValues.teamPaymentDate) setValue('teamPaymentDate', toISODate(new Date())); }} /><Label htmlFor="deductTeam">Descontar Cachês da Equipe/Músicos do Caixa</Label></div>{watchedValues.deductTeam && <div><Label htmlFor="teamPaymentDate">Data do pagamento da equipe</Label><Input id="teamPaymentDate" type="date" {...register('teamPaymentDate')} /></div>}</div>
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-gold/5 border-gold/20">
            <h3 className="text-lg font-semibold text-gold mb-4">Resultado do Show</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Total de Gastos</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(calculations.totalGastos)}</p>
              </div>

              <div className="text-center p-4 bg-success/10 rounded-xl border border-success/20">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Faturamento Real</p>
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
              disabled={isSubmitting}
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
