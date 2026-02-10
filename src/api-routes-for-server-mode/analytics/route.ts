export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server/auth';
import { getUserData } from '@/lib/server/storage';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const userData = getUserData(session.userId);
    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const profile = userData.profile;
    const transactions = userData.transactions;

    // Calculate income and expenses from transactions
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Calculate savings rate
    const monthlyIncome = profile.monthlyIncome;
    const totalMonthlyExpenses = profile.fixedExpenses + profile.variableExpenses;
    const freeCashFlow = monthlyIncome - totalMonthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (freeCashFlow / monthlyIncome) * 100 : 0;

    // Emergency fund calculation
    const emergencyFundTarget = totalMonthlyExpenses * 6;

    // 50/30/20 breakdown
    const recommended50 = monthlyIncome * 0.5;
    const recommended30 = monthlyIncome * 0.3;
    const recommended20 = monthlyIncome * 0.2;

    // Category breakdown
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = 0;
        }
        acc[t.category] += t.amount;
        return acc;
      }, {} as Record<string, number>);

    const categoryBreakdown = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category: category || 'Sem categoria',
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      if (date >= sixMonthsAgo) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expenses: 0 };
        }
        if (t.type === 'income') {
          monthlyData[monthKey].income += t.amount;
        } else {
          monthlyData[monthKey].expenses += t.amount;
        }
      }
    });

    const monthlyTrend = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpenses,
        balance,
        transactionCount: transactions.length,
      },
      profile: {
        monthlyIncome,
        totalMonthlyExpenses,
        freeCashFlow,
        savingsRate: Math.round(savingsRate * 10) / 10,
      },
      goals: {
        emergencyFundTarget,
        emergencyFundProgress: balance > 0 ? Math.min((balance / emergencyFundTarget) * 100, 100) : 0,
      },
      budgetPlan: {
        essentials: { recommended: recommended50, current: profile.fixedExpenses },
        lifestyle: { recommended: recommended30, current: profile.variableExpenses },
        savings: { recommended: recommended20, current: freeCashFlow },
      },
      categoryBreakdown,
      monthlyTrend,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular análises' },
      { status: 500 }
    );
  }
}
