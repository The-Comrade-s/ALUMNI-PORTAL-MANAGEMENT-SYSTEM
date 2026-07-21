'use client';

import { Search, Menu } from 'lucide-react';
import { NotificationsMenu } from './NotificationsMenu';

export function Topbar({ userName = 'John Doe', onMenuClick }: { userName?: string; onMenuClick?: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-line-200 bg-white px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-card p-2 text-slate-500 hover:bg-mist-100 md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <input
            type="search"
            placeholder="Search alumni, jobs, events…"
            className="w-72 rounded-card border border-line-200 bg-mist-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-300 focus:border-navy-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationsMenu />
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-sm font-semibold text-white">
            {userName.split(' ').map((n) => n[0]).join('')}
          </div>
          <span className="hidden text-sm font-medium text-ink sm:inline">{userName}</span>
        </div>
      </div>
    </header>
  );
}
