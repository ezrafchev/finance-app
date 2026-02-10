import { NextRequest } from 'next/server';
import { prisma } from './prisma';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export interface SessionPayload {
  userId: string;
  email: string;
  exp: number;
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString();
}

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

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) {
      return null;
    }

    const expectedSignature = await createSignature(`${header}.${body}`, JWT_SECRET);
    if (signature !== expectedSignature) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(base64UrlDecode(body));
    
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function getSession(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get('session')?.value;
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

export async function requireAuth(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return { error: 'Não autorizado', status: 401 };
  }

  // Verify user still exists and is verified
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true },
  });

  if (!user) {
    return { error: 'Usuário não encontrado', status: 404 };
  }

  if (!user.emailVerified) {
    return { error: 'E-mail não verificado', status: 403 };
  }

  return { user, session };
}
