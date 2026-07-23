'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, User, Users2, Briefcase, CalendarDays, Handshake,
  MessageSquare, Newspaper, Gift, Settings, X, ShieldCheck,
} from 'lucide-react';
import { Logo } from './Logo';
import { LogoutButton } from './LogoutButton';
import { useCurrentUser } from '@/lib/user-context';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'My Profile', icon: User },
  { href: '/dashboard/directory', label: 'Alumni Directory', icon: Users2 },
  { href: '/dashboard/jobs', label: 'Jobs & Internships', icon: Briefcase },
  { href: '/dashboard/events', label: 'Events', icon: CalendarDays },
  { href: '/dashboard/mentorship', label: 'Mentorship', icon: Handshake },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/news', label: 'News & Announcements', icon: Newspaper },
  { href: '/dashboard/donations', label: 'Donations', icon: Gift },
];

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const isAdmin = !!user && ['administrator', 'super_administrator'].includes(user.role.slug);

  const content = (
    <>
      <div className="border-b border-line-200 px-5 py-4">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-navy-800 text-white' : 'text-slate-500 hover:bg-mist-100 hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-line-200 px-3 py-4">
        {isAdmin && (
          <Link href="/admin" onClick={onClose} className="flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-mist-100 hover:text-ink">
            <ShieldCheck className="h-4 w-4" /> Admin Panel
          </Link>
        )}
        <Link href="/dashboard/settings" onClick={onClose} className="flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-mist-100 hover:text-ink">
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <LogoutButton className="flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-mist-100 hover:text-danger" />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line-200 bg-white md:flex">
        {content}
      </aside>

      {/* Mobile: slide-in drawer, only mounted while open */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-card p-1.5 text-slate-500 hover:bg-mist-100"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
