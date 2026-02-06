import { Menu, Trophy, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const MobileHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

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
            {user && (
              <>
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
                <DropdownMenuSeparator />
              </>
            )}
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
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default MobileHeader;
