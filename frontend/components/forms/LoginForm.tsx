'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, setToken } from '@/lib/api-client';

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await apiFetch<{ token: string; user: { role: { slug: string } } }>('/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
          remember: form.get('remember') === 'on',
        }),
      });
      setToken(res.token);
      const isAdmin = ['administrator', 'super_administrator'].includes(res.user.role.slug);
      router.push(isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {error && (
        <p role="alert" className="rounded-card border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input-field" placeholder="you@example.com" />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">Password</label>
          <Link href="/forgot-password" className="text-xs font-semibold text-navy-800 hover:underline">
            Forgot password?
          </Link>
        </div>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input-field" placeholder="••••••••" />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-500">
        <input type="checkbox" name="remember" className="rounded border-line-200" />
        Remember me on this device
      </label>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}
