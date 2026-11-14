import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Crown, Search, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { isSubscriptionActive, isVipActive, type AccessProfile } from "@/lib/subscription";

type VipProfile = AccessProfile & { id: string; name: string; email: string | null; vip_notes?: string | null };

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

function Row({ profile, onSaved }: { profile: VipProfile; onSaved: () => void }) {
  const [isVip, setIsVip] = useState(!!profile.is_vip);
  const [date, setDate] = useState(toDateInput(profile.vip_expires_at));
  const [notes, setNotes] = useState(profile.vip_notes ?? "");
  const [saving, setSaving] = useState(false);
  const stripe = isSubscriptionActive(profile);
  const vip = isVipActive(profile);

  const save = async (nextVip = isVip) => {
    setSaving(true);
    const expires = nextVip && date ? new Date(`${date}T23:59:59`).toISOString() : null;
    const { error } = await (supabase.rpc as unknown as (fn: string, args: object) => Promise<{ error: { message: string } | null }>)(
      "admin_set_user_vip",
      { p_user_id: profile.id, p_is_vip: nextVip, p_expires_at: expires, p_notes: notes },
    );
    setSaving(false);
    if (error) { toast.error(error.message || "Não foi possível atualizar o acesso VIP"); return; }
    toast.success("Acesso VIP atualizado com sucesso");
    onSaved();
  };

  return (
    <div className="grid gap-3 rounded-xl border border-border/50 bg-card/40 p-3 lg:grid-cols-[1.4fr_auto_auto_1.2fr_auto] lg:items-center">
      <div className="min-w-0">
        <p className="truncate font-medium">{profile.name}</p>
        <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
        <div className="mt-1">
          {stripe ? <Badge>Ativo (Stripe)</Badge> : vip ? <Badge className="bg-gold text-background">VIP</Badge> : <Badge variant="outline">Sem Plano</Badge>}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Switch checked={isVip} disabled={saving} onCheckedChange={(v) => { setIsVip(v); void save(v); }} aria-label={`VIP de ${profile.name}`} />
        VIP
      </label>
      <div className="space-y-1">
        <Input type="date" value={date} min={new Date(Date.now() + 864e5).toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} disabled={!isVip} className="w-40" aria-label="Validade do VIP" />
        <p className="text-[11px] text-muted-foreground">{date ? "Até a data" : "Em branco = vitalício"}</p>
      </div>
      <Input value={notes} maxLength={200} onChange={(e) => setNotes(e.target.value)} placeholder="Observação (ex: Beta Tester)" aria-label="Observação interna" />
      <Button size="sm" onClick={() => save()} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
      </Button>
    </div>
  );
}

export function AdminVipAccess({ profiles, onSaved }: { profiles: VipProfile[]; onSaved: () => void }) {
  const { isAdmin } = useAdmin();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? profiles.filter((p) => p.name.toLowerCase().includes(t) || (p.email ?? "").toLowerCase().includes(t)) : profiles;
  }, [profiles, q]);
  if (!isAdmin) return null;
  return (
    <Card className="mb-6">
      <CardHeader><CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-gold" /> Controle de Acessos VIP</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por e-mail ou nome" className="pl-9" />
        </div>
        <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
          {list.map((p) => <Row key={`${p.id}-${p.is_vip}-${p.vip_expires_at}-${p.vip_notes}`} profile={p} onSaved={onSaved} />)}
          {list.length === 0 && <p className="py-4 text-sm text-muted-foreground">Nenhum usuário encontrado.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
