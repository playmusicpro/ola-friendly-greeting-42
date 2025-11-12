import { Calendar as CalendarIcon, MapPin, DollarSign, Plus, TrendingUp, Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinancialData } from "@/hooks/useFinancialData";
import { calculateShow, formatCurrency, formatPercentage } from "@/lib/calculations";

const Shows = () => {
  const { shows } = useFinancialData();

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
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg">
          <Plus className="h-5 w-5" />
          Novo Show
        </Button>
      </div>

      {/* Calendar View */}
      <Card className="p-6 shadow-lg border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gold">Dezembro 2024</h2>
          <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
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
        <h2 className="text-2xl font-semibold text-gold">Próximos Shows</h2>
        {shows.map((show) => {
          const calc = calculateShow(show);
          const showDate = new Date(show.date);
          const formattedDate = showDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
          
          return (
            <Card key={show.id} className="p-6 hover:border-primary/40 transition-all shadow-lg hover:shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold">{show.local}</h3>
                    <Badge variant="outline" className="border-primary/30 text-primary">{show.tipo}</Badge>
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

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="text-center p-4 bg-success/10 rounded-xl border border-success/20">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Lucro Real</p>
                    <p className="text-3xl font-bold text-success">{formatCurrency(calc.lucroReal)}</p>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Margem</p>
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <p className="text-3xl font-bold text-primary">{formatPercentage(calc.margemPercentual)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
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
        })}
      </div>
    </div>
  );
};

export default Shows;
