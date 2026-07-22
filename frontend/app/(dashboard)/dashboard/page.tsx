'use client';

import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Clock, ExternalLink, Plus, X } from 'lucide-react';
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

interface MeResponse {
  user: { role: { slug: string } };
}

const jobTypeLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  internship: 'Internship',
  contract: 'Contract',
};

// Roles allowed to create job/internship postings — mirrors JobPostingPolicy::create on the backend.
const POSTER_ROLES = ['administrator', 'super_administrator', 'class_representative'];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobType, setJobType] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [canPost, setCanPost] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function loadJobs() {
    setLoading(true);
    const params = new URLSearchParams();
    if (jobType) params.set('job_type', jobType);

    apiFetch<{ data: Job[] }>(`/jobs?${params.toString()}`, { method: 'GET' })
      .then((res) => setJobs(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobType]);

  useEffect(() => {
    apiFetch<MeResponse>('/auth/me', { method: 'GET' })
      .then((res) => setCanPost(POSTER_ROLES.includes(res.user.role.slug)))
      .catch(() => setCanPost(false));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const form = new FormData(e.currentTarget);
    const deadline = form.get('deadline_at');

    try {
      await apiFetch('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          company_name: form.get('company_name'),
          position: form.get('position'),
          description: form.get('description'),
          job_type: form.get('job_type'),
          location: form.get('location') || null,
          apply_link: form.get('apply_link') || null,
          salary_range: form.get('salary_range') || null,
          deadline_at: deadline ? deadline : null,
        }),
      });
      setShowForm(false);
      loadJobs();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create the posting.');
    } finally {
      setSubmitting(false);
    }
  }

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
            <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-primary inline-flex items-center gap-1.5 text-sm">
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? 'Cancel' : 'Post a job'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-5">
          <h2 className="font-display text-base font-semibold text-ink">New job / internship posting</h2>

          {formError && <p className="text-sm text-danger">{formError}</p>}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="company_name" className="label">Company name</label>
              <input id="company_name" name="company_name" required className="input-field" placeholder="Acme Corp" />
            </div>
            <div>
              <label htmlFor="position" className="label">Position</label>
              <input id="position" name="position" required className="input-field" placeholder="Software Engineering Intern" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="label">Description</label>
              <textarea id="description" name="description" required rows={4} className="input-field" placeholder="Role responsibilities, requirements, etc." />
            </div>

            <div>
              <label htmlFor="job_type" className="label">Type</label>
              <select id="job_type" name="job_type" required defaultValue="" className="input-field">
                <option value="" disabled>Select type</option>
                {Object.entries(jobTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="label">Location</label>
              <input id="location" name="location" className="input-field" placeholder="Lagos, Nigeria" />
            </div>

            <div>
              <label htmlFor="salary_range" className="label">Salary range (optional)</label>
              <input id="salary_range" name="salary_range" className="input-field" placeholder="₦150,000 - ₦250,000" />
            </div>
            <div>
              <label htmlFor="deadline_at" className="label">Application deadline (optional)</label>
              <input id="deadline_at" name="deadline_at" type="date" className="input-field" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="apply_link" className="label">Apply link (optional)</label>
              <input id="apply_link" name="apply_link" type="url" className="input-field" placeholder="https://example.com/careers/apply" />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Posting…' : 'Publish posting'}
          </button>
        </form>
      )}

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
