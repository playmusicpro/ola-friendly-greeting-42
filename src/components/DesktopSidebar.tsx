import { Home, Calendar, DollarSign, Video, Trophy, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const DesktopSidebar = () => {
  const navItems = [
    { icon: Home, label: "Painel Inicial", path: "/" },
    { icon: Calendar, label: "Agenda de Shows", path: "/shows" },
    { icon: DollarSign, label: "Consultor Financeiro", path: "/financas" },
    { icon: Video, label: "Projeto Audiovisual", path: "/projeto" },
    { icon: Trophy, label: "Desafios Online", path: "/desafios" },
    { icon: Settings, label: "Configurações", path: "/configuracoes" },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border">
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex items-center justify-center h-16 border-b border-border">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
            Play Pro
          </h1>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
              activeClassName="bg-primary/10 text-primary border border-primary/20"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
