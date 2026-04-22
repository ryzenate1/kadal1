import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { resolveProfile } from '@/lib/server/requestUser';
import { getSupabaseAnonClient } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

type RefreshBody = {
  refreshToken?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RefreshBody;
    const refreshToken = body.refreshToken?.trim() || '';

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    const anonSupabase = getSupabaseAnonClient();
    if (!anonSupabase) {
      return NextResponse.json(
        {
          error:
            'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
        },
        { status: 500 }
      );
    }

    const { data, error } = await anonSupabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session || !data.user) {
      return NextResponse.json({ error: error?.message || 'Invalid refresh token' }, { status: 401 });
    }

    const refreshedUser = data.user;
    const refreshedSession = data.session;

    const metadata = (refreshedUser.user_metadata || {}) as Record<string, unknown>;
    const profile = await withTransaction((client) =>
      resolveProfile(client, {
        authUserId: refreshedUser.id,
        name: typeof metadata.name === 'string' ? metadata.name : undefined,
        email: refreshedUser.email || undefined,
        phoneNumber:
          typeof metadata.phone_number === 'string' ? metadata.phone_number : refreshedUser.phone || undefined,
      })
    );

    return NextResponse.json({
      token: refreshedSession.access_token,
      refreshToken: refreshedSession.refresh_token,
      expiresIn: refreshedSession.expires_in,
      user: {
        id: profile.id,
        authUserId: refreshedUser.id,
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phone_number,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ACCOUNT_BLOCKED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Refresh API error:', error);
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 });
  }
}
