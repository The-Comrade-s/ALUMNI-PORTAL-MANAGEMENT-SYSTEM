'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { apiFetch, clearToken } from '@/lib/api-client';

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Token may already be invalid/expired — clear locally regardless.
    } finally {
      clearToken();
      router.push('/login');
    }
  }

  return (
    <button onClick={handleLogout} className={className}>
      <LogOut className="h-4 w-4" /> Log out
    </button>
  );
}
