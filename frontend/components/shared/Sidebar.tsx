'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, User, Users2, Briefcase, CalendarDays, Handshake,
  MessageSquare, Newspaper, Gift, Settings,
} from 'lucide-react';
import { Logo } from './Logo';
import { LogoutButton } from './LogoutButton';

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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line-200 bg-white md:flex">
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
        <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-mist-100 hover:text-ink">
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <LogoutButton className="flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-mist-100 hover:text-danger" />
      </div>
    </aside>
  );
}
