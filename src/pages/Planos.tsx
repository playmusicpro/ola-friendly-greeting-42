import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  BadgeCheck,
  Clock3,
  CreditCard,
  Loader2,
  LogIn,
  LogOut,
  QrCode,
  ShieldCheck,
  Sparkles,
  Tag,
  Ticket,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  applyDiscount,
  formatBRL,
  installmentLabel,
  intervalLabel,
  normalizeCouponCode,
  type BillingOffer,
  type CouponPreview,
} from "@/lib/billing";

const HERO_KEY = "lifetime_founder";

type OfferResponse = { offers?: BillingOffer[] };
type CouponResponse = Partial<CouponPreview> & { error?: string };
type SessionResponse = { url?: string; error?: string };

async function readErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error && typeof error === "object" && "context" in error && error.context instanceof Response) {
    const body = await error.context.clone().json().catch(() => null);
    if (typeof body?.error === "string" && body.error) return body.error;
  }
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export default function Planos() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [offers, setOffers] = useState<BillingOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);
  const [busyOffer, setBusyOffer] = useState<string | null>(null);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase.functions.invoke("stripe-checkout", {
      body: { action: "list_offers" },
    });
    if (error) {
      setLoadError(await readErrorMessage(error, "Não foi possível carregar os planos."));
      setLoading(false);
      return;
    }
    const list = (data as OfferResponse)?.offers ?? [];
    setOffers(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    if (searchParams.get("cancelado") === "1") {
      toast("Pagamento não concluído", { description: "Sua vaga continua disponível enquanto a oferta durar." });
      const next = new URLSearchParams(searchParams);
      next.delete("cancelado");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const hero = useMemo(() => offers.find((offer) => offer.key === HERO_KEY) ?? null, [offers]);
  const secondary = useMemo(() => offers.filter((offer) => offer.key !== HERO_KEY), [offers]);

  const heroTotal = hero
    ? coupon?.valid
      ? applyDiscount(hero.priceCents, coupon.discountCents)
      : hero.priceCents
    : 0;

  const checkCoupon = async () => {
    const code = normalizeCouponCode(couponCode);
    if (!hero) return;
    if (!code) {
      toast.error("Digite o código do cupom.");
      return;
    }
    setCouponChecking(true);
    const { data, error } = await supabase.functions.invoke("stripe-checkout", {
      body: { action: "validate_coupon", offer: hero.key, couponCode: code },
    });
    setCouponChecking(false);
    if (error) {
      setCoupon(null);
      toast.error(await readErrorMessage(error, "Cupom inválido."));
      return;
    }
    const result = data as CouponResponse;
    if (!result?.valid) {
      setCoupon(null);
      toast.error(result?.reason || "Cupom inválido para esta oferta.");
      return;
    }
    setCoupon({
      valid: true,
      couponCode: result.couponCode ?? code,
      affiliate: result.affiliate ?? null,
      discountCents: result.discountCents ?? 0,
      priceCents: result.priceCents ?? hero.priceCents,
      totalCents: result.totalCents ?? applyDiscount(hero.priceCents, result.discountCents ?? 0),
    });
    toast.success("Cupom aplicado", {
      description: `Desconto de ${formatBRL(result.discountCents ?? 0)} — você paga ${formatBRL(result.totalCents ?? 0)}.`,
    });
  };

  const startCheckout = async (offer: BillingOffer) => {
    setBusyOffer(offer.key);
    const body: Record<string, string> = { action: "create_session", offer: offer.key };
    if (offer.key === HERO_KEY && coupon?.valid && coupon.couponCode) {
      body.couponCode = coupon.couponCode;
    }
    const { data, error } = await supabase.functions.invoke("stripe-checkout", { body });
    if (error || !(data as SessionResponse)?.url) {
      setBusyOffer(null);
      toast.error(await readErrorMessage(error, (data as SessionResponse)?.error || "Não foi possível iniciar o pagamento."));
      return;
    }
    const url = (data as SessionResponse).url as string;
    const opened = window.open(url, "_blank", "noopener");
    if (!opened) window.location.href = url;
    setBusyOffer(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 rounded-2xl border border-gold/15 bg-card/50 backdrop-blur-xl px-4 py-3">
        <Link to="/planos" className="flex items-center gap-3 shrink-0" aria-label="Play Pro">
          <img src="/logo.jpg" alt="Play Pro" width={1920} height={1434} className="h-9 w-auto rounded-lg" />
          <span className="hidden sm:block text-sm font-semibold text-foreground">Play Pro</span>
        </Link>
        {authUser ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate text-xs text-muted-foreground" title={authUser.email ?? ""}>{authUser.email}</span>
            <Button variant="outline" size="sm" className="shrink-0 border-gold/30 hover:bg-gold/10" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair / Trocar conta
            </Button>
          </div>
        ) : (
          <Button asChild variant="outline" size="sm" className="border-gold/30 hover:bg-gold/10">
            <Link to="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Já tenho conta · Entrar
            </Link>
          </Button>
        )}
      </header>

      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-gold/20 border border-gold/20">
          <Ticket className="h-6 w-6 text-gold" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
            Planos
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Escolha como entrar para o Play Pro — a oferta da Black Friday é a mais vantajosa.
          </p>
        </div>
      </div>

      {loading && (
        <Card className="p-8 text-center border-gold/20">
          <p role="status" className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-gold" /> Carregando ofertas...
          </p>
        </Card>
      )}

      {!loading && loadError && (
        <Card className="p-6 border-destructive/30">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button variant="outline" className="mt-4" onClick={() => void loadOffers()}>
            Tentar novamente
          </Button>
        </Card>
      )}

      {!loading && hero && (
        <Card className="overflow-hidden border-gold/30 shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-gold via-primary to-gold" />
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-gold/15 text-gold border-gold/30">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> Black Friday
              </Badge>
              <Badge variant="outline" className="border-gold/20 text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5 mr-1" /> Lote limitado
              </Badge>
              <Badge variant="outline" className="border-gold/20 text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Pagamento seguro
              </Badge>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{hero.label}</h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-xl">{hero.description}</p>
              </div>
              <div className="text-left md:text-right">
                {coupon?.valid && coupon.discountCents > 0 && (
                  <p className="text-sm text-muted-foreground line-through">{formatBRL(hero.priceCents)}</p>
                )}
                <p className="text-4xl md:text-5xl font-bold text-gold tabular-nums">{formatBRL(heroTotal)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  à vista no PIX ou {installmentLabel(heroTotal)} no cartão
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gold/20 bg-card/60 backdrop-blur-xl p-4 space-y-3">
              <label htmlFor="cupom" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Tag className="h-4 w-4 text-gold" /> Cupom de desconto
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  id="cupom"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Ex.: BLACKFRIDAY120"
                  className="uppercase"
                  autoComplete="off"
                />
                <Button
                  variant="outline"
                  onClick={() => void checkCoupon()}
                  disabled={couponChecking || !couponCode.trim()}
                  className="shrink-0"
                >
                  {couponChecking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Aplicar cupom
                </Button>
              </div>
              {coupon?.valid ? (
                <p className="text-xs text-success flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" />
                  Cupom {coupon.couponCode} aplicado: {formatBRL(coupon.discountCents)} de desconto — total {formatBRL(coupon.totalCents)}.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Tem cupom de influenciador ou afiliado? Aplique aqui para ver o valor final antes de pagar.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => void startCheckout(hero)}
                disabled={busyOffer === hero.key}
                className="w-full sm:w-auto bg-gradient-to-r from-gold to-primary hover:opacity-90 text-white font-semibold"
              >
                {busyOffer === hero.key ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <CreditCard className="h-5 w-5 mr-2" />
                )}
                Garantir minha vaga
              </Button>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <QrCode className="h-4 w-4 text-gold" /> PIX
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4 text-gold" /> Cartão em até 12x
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && secondary.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {secondary.map((offer) => (
            <Card key={offer.key} className="border-gold/20 bg-card/60 backdrop-blur-xl shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{offer.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className="border-gold/20 text-gold">
                      {offer.mode === "subscription" ? "Recorrente" : "Avulso"}
                    </Badge>
                    {offer.interval === "year" && (
                      <Badge className="bg-success/20 text-success border border-success/40">17% OFF · Economize R$ 60,90</Badge>
                    )}
                  </div>
                </div>
                <p className="text-3xl font-bold text-gold tabular-nums">
                  {formatBRL(offer.priceCents)}
                  <span className="text-base font-medium text-muted-foreground">{intervalLabel(offer.interval)}</span>
                </p>
                <Button
                  variant="outline"
                  className="w-full border-gold/30 hover:bg-gold/10"
                  onClick={() => void startCheckout(offer)}
                  disabled={busyOffer === offer.key}
                >
                  {busyOffer === offer.key ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Assinar {offer.label}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-5 border-gold/10 bg-card/40 backdrop-blur-xl">
        <p className="text-xs text-muted-foreground leading-relaxed">
          O pagamento é processado pelo Stripe em ambiente seguro. Depois de confirmar, você volta automaticamente
          para o Painel com a sua condição de membro ativada.
        </p>
      </Card>
    </div>
  );
}
