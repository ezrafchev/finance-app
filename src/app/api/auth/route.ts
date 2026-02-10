import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const APP_URL = process.env.APP_URL || 'http://localhost:8000';

// Simple JWT creation (same as before)
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64UrlEncode(Buffer.from(signature).toString('base64'));
}

async function createToken(payload: { userId: string; email: string }): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const fullPayload = { ...payload, exp };
  
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = await createSignature(`${header}.${body}`, JWT_SECRET);
  
  return `${header}.${body}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    if (action === 'register') {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: emailLower },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 409 }
        );
      }

      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Nome é obrigatório' },
          { status: 400 }
        );
      }

      if (password.length < 8) {
        return NextResponse.json(
          { error: 'A senha deve ter pelo menos 8 caracteres' },
          { status: 400 }
        );
      }

      // Hash password with bcrypt cost factor 10 (OWASP recommended)
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user with profile
      const user = await prisma.user.create({
        data: {
          email: emailLower,
          passwordHash,
          name: name.trim(),
          emailVerified: false,
          profile: {
            create: {
              monthlyIncome: 0,
              fixedExpenses: 0,
              variableExpenses: 0,
              riskProfile: 'moderado',
              mainGoal: 'equilibrar',
            },
          },
        },
      });

      // Create email verification token
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
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl,
      });

      return NextResponse.json({
        success: true,
        message: 'Cadastro realizado! Verifique seu e-mail para confirmar sua conta.',
        requiresVerification: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        },
      });

    } else if (action === 'login') {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: emailLower },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Email ou senha incorretos' },
          { status: 401 }
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Email ou senha incorretos' },
          { status: 401 }
        );
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return NextResponse.json(
          { 
            error: 'Por favor, confirme seu e-mail antes de fazer login',
            requiresVerification: true,
            userId: user.id,
          },
          { status: 403 }
        );
      }

      // Create session token
      const token = await createToken({
        userId: user.id,
        email: user.email,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        },
      });

      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json(
        { error: 'Ação inválida' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar autenticação' },
      { status: 500 }
    );
  }
}
