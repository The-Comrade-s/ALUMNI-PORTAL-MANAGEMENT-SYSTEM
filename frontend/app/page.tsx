import Link from 'next/link';
import { ArrowRight, Briefcase, CalendarDays, Users2, Megaphone } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { GatewayMark } from '@/components/shared/GatewayMark';

const stats = [
  { label: 'Registered alumni', value: '8,756+' },
  { label: 'Active this month', value: '5,432+' },
  { label: 'Open job postings', value: '312' },
  { label: 'Upcoming events', value: '24' },
];

const news = [
  {
    title: 'Annual Alumni Reunion 2026 — registration now open',
    date: 'Aug 15, 2026',
    excerpt: 'Join classmates across every school for a weekend of reunion, mentorship, and homecoming at the main campus.',
  },
  {
    title: 'New scholarship fund for final-year students',
    date: 'Jul 2, 2026',
    excerpt: 'Alumni-backed scholarships are open for application — nominate a current student or contribute to the fund.',
  },
  {
    title: 'Mentorship Circle: apply to mentor a graduating class',
    date: 'Jun 20, 2026',
    excerpt: 'Pair up with final-year students in your former department and help them navigate their first job search.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mist-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-line-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink md:flex">
            <Link href="#directory" className="hover:text-navy-800">Alumni</Link>
            <Link href="#events" className="hover:text-navy-800">Events</Link>
            <Link href="#news" className="hover:text-navy-800">News</Link>
            <Link href="/contact" className="hover:text-navy-800">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-outline hidden sm:inline-flex">Log in</Link>
            <Link href="/register" className="btn-gold">Join the network</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line-200 bg-navy-900">
        <div className="pointer-events-none absolute -right-16 -top-16 h-[420px] w-[420px] opacity-30 md:opacity-40">
          <GatewayMark className="h-full w-full" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="mb-4 inline-block rounded-full border border-gold-500/40 px-3 py-1 text-xs font-medium tracking-wide text-gold-300">
              Gateway ICT Polytechnic Saapade
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              Every graduate stays part of the gate they walked through.
            </h1>
            <p className="mt-5 max-w-lg text-base text-slate-300">
              Find classmates by school, department, and set. Post and apply for jobs.
              Register for reunions. Mentor the next class. One home for every alumnus of
              Gateway ICT Polytechnic Saapade.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="btn-gold">
                Create your profile <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#directory" className="inline-flex items-center gap-2 rounded-card border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:border-white/50">
                Browse the directory
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card text-center">
              <p className="font-display text-3xl font-semibold text-navy-800">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you can do */}
      <section id="directory" className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="text-2xl font-semibold text-ink">What the portal is for</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={<Users2 className="h-5 w-5" />}
            title="Find your classmates"
            body="Search the directory by school, department, programme, or graduation year — see where they ended up."
          />
          <FeatureCard
            icon={<Briefcase className="h-5 w-5" />}
            title="Jobs from people who know you"
            body="Alumni and administrators post roles first here, before they hit public job boards."
          />
          <FeatureCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="Reunions and mentorship"
            body="Register for events, join your class's mentorship circle, or represent your set as a Class Representative."
          />
        </div>
      </section>

      {/* News */}
      <section id="news" className="border-t border-line-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-ink">
              <Megaphone className="h-5 w-5 text-gold-500" /> Latest from the institution
            </h2>
            <Link href="#" className="text-sm font-semibold text-navy-800 hover:underline">View all</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {news.map((n) => (
              <article key={n.title} className="card">
                <p className="text-xs font-medium text-gold-500">{n.date}</p>
                <h3 className="mt-2 font-display text-base font-semibold text-ink">{n.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{n.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="text-3xl font-semibold text-ink">Your class is already here.</h2>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          It takes about three minutes to create your profile and get matched to your school, department, and graduation year.
        </p>
        <Link href="/register" className="btn-primary mt-6 inline-flex">
          Register now <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-line-200 bg-navy-900 py-10 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-start md:justify-between">
          <Logo theme="dark" />
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-2 font-semibold text-white">Portal</p>
              <ul className="space-y-1.5">
                <li><Link href="#directory" className="hover:text-white">Directory</Link></li>
                <li><Link href="#events" className="hover:text-white">Events</Link></li>
                <li><Link href="#news" className="hover:text-white">News</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold text-white">Support</p>
              <ul className="space-y-1.5">
                <li><Link href="/faq" className="hover:text-white">FAQs</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms & conditions</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold text-white">Contact</p>
              <ul className="space-y-1.5">
                <li>Gateway ICT Polytechnic, Saapade</li>
                <li>alumni@gatewaypolysaapade.edu.ng</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-7xl px-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Gateway ICT Polytechnic Saapade. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-card bg-navy-100 text-navy-800">
        {icon}
      </div>
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{body}</p>
    </div>
  );
}
