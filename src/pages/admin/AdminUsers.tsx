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
import { AdminUser, generateMockUsers } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";

const AdminUsers = () => {
  const [users] = useState<AdminUser[]>(generateMockUsers());
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

  const handleResetPassword = () => {
    toast({
      title: "E-mail enviado",
      description: `Link de redefinição enviado para ${selectedUser?.email}`,
    });
  };

  const handleRevokeSubscription = () => {
    toast({
      title: "Assinatura revogada",
      description: `Assinatura de ${selectedUser?.name} foi cancelada`,
      variant: "destructive"
    });
    setShowRevokeDialog(false);
    setSelectedUser(null);
  };

  return (
    <AdminLayout title="Gerenciamento de Usuários">
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
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Shows</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Receita</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Último Acesso</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
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
                        {user.status === 'active' ? 'Ativo' : user.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{user.showsCount}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(user.totalRevenue)}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(user.lastLoginAt).toLocaleDateString('pt-BR')}
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
                  <p className="text-xs text-muted-foreground">Status</p>
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
                    {new Date(selectedUser.lastLoginAt).toLocaleDateString('pt-BR')}
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
                    Receita Total
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
              Esta ação irá cancelar o plano via Stripe e o usuário será movido para o plano Free.
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
