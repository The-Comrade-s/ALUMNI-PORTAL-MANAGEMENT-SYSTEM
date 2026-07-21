'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getToken, clearToken } from '@/lib/api-client';

interface MeResponse {
  user: { role: { slug: string } };
}

/**
 * Client-side route guard. Next.js middleware runs at the edge and can't
 * read localStorage, so a bearer-token setup (required for the Vercel/
 * Railway cross-domain split — see lib/api-client.ts) can't be gated at the
 * middleware layer the way a cookie-based session could. This wrapper is
 * the trade-off: it blocks render until a token is confirmed valid (and,
 * optionally, the user's role is in `allowedRoles`) via /auth/me,
 * redirecting to /login otherwise. The page will still flash briefly
 * blank on first load — acceptable for an internal alumni portal, but
 * worth knowing if you need instant-redirect guarantees later.
 */
export function AuthGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    apiFetch<MeResponse>('/auth/me', { method: 'GET' })
      .then((res) => {
        if (allowedRoles && !allowedRoles.includes(res.user.role.slug)) {
          router.replace('/dashboard');
          return;
        }
        setChecked(true);
      })
      .catch(() => {
        clearToken();
        router.replace('/login');
      });
  }, [router, allowedRoles]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-800 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
