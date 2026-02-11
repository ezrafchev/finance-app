// Client-side Financial AI Advisor

export interface Profile {
  name: string;
  email: string;
  monthlyIncome: number;
  fixedExpenses: number;
  variableExpenses: number;
  riskProfile: string;
  mainGoal: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  category: string;
  amount: number;
  date: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionItems: string[];
  icon: string;
}

/**
 * Calculates comprehensive financial metrics based on user profile and transactions.
 * 
 * @param profile - User's financial profile containing income and expense information
 * @param transactions - Array of financial transactions (income and expenses)
 * @returns Object containing calculated financial metrics including:
 *   - totalIncome: Sum of all income transactions
 *   - totalExpenses: Sum of all expense transactions
 *   - balance: Net difference between income and expenses
 *   - savingsRate: Percentage of monthly income being saved
 *   - monthlyFreeCashFlow: Available cash after monthly expenses
 *   - emergencyFundTarget: Recommended emergency fund (6 months of expenses)
 */
function calculateMetrics(profile: Profile, transactions: Transaction[]) {
  const monthlyIncome = profile.monthlyIncome || 0;
  const fixedExpenses = profile.fixedExpenses || 0;
  const variableExpenses = profile.variableExpenses || 0;
  const monthlyExpenses = fixedExpenses + variableExpenses;
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  const monthlyFreeCashFlow = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlyFreeCashFlow / monthlyIncome) * 100 : 0;
  const emergencyFundTarget = monthlyExpenses * 6;
  
  return {
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
    monthlyFreeCashFlow,
    emergencyFundTarget,
  };
}

