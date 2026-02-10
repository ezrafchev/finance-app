"use client";

import { type FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Wallet, AlertCircle, CheckCircle, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type StatusMessage = {
  type: "success" | "error" | "info";
  text: string;
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Check for verification status
    const verified = searchParams.get("verified");
    const error = searchParams.get("error");
    const modeParam = searchParams.get("mode");

    if (verified === "true") {
      setStatus({
        type: "success",
        text: "E-mail verificado com sucesso! Agora você pode fazer login.",
      });
      setMode("login");
    } else if (error) {
      let errorMsg = "Erro ao verificar e-mail.";
      if (error === "expired-token") {
        errorMsg = "Link de verificação expirado. Solicite um novo link.";
      } else if (error === "invalid-token") {
        errorMsg = "Link de verificação inválido.";
      }
      setStatus({ type: "error", text: errorMsg });
    }

    if (modeParam === "register") {
      setMode("register");
    }
  }, [searchParams]);

  const handleResendVerification = async () => {
    if (!userEmail) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          text: "E-mail de verificação reenviado! Verifique sua caixa de entrada.",
        });
      } else {
        setStatus({ type: "error", text: data.error || "Erro ao reenviar e-mail." });
      }
    } catch {
      setStatus({ type: "error", text: "Erro ao conectar ao servidor." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);
    setNeedsVerification(false);

    try {
      const email = loginForm.email.trim().toLowerCase();
      if (!EMAIL_PATTERN.test(email)) {
        setStatus({ type: "error", text: "Informe um e-mail válido para continuar." });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.replace("/dashboard");
      } else if (data.requiresVerification) {
        setNeedsVerification(true);
        setUserEmail(email);
        setStatus({
          type: "error",
          text: data.error || "Por favor, confirme seu e-mail antes de fazer login.",
        });
      } else {
        setStatus({ type: "error", text: data.error || "Erro ao fazer login." });
      }
    } catch {
      setStatus({ type: "error", text: "Erro ao conectar ao servidor." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const name = registerForm.name.trim();
      const email = registerForm.email.trim().toLowerCase();
      const password = registerForm.password;

      if (!name || !email || !password || !registerForm.confirmPassword) {
        setStatus({ type: "error", text: "Preencha todos os campos obrigatórios." });
        setIsSubmitting(false);
        return;
      }

      if (!EMAIL_PATTERN.test(email)) {
        setStatus({ type: "error", text: "Informe um e-mail válido para continuar." });
        setIsSubmitting(false);
        return;
      }

      if (password.length < 8) {
        setStatus({ type: "error", text: "A senha precisa ter pelo menos 8 caracteres." });
        setIsSubmitting(false);
        return;
      }

      if (password !== registerForm.confirmPassword) {
        setStatus({ type: "error", text: "As senhas não conferem." });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          email,
          password,
          name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNeedsVerification(true);
        setUserEmail(email);
        setStatus({
          type: "success",
          text: data.message || "Cadastro realizado! Verifique seu e-mail para confirmar sua conta.",
        });
        setRegisterForm({ name: "", email: "", password: "", confirmPassword: "" });
      } else {
        setStatus({ type: "error", text: data.error || "Erro ao criar cadastro." });
      }
    } catch {
      setStatus({ type: "error", text: "Erro ao conectar ao servidor." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    if (status?.type === "success") return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status?.type === "error") return <AlertCircle className="h-5 w-5 text-red-600" />;
    return <Mail className="h-5 w-5 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" aria-hidden="true" />
            <h1 className="text-xl font-bold">Finance App</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/privacy">Privacidade</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-3">
            <CardTitle>Bem-vindo de volta</CardTitle>
            <CardDescription>
              Acesse sua conta ou crie um cadastro para desbloquear o painel financeiro completo.
            </CardDescription>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === "login" ? "default" : "outline"}
                onClick={() => {
                  setMode("login");
                  setStatus(null);
                  setNeedsVerification(false);
                }}
              >
                Entrar
              </Button>
              <Button
                type="button"
                variant={mode === "register" ? "default" : "outline"}
                onClick={() => {
                  setMode("register");
                  setStatus(null);
                  setNeedsVerification(false);
                }}
              >
                Criar conta
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {status && (
              <Alert className="mb-4" variant={status.type === "error" ? "destructive" : "default"}>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <AlertDescription>{status.text}</AlertDescription>
                </div>
              </Alert>
            )}

            {needsVerification && (
              <Alert className="mb-4">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>Não recebeu o e-mail?</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={isSubmitting}
                    >
                      Reenviar e-mail de verificação
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {mode === "login" ? (
              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="você@exemplo.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome completo</Label>
                  <Input
                    id="register-name"
                    value={registerForm.name}
                    onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerForm.email}
                    onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="você@exemplo.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Confirmar senha</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(event) => setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Criando..." : "Criar cadastro"}
                </Button>
              </form>
            )}

            <p className="mt-6 text-xs text-muted-foreground">
              Seus dados são armazenados com segurança em banco de dados e protegidos por verificação de e-mail.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" />}>
      <LoginContent />
    </Suspense>
  );
}
