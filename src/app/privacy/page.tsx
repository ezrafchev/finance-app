import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
            <h1 className="text-xl font-bold">Política de Privacidade</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Seu controle é prioridade</CardTitle>
            <CardDescription>
              Esta plataforma foi desenhada para funcionar totalmente no seu navegador, garantindo privacidade e
              transparência.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              • Os dados de cadastro e transações são armazenados localmente (localStorage) e não são enviados para
              servidores externos.
            </p>
            <p>
              • Você pode exportar todas as informações em JSON a qualquer momento para manter backups pessoais.
            </p>
            <p>
              • O botão “Limpar dados” remove imediatamente todas as informações locais, garantindo total controle.
            </p>
            <p>
              • As recomendações da IA são geradas com base nos dados disponíveis no navegador e não são compartilhadas.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
