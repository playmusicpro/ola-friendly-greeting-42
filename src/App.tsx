import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Financas from "./pages/Financas";
import Receitas from "./pages/Receitas";
import Analises from "./pages/Analises";
import Projeto from "./pages/Projeto";
import Repertorio from "./pages/Repertorio";
import Agenda from "./pages/Agenda";
import ModoShow from "./pages/ModoShow";
import Desafios from "./pages/Desafios";
import Comunidades from "./pages/Comunidades";
import Configuracoes from "./pages/Configuracoes";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminShows from "./pages/admin/AdminShows";
import AdminLogs from "./pages/admin/AdminLogs";

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
        <Routes>
          {/* Admin Routes - No sidebar/nav */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/shows" element={<AdminShows />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          
          {/* Main App Routes */}
          <Route path="/*" element={
            <div className="min-h-screen flex w-full bg-background">
              <DesktopSidebar />
              <MobileHeader />
              <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
                <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/agenda" element={<Agenda />} />
                    <Route path="/modo-show/:playlistId" element={<ModoShow />} />
                    <Route path="/financas" element={<Financas />} />
                    <Route path="/receitas" element={<Receitas />} />
                    <Route path="/analises" element={<Analises />} />
                    <Route path="/projeto" element={<Projeto />} />
                    <Route path="/repertorio" element={<Repertorio />} />
                    <Route path="/desafios" element={<Desafios />} />
                    <Route path="/comunidades" element={<Comunidades />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
              <MobileNav />
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
