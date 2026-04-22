import { clientStorage } from '@/lib/clientStorage';

type FetchJsonOptions = Omit<RequestInit, 'headers' | 'body'> & {
  headers?: HeadersInit;
  body?: BodyInit | object | null;
  authenticated?: boolean;
};

function normalizeHeaders(headers: HeadersInit | undefined) {
  const result = new Headers(headers);
  return result;
}

export function getAuthHeaders() {
  const headers = new Headers();
  const session = clientStorage.auth.getSession();
  const user = clientStorage.user.get();

  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }

  if (user?.id) headers.set('x-user-id', user.id);
  if (user?.authUserId) headers.set('x-auth-user-id', user.authUserId);
  if (user?.name) headers.set('x-user-name', user.name);
  if (user?.email) headers.set('x-user-email', user.email);
  if (user?.phoneNumber) headers.set('x-user-phone', user.phoneNumber);

  return headers;
}

export async function fetchJson<T = unknown>(input: string, options: FetchJsonOptions = {}) {
  const headers = normalizeHeaders(options.headers);
  const body =
    options.body && typeof options.body === 'object' && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : (options.body as BodyInit | null | undefined);

  if (options.authenticated !== false) {
    const authHeaders = getAuthHeaders();
    authHeaders.forEach((value, key) => {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    });
  }

  if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(input, {
    ...options,
    headers,
    body: body ?? undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage =
      typeof (payload as { error?: unknown }).error === 'string'
        ? (payload as { error: string }).error
        : `Request failed: ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload as T;
}
