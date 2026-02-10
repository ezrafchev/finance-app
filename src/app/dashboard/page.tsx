"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Calculator,
  CreditCard,
  Database,
  DollarSign,
  FileDown,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type Profile = {
  name: string;
  email: string;
  monthlyIncome: string;
  fixedExpenses: string;
  variableExpenses: string;
  riskProfile: string;
  mainGoal: string;
};

type Transaction = {
  id: string;
  type: "income" | "expense";
  description: string;
  category: string;
  amount: number;
  date: string;
};

const STORAGE_KEYS = {
  profile: "finance-app-profile",
  transactions: "finance-app-transactions",
  session: "finance-app-session",
  user: "finance-app-user",
};

const MAX_PROJECTION_MONTHS = 24;
const MIN_PROJECTION_MONTHS = 1;
const DEFAULT_PROJECTION_MONTHS = 12;
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const defaultProfile: Profile = {
  name: "",
  email: "",
  monthlyIncome: "",
  fixedExpenses: "",
  variableExpenses: "",
  riskProfile: "moderado",
  mainGoal: "equilibrar",
};

const getToday = () => new Date().toISOString().slice(0, 10);

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(year, month - 1, day);
};

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const parseNumber = (value: string) => {
  const normalized = value.replace(",", ".");
  return Number.isNaN(Number.parseFloat(normalized)) ? 0 : Number.parseFloat(normalized);
};

const calculateCompoundBalance = (monthlyContribution: number, monthlyRate: number, month: number) => {
  if (!monthlyRate) {
    return monthlyContribution * month;
  }
  return monthlyContribution * ((Math.pow(1 + monthlyRate, month) - 1) / monthlyRate);
};

