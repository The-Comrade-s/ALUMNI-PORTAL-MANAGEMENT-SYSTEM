'use client';

import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Clock, ExternalLink } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface Job {
  id: number;
  company_name: string;
  position: string;
  description: string;
  location: string | null;
  job_type: string;
  apply_link: string | null;
  deadline_at: string | null;
  posted_by: string | null;
}

const jobTypeLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  internship: 'Internship',
  contract: 'Contract',
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobType, setJobType] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (jobType) params.set('job_type', jobType);

    apiFetch<{ data: Job[] }>(`/jobs?${params.toString()}`, { method: 'GET' })
      .then((res) => setJobs(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [jobType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Jobs & Internships</h1>
          <p className="mt-1 text-sm text-slate-500">Opportunities shared by administrators and class representatives.</p>
        </div>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="input-field w-auto">
          <option value="">All types</option>
          {Object.entries(jobTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card py-12 text-center text-sm text-slate-500">No open positions right now — check back soon.</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold text-ink">{job.position}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{job.company_name}</p>
                </div>
                <span className="rounded-full bg-navy-100 px-3 py-1 text-xs font-medium text-navy-800">
                  {jobTypeLabels[job.job_type] ?? job.job_type}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-500 line-clamp-2">{job.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>}
                {job.deadline_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Apply by {new Date(job.deadline_at).toLocaleDateString()}
                  </span>
                )}
                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> Posted by {job.posted_by}</span>
              </div>

              {job.apply_link && (
                <a href={job.apply_link} target="_blank" rel="noreferrer" className="btn-primary mt-4 inline-flex text-xs">
                  Apply now <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
