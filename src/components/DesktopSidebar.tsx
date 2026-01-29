import { Home, Calendar, DollarSign, Video, Music, Trophy, Settings, BarChart3, TrendingUp, Rocket } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Separator } from "@/components/ui/separator";

const DesktopSidebar = () => {
  const mainNavItems = [
    { icon: Home, label: "Painel Inicial", path: "/" },
    { icon: Calendar, label: "Agenda", path: "/agenda" },
    { icon: DollarSign, label: "Consultor Financeiro", path: "/financas" },
    { icon: TrendingUp, label: "Outras Receitas", path: "/receitas" },
    { icon: BarChart3, label: "Análise por Evento", path: "/analises" },
    { icon: Video, label: "Projeto Audiovisual", path: "/projeto" },
    { icon: Music, label: "Repertório Inteligente", path: "/repertorio" },
  ];

  const extraNavItems = [
    { icon: Trophy, label: "Desafios Online", path: "/desafios" },
    { icon: Rocket, label: "Launch Checklist", path: "/launch" },
    { icon: Settings, label: "Configurações", path: "/configuracoes" },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-gold/10 shadow-xl">
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex items-center justify-center h-20 border-b border-gold/20 bg-gradient-to-b from-black to-transparent">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-gold to-primary bg-clip-text text-transparent">
            Play Pro
          </h1>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          <div className="mb-2 px-4">
            <p className="text-xs uppercase tracking-wider text-gold/60 font-semibold">Menu Principal</p>
          </div>
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
              activeClassName="bg-gradient-to-r from-primary/20 to-gold/10 text-gold border-l-4 border-gold shadow-md"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <Separator className="my-4 bg-border/50" />
          
          <div className="mb-2 px-4">
            <p className="text-xs uppercase tracking-wider text-gold/60 font-semibold">Extras</p>
          </div>
          {extraNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-muted-foreground hover:bg-gold/5 hover:text-gold transition-all"
              activeClassName="bg-gradient-to-r from-gold/20 to-primary/10 text-gold border-l-4 border-gold shadow-md"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gold/10">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-gold/5 border border-gold/20">
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-semibold text-gold">Play Pro</span> v1.0
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
