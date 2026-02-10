import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=missing-token', request.url));
    }

    // Find verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url));
    }

    // Check if token expired
    if (new Date() > verification.expiresAt) {
      // Delete expired token
      await prisma.emailVerification.delete({
        where: { id: verification.id },
      });
      return NextResponse.redirect(new URL('/login?error=expired-token', request.url));
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    });

    // Delete verification token (one-time use)
    await prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    // Redirect to login with success message
    return NextResponse.redirect(new URL('/login?verified=true', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/login?error=verification-failed', request.url));
  }
}
