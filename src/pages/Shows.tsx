import { Calendar as CalendarIcon, MapPin, DollarSign, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Shows = () => {
  const shows = [
    {
      id: 1,
      date: "15 Dez 2024",
      time: "21h00",
      local: "Bar do Zé",
      tipo: "Bar",
      cache: 800,
      lucro: 520,
      margem: 65,
      valeuAPena: true,
    },
    {
      id: 2,
      date: "20 Dez 2024",
      time: "22h00",
      local: "Casa de Eventos Premium",
      tipo: "Casa de Shows",
      cache: 1500,
      lucro: 980,
      margem: 65.3,
      valeuAPena: true,
    },
    {
      id: 3,
      date: "28 Dez 2024",
      time: "20h00",
      local: "Festa Particular",
      tipo: "Particular",
      cache: 2000,
      lucro: 1450,
      margem: 72.5,
      valeuAPena: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agenda de Shows</h1>
          <p className="text-muted-foreground">
            Gerencie seus shows e acompanhe seus lucros
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Show
        </Button>
      </div>

      {/* Calendar View */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Dezembro 2024</h2>
          <Button variant="outline" size="sm">Ver Calendário</Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Visualização de calendário em desenvolvimento</p>
        </div>
      </Card>

      {/* Shows List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Próximos Shows</h2>
        {shows.map((show) => (
          <Card key={show.id} className="p-6 hover:border-primary/40 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{show.local}</h3>
                  <Badge variant="outline">{show.tipo}</Badge>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{show.date} às {show.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Cachê: R$ {show.cache}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Lucro Real</p>
                  <p className="text-2xl font-bold text-success">R$ {show.lucro}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Margem</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <p className="text-2xl font-bold text-success">{show.margem}%</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {show.valeuAPena ? (
                    <Badge className="bg-success text-white border-success">
                      ✓ Valeu a pena!
                    </Badge>
                  ) : (
                    <Badge variant="destructive">✗ Não compensou</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Shows;
