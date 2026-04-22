import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, withTransaction } from '@/lib/server/database';
import { resolveProfile } from '@/lib/server/requestUser';
import { getSupabaseAdminClient, getSupabaseAnonClient } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

type RegisterBody = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
};

type LegacyProfile = {
  id: string;
  email: string | null;
  phone_number: string | null;
};

async function findLegacyProfile(email: string, phoneNumber: string): Promise<LegacyProfile | null> {
  return withTransaction(async (client) => {
    const result = await client.query(
      `SELECT id, email, phone_number
       FROM profiles
       WHERE (email = $1 OR phone_number = $2)
         AND auth_user_id IS NULL
       ORDER BY updated_at DESC NULLS LAST, created_at DESC
       LIMIT 1`,
      [email, phoneNumber]
    );

    return result.rows[0] || null;
  });
}

async function disarmLegacyEmailConflict(legacyProfileId: string, email: string): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE profiles
       SET email = CONCAT($2, '.legacy.', LEFT($1::text, 8), '@migrated.local'),
           updated_at = NOW()
       WHERE id = $1
         AND auth_user_id IS NULL`,
      [legacyProfileId, email]
    );
  });
}

async function migrateLegacyProfileData(legacyProfileId: string, activeProfileId: string): Promise<void> {
  if (!legacyProfileId || legacyProfileId === activeProfileId) {
    return;
  }

  await withTransaction(async (client) => {
    await client.query(`UPDATE addresses SET profile_id = $2, updated_at = NOW() WHERE profile_id = $1`, [
      legacyProfileId,
      activeProfileId,
    ]);
    await client.query(`UPDATE payment_methods SET profile_id = $2, updated_at = NOW() WHERE profile_id = $1`, [
      legacyProfileId,
      activeProfileId,
    ]);
    await client.query(`UPDATE orders SET profile_id = $2, updated_at = NOW() WHERE profile_id = $1`, [
      legacyProfileId,
      activeProfileId,
    ]);
    await client.query(`UPDATE loyalty_activities SET profile_id = $2 WHERE profile_id = $1`, [
      legacyProfileId,
      activeProfileId,
    ]);

    const legacyPoints = await client.query(
      `SELECT COALESCE(loyalty_points, 0) AS points FROM profiles WHERE id = $1`,
      [legacyProfileId]
    );
    const points = Number(legacyPoints.rows[0]?.points || 0);
    if (points > 0) {
      await client.query(
        `UPDATE profiles
         SET loyalty_points = COALESCE(loyalty_points, 0) + $2,
             updated_at = NOW()
         WHERE id = $1`,
        [activeProfileId, points]
      );
    }

    await client.query(`DELETE FROM profiles WHERE id = $1 AND auth_user_id IS NULL`, [legacyProfileId]);
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterBody;
    const name = body.name?.trim() || '';
    const email = body.email?.trim().toLowerCase() || '';
    const phoneNumber = body.phoneNumber?.trim() || '';
    const password = body.password || '';

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json({ error: 'Phone number must be 10 digits' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const adminSupabase = getSupabaseAdminClient();
    const anonSupabase = getSupabaseAnonClient();

    if (!adminSupabase || !anonSupabase) {
      return NextResponse.json(
        {
          error:
            'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.',
        },
        { status: 500 }
      );
    }

    // Ensure app schema is ready before auth triggers write to public.profiles.
    await ensureSchema();

    let legacyProfile: LegacyProfile | null = null;
    let createAttempt = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone_number: phoneNumber,
      },
    });

    if (createAttempt.error && /database error creating new user/i.test(createAttempt.error.message || '')) {
      legacyProfile = await findLegacyProfile(email, phoneNumber);
      if (legacyProfile?.id) {
        await disarmLegacyEmailConflict(legacyProfile.id, email);
        createAttempt = await adminSupabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name,
            phone_number: phoneNumber,
          },
        });
      }
    }

    const { data: createdData, error: createError } = createAttempt;

    if (createError || !createdData.user) {
      // SECURITY: Never return the raw Supabase error — it may expose internal details.
      // Detect duplicate accounts from the error message for a helpful 409, but
      // return only a safe, generic string to the client in both cases.
      const isDuplicate = /already|exists|duplicate/i.test(createError?.message || '');
      return NextResponse.json(
        { error: isDuplicate ? 'An account with this email already exists.' : 'Registration failed. Please try again.' },
        { status: isDuplicate ? 409 : 400 }
      );
    }

    const { data: signInData, error: signInError } = await anonSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session || !signInData.user) {
      await adminSupabase.auth.admin.deleteUser(createdData.user.id).catch((cleanupError) => {
        console.error('Failed to rollback auth user after sign-in failure:', cleanupError);
      });
      // SECURITY: Log the real error server-side; never expose it to the client.
      console.error('Register post-creation sign-in failed:', signInError);
      return NextResponse.json(
        { error: 'Registration failed. Please try again.' },
        { status: 500 }
      );
    }

    let profile;
    try {
      profile = await withTransaction((client) =>
        resolveProfile(client, {
          authUserId: signInData.user.id,
          name,
          email,
          phoneNumber,
        })
      );

      if (legacyProfile?.id) {
        await migrateLegacyProfileData(legacyProfile.id, String(profile.id));
      }
    } catch (profileError) {
      await adminSupabase.auth.admin.deleteUser(createdData.user.id).catch((cleanupError) => {
        console.error('Failed to rollback auth user after profile failure:', cleanupError);
      });
      throw profileError;
    }

    return NextResponse.json({
      token: signInData.session.access_token,
      refreshToken: signInData.session.refresh_token,
      expiresIn: signInData.session.expires_in,
      user: {
        id: profile.id,
        authUserId: signInData.user.id,
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phone_number,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ACCOUNT_BLOCKED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Register API error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
