import { Menu, Trophy, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const MobileHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/95 border-b border-gold/20 z-40 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 h-full">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-gold to-primary bg-clip-text text-transparent">
          Play Pro
        </h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gold">
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-gold/20">
            <DropdownMenuItem 
              onClick={() => navigate("/desafios")}
              className="cursor-pointer"
            >
              <Trophy className="h-4 w-4 mr-2 text-gold" />
              Desafios Online
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate("/configuracoes")}
              className="cursor-pointer"
            >
              <Settings className="h-4 w-4 mr-2 text-primary" />
              Configurações
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default MobileHeader;
