import { FileText, Image, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Desafios = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Desafios Online</h1>
        <p className="text-muted-foreground">
          Ferramentas e prompts para impulsionar sua carreira
        </p>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Presskit Challenge */}
        <Card
          className="p-6 cursor-pointer hover:border-primary/40 transition-all hover:shadow-[0_0_20px_rgba(0,86,255,0.2)]"
          onClick={() => navigate("/desafios/presskit")}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Como criar seu Presskit</h2>
          <p className="text-muted-foreground mb-4">
            Prompts prontos para criar um presskit profissional usando IA. 
            Tenha bio, fotos e materiais de divulgação em minutos.
          </p>
          <div className="flex items-center gap-2 text-sm text-primary">
            <span className="font-medium">Acessar prompts</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Card>

        {/* Flyer Challenge */}
        <Card
          className="p-6 cursor-pointer hover:border-gold/40 transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          onClick={() => navigate("/desafios/flyer")}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-gold/10">
              <Image className="h-8 w-8 text-gold" />
            </div>
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Nunca mais pague por flyer</h2>
          <p className="text-muted-foreground mb-4">
            Aprenda a criar flyers profissionais usando prompts de design. 
            Economize e tenha autonomia criativa total.
          </p>
          <div className="flex items-center gap-2 text-sm text-gold">
            <span className="font-medium">Acessar prompts</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card className="p-6 border-dashed opacity-60">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2">Mais desafios em breve...</h3>
          <p className="text-muted-foreground">
            Estamos preparando novos prompts e ferramentas para você!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Desafios;
