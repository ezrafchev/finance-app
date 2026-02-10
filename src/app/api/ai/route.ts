import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server/auth';
import { getUserData } from '@/lib/server/storage';
import { generateFinancialRecommendations } from '@/lib/server/financial-ai';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { goal, horizon, question } = body;

    const recommendations = generateFinancialRecommendations(
      userData,
      goal || 'equilibrar',
      Number(horizon) || 12,
      question
    );

    return NextResponse.json({
      success: true,
      recommendations,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI recommendations error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar recomendações' },
      { status: 500 }
    );
  }
}
