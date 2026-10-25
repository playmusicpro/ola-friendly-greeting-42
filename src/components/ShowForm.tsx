import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showSchema, showFormDefaults, type ShowFormData } from "@/lib/showForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import { Switch } from "@/components/ui/switch";
import { TrendingUp, DollarSign, Users } from "lucide-react";
import { Show } from "@/types";
import { calculateShow, formatCurrency, formatPercentage, toISODate } from "@/lib/calculations";
import { useEffect } from "react";

interface ShowFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (show: Omit<Show, 'id'>) => boolean | void | Promise<boolean | void>;
  initialData?: Show;
  prefill?: Partial<Show>;
}

export function ShowForm({ open, onOpenChange, onSubmit, initialData, prefill }: ShowFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ShowFormData>({
    resolver: zodResolver(showSchema),
    defaultValues: showFormDefaults(initialData || prefill),
  });
  const watchedValues = watch();
  const calculations = calculateShow({ ...showFormDefaults(watchedValues), id: 'preview' });
  const outstanding = watchedValues.settled ? 0 : Math.max(0, (watchedValues.cache || 0) - (watchedValues.depositReceived ? watchedValues.depositAmount || 0 : 0));
  useEffect(() => {
    if (open) reset(showFormDefaults(initialData || prefill));
  }, [open, initialData, prefill, reset]);

  const handleFormSubmit = async (data: ShowFormData) => {
    // Após validação do zod, todos os campos estarão presentes
    if (await onSubmit({ ...data, cashTracking: true } as Omit<Show, 'id'>) === false) return;
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={value => { if (!isSubmitting) onOpenChange(value); }}>
      <DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto rounded-xl p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {initialData ? "Editar Show" : "Novo Show"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Dados do Evento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="show-title">Nome do Show *</Label><Input id="show-title" {...register('title')} placeholder="Nome da apresentação" className="mt-1" />{errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}</div>
              <div><Label htmlFor="contractor">Contratante *</Label><Input id="contractor" {...register('contractor')} placeholder="Pessoa ou empresa" className="mt-1" />{errors.contractor && <p className="text-xs text-destructive mt-1">{errors.contractor.message}</p>}</div>
              <div><Label htmlFor="show-end">Horário de término</Label><Input id="show-end" type="time" {...register('endTime')} /></div>
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
                  value={watchedValues.tipo}
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
                  <div><Label>Valor Restante / A Receber</Label><output className="block text-xl font-semibold text-gold mt-2" aria-live="polite">{formatCurrency(outstanding)}</output></div>
                </div>
                <div className="flex items-center justify-between gap-3"><Label htmlFor="depositReceived">Sinal recebido</Label><Switch id="depositReceived" checked={!!watchedValues.depositReceived} onCheckedChange={value => { setValue('depositReceived', value); if (value && !watchedValues.depositDate) setValue('depositDate', toISODate(new Date())); }} /></div>
                {watchedValues.depositReceived && <div><Label htmlFor="depositDate">Data de recebimento do sinal</Label><Input id="depositDate" type="date" {...register('depositDate')} />{errors.depositDate && <p className="text-xs text-destructive">{errors.depositDate.message}</p>}</div>}
                <div className="flex items-center justify-between gap-3"><Label htmlFor="settled">Quitado (100% Pago)</Label><Switch id="settled" checked={!!watchedValues.settled} onCheckedChange={value => { setValue('settled', value); if (value && !watchedValues.settlementDate) setValue('settlementDate', toISODate(new Date())); }} /></div>
                {watchedValues.settled && <div><Label htmlFor="settlementDate">Data da quitação</Label><Input id="settlementDate" type="date" {...register('settlementDate')} />{errors.settlementDate && <p className="text-xs text-destructive">{errors.settlementDate.message}</p>}</div>}
              </div>

              <div className="md:col-span-2 py-3">
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

              <div className="md:col-span-2 flex items-center justify-between gap-3 border-t border-border py-4">
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

          {/* Custo Operacional Direto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Custo Operacional Direto</h3>
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
                <Label htmlFor="combustivel">Combustível / Transporte (R$)</Label>
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
                <Label htmlFor="consumacao">Alimentação / Consumação (R$)</Label>
                <Input
                  id="consumacao"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("consumacao", { valueAsNumber: true })}
                  className="mt-1"
                />
                
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
          <div className="space-y-3 border-y border-border py-4"><div className="flex items-start gap-3"><input id="deductTeam" type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={!!watchedValues.deductTeam} onChange={event => { setValue('deductTeam', event.target.checked); if (event.target.checked && !watchedValues.teamPaymentDate) setValue('teamPaymentDate', toISODate(new Date())); }} /><Label htmlFor="deductTeam">Descontar Cachês da Equipe/Músicos do Caixa</Label></div>{watchedValues.deductTeam && <div><Label htmlFor="teamPaymentDate">Data do pagamento da equipe</Label><Input id="teamPaymentDate" type="date" {...register('teamPaymentDate')} />{errors.teamPaymentDate && <p className="text-xs text-destructive">{errors.teamPaymentDate.message}</p>}</div>}</div>
          <section className="border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Resultado Previsto do Show</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><p className="text-xs text-muted-foreground">Custos Totais</p><p className="text-xl font-semibold text-destructive tabular-nums">{formatCurrency(calculations.totalGastos)}</p></div>
              <div><p className="text-xs text-muted-foreground">Resultado Previsto</p><p className="text-xl font-semibold text-gold tabular-nums">{formatCurrency(calculations.lucroReal)}</p></div>
              <div><p className="text-xs text-muted-foreground">Margem Prevista</p><p className="text-xl font-semibold text-primary flex items-center gap-2"><TrendingUp className="h-4 w-4" />{formatPercentage(calculations.margemPercentual)}</p></div>
            </div>
          </section>

          {/* Botões */}
          <div className="sticky bottom-0 flex gap-3 justify-end border-t border-border bg-background py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
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
              className="text-primary-foreground"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {isSubmitting ? "Salvando…" : initialData ? "Salvar Alterações" : "Salvar Show"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
