'use client';

import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Clock, ExternalLink, Plus, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { useCurrentUser } from '@/lib/user-context';

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

// Mirrors JobPostingPolicy::create() on the backend.
const CAN_POST_ROLES = ['administrator', 'super_administrator', 'class_representative'];

export default function JobsPage() {
  const user = useCurrentUser();
  const canPost = !!user && CAN_POST_ROLES.includes(user.role.slug);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobType, setJobType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (jobType) params.set('job_type', jobType);

    apiFetch<{ data: Job[] }>(`/jobs?${params.toString()}`, { method: 'GET' })
      .then((res) => setJobs(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [jobType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Jobs & Internships</h1>
          <p className="mt-1 text-sm text-slate-500">Opportunities shared by administrators and class representatives.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="input-field w-auto">
            <option value="">All types</option>
            {Object.entries(jobTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {canPost && (
            <button onClick={() => setShowForm((v) => !v)} className="btn-primary inline-flex items-center gap-1.5 text-xs">
              {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {showForm ? 'Cancel' : 'Post a job'}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {canPost && showForm && (
        <NewJobForm
          onCreated={(job) => {
            setJobs((prev) => [job, ...prev]);
            setShowForm(false);
          }}
        />
      )}

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

function NewJobForm({ onCreated }: { onCreated: (job: Job) => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const res = await apiFetch<{ data: Job }>('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          company_name: form.get('company_name'),
          position: form.get('position'),
          description: form.get('description'),
          location: form.get('location') || null,
          job_type: form.get('job_type'),
          apply_link: form.get('apply_link') || null,
          deadline_at: form.get('deadline_at') || null,
        }),
      });
      onCreated(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post this job.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <p className="font-display text-sm font-semibold text-ink">New job posting</p>
      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company_name" className="label">Company</label>
          <input id="company_name" name="company_name" required className="input-field" />
        </div>
        <div>
          <label htmlFor="position" className="label">Position</label>
          <input id="position" name="position" required className="input-field" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="label">Description</label>
          <textarea id="description" name="description" required rows={4} className="input-field" />
        </div>
        <div>
          <label htmlFor="job_type" className="label">Job type</label>
          <select id="job_type" name="job_type" required className="input-field" defaultValue="full_time">
            {Object.entries(jobTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location" className="label">Location</label>
          <input id="location" name="location" className="input-field" placeholder="e.g. Lagos, Nigeria or Remote" />
        </div>
        <div>
          <label htmlFor="apply_link" className="label">Apply link</label>
          <input id="apply_link" name="apply_link" type="url" className="input-field" placeholder="https://…" />
        </div>
        <div>
          <label htmlFor="deadline_at" className="label">Application deadline</label>
          <input id="deadline_at" name="deadline_at" type="date" className="input-field" />
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Posting…' : 'Post job'}
      </button>
    </form>
  );
}
