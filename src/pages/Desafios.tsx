import { FileText, Image, ChevronRight, Trophy, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import PresskitGenerator from "@/components/PresskitGenerator";
import FlyerGenerator from "@/components/FlyerGenerator";
import { useChallenges } from "@/hooks/useChallenges";

const Desafios = () => {
  const [activeGenerator, setActiveGenerator] = useState<'none' | 'presskit' | 'flyer'>('none');
  const { getUnlockedBadges, getCompletedChallenges } = useChallenges();
  
  const unlockedBadges = getUnlockedBadges();
  const completedChallenges = getCompletedChallenges();

  if (activeGenerator === 'presskit') {
    return <PresskitGenerator onBack={() => setActiveGenerator('none')} />;
  }

  if (activeGenerator === 'flyer') {
    return <FlyerGenerator onBack={() => setActiveGenerator('none')} />;
  }

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

      {/* Badges Section */}
      {unlockedBadges.length > 0 && (
        <Card className="p-5 border-gold/30 bg-gradient-to-br from-gold/10 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-5 w-5 text-gold" />
            <h2 className="font-semibold text-gold">Suas Conquistas</h2>
            <Badge variant="secondary" className="ml-auto">{unlockedBadges.length} badges</Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold/20 border border-gold/30"
              >
                <Award className="h-4 w-4 text-gold" />
                <span className="text-sm font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Presskit Challenge */}
        <Card
          className={`p-8 cursor-pointer transition-all group bg-gradient-to-br from-card to-primary/5 ${
            completedChallenges.some(c => c.id === 'create-presskit')
              ? 'border-primary/60 hover:border-primary'
              : 'hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,86,255,0.3)]'
          }`}
          onClick={() => setActiveGenerator('presskit')}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              {completedChallenges.some(c => c.id === 'create-presskit') && (
                <Badge className="bg-primary">Concluído</Badge>
              )}
              <ChevronRight className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3">Gerador de Presskit</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Crie um presskit profissional com bio, legendas para redes sociais e material de divulgação usando IA.
          </p>
          <div className="flex items-center gap-2 text-sm text-primary font-semibold">
            <span>Criar meu Presskit</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Card>

        {/* Flyer Challenge */}
        <Card
          className={`p-8 cursor-pointer transition-all group bg-gradient-to-br from-card to-gold/5 ${
            completedChallenges.some(c => c.id === 'create-flyer')
              ? 'border-gold/60 hover:border-gold'
              : 'hover:border-gold/40 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
          }`}
          onClick={() => setActiveGenerator('flyer')}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 rounded-xl bg-gold/10 group-hover:bg-gold/20 transition-colors">
              <Image className="h-10 w-10 text-gold" />
            </div>
            <div className="flex items-center gap-2">
              {completedChallenges.some(c => c.id === 'create-flyer') && (
                <Badge className="bg-gold text-black">Concluído</Badge>
              )}
              <ChevronRight className="h-7 w-7 text-muted-foreground group-hover:text-gold transition-colors" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3">Gerador de Flyers</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Crie flyers profissionais para seus shows usando prompts de design otimizados para IA.
          </p>
          <div className="flex items-center gap-2 text-sm text-gold font-semibold">
            <span>Criar meu Flyer</span>
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
