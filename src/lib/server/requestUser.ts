import { PoolClient } from 'pg';
import { NextRequest } from 'next/server';
import { verifyToken } from '@clerk/nextjs/server';
import { getSupabaseAdminClient } from '@/lib/server/supabaseAdmin';
import { verifyAppToken } from '@/lib/server/appToken';
import { getBlockedProfileReason } from '@/lib/server/adminUserMeta';

export type RequestUser = {
  id?: string;
  authUserId?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  accessToken?: string;
};

type ClerkIdentity = {
  authUserId: string;
  email?: string;
  name?: string;
  phoneNumber?: string;
};

async function resolveClerkIdentity(accessToken: string): Promise<ClerkIdentity | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  try {
    const payload = await verifyToken(accessToken, { secretKey });
    const claims = payload as Record<string, unknown>;
    const sub = typeof claims.sub === 'string' ? claims.sub : null;
    if (!sub) return null;

    const firstName = typeof claims.first_name === 'string' ? claims.first_name : '';
    const lastName = typeof claims.last_name === 'string' ? claims.last_name : '';
    const fullName = `${firstName} ${lastName}`.trim() || undefined;

    const phone =
      typeof claims.phone_number === 'string'
        ? claims.phone_number.replace(/\D/g, '').slice(-10)
        : undefined;

    let email: string | undefined;
    if (typeof claims.email === 'string' && claims.email.trim()) {
      email = claims.email.trim().toLowerCase();
    }

    return { authUserId: sub, email, name: fullName, phoneNumber: phone };
  } catch {
    return null;
  }
}

function throwBlocked(reason: string): never {
  const error = new Error(reason);
  error.name = 'ACCOUNT_BLOCKED';
  throw error;
}

function normalizeHeaderPhone(value: string | null): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, '').slice(-10);
  return digits || undefined;
}

export function getRequestUser(req: NextRequest): RequestUser {
  const authorization = req.headers.get('authorization');
  const accessToken = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : undefined;

  const appTokenPayload = accessToken ? verifyAppToken(accessToken) : null;

  return {
    id: appTokenPayload?.profileId || req.headers.get('x-user-id')?.trim() || undefined,
    authUserId: req.headers.get('x-auth-user-id')?.trim() || undefined,
    name: appTokenPayload?.name || req.headers.get('x-user-name')?.trim() || undefined,
    email:
      appTokenPayload?.email ||
      req.headers.get('x-user-email')?.trim().toLowerCase() ||
      undefined,
    phoneNumber: appTokenPayload?.phoneNumber || normalizeHeaderPhone(req.headers.get('x-user-phone')),
    accessToken,
  };
}

