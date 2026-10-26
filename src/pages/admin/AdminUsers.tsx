import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  User,
  Mail,
  Calendar,
  Music,
  DollarSign,
  CreditCard,
  AlertTriangle
} from "lucide-react";
import { useAdminRows } from "@/hooks/useAdminData";
import { AdminDataState } from "@/components/AdminDataState";
import { summarizeAdminShows } from "@/lib/adminAnalytics";
import { supabase } from "@/integrations/supabase/client";

type AdminUser = { id: string; name: string; email: string; plan: string; status: string; createdAt: string; showsCount: number; totalRevenue: number; lastLoginAt: string | null; premiumExpiresAt: string | null };
import { useToast } from "@/hooks/use-toast";
import { useAdminIntelligenceRows } from '@/hooks/useAdminIntelligence';
import { AdminEngagement } from '@/components/AdminEngagement';

const AdminUsers = () => {
  const profilesQuery = useAdminRows('profiles');
  const showsQuery = useAdminRows('shows');
  const activityQuery = useAdminIntelligenceRows('admin_activity_page');
  const activityByUser = new Map((activityQuery.data ?? []).map(row => [row.user_id, row.last_active_at]));
  const users: AdminUser[] = (profilesQuery.data ?? []).map(profile => ({
    id: profile.id, name: profile.name, email: profile.email ?? '',
    plan: profile.plan === 'default: free' ? 'free' : profile.plan ?? 'Não informado',
    status: profile.onboarding_completed ? 'Perfil completo' : 'Perfil pendente',
    createdAt: profile.created_at, lastLoginAt: activityByUser.get(profile.id) ?? null, premiumExpiresAt: null,
    showsCount: (showsQuery.data ?? []).filter(show => show.user_id === profile.id).length,
    totalRevenue: summarizeAdminShows((showsQuery.data ?? []).filter(show => show.user_id === profile.id)).net,
  }));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPlanBadgeVariant = (plan: AdminUser['plan']) => {
    switch (plan) {
      case 'premium': return 'default';
      case 'pro': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: AdminUser['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(selectedUser.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    toast({ title: error ? 'Não foi possível enviar' : 'Solicitação enviada',
      description: error ? error.message : 'O Supabase processou a solicitação de redefinição.',
      variant: error ? 'destructive' : 'default' });
  };

  const handleRevokeSubscription = () => {
    toast({ title: 'Cancelamento indisponível', description: 'O cancelamento exige integração de cobrança com Stripe.', variant: 'destructive' });
    setShowRevokeDialog(false);
  };

  return (
    <AdminLayout title="Gerenciamento de Usuários">
      <AdminDataState loading={activityQuery.isLoading} error={activityQuery.error} retry={activityQuery.refetch} />
      <AdminEngagement userIds={(profilesQuery.data ?? []).map(profile => profile.id)} activity={activityQuery.data ?? []} unavailable={profilesQuery.isLoading || activityQuery.isLoading || !!profilesQuery.error || !!activityQuery.error} />
      <AdminDataState loading={profilesQuery.isLoading || showsQuery.isLoading} error={profilesQuery.error || showsQuery.error} retry={() => { void profilesQuery.refetch(); void showsQuery.refetch(); }} />
      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Usuário</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Plano</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Perfil</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Shows</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Faturamento</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Último Acesso</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {!profilesQuery.isLoading && !profilesQuery.error && filteredUsers.length === 0 && <tr><td colSpan={7} className="py-6 text-muted-foreground">Nenhum usuário encontrado.</td></tr>}
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/30 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getPlanBadgeVariant(user.plan)} className="capitalize">
                        {user.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(user.status)} className="capitalize">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{user.showsCount}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(user.totalRevenue)}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {activityQuery.isLoading || activityQuery.error ? '—' : user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('pt-BR') : 'Não registrado'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser && !showRevokeDialog} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalhes do Usuário
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedUser.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Plano</p>
                  <Badge variant={getPlanBadgeVariant(selectedUser.plan)} className="capitalize">
                    {selectedUser.plan}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Perfil</p>
                  <Badge variant={getStatusBadgeVariant(selectedUser.status)} className="capitalize">
                    {selectedUser.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Criado em
                  </p>
                  <p className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Último acesso</p>
                  <p className="font-medium">
                    {activityByUser.get(selectedUser.id) ? new Date(activityByUser.get(selectedUser.id) ?? '').toLocaleString('pt-BR') : 'Não registrado'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Music className="h-3 w-3" />
                    Shows
                  </p>
                  <p className="font-medium">{selectedUser.showsCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Faturamento Real
                  </p>
                  <p className="font-medium">{formatCurrency(selectedUser.totalRevenue)}</p>
                </div>
              </div>

              {selectedUser.premiumExpiresAt && (
                <div className="p-3 bg-gold/10 rounded-lg border border-gold/20">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Assinatura expira em
                  </p>
                  <p className="font-medium text-gold">
                    {new Date(selectedUser.premiumExpiresAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetPassword}
                >
                  Resetar Senha
                </Button>
                {selectedUser.plan !== 'free' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowRevokeDialog(true)}
                  >
                    Revogar Assinatura
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Revogação
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja revogar a assinatura de <strong>{selectedUser?.name}</strong>?
              O cancelamento via Stripe ainda não está conectado; nenhuma assinatura será alterada.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRevokeSubscription}>
              Confirmar Revogação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
