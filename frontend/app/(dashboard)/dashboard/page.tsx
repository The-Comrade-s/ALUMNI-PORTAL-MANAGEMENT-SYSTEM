import Link from 'next/link';
import { User, Briefcase, CalendarDays, Handshake, MessageSquare, Newspaper, MapPin } from 'lucide-react';

const quickActions = [
  { href: '/dashboard/profile', label: 'My Profile', desc: 'View and update your profile', icon: User, tint: 'bg-navy-100 text-navy-800' },
  { href: '/dashboard/jobs', label: 'Jobs & Internships', desc: 'Find and apply for opportunities', icon: Briefcase, tint: 'bg-gold-100 text-gold-500' },
  { href: '/dashboard/events', label: 'Events', desc: 'View upcoming events and register', icon: CalendarDays, tint: 'bg-navy-100 text-navy-800' },
  { href: '/dashboard/mentorship', label: 'Mentorship', desc: 'Connect and learn from mentors', icon: Handshake, tint: 'bg-gold-100 text-gold-500' },
  { href: '/dashboard/messages', label: 'Messages', desc: 'You have 5 new messages', icon: MessageSquare, tint: 'bg-navy-100 text-navy-800' },
  { href: '/dashboard/news', label: 'News', desc: 'Read latest news and updates', icon: Newspaper, tint: 'bg-gold-100 text-gold-500' },
];

const upcomingEvents = [
  { title: 'Annual Alumni Reunion 2026', place: 'Lagos, Nigeria', date: 'Aug 15, 2026' },
  { title: 'Career Talk with Industry Experts', place: 'Virtual Event', date: 'Jun 20, 2026' },
  { title: 'Entrepreneurship Workshop', place: 'Main Auditorium', date: 'Jul 10, 2026' },
];

const quickStats = [
  { label: 'Profile views', value: 122 },
  { label: 'Connections', value: 48 },
  { label: 'Applications', value: 7 },
  { label: 'Events joined', value: 3 },
];

export default function DashboardHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Welcome back, John 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening across your class and the wider network.</p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map(({ href, label, desc, icon: Icon, tint }) => (
          <Link key={href} href={href} className="card flex items-start gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-card ${tint}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-ink">{label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming events */}
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Upcoming events</h2>
            <Link href="/dashboard/events" className="text-xs font-semibold text-navy-800 hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-line-200">
            {upcomingEvents.map((e) => (
              <li key={e.title} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{e.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" /> {e.place} · {e.date}
                  </p>
                </div>
                <button className="btn-outline px-4 py-1.5 text-xs">Register</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick stats */}
        <div className="card">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Quick stats</h2>
          <ul className="space-y-3">
            {quickStats.map((s) => (
              <li key={s.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{s.label}</span>
                <span className="font-mono font-semibold text-ink">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
