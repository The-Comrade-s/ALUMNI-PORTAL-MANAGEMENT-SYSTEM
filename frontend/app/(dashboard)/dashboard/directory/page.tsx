'use client';

import { useEffect, useState } from 'react';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface AlumniListItem {
  id: number;
  name: string;
  matric_number: string;
  photo_url: string | null;
  occupation: string | null;
  employer: string | null;
  location: string | null;
  programme: string | null;
  department: string | null;
  graduation_year: number | null;
  employment_status: string;
}

export default function DirectoryPage() {
  const [alumni, setAlumni] = useState<AlumniListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('employment_status', status);

    apiFetch<{ data: AlumniListItem[] }>(`/alumni?${params.toString()}`, { method: 'GET', signal: controller.signal })
      .then((res) => setAlumni(res.data))
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [q, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Alumni Directory</h1>
        <p className="mt-1 text-sm text-slate-500">Find classmates by name, programme, or employment status.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name…"
            className="input-field pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field w-auto">
          <option value="">All employment statuses</option>
          <option value="employed">Employed</option>
          <option value="self_employed">Self-employed</option>
          <option value="unemployed">Unemployed</option>
          <option value="student">Student</option>
        </select>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading ? (
        <SkeletonGrid />
      ) : alumni.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alumni.map((a) => (
            <div key={a.id} className="card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-100 font-display text-sm font-semibold text-navy-800">
                  {a.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-ink">{a.name}</p>
                  <p className="text-xs text-slate-500">{a.programme} · {a.graduation_year}</p>
                </div>
              </div>
              {a.occupation && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Briefcase className="h-3.5 w-3.5" /> {a.occupation}{a.employer ? ` at ${a.employer}` : ''}
                </p>
              )}
              {a.location && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" /> {a.location}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-mist-100" />
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-mist-100" />
              <div className="h-2.5 w-20 rounded bg-mist-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center py-12 text-center">
      <p className="font-display text-sm font-semibold text-ink">No alumni match your search</p>
      <p className="mt-1 text-sm text-slate-500">Try a different name or clear the filters.</p>
    </div>
  );
}