const getValidSession = () => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEYS.session);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as { email?: string; signedInAt?: string };
    if (!parsed.email || !parsed.signedInAt) return null;
    const signedInAt = new Date(parsed.signedInAt).getTime();
    if (!Number.isFinite(signedInAt) || Date.now() - signedInAt > SESSION_MAX_AGE_MS) {
      return null;
    }
    const storedUser = window.localStorage.getItem(STORAGE_KEYS.user);
    if (!storedUser) return null;
    const user = JSON.parse(storedUser) as { email?: string };
    if (!user.email || user.email !== parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [profileSavedAt, setProfileSavedAt] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionForm, setTransactionForm] = useState({
    description: "",
    category: "",
    amount: "",
    type: "expense" as "income" | "expense",
    date: getToday(),
  });
  const [investmentForm, setInvestmentForm] = useState({
    monthlyContribution: "350",
    annualRate: "8",
    months: "12",
  });
  const [assistantForm, setAssistantForm] = useState({
    goal: "equilibrar",
    horizon: "12",
    question: "",
  });
  const [assistantTips, setAssistantTips] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const session = getValidSession();
    if (!session) {
      window.localStorage.removeItem(STORAGE_KEYS.session);
      router.replace("/login");
      return;
    }
    setIsAuthenticated(true);

    const storedProfile = window.localStorage.getItem(STORAGE_KEYS.profile);
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile) as Profile & { savedAt?: string };
      setProfile({ ...defaultProfile, ...parsed });
      if (parsed.savedAt) {
        setProfileSavedAt(parsed.savedAt);
      }
    }

    const storedTransactions = window.localStorage.getItem(STORAGE_KEYS.transactions);
    if (storedTransactions) {
      const parsed = JSON.parse(storedTransactions) as Transaction[];
      setTransactions(parsed);
    }
  }, [router]);

  const monthlyIncome = parseNumber(profile.monthlyIncome);
  const fixedExpenses = parseNumber(profile.fixedExpenses);
  const variableExpenses = parseNumber(profile.variableExpenses);
  const monthlyExpenses = fixedExpenses + variableExpenses;
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0;

  const transactionTotals = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const balance = (transactionTotals.income || monthlyIncome) - (transactionTotals.expense || monthlyExpenses);
  const emergencyFund = monthlyExpenses * 6;

  const budgetPlan = useMemo(() => {
    return {
      essentials: monthlyIncome * 0.5,
      lifestyle: monthlyIncome * 0.3,
      investments: monthlyIncome * 0.2,
    };
  }, [monthlyIncome]);

  const investmentProjection = useMemo(() => {
    const monthlyContribution = parseNumber(investmentForm.monthlyContribution);
    const annualRate = parseNumber(investmentForm.annualRate);
    const months = Math.min(
      MAX_PROJECTION_MONTHS,
      Math.max(MIN_PROJECTION_MONTHS, Number.parseInt(investmentForm.months, 10) || DEFAULT_PROJECTION_MONTHS)
    );
    const monthlyRate = annualRate / 12 / 100;
    const data = Array.from({ length: months }, (_, index) => {
      const month = index + 1;
      const balanceValue = calculateCompoundBalance(monthlyContribution, monthlyRate, month);
      return { month, balance: balanceValue };
    });

    return {
      months,
      monthlyContribution,
      annualRate,
      data,
      finalBalance: data[data.length - 1]?.balance ?? 0,
      totalInvested: monthlyContribution * months,
    };
  }, [investmentForm]);

  const topExpenseCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const key = transaction.category || "Outros";
        totals[key] = (totals[key] ?? 0) + transaction.amount;
      });

    const sorted = Object.entries(totals).sort(([, valueA], [, valueB]) => valueB - valueA);
    return sorted[0];
  }, [transactions]);

  const handleProfileChange = (field: keyof Profile) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window === "undefined") return;
    const savedAt = new Date().toISOString();
    setProfileSavedAt(savedAt);
    window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify({ ...profile, savedAt }));
  };

  const handleAddTransaction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = parseNumber(transactionForm.amount);
    if (!transactionForm.description.trim() || amount <= 0) return;

    const newTransaction: Transaction = {
      id: generateId(),
      type: transactionForm.type,
      description: transactionForm.description.trim(),
      category: transactionForm.category.trim(),
      amount,
      date: transactionForm.date || getToday(),
    };

    setTransactions((prev) => {
      const updated = [newTransaction, ...prev];
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(updated));
      }
      return updated;
    });

    setTransactionForm((prev) => ({
      ...prev,
      description: "",
      category: "",
      amount: "",
    }));
  };

  const handleRemoveTransaction = (id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((transaction) => transaction.id !== id);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleExportData = () => {
    if (typeof window === "undefined") return;
    const payload = {
      profile,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "finance-app-dados.json";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    setProfile(defaultProfile);
    setProfileSavedAt(null);
    setTransactions([]);
    setAssistantTips([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.profile);
      window.localStorage.removeItem(STORAGE_KEYS.transactions);
    }
  };

  const handleGenerateAdvice = () => {
    const tips: string[] = [];

    if (!monthlyIncome) {
      tips.push("Informe sua renda mensal para receber recomendações mais precisas.");
    }

    if (monthlyIncome && monthlyExpenses > monthlyIncome) {
      tips.push("Seus gastos estão acima da renda. Revise despesas fixas e renegocie contratos.");
    } else if (monthlyIncome && savingsRate < 0.2) {
      tips.push("Seu índice de poupança está abaixo de 20%. Ajuste gastos variáveis para aumentar a reserva.");
    } else if (monthlyIncome) {
      tips.push("Bom trabalho! Seu fluxo mensal está equilibrado. Continue registrando transações.");
    }

    if (assistantForm.goal === "investir") {
      tips.push(
        `Para investir com perfil ${profile.riskProfile}, diversifique entre renda fixa e variável e mantenha uma reserva de ${currencyFormatter.format(emergencyFund)}.`
      );
    } else if (assistantForm.goal === "reserva") {
      tips.push(`Priorize a reserva de emergência entre 3 e 6 meses (${currencyFormatter.format(emergencyFund)}).`);
    } else {
      tips.push("Mantenha o orçamento 50/30/20 como referência e acompanhe seus limites semanalmente.");
    }

    if (topExpenseCategory && topExpenseCategory[1] > 0) {
      tips.push(`A categoria com maior impacto é "${topExpenseCategory[0]}". Avalie metas de redução específicas.`);
    }

    if (assistantForm.question.trim()) {
      tips.push(`Sobre sua pergunta: "${assistantForm.question.trim()}", foque em metas realistas e revise mensalmente.`);
    }

    if (!tips.length) {
      tips.push("Preencha seus dados para receber recomendações personalizadas.");
    }

    setAssistantTips(tips);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Verificando sessão...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" aria-hidden="true" />
            <h1 className="text-xl font-bold">Dashboard Financeiro Completo</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/privacy">Privacidade</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Voltar ao início</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/logout">Sair</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bem-vindo ao seu painel completo</p>
            <h2 className="text-3xl font-bold">Controle total com cadastro, banco local e IA financeira</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2" onClick={handleExportData}>
              Exportar dados <FileDown className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="ghost" className="gap-2 text-destructive" onClick={handleClearData}>
              Limpar dados <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo atual</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencyFormatter.format(balance)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" aria-hidden="true" />
                <span className="text-green-500">{Math.round(savingsRate * 100) || 0}%</span> de taxa de poupança
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Entradas registradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencyFormatter.format(transactionTotals.income || monthlyIncome)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" aria-hidden="true" />
                Atualize suas receitas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saídas registradas</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencyFormatter.format(transactionTotals.expense || monthlyExpenses)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingDown className="h-3 w-3 text-red-500" aria-hidden="true" />
                Monitore seus gastos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reserva de emergência</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencyFormatter.format(emergencyFund)}</div>
              <CardDescription className="text-xs">Meta sugerida para 6 meses</CardDescription>
            </CardContent>
          </Card>
        </div>

        <section id="cadastro" className="mt-12">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="text-2xl font-semibold">Cadastro e banco de dados local</h3>
          </div>
          <p className="text-muted-foreground mt-2">
            Preencha seus dados para salvar o perfil financeiro diretamente no navegador e manter o histórico sempre
            disponível.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cadastro rápido</CardTitle>
                <CardDescription>Atualize sua renda, despesas e objetivo principal.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleProfileSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input id="name" value={profile.name} onChange={handleProfileChange("name")} placeholder="Ex: Ana Silva" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" value={profile.email} onChange={handleProfileChange("email")} placeholder="voce@email.com" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="income">Renda mensal (R$)</Label>
                      <Input id="income" inputMode="decimal" value={profile.monthlyIncome} onChange={handleProfileChange("monthlyIncome")} placeholder="5000" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fixed">Despesas fixas (R$)</Label>
                      <Input id="fixed" inputMode="decimal" value={profile.fixedExpenses} onChange={handleProfileChange("fixedExpenses")} placeholder="2500" />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="variable">Despesas variáveis (R$)</Label>
                      <Input id="variable" inputMode="decimal" value={profile.variableExpenses} onChange={handleProfileChange("variableExpenses")} placeholder="1200" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="risk">Perfil de risco</Label>
                      <select
                        id="risk"
                        value={profile.riskProfile}
                        onChange={handleProfileChange("riskProfile")}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      >
                        <option value="conservador">Conservador</option>
                        <option value="moderado">Moderado</option>
                        <option value="arrojado">Arrojado</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="goal">Objetivo principal</Label>
                    <select
                      id="goal"
                      value={profile.mainGoal}
                      onChange={handleProfileChange("mainGoal")}
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                      <option value="equilibrar">Equilibrar orçamento</option>
                      <option value="reserva">Criar reserva</option>
                      <option value="investir">Investir melhor</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full">Salvar cadastro</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo do perfil</CardTitle>
                <CardDescription>Dados salvos localmente no seu navegador.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Nome:</strong> {profile.name || "Não informado"}</p>
                  <p><strong>E-mail:</strong> {profile.email || "Não informado"}</p>
                  <p><strong>Renda mensal:</strong> {currencyFormatter.format(monthlyIncome)}</p>
                  <p><strong>Despesas totais:</strong> {currencyFormatter.format(monthlyExpenses)}</p>
                  <p><strong>Meta:</strong> {profile.mainGoal}</p>
                </div>
                <Separator />
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <p>Último salvamento: {profileSavedAt ? new Date(profileSavedAt).toLocaleString("pt-BR") : "Nenhum"}</p>
                  <p>Reserva sugerida: {currencyFormatter.format(emergencyFund)}</p>
                  <p>Saldo livre mensal: {currencyFormatter.format(monthlySavings)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="transacoes" className="mt-12">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="text-2xl font-semibold">Banco de dados de transações</h3>
          </div>
          <p className="text-muted-foreground mt-2">
            Registre receitas e despesas para manter um histórico completo e obter análises mais avançadas.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Nova transação</CardTitle>
                <CardDescription>Adicione entradas e saídas com categoria e data.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleAddTransaction}>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={transactionForm.description}
                      onChange={(event) => setTransactionForm((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Ex: Salário, aluguel, mercado"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={transactionForm.category}
                      onChange={(event) => setTransactionForm((prev) => ({ ...prev, category: event.target.value }))}
                      placeholder="Ex: Habitação"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input
                        id="amount"
                        inputMode="decimal"
                        value={transactionForm.amount}
                        onChange={(event) => setTransactionForm((prev) => ({ ...prev, amount: event.target.value }))}
                        placeholder="250"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Tipo</Label>
                      <select
                        id="type"
                        value={transactionForm.type}
                        onChange={(event) =>
                          setTransactionForm((prev) => ({ ...prev, type: event.target.value as "income" | "expense" }))
                        }
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      >
                        <option value="income">Entrada</option>
                        <option value="expense">Saída</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={transactionForm.date}
                      onChange={(event) => setTransactionForm((prev) => ({ ...prev, date: event.target.value }))}
                    />
                  </div>
                  <Button type="submit" className="w-full">Registrar transação</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico</CardTitle>
                <CardDescription>Dados armazenados localmente com atualização imediata.</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma transação cadastrada ainda.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.type === "income" ? "Entrada" : "Saída"}</TableCell>
                          <TableCell>{currencyFormatter.format(transaction.amount)}</TableCell>
                          <TableCell>{parseLocalDate(transaction.date).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTransaction(transaction.id)}
                            >
                              Remover
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="ferramentas" className="mt-12">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="text-2xl font-semibold">Ferramentas avançadas de análise</h3>
          </div>
          <p className="text-muted-foreground mt-2">
            Planeje orçamento, simule investimentos e visualize metas importantes para o seu crescimento financeiro.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Planejador 50/30/20</CardTitle>
                <CardDescription>Distribuição recomendada a partir da renda informada.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Recomendado</TableHead>
                      <TableHead>Atual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Essenciais (50%)</TableCell>
                      <TableCell>{currencyFormatter.format(budgetPlan.essentials)}</TableCell>
                      <TableCell>{currencyFormatter.format(fixedExpenses)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Estilo de vida (30%)</TableCell>
                      <TableCell>{currencyFormatter.format(budgetPlan.lifestyle)}</TableCell>
                      <TableCell>{currencyFormatter.format(variableExpenses)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Investimentos (20%)</TableCell>
                      <TableCell>{currencyFormatter.format(budgetPlan.investments)}</TableCell>
                      <TableCell>{currencyFormatter.format(Math.max(monthlySavings, 0))}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Simulador de investimentos</CardTitle>
                <CardDescription>Projeção com aportes mensais e juros compostos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="contribution">Aporte mensal (R$)</Label>
                    <Input
                      id="contribution"
                      inputMode="decimal"
                      value={investmentForm.monthlyContribution}
                      onChange={(event) =>
                        setInvestmentForm((prev) => ({ ...prev, monthlyContribution: event.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="rate">Taxa anual (%)</Label>
                    <Input
                      id="rate"
                      inputMode="decimal"
                      value={investmentForm.annualRate}
                      onChange={(event) => setInvestmentForm((prev) => ({ ...prev, annualRate: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="months">Meses</Label>
                    <Input
                      id="months"
                      inputMode="numeric"
                      value={investmentForm.months}
                      onChange={(event) => setInvestmentForm((prev) => ({ ...prev, months: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="rounded-md border border-border bg-muted/40 p-4 text-sm">
                  <p><strong>Total investido:</strong> {currencyFormatter.format(investmentProjection.totalInvested)}</p>
                  <p><strong>Valor projetado:</strong> {currencyFormatter.format(investmentProjection.finalBalance)}</p>
                  <p><strong>Período:</strong> {investmentProjection.months} meses</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês</TableHead>
                      <TableHead>Saldo projetado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investmentProjection.data.slice(0, 6).map((entry) => (
                      <TableRow key={entry.month}>
                        <TableCell>{entry.month}</TableCell>
                        <TableCell>{currencyFormatter.format(entry.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="assistente" className="mt-12">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="text-2xl font-semibold">Assistente IA gratuita especialista em finanças</h3>
          </div>
          <p className="text-muted-foreground mt-2">
            Gere recomendações automáticas com base no seu cadastro, transações e objetivo principal.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personalize a análise</CardTitle>
                <CardDescription>Informe seu objetivo e perguntas específicas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="goal-assistant">Objetivo</Label>
                  <select
                    id="goal-assistant"
                    value={assistantForm.goal}
                    onChange={(event) => setAssistantForm((prev) => ({ ...prev, goal: event.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="equilibrar">Equilibrar orçamento</option>
                    <option value="reserva">Criar reserva</option>
                    <option value="investir">Investir melhor</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="horizon">Horizonte de análise (meses)</Label>
                  <Input
                    id="horizon"
                    inputMode="numeric"
                    value={assistantForm.horizon}
                    onChange={(event) => setAssistantForm((prev) => ({ ...prev, horizon: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="question">Pergunta ou desafio atual</Label>
                  <Textarea
                    id="question"
                    value={assistantForm.question}
                    onChange={(event) => setAssistantForm((prev) => ({ ...prev, question: event.target.value }))}
                    placeholder="Ex: Quero reduzir gastos e investir mais"
                  />
                </div>
                <Button onClick={handleGenerateAdvice} className="w-full">Gerar recomendações</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resposta da IA</CardTitle>
                <CardDescription>Dicas geradas gratuitamente para você aplicar agora.</CardDescription>
              </CardHeader>
              <CardContent>
                {assistantTips.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma recomendação ainda. Clique em “Gerar”.</p>
                ) : (
                  <ul className="list-disc space-y-2 pl-5 text-sm">
                    {assistantTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="privacidade" className="mt-12">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="text-2xl font-semibold">Privacidade e segurança</h3>
          </div>
          <p className="text-muted-foreground mt-2">
            Seus dados ficam no seu navegador e você controla o acesso com exportação e limpeza a qualquer momento.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compromissos essenciais</CardTitle>
                <CardDescription>Transparência total com sua informação financeira.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Cadastro e histórico armazenados localmente.</p>
                <p>• Exportação em JSON para manter backup offline.</p>
                <p>• Nenhum dado enviado para servidores externos.</p>
                <p>• Controle total com botão de limpeza imediata.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Saiba mais</CardTitle>
                <CardDescription>Detalhes completos da política de privacidade.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/privacy">Ver política completa</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
