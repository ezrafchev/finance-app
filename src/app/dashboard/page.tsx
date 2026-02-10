import Link from "next/link";
import { ArrowUpRight, CreditCard, DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" aria-hidden="true" />
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
            <h2 className="text-3xl font-bold">Overview of your finances</h2>
          </div>
          <Button className="gap-2">
            View Insights <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$48,630.12</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" aria-hidden="true" />
                <span className="text-green-500">+8.4%</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$14,520.00</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" aria-hidden="true" />
                <span className="text-green-500">+12.3%</span> month to date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$7,980.40</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingDown className="h-3 w-3 text-red-500" aria-hidden="true" />
                <span className="text-red-500">-4.2%</span> under budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Bills</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,280.00</div>
              <CardDescription className="text-xs">Due in the next 14 days</CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
