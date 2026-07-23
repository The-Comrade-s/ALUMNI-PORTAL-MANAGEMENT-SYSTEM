'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface PendingAlumni {
  id: number;
  name: string;
  email: string;
  alumni_profile: {
    matric_number: string;
    programme: { name: string; department: { name: string; school: { name: string } } };
    graduation_year: { year: number };
  } | null;
}

export default function AlumniApprovalPage() {
  const [pending, setPending] = useState<PendingAlumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    apiFetch<{ data: PendingAlumni[] }>('/admin/alumni/pending', { method: 'GET' })
      .then((res) => setPending(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDecision(id: number, action: 'approve' | 'reject') {
    setBusyId(id);
    try {
      await apiFetch(`/admin/alumni/${id}/${action}`, { method: 'POST' });
      setPending((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Approve Alumni</h1>
        <p className="mt-1 text-sm text-slate-500">New registrations awaiting approval before they appear in the directory.</p>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-200 bg-mist-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Matric No</th>
              <th className="px-4 py-3">Programme</th>
              <th className="px-4 py-3">Graduation Year</th>
              <th className="px-4 py-3 text-right">Decision</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
            ) : pending.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No pending registrations. 🎉</td></tr>
            ) : (
              pending.map((p) => (
                <tr key={p.id} className="border-b border-line-200 last:border-0 hover:bg-mist-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.alumni_profile?.matric_number}</td>
                  <td className="px-4 py-3">{p.alumni_profile?.programme?.name}</td>
                  <td className="px-4 py-3">{p.alumni_profile?.graduation_year?.year}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDecision(p.id, 'approve')}
                      disabled={busyId === p.id}
                      className="mr-2 inline-flex items-center gap-1 rounded-card bg-success/10 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/20"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleDecision(p.id, 'reject')}
                      disabled={busyId === p.id}
                      className="inline-flex items-center gap-1 rounded-card bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/20"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
