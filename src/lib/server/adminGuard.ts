/**
 * adminGuard.ts
 *
 * Single source of truth for admin API authorization.
 * All admin route handlers MUST call requireAdmin() and return early
 * if it returns a non-null response.
 *
 * Security guarantees:
 *  - ADMIN_API_KEY env var is REQUIRED. If not set, every request is denied.
 *  - The key is compared with strict equality (no fallback, no default).
 *  - Returns a 401 response on failure; null on success.
 */

import { NextResponse } from 'next/server';

function getRequiredAdminKey(): string | null {
  const key = process.env.ADMIN_API_KEY;
  if (!key || key.trim().length === 0) {
    return null;
  }
  return key.trim();
}

/**
 * Call this at the top of every admin route handler.
 *
 * @returns null if the request is authorized, or a 401 NextResponse to return immediately.
 *
 * @example
 * export async function GET(req: NextRequest) {
 *   const unauthorized = requireAdmin(req);
 *   if (unauthorized) return unauthorized;
 *   // ... handler logic
 * }
 */
export function requireAdmin(req: Request | { headers: { get(name: string): string | null } }): NextResponse | null {
  const expectedKey = getRequiredAdminKey();

  // Deny all requests if the env var is missing — never fall back to a default.
  if (!expectedKey) {
    console.error('[adminGuard] ADMIN_API_KEY is not configured. All admin requests denied.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const providedKey = req.headers.get('x-admin-key');

  if (!providedKey || providedKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
