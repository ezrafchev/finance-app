"use client";

import { type FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const USER_STORAGE_KEY = "finance-app-user";
const SESSION_STORAGE_KEY = "finance-app-session";

type StoredUser = {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type StatusMessage = {
  type: "success" | "error";
  text: string;
};

const hashPassword = async (value: string) => {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return value;
  }
  const data = new TextEncoder().encode(value);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as StoredUser;
  } catch {
    return null;
  }
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const session = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (session) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    const storedUser = getStoredUser();

    if (modeParam === "register") {
      setMode("register");
      return;
    }

    if (!storedUser) {
      setMode("register");
      return;
    }

    setMode("login");
  }, [searchParams]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const storedUser = getStoredUser();
      if (!storedUser) {
        setStatus({ type: "error", text: "Nenhum cadastro encontrado. Crie sua conta para continuar." });
        setMode("register");
        return;
      }

      const email = loginForm.email.trim().toLowerCase();
      const passwordHash = await hashPassword(loginForm.password);

      if (storedUser.email !== email || storedUser.passwordHash !== passwordHash) {
        setStatus({ type: "error", text: "E-mail ou senha incorretos." });
        return;
      }

      window.localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ email: storedUser.email, signedInAt: new Date().toISOString() })
      );
      router.replace("/dashboard");
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
        return;
      }

      if (password.length < 6) {
        setStatus({ type: "error", text: "A senha precisa ter pelo menos 6 caracteres." });
        return;
      }

      if (password !== registerForm.confirmPassword) {
        setStatus({ type: "error", text: "As senhas não conferem." });
        return;
      }

      const existing = getStoredUser();
      if (existing && existing.email !== email) {
        setStatus({
          type: "error",
          text: "Já existe um cadastro neste navegador. Faça login com ele.",
        });
        setMode("login");
        return;
      }

      const passwordHash = await hashPassword(password);
      const newUser: StoredUser = {
        name,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      window.localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ email: newUser.email, signedInAt: new Date().toISOString() })
      );
      router.replace("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusClasses = status?.type === "error" ? "text-red-600" : "text-green-600";

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
                onClick={() => setMode("login")}
              >
                Entrar
              </Button>
              <Button
                type="button"
                variant={mode === "register" ? "default" : "outline"}
                onClick={() => setMode("register")}
              >
                Criar conta
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {status ? <p className={`mb-4 text-sm ${statusClasses}`}>{status.text}</p> : null}

            {mode === "login" ? (
              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="voce@exemplo.com"
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
                    placeholder="voce@exemplo.com"
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
              Seus dados ficam salvos apenas neste navegador para acesso seguro ao painel financeiro.
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
