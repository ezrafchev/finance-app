"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SESSION_STORAGE_KEY = "finance-app-session";

export default function LogoutPage() {
  const [isCleared, setIsCleared] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setIsCleared(true);
  }, []);

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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Logout concluído</CardTitle>
            <CardDescription>
              {isCleared
                ? "Você saiu da sua conta. Faça login novamente para acessar o painel."
                : "Encerrando sua sessão..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/login">Voltar para o login</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