export async function resolveProfile(client: PoolClient, reqUser: RequestUser) {
  const adminSupabase = getSupabaseAdminClient();
  let authUserId = reqUser.authUserId;
  let authEmail = reqUser.email;
  let authName = reqUser.name;
  let authPhone = reqUser.phoneNumber;

  if (reqUser.id) {
    const existingById = await client.query(
      `SELECT id, auth_user_id, name, email, phone_number FROM profiles WHERE id = $1 LIMIT 1`,
      [reqUser.id]
    );
    if (existingById.rows[0]) {
      const blockedReason = await getBlockedProfileReason(existingById.rows[0].id as string);
      if (blockedReason) throwBlocked(blockedReason);
      return existingById.rows[0];
    }
  }

  if (!authUserId && reqUser.accessToken) {
    const clerkIdentity = await resolveClerkIdentity(reqUser.accessToken);
    if (clerkIdentity) {
      authUserId = clerkIdentity.authUserId;
      authEmail = authEmail || clerkIdentity.email;
      authName = authName || clerkIdentity.name;
      authPhone = authPhone || clerkIdentity.phoneNumber;
    }
  }

  if (!authUserId && reqUser.accessToken && adminSupabase) {
    const { data, error } = await adminSupabase.auth.getUser(reqUser.accessToken);
    if (!error && data.user) {
      const metadata = (data.user.user_metadata || {}) as Record<string, unknown>;
      authUserId = data.user.id;
      authEmail = authEmail || (typeof data.user.email === 'string' ? data.user.email : undefined);
      authName = authName || (typeof metadata.name === 'string' ? metadata.name : undefined);
      authPhone =
        authPhone ||
        (typeof metadata.phone_number === 'string'
          ? metadata.phone_number
          : typeof data.user.phone === 'string'
            ? data.user.phone
            : undefined);
    }
  }

  const fallbackName = 'Kadal Customer';
  // IMPORTANT: Do NOT generate a fake @clerk.local email. Use null if no real email.
  const email = authEmail && !authEmail.endsWith('@clerk.local') ? authEmail : null;
  const name = authName || fallbackName;
  const phone = authPhone || null;

  if (!reqUser.id && !authUserId && !email && !phone) {
    const error = new Error('Unable to resolve authenticated user');
    error.name = 'AUTH_RESOLUTION_FAILED';
    throw error;
  }

  if (authUserId) {
    const existingByAuthUserId = await client.query(
      `SELECT id, auth_user_id, name, email, phone_number FROM profiles WHERE auth_user_id = $1 LIMIT 1`,
      [authUserId]
    );

    if (existingByAuthUserId.rows[0]) {
      const current = existingByAuthUserId.rows[0];
      const needsUpdate =
        (name && name !== current.name) ||
        (email && email !== current.email) ||
        (phone && phone !== current.phone_number);

      if (needsUpdate) {
        await client.query(
          `UPDATE profiles SET
            name = COALESCE(NULLIF($2, ''), name),
            email = CASE WHEN $3::text IS NOT NULL AND $3 != '' THEN $3 ELSE email END,
            phone_number = COALESCE($4, phone_number),
            updated_at = NOW()
           WHERE id = $1`,
          [current.id, name, email, phone]
        );
      }

      const resolved = { id: current.id as string, auth_user_id: authUserId, name, email, phone_number: phone };
      const blockedReason = await getBlockedProfileReason(resolved.id);
      if (blockedReason) throwBlocked(blockedReason);
      return resolved;
    }

    try {
      const insertedByAuthUserId = await client.query(
        `INSERT INTO profiles (auth_user_id, name, email, phone_number)
         VALUES ($1, $2, $3, $4)
         RETURNING id, auth_user_id, name, email, phone_number`,
        [authUserId, name, email, phone]
      );
      const inserted = insertedByAuthUserId.rows[0];
      const blockedReason = await getBlockedProfileReason(inserted.id as string);
      if (blockedReason) throwBlocked(blockedReason);
      return inserted;
    } catch (error) {
      const dbError = error as { code?: string };
      if (dbError.code !== '23505') throw error;

      const existingByIdentity = await client.query(
        `SELECT id, auth_user_id, name, email, phone_number FROM profiles
         WHERE ($1::text IS NOT NULL AND email = $1) OR ($2::text IS NOT NULL AND phone_number = $2)
         ORDER BY updated_at DESC NULLS LAST, created_at DESC LIMIT 1`,
        [email, phone]
      );

      if (!existingByIdentity.rows[0]) throw error;

      const current = existingByIdentity.rows[0];
      await client.query(
        `UPDATE profiles SET
          auth_user_id = COALESCE(auth_user_id, $2),
          name = COALESCE(NULLIF($3, ''), name),
          email = COALESCE(NULLIF($4, ''), email),
          phone_number = COALESCE($5, phone_number),
          updated_at = NOW()
         WHERE id = $1`,
        [current.id, authUserId, name, email, phone]
      );

      const resolved = { id: current.id as string, auth_user_id: authUserId, name, email, phone_number: phone };
      const blockedReason = await getBlockedProfileReason(resolved.id);
      if (blockedReason) throwBlocked(blockedReason);
      return resolved;
    }
  }

  const existingByIdentity = await client.query(
    `SELECT id, name, email, phone_number, created_at FROM profiles
     WHERE ($1::text IS NOT NULL AND email = $1) OR ($2::text IS NOT NULL AND phone_number = $2)
     ORDER BY updated_at DESC NULLS LAST, created_at DESC LIMIT 1`,
    [email, phone]
  );

  if (existingByIdentity.rows[0]) {
    const current = existingByIdentity.rows[0];
    if (name !== current.name || phone !== current.phone_number) {
      await client.query(
        `UPDATE profiles SET name = $2, email = COALESCE($3, email), phone_number = COALESCE($4, phone_number), updated_at = NOW() WHERE id = $1`,
        [current.id, name, email, phone]
      );
    }
    const resolved = { id: current.id as string, name, email: email || current.email, phone_number: phone };
    const blockedReason = await getBlockedProfileReason(resolved.id);
    if (blockedReason) throwBlocked(blockedReason);
    return resolved;
  }

  const inserted = await client.query(
    `INSERT INTO profiles (name, email, phone_number) VALUES ($1, $2, $3) RETURNING id, name, email, phone_number`,
    [name, email, phone]
  );
  const insertedProfile = inserted.rows[0];
  const blockedReason = await getBlockedProfileReason(insertedProfile.id as string);
  if (blockedReason) throwBlocked(blockedReason);
  return insertedProfile;
}
