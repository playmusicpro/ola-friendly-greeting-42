import { FileText, Image, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Desafios = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
          Desafios Online
        </h1>
        <p className="text-muted-foreground text-lg">
          Ferramentas premium para impulsionar sua carreira
        </p>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Presskit Challenge */}
        <Card
          className="p-8 cursor-pointer hover:border-primary/40 transition-all hover:shadow-[0_0_30px_rgba(0,86,255,0.3)] group bg-gradient-to-br from-card to-primary/5"
          onClick={() => navigate("/desafios/presskit")}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <ChevronRight className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Como criar seu Presskit</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Prompts prontos para criar um presskit profissional usando IA. 
            Tenha bio, fotos e materiais de divulgação em minutos.
          </p>
          <div className="flex items-center gap-2 text-sm text-primary font-semibold">
            <span>Acessar prompts VIP</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Card>

        {/* Flyer Challenge */}
        <Card
          className="p-8 cursor-pointer hover:border-gold/40 transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] group bg-gradient-to-br from-card to-gold/5"
          onClick={() => navigate("/desafios/flyer")}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 rounded-xl bg-gold/10 group-hover:bg-gold/20 transition-colors">
              <Image className="h-10 w-10 text-gold" />
            </div>
            <ChevronRight className="h-7 w-7 text-muted-foreground group-hover:text-gold transition-colors" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Nunca mais pague por flyer</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Aprenda a criar flyers profissionais usando prompts de design. 
            Economize e tenha autonomia criativa total.
          </p>
          <div className="flex items-center gap-2 text-sm text-gold font-semibold">
            <span>Acessar prompts VIP</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card className="p-8 border-dashed border-2 opacity-60 bg-secondary/20">
        <div className="text-center py-12">
          <h3 className="text-2xl font-semibold mb-3">Mais desafios em breve...</h3>
          <p className="text-muted-foreground text-lg">
            Estamos preparando novos prompts e ferramentas exclusivas para você!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Desafios;
