import { Home, Calendar, DollarSign, Video, Trophy, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const MobileNav = () => {
  const navItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Calendar, label: "Shows", path: "/shows" },
    { icon: DollarSign, label: "Finanças", path: "/financas" },
    { icon: Video, label: "Projeto", path: "/projeto" },
    { icon: Trophy, label: "Desafios", path: "/desafios" },
    { icon: Settings, label: "Config", path: "/configuracoes" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
