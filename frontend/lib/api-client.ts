/**
 * Fetch wrapper using Sanctum bearer-token auth.
 *
 * The old cookie/CSRF-cookie flow (Sanctum SPA mode) required frontend and
 * backend to share a parent domain for cookies to survive SameSite/
 * third-party-cookie restrictions. On Vercel + Railway they don't, so this
 * client stores the token AuthController returns on login and sends it
 * back as `Authorization: Bearer <token>` on every request instead.
 *
 * Trade-off, stated plainly: the token lives in localStorage, which is
 * readable by any JS running on the page — an XSS bug becomes a session-
 * theft bug, whereas an httpOnly cookie wouldn't be readable at all. This
 * is still the standard, widely-used approach for a frontend and API on
 * genuinely separate domains (it's what most decoupled Jamstack-style
 * apps do). If you later put the frontend and backend under one apex
 * domain (e.g. app.example.com + api.example.com), switching back to
 * httpOnly-cookie Sanctum SPA auth is the more defensible choice — the
 * backend already supports both (see AuthController::logout).
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const TOKEN_KEY = 'gateway_alumni_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiDownload(path: string, filename: string): Promise<void> {
  const token = getToken();

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    headers: {
      Accept: '*/*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Download failed with status ${res.status}`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // set false for public endpoints that don't need a token
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const token = auth ? getToken() : null;

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...rest,
  });

  if (res.status === 401) {
    clearToken();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
