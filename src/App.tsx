import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Shows from "./pages/Shows";
import Financas from "./pages/Financas";
import Projeto from "./pages/Projeto";
import Repertorio from "./pages/Repertorio";
import Desafios from "./pages/Desafios";
import Presskit from "./pages/Presskit";
import Flyer from "./pages/Flyer";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import MobileNav from "./components/MobileNav";
import MobileHeader from "./components/MobileHeader";
import DesktopSidebar from "./components/DesktopSidebar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex w-full bg-background">
          <DesktopSidebar />
          <MobileHeader />
          <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/shows" element={<Shows />} />
                <Route path="/financas" element={<Financas />} />
                <Route path="/projeto" element={<Projeto />} />
                <Route path="/repertorio" element={<Repertorio />} />
                <Route path="/desafios" element={<Desafios />} />
                <Route path="/desafios/presskit" element={<Presskit />} />
                <Route path="/desafios/flyer" element={<Flyer />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
          <MobileNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
