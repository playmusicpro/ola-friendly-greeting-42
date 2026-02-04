import { useState } from "react";
import { Home, CalendarDays, DollarSign, Music2, Menu, Video, Trophy, User, Settings, X, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

const MobileNav = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const mainNavItems = [
    { icon: Home, label: "Painel", path: "/" },
    { icon: CalendarDays, label: "Shows", path: "/agenda" },
    { icon: DollarSign, label: "Finanças", path: "/financas" },
  ];

  const moreNavItems = [
    { icon: Music2, label: "Repertório", path: "/repertorio" },
    { icon: Video, label: "Projeto Audiovisual", path: "/projeto" },
    { icon: Trophy, label: "Desafios", path: "/desafios" },
    { icon: Users, label: "Comunidades", path: "/comunidades" },
    { icon: Settings, label: "Configurações", path: "/configuracoes" },
  ];

  const isMoreActive = moreNavItems.some(item => location.pathname === item.path);

  const handleMoreItemClick = (path: string) => {
    navigate(path);
    setIsMoreOpen(false);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gold/20 z-50 md:hidden shadow-[0_-4px_20px_rgba(212,175,55,0.1)]">
        <div className="flex items-center justify-around py-3">
          {mainNavItems.map((item) => (
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
          
          {/* Botão Mais */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center gap-1 px-4 py-2 transition-all duration-200 ${
              isMoreActive ? "text-gold scale-110" : "text-muted-foreground"
            }`}
          >
            <Menu className="h-6 w-6" />
            <span className="text-[10px] font-semibold tracking-wide">Mais</span>
          </button>
        </div>
      </nav>

      {/* Drawer do menu "Mais" */}
      <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <DrawerContent className="bg-card border-gold/20">
          <DrawerHeader className="border-b border-gold/10 pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-bold text-gold">Menu</DrawerTitle>
              <DrawerClose asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="p-4 space-y-2">
            {moreNavItems.map((item) => (
              <button
                key={item.path + item.label}
                onClick={() => handleMoreItemClick(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-primary/20 to-gold/10 text-gold border-l-4 border-gold"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="p-4 pt-2 border-t border-gold/10 mt-2">
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-semibold text-gold">Play Pro</span> v1.0
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileNav;
