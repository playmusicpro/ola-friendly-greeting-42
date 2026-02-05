import { ReactNode } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Music, 
  FileText, 
  ArrowLeft,
  Shield,
   AlertTriangle,
   ClipboardCheck
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const adminNavItems = [
  { icon: LayoutDashboard, label: "Visão Geral", path: "/admin" },
  { icon: Users, label: "Usuários", path: "/admin/users" },
  { icon: Music, label: "Shows", path: "/admin/shows" },
  { icon: FileText, label: "Logs", path: "/admin/logs" },
   { icon: ClipboardCheck, label: "Operações", path: "/admin/ops" },
];

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { isAdmin, isLoading, adminEmail } = useAdmin();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Security Warning Banner */}
      <Alert className="rounded-none border-x-0 border-t-0 bg-destructive/10 border-destructive/30">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive text-sm">
          <strong>Modo Demo:</strong> Autenticação de admin via localStorage não é segura para produção.
          Em produção, use autenticação server-side com tabela user_roles no Supabase.
        </AlertDescription>
      </Alert>

      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-48px)] bg-card border-r border-border/50">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2 text-gold">
              <Shield className="h-5 w-5" />
              <span className="font-bold">Admin Panel</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{adminEmail}</p>
          </div>

          <nav className="p-3 space-y-1">
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all",
                    isActive
                      ? "bg-primary/20 text-primary border-l-4 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 mt-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao App</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
