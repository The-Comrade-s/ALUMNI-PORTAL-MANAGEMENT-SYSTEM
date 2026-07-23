import { Gift } from 'lucide-react';

// Same situation as mentorship/page.tsx — placeholder to replace a hard
// 404 until a donations backend (payment provider integration, etc.)
// exists.
export default function DonationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Donations</h1>
        <p className="mt-1 text-sm text-slate-500">Support scholarships and alumni-backed initiatives.</p>
      </div>
      <div className="card flex flex-col items-center py-16 text-center">
        <Gift className="h-8 w-8 text-navy-800" />
        <p className="mt-3 font-display text-sm font-semibold text-ink">Donations are coming soon</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          We&apos;re setting up a secure way to give. Check back soon, or contact the alumni office directly.
        </p>
      </div>
    </div>
  );
}
