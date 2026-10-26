import { useState } from "react";
import { Home, CalendarDays, DollarSign, Music2, Menu, Video, Trophy, Settings, X, Users, HelpCircle, Play, AudioLines } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import ModuleArtwork from "@/components/ModuleArtwork";
import HelpCenter from "@/components/HelpCenter";
import ChromaticTuner from "@/components/ChromaticTuner";

const MobileNav = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showTuner, setShowTuner] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/";

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

  const handleHelpClick = () => {
    setIsMoreOpen(false);
    setShowHelpCenter(true);
  };

  return (
    <>
      {isDashboard ? <nav aria-label="Navegação do Painel" className="dashboard-dock fixed left-1/2 -translate-x-1/2 bottom-5">
        <Button variant="ghost" className="dashboard-dock-tab" onClick={() => setShowTuner(true)} aria-label="Abrir afinador" title="Abrir afinador"><AudioLines className="h-5 w-5" /><span>Afinador</span></Button>
        <Button className="dashboard-play" size="icon" aria-label="Abrir Panorama Visual" title="Abrir Panorama Visual" onClick={() => navigate('/panorama')}><Play className="h-7 w-7 fill-current" /></Button>
        <Button variant="ghost" className="dashboard-dock-tab" onClick={() => setIsMoreOpen(true)} aria-label="Abrir menu" title="Abrir menu"><Menu className="h-5 w-5" /><span>Menu</span></Button>
      </nav> : <nav aria-label="Navegação principal" className="mobile-floating-dock fixed md:hidden">
        <div className="grid grid-cols-4 items-center gap-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="mobile-dock-item text-muted-foreground transition-colors"
              activeClassName="text-gold bg-gold/10"
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </NavLink>
          ))}
          
          {/* Botão Mais */}
          <Button variant="ghost"
            onClick={() => setIsMoreOpen(true)}
             className={`mobile-dock-item transition-colors ${
               isMoreActive ? "text-gold bg-gold/10" : "text-muted-foreground"
            }`}
          >
            <Menu className="h-6 w-6" />
            <span className="text-[10px] font-semibold tracking-wide">Mais</span>
          </Button>
        </div>
      </nav>}

      {/* Drawer do menu "Mais" */}
      <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <DrawerContent className="bg-card border-gold/20">
          <DrawerHeader className="border-b border-gold/10 pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-bold text-gold">Menu</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="module-menu p-4 space-y-2 overflow-y-auto">
            {(isDashboard ? [...mainNavItems.filter(item => item.path !== "/"), ...moreNavItems] : moreNavItems).map((item) => (
              <Button variant="ghost"
                key={item.path + item.label}
                onClick={() => handleMoreItemClick(item.path)}
                aria-current={location.pathname === item.path ? 'page' : undefined}
                className="module-navigation w-full flex items-center justify-start gap-4 px-4 py-4 rounded-xl transition-all duration-200"
              >
                <ModuleArtwork module={item.path} />
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Button>
            ))}
            
            {/* Help Button */}
            <Button variant="ghost"
              onClick={handleHelpClick}
              className="module-navigation w-full flex items-center justify-start gap-4 px-4 py-4 rounded-xl transition-all duration-200 mt-2"
            >
              <ModuleArtwork module="help" />
              <HelpCircle className="h-5 w-5" />
              <span className="font-medium">Central de Ajuda</span>
            </Button>
          </div>
          
          <div className="p-4 pt-2 border-t border-gold/10 mt-2">
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-semibold text-gold">Play Pro</span> v1.0
            </p>
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Help Center Modal */}
      <HelpCenter
        isOpen={showHelpCenter}
        onClose={() => setShowHelpCenter(false)}
      />
      <ChromaticTuner open={showTuner} onOpenChange={setShowTuner} />
    </>
  );
};

export default MobileNav;
