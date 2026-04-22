import { NextRequest, NextResponse } from 'next/server';
import { db, ensureSchema, withTransaction } from '@/lib/server/database';
import { resolveProfile } from '@/lib/server/requestUser';
import { getSupabaseAnonClient } from '@/lib/server/supabaseAdmin';
import { getBlockedProfileReason } from '@/lib/server/adminUserMeta';

export const runtime = 'nodejs';

type LoginBody = {
  email?: string;
  phoneNumber?: string;
  password?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LoginBody;
    let email = body.email?.trim().toLowerCase() || '';
    const phoneNumber = body.phoneNumber?.trim() || '';
    const password = body.password || '';

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown-ip';

    if (!email && /^\d{10}$/.test(phoneNumber)) {
      await ensureSchema();
      const profileByPhone = await db.query(
        `SELECT id, email FROM profiles WHERE phone_number = $1 AND email IS NOT NULL ORDER BY updated_at DESC NULLS LAST, created_at DESC LIMIT 1`,
        [phoneNumber]
      );
      email = (profileByPhone.rows[0]?.email as string | undefined) || '';
      const blockedProfileId = profileByPhone.rows[0]?.id as string | undefined;
      if (blockedProfileId) {
        const blockedReason = await getBlockedProfileReason(blockedProfileId);
        if (blockedReason) {
          return NextResponse.json({ error: blockedReason }, { status: 403 });
        }
      }
    }
    await ensureSchema();
    const identityKey = (email || phoneNumber || 'unknown').toLowerCase();
    const attemptKey = `${identityKey}|${clientIp}`;
    const lockState = await db.query(
      `SELECT failed_count, blocked_until
       FROM auth_login_attempts
       WHERE identity_key = $1
       LIMIT 1`,
      [attemptKey]
    );
    const blockedUntil = lockState.rows[0]?.blocked_until
      ? new Date(String(lockState.rows[0].blocked_until)).getTime()
      : 0;
    if (blockedUntil > Date.now()) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Try again later.' },
        { status: 429 }
      );
    }

    const blockedProfileByIdentity = await db.query(
      `SELECT id FROM profiles WHERE email = $1 OR (phone_number IS NOT NULL AND phone_number = $2) LIMIT 1`,
      [email, phoneNumber || null]
    );
    const blockedReason = await getBlockedProfileReason(
      (blockedProfileByIdentity.rows[0]?.id as string | undefined) || null
    );
    if (blockedReason) {
      return NextResponse.json({ error: blockedReason }, { status: 403 });
    }


    // Supabase password login requires an email identifier.
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: 'No account found for this phone/email. Please register first.' },
        { status: 400 }
      );
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

    const { data, error } = await anonSupabase.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      const failedCount = Number(lockState.rows[0]?.failed_count || 0) + 1;
      const blockMinutes = failedCount >= 6 ? 15 : 0;
      await db.query(
        `INSERT INTO auth_login_attempts (identity_key, failed_count, last_failed_at, blocked_until, updated_at)
         VALUES ($1, $2, NOW(), $3, NOW())
         ON CONFLICT (identity_key)
         DO UPDATE SET
           failed_count = $2,
           last_failed_at = NOW(),
           blocked_until = $3,
           updated_at = NOW()`,
        [attemptKey, failedCount, blockMinutes ? new Date(Date.now() + blockMinutes * 60 * 1000).toISOString() : null]
      );
      return NextResponse.json({ error: 'Invalid email/phone or password' }, { status: 401 });
    }

    await db.query(`DELETE FROM auth_login_attempts WHERE identity_key = $1`, [attemptKey]);

    const metadata = (data.user.user_metadata || {}) as Record<string, unknown>;
    const resolvedName =
      typeof metadata.name === 'string' && metadata.name.trim()
        ? metadata.name.trim()
        : data.user.email?.split('@')[0] || 'Kadal Customer';
    const resolvedPhone =
      phoneNumber ||
      (typeof metadata.phone_number === 'string' ? metadata.phone_number : '') ||
      (data.user.phone || '');

    const profile = await withTransaction((client) =>
      resolveProfile(client, {
        authUserId: data.user.id,
        name: resolvedName,
        email,
        phoneNumber: resolvedPhone,
      })
    );

    return NextResponse.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      user: {
        id: profile.id,
        authUserId: data.user.id,
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phone_number,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ACCOUNT_BLOCKED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
