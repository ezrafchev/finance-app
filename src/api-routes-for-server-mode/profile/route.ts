export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server/auth';
import { getUserData, updateProfile } from '@/lib/server/storage';

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

    return NextResponse.json({
      profile: userData.profile,
      email: userData.email,
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, monthlyIncome, fixedExpenses, variableExpenses, riskProfile, mainGoal } = body;

    const profileUpdate: Record<string, string | number> = {};
    if (name !== undefined) profileUpdate.name = name.trim();
    if (monthlyIncome !== undefined) profileUpdate.monthlyIncome = Number(monthlyIncome) || 0;
    if (fixedExpenses !== undefined) profileUpdate.fixedExpenses = Number(fixedExpenses) || 0;
    if (variableExpenses !== undefined) profileUpdate.variableExpenses = Number(variableExpenses) || 0;
    if (riskProfile !== undefined) profileUpdate.riskProfile = riskProfile;
    if (mainGoal !== undefined) profileUpdate.mainGoal = mainGoal;

    const success = updateProfile(session.userId, profileUpdate);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil' },
        { status: 500 }
      );
    }

    const userData = getUserData(session.userId);
    return NextResponse.json({
      success: true,
      profile: userData?.profile,
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}
