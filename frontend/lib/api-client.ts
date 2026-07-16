/**
 * Thin fetch wrapper for the Laravel Sanctum SPA auth flow.
 * Sanctum requires hitting /sanctum/csrf-cookie once before the first
 * mutating request, then every request is cookie-authenticated.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function ensureCsrfCookie() {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, { credentials: 'include' });
}

function getCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // set false to skip CSRF bootstrap (public GETs)
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  if (auth && rest.method && rest.method !== 'GET') {
    await ensureCsrfCookie();
  }

  const xsrfToken = getCookie('XSRF-TOKEN');

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
      ...headers,
    },
    ...rest,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}