export function generateRecommendations(
  profile: Profile,
  transactions: Transaction[],
  goal: string,
  horizon: number,
  question?: string
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  const monthlyIncome = profile.monthlyIncome || 0;
  const fixedExpenses = profile.fixedExpenses || 0;
  const variableExpenses = profile.variableExpenses || 0;
  const totalExpenses = fixedExpenses + variableExpenses;
  const freeCashFlow = monthlyIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? (freeCashFlow / monthlyIncome) * 100 : 0;
  
  const metrics = calculateMetrics(profile, transactions);
  
  // Análise de transações recentes
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentExpenses = transactions.filter(t => 
    t.type === 'expense' && new Date(t.date) >= last30Days
  );
  
  const expensesByCategory = recentExpenses.reduce((acc, t) => {
    const category = t.category || 'Outros';
    acc[category] = (acc[category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const topExpense = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)[0];

  // Recomendação 1: Reserva de emergência
  if (metrics.emergencyFundTarget > 0 && (goal === 'reserva' || goal === 'equilibrar')) {
    const currentReserve = Math.max(0, metrics.balance);
    const gap = metrics.emergencyFundTarget - currentReserve;
    
    if (gap > 0) {
      const monthlyTarget = gap / horizon;
      recommendations.push({
        title: '🛡️ Construa sua reserva de emergência',
        description: `Você precisa de R$ ${metrics.emergencyFundTarget.toFixed(2)} como reserva (6 meses de despesas). Faltam R$ ${gap.toFixed(2)}.`,
        priority: 'high',
        category: 'Segurança Financeira',
        icon: '🛡️',
        actionItems: [
          `💰 Separe R$ ${monthlyTarget.toFixed(2)} por mês para atingir em ${horizon} meses`,
          '📊 Invista em Tesouro Selic ou CDB com liquidez diária',
          '🚫 Use apenas em emergências reais (saúde, desemprego)',
          '✅ Revise seu progresso mensalmente'
        ]
      });
    }
  }

  // Recomendação 2: Taxa de poupança
  if (savingsRate < 15) {
    const targetSavings = monthlyIncome * 0.15;
    const additionalSavings = targetSavings - freeCashFlow;
    
    recommendations.push({
      title: '📈 Aumente sua taxa de poupança',
      description: `Sua taxa de poupança é ${savingsRate.toFixed(1)}%. O ideal é 15-20% da renda para construir patrimônio.`,
      priority: 'high',
      category: 'Poupança',
      icon: '📈',
      actionItems: [
        `💸 Economize mais R$ ${Math.max(0, additionalSavings).toFixed(2)} por mês`,
        '🔍 Analise gastos supérfluos e corte 20% deles',
        '🤖 Automatize transferências para poupança assim que receber',
        '📱 Use método "pague-se primeiro"'
      ]
    });
  }

  // Recomendação 3: Orçamento negativo URGENTE
  if (freeCashFlow < 0) {
    recommendations.push({
      title: '🚨 URGENTE: Equilibre seu orçamento',
      description: `Suas despesas excedem sua renda em R$ ${Math.abs(freeCashFlow).toFixed(2)}/mês. Isso leva a dívidas!`,
      priority: 'high',
      category: 'Orçamento Crítico',
      icon: '🚨',
      actionItems: [
        '✂️ Corte IMEDIATAMENTE despesas não essenciais',
        '💼 Busque renda extra (freelance, vendas, trabalho temporário)',
        '📞 Renegocie contratos (internet, telefone, academia)',
        '🏠 Considere mudanças maiores (moradia, carro) se necessário'
      ]
    });
  }

  // Recomendação 4: Regra 50/30/20
  const recommended50 = monthlyIncome * 0.5;
  if (fixedExpenses > recommended50) {
    const excess = fixedExpenses - recommended50;
    recommendations.push({
      title: '⚖️ Reequilibre despesas essenciais',
      description: `Despesas fixas (R$ ${fixedExpenses.toFixed(2)}) excedem 50% da renda. Ideal: R$ ${recommended50.toFixed(2)}.`,
      priority: 'medium',
      category: 'Orçamento 50/30/20',
      icon: '⚖️',
      actionItems: [
        `📉 Reduza em R$ ${excess.toFixed(2)} as despesas fixas`,
        '🏠 Avalie moradia (mudança, dividir apartamento)',
        '🚗 Considere transporte alternativo',
        '📞 Renegocie todos os serviços fixos'
      ]
    });
  }

  // Recomendação 5: Categoria de gasto alto
  if (topExpense && topExpense[1] > monthlyIncome * 0.15 && monthlyIncome > 0) {
    const percentage = ((topExpense[1] / monthlyIncome) * 100).toFixed(1);
    const suggestedLimit = monthlyIncome * 0.12;
    
    recommendations.push({
      title: `💳 Controle gastos em ${topExpense[0]}`,
      description: `R$ ${topExpense[1].toFixed(2)} em ${topExpense[0]} (${percentage}% da renda) está acima do recomendado.`,
      priority: 'medium',
      category: 'Controle de Gastos',
      icon: '💳',
      actionItems: [
        `🎯 Estabeleça limite de R$ ${suggestedLimit.toFixed(2)}/mês nesta categoria`,
        '📝 Liste todos os gastos desta categoria no mês',
        '❓ Questione cada compra: "Preciso realmente?"',
        '🔄 Busque alternativas mais econômicas'
      ]
    });
  }

  // Recomendação 6: Investimentos
  if (freeCashFlow > 0 && (goal === 'investir' || savingsRate > 20)) {
    const riskProfiles = {
      conservador: {
        allocation: '80% Renda Fixa + 20% Fundos',
        assets: 'Tesouro Selic, CDB, LCI/LCA',
        return: '~10-12% ao ano (100% do CDI)'
      },
      moderado: {
        allocation: '60% Renda Fixa + 30% Fundos + 10% Ações',
        assets: 'Tesouro, CDB, Fundos Multimercado, ETFs',
        return: '~12-15% ao ano com volatilidade moderada'
      },
      arrojado: {
        allocation: '40% Renda Fixa + 60% Renda Variável',
        assets: 'Ações, ETFs, FIIs, Criptomoedas',
        return: '~15-20% ao ano com alta volatilidade'
      }
    };

    const profile_risk = profile.riskProfile as keyof typeof riskProfiles || 'moderado';
    const riskData = riskProfiles[profile_risk];

    recommendations.push({
      title: '💎 Otimize seus investimentos',
      description: `Com R$ ${freeCashFlow.toFixed(2)}/mês disponíveis e perfil ${profile_risk}, construa patrimônio sólido.`,
      priority: 'medium',
      category: 'Investimentos',
      icon: '💎',
      actionItems: [
        `📊 Alocação: ${riskData.allocation}`,
        `🎯 Foque em: ${riskData.assets}`,
        `📈 Retorno esperado: ${riskData.return}`,
        '♻️ Reinvista dividendos para juros compostos'
      ]
    });
  }

  // Recomendação 7: Dívidas
  if (fixedExpenses > monthlyIncome * 0.55) {
    recommendations.push({
      title: '💰 Reduza endividamento',
      description: 'Despesas fixas muito altas podem indicar endividamento excessivo.',
      priority: 'high',
      category: 'Dívidas',
      icon: '💰',
      actionItems: [
        '📋 Liste todas as dívidas com juros e prazos',
        '🔥 Priorize dívidas com juros altos (cartão, cheque especial)',
        '🔄 Negocie portabilidade para taxas menores',
        '🚫 Não faça novas dívidas até equilibrar as atuais'
      ]
    });
  }

  // Resposta à pergunta específica
  if (question && question.trim().length > 0) {
    const q = question.toLowerCase();
    
    if (q.includes('investir') || q.includes('investimento') || q.includes('aplicar')) {
      if (freeCashFlow <= 0) {
        recommendations.push({
          title: '🎯 Primeiro: equilibre seu orçamento',
          description: 'Para investir, você precisa ter sobra no final do mês.',
          priority: 'high',
          category: 'Sua Pergunta',
          icon: '🎯',
          actionItems: [
            '1️⃣ Reduza despesas para ter fluxo positivo',
            '2️⃣ Comece poupando 10% da renda',
            '3️⃣ Depois, siga as recomendações de investimento acima',
            '4️⃣ Estude educação financeira (livros, cursos)'
          ]
        });
      } else {
        recommendations.push({
          title: '📚 Comece a investir agora',
          description: 'Você tem condições de investir. Comece simples e aprenda fazendo.',
          priority: 'high',
          category: 'Sua Pergunta',
          icon: '📚',
          actionItems: [
            '🏦 Abra conta em corretora (XP, Rico, Clear)',
            '📖 Estude o básico (Tesouro, CDB, Ações)',
            '💰 Comece com R$ 100-500/mês em Tesouro Selic',
            '📈 Aumente valores conforme ganhar confiança'
          ]
        });
      }
    } else if (q.includes('economizar') || q.includes('poupar') || q.includes('guardar')) {
      recommendations.push({
        title: '💡 Estratégias para economizar',
        description: 'Economizar é habilidade que se aprende com método e disciplina.',
        priority: 'high',
        category: 'Sua Pergunta',
        icon: '💡',
        actionItems: [
          '🥇 Pague-se primeiro: separe poupança ao receber',
          '⏱️ Regra dos 30 dias: espere antes de comprar',
          '🤖 Automatize transferências para investimento',
          `🎯 Meta: R$ ${(monthlyIncome * 0.2).toFixed(2)}/mês (20% da renda)`
        ]
      });
    } else if (q.includes('dívida') || q.includes('dever') || q.includes('empréstimo')) {
      recommendations.push({
        title: '🛠️ Saia das dívidas',
        description: 'Dívidas são emergência financeira. Prioridade máxima para resolver.',
        priority: 'high',
        category: 'Sua Pergunta',
        icon: '🛠️',
        actionItems: [
          '📊 Método bola de neve: pague menor dívida primeiro',
          '🔥 Método avalanche: pague maior juro primeiro',
          '💬 Negocie descontos (geralmente 30-50%)',
          '💼 Trabalhe extra temporariamente para quitar'
        ]
      });
    }
  }

  // Ordenar por prioridade
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Limitar a 6 recomendações
  return recommendations.slice(0, 6);
}
