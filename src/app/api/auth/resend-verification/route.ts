import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

const APP_URL = process.env.APP_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'Se o e-mail existir, você receberá um link de verificação.',
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Este e-mail já foi verificado' },
        { status: 400 }
      );
    }

    // Delete any existing verification tokens for this user
    await prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });

    // Create new verification token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send verification email
    const verificationUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;
    const result = await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Erro ao enviar e-mail de verificação' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'E-mail de verificação enviado com sucesso!',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Erro ao reenviar verificação' },
      { status: 500 }
    );
  }
}
