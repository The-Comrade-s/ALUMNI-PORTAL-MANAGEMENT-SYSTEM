import { School, Building2, GraduationCap, UserCheck } from 'lucide-react';
import Link from 'next/link';

const shortcuts = [
  { href: '/admin/alumni', label: 'Approve Alumni', icon: UserCheck, desc: 'Review pending registrations' },
  { href: '/admin/schools', label: 'Manage Schools', icon: School, desc: 'Top-level academic structure' },
  { href: '/admin/departments', label: 'Manage Departments', icon: Building2, desc: 'Nested under schools' },
  { href: '/admin/programmes', label: 'Manage Programmes', icon: GraduationCap, desc: 'ND / HND and durations' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Manage the institution&apos;s alumni portal.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className="card flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-navy-100 text-navy-800">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-ink">{label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
