import { Handshake } from 'lucide-react';

// NOTE: the Sidebar links here, but no backend endpoints exist yet for
// mentorship circles/pairings. This placeholder replaces what was
// previously a hard 404 — wire it up to real endpoints once the backend
// supports them (see routes/api.php comment block for what's not yet wired).
export default function MentorshipPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Mentorship</h1>
        <p className="mt-1 text-sm text-slate-500">Pair up with final-year students or fellow alumni.</p>
      </div>
      <div className="card flex flex-col items-center py-16 text-center">
        <Handshake className="h-8 w-8 text-navy-800" />
        <p className="mt-3 font-display text-sm font-semibold text-ink">Mentorship circles are coming soon</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          We&apos;re building this out next. In the meantime, reach out to classmates directly via Messages.
        </p>
      </div>
    </div>
  );
}
