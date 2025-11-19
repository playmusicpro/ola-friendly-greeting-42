import { Home, Calendar, DollarSign, Music, BarChart3, TrendingUp, CalendarDays } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const MobileNav = () => {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: CalendarDays, label: "Agenda", path: "/agenda" },
    { icon: DollarSign, label: "Finanças", path: "/financas" },
    { icon: TrendingUp, label: "Receitas", path: "/receitas" },
    { icon: BarChart3, label: "Análises", path: "/analises" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gold/20 z-50 md:hidden shadow-[0_-4px_20px_rgba(212,175,55,0.1)]">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground transition-all duration-200"
            activeClassName="text-gold scale-110"
          >
            <item.icon className="h-6 w-6" />
            <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
