import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { user } = auth;

  return NextResponse.json({
    profile: {
      name: user.name,
      email: user.email,
      monthlyIncome: user.profile?.monthlyIncome || 0,
      fixedExpenses: user.profile?.fixedExpenses || 0,
      variableExpenses: user.profile?.variableExpenses || 0,
      riskProfile: user.profile?.riskProfile || 'moderado',
      mainGoal: user.profile?.mainGoal || 'equilibrar',
    },
  });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { user } = auth;

  try {
    const body = await request.json();
    const { monthlyIncome, fixedExpenses, variableExpenses, riskProfile, mainGoal } = body;

    // Update or create profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        monthlyIncome: monthlyIncome !== undefined ? parseFloat(monthlyIncome) : undefined,
        fixedExpenses: fixedExpenses !== undefined ? parseFloat(fixedExpenses) : undefined,
        variableExpenses: variableExpenses !== undefined ? parseFloat(variableExpenses) : undefined,
        riskProfile: riskProfile || undefined,
        mainGoal: mainGoal || undefined,
      },
      create: {
        userId: user.id,
        monthlyIncome: parseFloat(monthlyIncome) || 0,
        fixedExpenses: parseFloat(fixedExpenses) || 0,
        variableExpenses: parseFloat(variableExpenses) || 0,
        riskProfile: riskProfile || 'moderado',
        mainGoal: mainGoal || 'equilibrar',
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}
