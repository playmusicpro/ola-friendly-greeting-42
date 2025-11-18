import { Plus, DollarSign, TrendingUp, Edit, Trash2, GraduationCap, Briefcase, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinancialData } from "@/hooks/useFinancialData";
import { formatCurrency } from "@/lib/calculations";
import { IncomeForm } from "@/components/IncomeForm";
import { useState } from "react";
import { Income } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import StatCard from "@/components/StatCard";
import { formatDateBR } from "@/lib/dateUtils";

const Receitas = () => {
  const { incomes, addIncome, updateIncome, deleteIncome } = useFinancialData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | undefined>();
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);

  const handleAddIncome = (incomeData: Omit<Income, 'id'>) => {
    addIncome(incomeData);
    toast({
      title: "Receita adicionada!",
      description: "A receita foi registrada com sucesso.",
    });
    setIsFormOpen(false);
  };

  const handleUpdateIncome = (incomeData: Omit<Income, 'id'>) => {
    if (editingIncome) {
      updateIncome(editingIncome.id, incomeData);
      toast({
        title: "Receita atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      setEditingIncome(undefined);
      setIsFormOpen(false);
    }
  };

  const handleDeleteIncome = () => {
    if (incomeToDelete) {
      deleteIncome(incomeToDelete);
      toast({
        title: "Receita removida",
        description: "A receita foi removida do sistema.",
      });
      setIncomeToDelete(null);
    }
  };

  const handleEditClick = (income: Income) => {
    setEditingIncome(income);
    setIsFormOpen(true);
  };

  const getSourceIcon = (source: Income['source']) => {
    switch (source) {
      case 'lessons':
        return GraduationCap;
      case 'freelance':
        return Briefcase;
      default:
        return Wallet;
    }
  };

  const getSourceLabel = (source: Income['source']) => {
    switch (source) {
      case 'lessons':
        return 'Aulas';
      case 'freelance':
        return 'Freelance';
      default:
        return 'Outras';
    }
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const lessonsTotal = incomes.filter(i => i.source === 'lessons').reduce((sum, i) => sum + i.amount, 0);
  const freelanceTotal = incomes.filter(i => i.source === 'freelance').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
            Outras Receitas
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie suas fontes de renda além dos shows
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingIncome(undefined);
            setIsFormOpen(true);
          }}
          className="gap-2 bg-success hover:bg-success/90 text-white rounded-xl shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Nova Receita
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total de Receitas"
          value={formatCurrency(totalIncome)}
          icon={DollarSign}
          trend="Receitas além dos shows"
          variant="default"
        />
        <StatCard
          title="Aulas de Música"
          value={formatCurrency(lessonsTotal)}
          icon={GraduationCap}
          trend={`${incomes.filter(i => i.source === 'lessons').length} aula(s)`}
          variant="gold"
        />
        <StatCard
          title="Freelance"
          value={formatCurrency(freelanceTotal)}
          icon={Briefcase}
          trend={`${incomes.filter(i => i.source === 'freelance').length} trabalho(s)`}
          variant="default"
        />
      </div>

      {/* Incomes List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gold">Histórico de Receitas</h2>
          <p className="text-sm text-muted-foreground">{incomes.length} receita(s) cadastrada(s)</p>
        </div>
        
        {incomes.length === 0 ? (
          <Card className="p-12 text-center">
            <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground">
              Nenhuma receita cadastrada
            </h3>
            <p className="text-muted-foreground mb-6">
              Adicione suas fontes de renda além dos shows
            </p>
            <Button onClick={() => setIsFormOpen(true)} className="bg-success hover:bg-success/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Receita
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {incomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((income) => {
              const SourceIcon = getSourceIcon(income.source);
              
              return (
                <Card key={income.id} className="p-5 hover:shadow-lg transition-shadow border-success/20">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-success/10">
                        <SourceIcon className="h-6 w-6 text-success" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{income.description}</h3>
                          <Badge variant="outline" className="border-success/30 text-success">
                            {getSourceLabel(income.source)}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold text-success">{formatCurrency(income.amount)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{formatDateBR(income.date)}</span>
                          </div>
                          {income.category && (
                            <Badge variant="secondary" className="text-xs">
                              {income.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(income)}
                        className="hover:bg-success/10 hover:text-success"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIncomeToDelete(income.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingIncome ? 'Editar Receita' : 'Nova Receita'}
            </DialogTitle>
          </DialogHeader>
          <IncomeForm
            onSubmit={editingIncome ? handleUpdateIncome : handleAddIncome}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingIncome(undefined);
            }}
            initialData={editingIncome}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!incomeToDelete} onOpenChange={() => setIncomeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta receita? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteIncome} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Receitas;
