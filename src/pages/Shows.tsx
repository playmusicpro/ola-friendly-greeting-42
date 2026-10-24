import { Calendar as CalendarIcon, MapPin, DollarSign, Plus, TrendingUp, Fuel, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinancialData } from "@/hooks/useFinancialData";
import { calculateShow, formatCurrency, formatPercentage } from "@/lib/calculations";
import { GoogleCalendarShowButton } from '@/components/GoogleCalendarShowButton';
import { ShowForm } from "@/components/ShowForm";
import { useState } from "react";
import { Show } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Shows = () => {
  const { shows, addShow, updateShow, deleteShow, markShowRealizado } = useFinancialData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | undefined>();
  const [showToDelete, setShowToDelete] = useState<string | null>(null);

  const handleAddShow = async (showData: Omit<Show, 'id'>) => {
    if (!await addShow(showData)) return false;
    toast({
      title: "Show adicionado!",
      description: "O show foi adicionado à sua agenda com sucesso.",
    });
  };

  const handleUpdateShow = async (showData: Omit<Show, 'id'>) => {
    if (editingShow) {
      if (!await updateShow(editingShow.id, showData)) return false;
      toast({
        title: "Show atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      setEditingShow(undefined);
    }
  };

  const handleDeleteShow = () => {
    if (showToDelete) {
      deleteShow(showToDelete);
      toast({
        title: "Show removido",
        description: "O show foi removido da sua agenda.",
      });
      setShowToDelete(null);
    }
  };

  const handleEditClick = (show: Show) => {
    setEditingShow(show);
    setIsFormOpen(true);
  };

  const handleToggleRealizado = (show: Show) => {
    const novo = !show.realizado;
    markShowRealizado(show.id, novo);
    toast({
      title: novo ? "Show finalizado!" : "Show reaberto",
      description: novo
        ? "O faturamento deste show já conta nas suas metas."
        : "O show voltou para a lista de agendados.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
            Agenda de Shows
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie seus shows e acompanhe seus lucros
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingShow(undefined);
            setIsFormOpen(true);
          }}
          className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Novo Show
        </Button>
      </div>

      {/* Calendar View */}
      <Card className="p-6 shadow-lg border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gold">Dezembro 2024</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-gold/30 text-gold hover:bg-gold/10"
            onClick={() => toast({ title: "Em breve", description: "O calendário completo será disponibilizado em breve." })}
          >
            Ver Calendário Completo
          </Button>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-30 text-gold" />
          <p className="text-lg">Visualização de calendário em desenvolvimento</p>
          <p className="text-sm mt-2">Em breve você poderá ver todos os shows do mês em formato de calendário</p>
        </div>
      </Card>

      {/* Shows List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gold">Próximos Shows</h2>
          <p className="text-sm text-muted-foreground">{shows.length} show(s) cadastrado(s)</p>
        </div>
        {shows.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-30 text-gold" />
            <h3 className="text-xl font-semibold mb-2">Nenhum show cadastrado</h3>
            <p className="text-muted-foreground mb-6">
              Adicione seu primeiro show para começar a acompanhar seus lucros
            </p>
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Show
            </Button>
          </Card>
        ) : (
          shows.map((show) => {
            const calc = calculateShow(show);
            const showDate = new Date(show.date);
            const formattedDate = showDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
            
            return (
              <Card key={show.id} className="p-6 hover:border-primary/40 transition-all shadow-lg hover:shadow-xl">
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-xl font-bold">{show.title || show.local}</h3>
                        <Badge variant="outline" className="border-primary/30 text-primary">{show.tipo}</Badge>
                        {show.realizado && (
                          <Badge className="bg-success text-white border-success">Finalizado</Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gold" />
                          <span className="font-medium">{formattedDate} às {show.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gold" />
                          <span className="font-medium">Cachê: {formatCurrency(show.cache)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gold" />
                          <span className="text-xs">Total de gastos: {formatCurrency(calc.totalGastos)}</span>
                        </div>
                        {show.kmRodados > 0 && (
                          <div className="flex items-center gap-2">
                            <Fuel className="h-4 w-4 text-gold" />
                            <span className="text-xs">
                              {show.kmRodados}km rodados • Preço médio: {formatCurrency(calc.precoMedioCombustivel)}/km
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap justify-end">
                      <GoogleCalendarShowButton show={show} />
                      <Button
                        size="sm"
                        variant={show.realizado ? "outline" : "default"}
                        onClick={() => handleToggleRealizado(show)}
                        className={show.realizado ? "gap-2" : "gap-2 bg-success hover:bg-success/90 text-white"}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {show.realizado ? "Reabrir" : "Marcar finalizado"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(show)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowToDelete(show.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center w-full">
                    <div className="text-center p-4 bg-success/10 rounded-xl border border-success/20 flex-1">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Faturamento Real</p>
                      <p className="text-2xl md:text-3xl font-bold text-success">{formatCurrency(calc.faturamentoReal)}</p>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/20 flex-1">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Margem</p>
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <p className="text-2xl md:text-3xl font-bold text-primary">{formatPercentage(calc.margemPercentual)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center flex-1">
                      {calc.valeuAPena ? (
                        <Badge className="bg-success text-white border-success px-4 py-2 text-sm font-semibold shadow-md">
                          ✓ Valeu a pena!
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="px-4 py-2 text-sm font-semibold shadow-md">
                          ✗ Não compensou
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Show Form Dialog */}
      <ShowForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingShow(undefined);
        }}
        onSubmit={editingShow ? handleUpdateShow : handleAddShow}
        initialData={editingShow}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!showToDelete} onOpenChange={() => setShowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este show? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteShow}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Shows;
