import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/server/storage';
import { createToken } from '@/lib/server/auth';

const PBKDF2_ITERATIONS = 120000;
const PBKDF2_HASH = 'SHA-256';

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const saltBytes = new Uint8Array(
    salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    keyMaterial,
    256
  );
  
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function createSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
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
      const existingUser = getUserByEmail(emailLower);
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

      // Create new user
      const salt = createSalt();
      const passwordHash = await hashPassword(password, salt);
      const user = createUser(emailLower, passwordHash, salt, name.trim());

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
          name: user.profile.name,
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
    } else if (action === 'login') {
      // Find user
      const user = getUserByEmail(emailLower);
      if (!user) {
        return NextResponse.json(
          { error: 'Email ou senha incorretos' },
          { status: 401 }
        );
      }

      // Verify password
      const passwordHash = await hashPassword(password, user.salt);
      if (passwordHash !== user.passwordHash) {
        return NextResponse.json(
          { error: 'Email ou senha incorretos' },
          { status: 401 }
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
          name: user.profile.name,
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
