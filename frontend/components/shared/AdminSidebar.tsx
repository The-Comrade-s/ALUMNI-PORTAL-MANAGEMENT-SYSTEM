'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, School, Building2, GraduationCap, CalendarRange,
  UserCheck, FileBarChart, ScrollText,
} from 'lucide-react';
import { Logo } from './Logo';
import { LogoutButton } from './LogoutButton';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/alumni', label: 'Approve Alumni', icon: UserCheck },
  { href: '/admin/schools', label: 'Schools', icon: School },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/programmes', label: 'Programmes', icon: GraduationCap },
  { href: '/admin/graduation-years', label: 'Graduation Years', icon: CalendarRange },
  { href: '/admin/reports', label: 'Reports', icon: FileBarChart },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line-200 bg-navy-900 md:flex">
      <div className="border-b border-white/10 px-5 py-4">
        <Logo theme="dark" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-gold-500 text-navy-900' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <LogoutButton className="flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white" />
      </div>
    </aside>
  );
}
