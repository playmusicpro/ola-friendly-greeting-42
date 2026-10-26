import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
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
import AdminOps from "./pages/admin/AdminOps";
import NotFound from "./pages/NotFound";
import MobileNav from "./components/MobileNav";
import MobileHeader from "./components/MobileHeader";
import DesktopSidebar from "./components/DesktopSidebar";
import MusicianProfileGate from "./components/MusicianProfileGate";
import AdminRoute from "./components/AdminRoute";
import { AppUsageTracker } from './components/AppUsageTracker';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from 'next-themes';
import AmbientBackground from './components/AmbientBackground';
const Panorama = lazy(() => import('./pages/Panorama'));

const queryClient = new QueryClient();

// Component to handle login route - redirects to dashboard if already authenticated
const LoginRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Will show loading in ProtectedRoute
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <Login />;
};

// Main app layout with sidebar and navigation
const AppLayout = () => {
  const isDashboard = useLocation().pathname === "/";
  return (
    <div className={`min-h-screen flex w-full bg-background ${isDashboard ? "dashboard-stage" : ""}`}>
      <DesktopSidebar />
      {!isDashboard && <MobileHeader />}
      <main className={`flex-1 min-w-0 md:ml-64 ${isDashboard ? "pt-0 pb-32" : "pt-16 md:pt-0 pb-32 md:pb-0"}`}>
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
          <MusicianProfileGate>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/modo-show/:playlistId" element={<ModoShow />} />
            <Route path="/financas" element={<Financas />} />
            <Route path="/panorama" element={<Suspense fallback={<p role="status">Carregando panorama…</p>}><Panorama /></Suspense>} />
            <Route path="/receitas" element={<Receitas />} />
            <Route path="/analises" element={<Analises />} />
            <Route path="/projeto" element={<Projeto />} />
            <Route path="/repertorio" element={<Repertorio />} />
            <Route path="/desafios" element={<Desafios />} />
            <Route path="/comunidades" element={<Comunidades />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </MusicianProfileGate>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="data-theme" defaultTheme="classic" themes={['classic', 'soft-pink']} enableSystem={false} storageKey="playpro_appearance" enableColorScheme={false}>
    <AmbientBackground />
    <div className="app-foreground">
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppUsageTracker />
          <Routes>
            {/* Public Route - Login */}
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Admin Routes - Protected */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRoute><AdminDashboard /></AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AdminRoute><AdminUsers /></AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/shows" element={
              <ProtectedRoute>
                <AdminRoute><AdminShows /></AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute>
                <AdminRoute><AdminLogs /></AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/ops" element={
              <ProtectedRoute>
                <AdminRoute><AdminOps /></AdminRoute>
              </ProtectedRoute>
            } />
            
            {/* Main App Routes - Protected */}
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </div>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
