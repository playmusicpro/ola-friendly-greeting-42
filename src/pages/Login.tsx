import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import loginStudio from '@/assets/login-studio.jpg';
import brandLogo from '@/assets/play-pro-logo.jpeg.asset.json';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: loginError } = await login(email, password);

    if (loginError) {
      setError(loginError);
      setIsLoading(false);
      return;
    }

    toast({
      title: "Bem-vindo!",
      description: "Login realizado com sucesso.",
    });

    navigate("/", { replace: true });
    setIsLoading(false);
  };

  const [isSendingReset, setIsSendingReset] = useState(false);
  const handleForgot = async () => {
    const clean = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError("Digite seu email no campo acima para receber o link de recuperação.");
      return;
    }
    setIsSendingReset(true);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(clean, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSendingReset(false);
    if (resetErr) {
      console.error("[Login] resetPasswordForEmail error:", resetErr);
      const m = resetErr.message.toLowerCase();
      setError(m.includes("rate") ? "Muitas tentativas. Aguarde alguns minutos." : "Não foi possível enviar o email. Tente novamente.");
      return;
    }
    toast({ title: "Email enviado!", description: "Confira sua caixa de entrada para redefinir a senha." });
  };



  return (
    <div className="login-scene min-h-svh flex items-center justify-center p-4 py-8 sm:py-12">
      <img className="login-background" src={loginStudio} alt="" aria-hidden="true" width={1024} height={1536} fetchPriority="high" />
      <div className="login-scrim" aria-hidden="true" />
      <div className="login-content relative w-full max-w-md space-y-7">
        {/* Logo/Brand */}
        <div className="text-center space-y-3">
          <h1 className="login-logo mx-auto">
            <img src={brandLogo.url} alt="Play Pro" width={1029} height={768} />
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Seu assistente profissional para músicos
          </p>
        </div>

        {/* Login Card */}
        <Card className="login-glass">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite seu email e senha para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    className="login-input pl-10"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    className="login-input pl-10"
                    required
                    minLength={6}
                    autoComplete="current-password"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Primeiro acesso? Sua conta é criada automaticamente.
                  </p>
                  <Button
                    variant="link"
                    type="button"
                    onClick={handleForgot}
                    disabled={isSendingReset}
                    className="h-auto p-0 text-xs font-medium whitespace-nowrap"
                  >
                    {isSendingReset ? "Enviando..." : "Esqueci minha senha"}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !password}
              >

                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </div>
    </div>
  );
};

export default Login;
