import { UserData } from './storage';

export interface AIRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionItems: string[];
}

export function generateFinancialRecommendations(
  userData: UserData,
  goal: string,
  horizon: number,
  customQuestion?: string
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];
  const profile = userData.profile;
  
  // Calculate key metrics
  const totalIncome = profile.monthlyIncome;
  const totalExpenses = profile.fixedExpenses + profile.variableExpenses;
  const freeCashFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (freeCashFlow / totalIncome) * 100 : 0;
  
  // Calculate from transactions
  const transactions = userData.transactions;
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentExpenses = transactions.filter(t => 
    t.type === 'expense' && new Date(t.date) >= last30Days
  );
  
  const expensesByCategory = recentExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const topExpenseCategory = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)[0];

  // Emergency fund recommendation
  const emergencyFundTarget = totalExpenses * 6;
  const emergencyFundGap = emergencyFundTarget - (freeCashFlow > 0 ? freeCashFlow * 6 : 0);
  
  if (emergencyFundGap > 0 && (goal === 'reserva' || goal === 'equilibrar')) {
    recommendations.push({
      title: 'Construa sua reserva de emergência',
      description: `Com base nas suas despesas mensais de R$ ${totalExpenses.toFixed(2)}, você precisa de uma reserva de R$ ${emergencyFundTarget.toFixed(2)} (6 meses de despesas).`,
      priority: 'high',
      category: 'Segurança Financeira',
      actionItems: [
        `Separe mensalmente R$ ${(emergencyFundGap / horizon).toFixed(2)} para atingir sua meta em ${horizon} meses`,
        'Mantenha esta reserva em investimentos líquidos e conservadores (ex: Tesouro Selic)',
        'Não utilize este dinheiro exceto em verdadeiras emergências'
      ]
    });
  }

  // Savings rate recommendation
  if (savingsRate < 15 && freeCashFlow < totalIncome * 0.15) {
    recommendations.push({
      title: 'Aumente sua taxa de poupança',
      description: `Sua taxa de poupança atual é de ${savingsRate.toFixed(1)}%. Para uma boa saúde financeira, o ideal é poupar pelo menos 15-20% da sua renda.`,
      priority: 'high',
      category: 'Orçamento',
      actionItems: [
        `Tente economizar mais R$ ${((totalIncome * 0.15) - freeCashFlow).toFixed(2)} por mês`,
        'Revise suas despesas variáveis e identifique onde pode cortar',
        'Automatize suas economias assim que receber o salário'
      ]
    });
  }

  // Budget balance recommendation
  if (freeCashFlow < 0) {
    recommendations.push({
      title: 'URGENTE: Equilibre seu orçamento',
      description: `Suas despesas excedem sua renda em R$ ${Math.abs(freeCashFlow).toFixed(2)} por mês. Isso é insustentável e pode levar a dívidas.`,
      priority: 'high',
      category: 'Orçamento',
      actionItems: [
        'Revise TODAS as despesas e elimine as não essenciais imediatamente',
        'Procure formas de aumentar sua renda (trabalho extra, freelancing)',
        'Considere renegociar dívidas existentes para reduzir juros'
      ]
    });
  }

  // 50/30/20 rule recommendation
  const recommended50 = totalIncome * 0.5;
  const recommended20 = totalIncome * 0.2;
  
  if (profile.fixedExpenses > recommended50 && goal === 'equilibrar') {
    recommendations.push({
      title: 'Rebalance suas despesas essenciais',
      description: `Suas despesas fixas de R$ ${profile.fixedExpenses.toFixed(2)} excedem os 50% recomendados (R$ ${recommended50.toFixed(2)}).`,
      priority: 'medium',
      category: 'Orçamento',
      actionItems: [
        'Avalie se pode reduzir aluguel (mudança, dividir moradia)',
        'Renegocie serviços fixos (internet, telefone, seguros)',
        `Tente reduzir em pelo menos R$ ${(profile.fixedExpenses - recommended50).toFixed(2)}`
      ]
    });
  }

  // Expense category recommendation
  if (topExpenseCategory && topExpenseCategory[1] > totalIncome * 0.15) {
    recommendations.push({
      title: `Controle gastos em ${topExpenseCategory[0]}`,
      description: `Você gastou R$ ${topExpenseCategory[1].toFixed(2)} em ${topExpenseCategory[0]} nos últimos 30 dias, representando ${((topExpenseCategory[1] / totalIncome) * 100).toFixed(1)}% da sua renda.`,
      priority: 'medium',
      category: 'Despesas',
      actionItems: [
        `Estabeleça um limite mensal de R$ ${(totalIncome * 0.12).toFixed(2)} para esta categoria`,
        'Analise cada gasto e questione se é realmente necessário',
        'Busque alternativas mais econômicas'
      ]
    });
  }

  // Investment recommendation
  if (freeCashFlow > 0 && (goal === 'investir' || savingsRate > 20)) {
    const riskRecommendations = {
      conservador: {
        assets: 'Tesouro Selic, CDBs de bancos grandes, LCI/LCA',
        allocation: '80% renda fixa + 20% fundos conservadores',
        expectedReturn: '100% do CDI (~10-12% ao ano)'
      },
      moderado: {
        assets: 'Mix de Tesouro, CDBs, Fundos Multimercados e Ações (ETFs)',
        allocation: '60% renda fixa + 30% fundos + 10% ações',
        expectedReturn: '12-15% ao ano com volatilidade moderada'
      },
      arrojado: {
        assets: 'Ações individuais, ETFs, Fundos de Ações, FIIs',
        allocation: '40% renda fixa + 60% renda variável',
        expectedReturn: '15-20% ao ano com alta volatilidade'
      }
    };

    const riskProfile = profile.riskProfile as keyof typeof riskRecommendations || 'moderado';
    const rec = riskRecommendations[riskProfile];

    recommendations.push({
      title: 'Otimize seus investimentos',
      description: `Com R$ ${freeCashFlow.toFixed(2)} disponíveis mensalmente e perfil ${riskProfile}, você pode construir uma carteira robusta.`,
      priority: 'medium',
      category: 'Investimentos',
      actionItems: [
        `Distribua seus investimentos: ${rec.allocation}`,
        `Foque em: ${rec.assets}`,
        `Retorno esperado: ${rec.expectedReturn}`,
        'Reinvista dividendos e juros para maximizar juros compostos'
      ]
    });
  }

  // Debt recommendation
  if (profile.fixedExpenses > totalIncome * 0.6) {
    recommendations.push({
      title: 'Avalie seu endividamento',
      description: 'Suas despesas fixas são muito altas em relação à renda, o que pode indicar endividamento.',
      priority: 'high',
      category: 'Dívidas',
      actionItems: [
        'Liste todas as dívidas com taxas de juros e valores',
        'Priorize pagar dívidas com maiores juros (cartão de crédito, cheque especial)',
        'Considere portabilidade de dívidas para taxas menores',
        'Evite novas dívidas até equilibrar as existentes'
      ]
    });
  }

  // Custom question handling
  if (customQuestion && customQuestion.trim().length > 0) {
    const question = customQuestion.toLowerCase();
    
    if (question.includes('investir') || question.includes('investimento')) {
      if (freeCashFlow <= 0) {
        recommendations.push({
          title: 'Primeiro equilibre seu orçamento',
          description: 'Antes de investir, você precisa ter dinheiro sobrando no final do mês.',
          priority: 'high',
          category: 'Resposta à sua pergunta',
          actionItems: [
            'Reduza despesas para criar um fluxo de caixa positivo',
            'Comece com 10% da renda destinada a investimentos',
            'Após equilibrar, siga as recomendações de investimento acima'
          ]
        });
      }
    } else if (question.includes('economizar') || question.includes('poupar')) {
      recommendations.push({
        title: 'Estratégias para economizar mais',
        description: 'Economizar requer disciplina e método. Aqui estão táticas práticas.',
        priority: 'high',
        category: 'Resposta à sua pergunta',
        actionItems: [
          'Pague a si mesmo primeiro: assim que receber, separe a poupança',
          'Use a regra dos 30 dias: espere 30 dias antes de compras não essenciais',
          'Automatize transferências para poupança/investimento',
          `Estabeleça meta de economizar ${recommended20.toFixed(2)} mensalmente`
        ]
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Limit to top 5 recommendations
  return recommendations.slice(0, 5);
}
