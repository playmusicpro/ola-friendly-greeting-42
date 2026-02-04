import { ExternalLink, Users, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Comunidades = () => {
  const communities = [
    {
      id: "hotmart",
      name: "Comunidade PLAY MUSIC PRO",
      platform: "Hotmart",
      description: `Esta não é uma comunidade para quem espera ser descoberto.

É para músicos que decidiram crescer, gerar e agregar conhecimento, entendendo que música vai muito além de talento.

Aqui você terá acesso a eBooks, materiais exclusivos e conteúdos estratégicos que formam a base de quem trata a música como negócio, entende o jogo da atenção e quer aprender a jogá-lo com inteligência.

Se você pensa fora da caixa e sabe que resultado vem de estratégia, seu lugar é aqui.`,
      link: "https://hotmart.com/pt-br/club/musico-de-sucesso",
      icon: Users,
      gradient: "from-primary via-primary/80 to-gold",
      buttonText: "Acessar Comunidade",
      highlight: "Conteúdo Estratégico",
    },
    {
      id: "kiwify",
      name: "Formação PLAY MUSIC PRO",
      platform: "Kiwify",
      description: `Talento abre portas. Execução constrói carreira.

Esta área é para músicos que não querem só consumir conteúdo, mas aplicar, executar e crescer.

Aqui estão os cursos, treinamentos e formações práticas do PLAY MUSIC PRO — feitos para quem entendeu que música é negócio, que atenção é moeda, e que só vence quem aprende a jogar o jogo certo.`,
      link: "https://dashboard.kiwify.com",
      icon: BookOpen,
      gradient: "from-gold via-gold/80 to-primary",
      buttonText: "Acessar Formação",
      highlight: "Cursos e Treinamentos",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-gold/20">
            <Sparkles className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              Comunidades
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Sua rede de crescimento estratégico
            </p>
          </div>
        </div>
      </div>

      {/* Intro Banner */}
      <Card className="p-6 bg-gradient-to-br from-card via-card to-gold/5 border-gold/20 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-gold/10 border border-gold/20">
            <Users className="h-8 w-8 text-gold" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Música é o negócio da atenção
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Você não está aqui por acaso. As comunidades PLAY MUSIC PRO são para músicos que 
              entenderam que talento é só o começo — e que estratégia, execução e visão de negócio 
              são o que separa quem sonha de quem conquista.
            </p>
          </div>
        </div>
      </Card>

      {/* Community Cards */}
      <div className="grid gap-6">
        {communities.map((community) => (
          <Card 
            key={community.id}
            className="overflow-hidden border-gold/20 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            {/* Header Gradient Bar */}
            <div className={`h-2 bg-gradient-to-r ${community.gradient}`} />
            
            <div className="p-6 md:p-8">
              {/* Title Section */}
              <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${community.gradient} bg-opacity-10 shrink-0`}>
                  <community.icon className="h-8 w-8 text-gold" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gold/10 text-gold border border-gold/20">
                      {community.highlight}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                      {community.platform}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    {community.name}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <div className="prose prose-sm max-w-none">
                  {community.description.split('\n\n').map((paragraph, index) => (
                    <p 
                      key={index} 
                      className={`text-muted-foreground leading-relaxed mb-4 last:mb-0 ${
                        index === community.description.split('\n\n').length - 1 
                          ? 'font-semibold text-foreground' 
                          : ''
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <Button
                asChild
                size="lg"
                className={`w-full md:w-auto bg-gradient-to-r ${community.gradient} hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group`}
              >
                <a 
                  href={community.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  {community.buttonText}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  <ExternalLink className="h-4 w-4 opacity-70" />
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer Message */}
      <Card className="p-6 text-center bg-gradient-to-b from-card to-gold/5 border-gold/20">
        <p className="text-sm text-muted-foreground italic">
          "Quem entende o jogo, joga. Quem não entende, assiste."
        </p>
        <p className="text-xs text-gold/60 mt-2 font-medium">
          PLAY MUSIC PRO — Música como negócio
        </p>
      </Card>
    </div>
  );
};

export default Comunidades;
