import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Returns the signing secret for app tokens.
 * Throws at call-time if neither APP_TOKEN_SECRET nor NEXTAUTH_SECRET is set,
 * rather than silently falling back to a predictable hardcoded string.
 */
function getAppTokenSecret(): string {
  const secret = process.env.APP_TOKEN_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret || secret.trim().length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[appToken] APP_TOKEN_SECRET is not configured. Falling back to an insecure development-only secret.'
      );
      return 'dev-only-app-token-secret-change-me';
    }

    throw new Error(
      '[appToken] APP_TOKEN_SECRET environment variable is required but not set. ' +
      'Set APP_TOKEN_SECRET (or NEXTAUTH_SECRET as a fallback) before starting the server.'
    );
  }
  return secret.trim();
}

type AppTokenPayload = {
  profileId: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  exp: number;
};

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(unsignedToken: string): string {
  return createHmac('sha256', getAppTokenSecret()).update(unsignedToken).digest('base64url');
}

export function createAppToken(payload: Omit<AppTokenPayload, 'exp'> & { expiresInSec?: number }): string {
  const exp = Math.floor(Date.now() / 1000) + (payload.expiresInSec || 60 * 60);
  const serializedPayload = {
    profileId: payload.profileId,
    name: payload.name || null,
    email: payload.email || null,
    phoneNumber: payload.phoneNumber || null,
    exp,
  } satisfies AppTokenPayload;

  const body = base64UrlEncode(JSON.stringify(serializedPayload));
  const unsignedToken = `kadal.${body}`;
  const signature = sign(unsignedToken);
  return `${unsignedToken}.${signature}`;
}

export function verifyAppToken(token: string): AppTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'kadal') {
    return null;
  }

  const unsignedToken = `${parts[0]}.${parts[1]}`;

  let expectedSignature: string;
  try {
    expectedSignature = sign(unsignedToken);
  } catch {
    // Secret is not configured — treat all tokens as invalid.
    return null;
  }

  const actual = Buffer.from(parts[2]);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as AppTokenPayload;
    if (!payload.profileId || typeof payload.exp !== 'number') {
      return null;
    }
    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
