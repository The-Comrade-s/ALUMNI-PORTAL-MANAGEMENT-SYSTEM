'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface NotificationItem {
  id: number;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<{ unread_count: number }>('/notifications/unread-count', { method: 'GET' })
      .then((res) => setUnreadCount(res.unread_count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      const res = await apiFetch<{ data: NotificationItem[] }>('/notifications', { method: 'GET' });
      setItems(res.data);
    }
  }

  async function markAllRead() {
    await apiFetch('/notifications/read-all', { method: 'POST' });
    setUnreadCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggleOpen} className="relative rounded-card p-2 text-slate-500 hover:bg-mist-100" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-card border border-line-200 bg-white shadow-card-hover">
          <div className="flex items-center justify-between border-b border-line-200 px-4 py-3">
            <p className="font-display text-sm font-semibold text-ink">Notifications</p>
            <button onClick={markAllRead} className="text-xs font-semibold text-navy-800 hover:underline">Mark all read</button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">You&apos;re all caught up.</p>
            ) : (
              items.map((n) => (
                <div key={n.id} className={`border-b border-line-200 px-4 py-3 text-sm ${n.read_at ? '' : 'bg-navy-100/40'}`}>
                  <p className="font-medium text-ink">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
