import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAnonClient } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() || '';
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const anon = getSupabaseAnonClient();
    if (!anon) {
      return NextResponse.json({ error: 'Auth service unavailable' }, { status: 500 });
    }

    const origin = req.nextUrl.origin;
    // Always return success-style message to avoid user enumeration.
    await anon.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/login`,
    });

    return NextResponse.json({
      success: true,
      message: 'If this email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Unable to process request' }, { status: 500 });
  }
}
