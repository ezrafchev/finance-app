import { type NextRequest } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET || 'finance-app-secret-key-change-in-production';

export interface SessionPayload {
  userId: string;
  email: string;
  exp: number;
}

// Simple JWT implementation (for production, use a library like 'jose')
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString();
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

export async function createToken(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const fullPayload: SessionPayload = { ...payload, exp };
  
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = await createSignature(`${header}.${body}`, SECRET_KEY);
  
  return `${header}.${body}.${signature}`;
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) {
      return null;
    }

    const expectedSignature = await createSignature(`${header}.${body}`, SECRET_KEY);
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
