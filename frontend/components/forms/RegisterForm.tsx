'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

interface LookupItem { id: number; name?: string; year?: number; label?: string }

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [schools, setSchools] = useState<LookupItem[]>([]);
  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [programmes, setProgrammes] = useState<LookupItem[]>([]);
  const [years, setYears] = useState<LookupItem[]>([]);

  const [schoolId, setSchoolId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    apiFetch<LookupItem[]>('/lookups/schools', { method: 'GET', auth: false }).then(setSchools).catch(() => {});
    apiFetch<LookupItem[]>('/lookups/graduation-years', { method: 'GET', auth: false }).then(setYears).catch(() => {});
  }, []);

  useEffect(() => {
    setDepartments([]);
    setDepartmentId('');
    if (!schoolId) return;
    apiFetch<LookupItem[]>(`/lookups/departments?school_id=${schoolId}`, { method: 'GET', auth: false }).then(setDepartments).catch(() => {});
  }, [schoolId]);

  useEffect(() => {
    setProgrammes([]);
    if (!departmentId) return;
    apiFetch<LookupItem[]>(`/lookups/programmes?department_id=${departmentId}`, { method: 'GET', auth: false }).then(setProgrammes).catch(() => {});
  }, [departmentId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          matric_number: form.get('matric_number'),
          school_id: schoolId,
          department_id: departmentId,
          programme_id: form.get('programme_id'),
          graduation_year_id: form.get('graduation_year_id'),
          password: form.get('password'),
          password_confirmation: form.get('password_confirmation'),
        }),
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div role="status" className="rounded-card border border-success/30 bg-success/5 px-5 py-4 text-sm text-success">
        Registration successful. Please check your email to verify your account — an administrator will also need
        to approve it before it appears in the directory. Redirecting you to login…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {error && (
        <p role="alert" className="rounded-card border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" name="name" required className="input-field" placeholder="As it appears on your certificate" />
        </div>

        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input id="email" name="email" type="email" required className="input-field" placeholder="you@example.com" />
        </div>

        <div>
          <label htmlFor="phone" className="label">Phone number</label>
          <input id="phone" name="phone" type="tel" className="input-field" placeholder="0801 234 5678" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="matric_number" className="label">Matriculation number</label>
          <input id="matric_number" name="matric_number" required className="input-field font-mono" placeholder="GPS/CSC/2020/0142" />
        </div>

        <div>
          <label htmlFor="school" className="label">School</label>
          <select id="school" required className="input-field" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
            <option value="" disabled>Select school</option>
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="department" className="label">Department</label>
          <select id="department" required className="input-field" value={departmentId} disabled={!schoolId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="" disabled>Select department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="programme_id" className="label">Programme</label>
          <select id="programme_id" name="programme_id" required className="input-field" disabled={!departmentId} defaultValue="">
            <option value="" disabled>Select programme</option>
            {programmes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="graduation_year_id" className="label">Graduation year</label>
          <select id="graduation_year_id" name="graduation_year_id" required className="input-field" defaultValue="">
            <option value="" disabled>Select year</option>
            {years.map((y) => <option key={y.id} value={y.id}>{y.year}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" name="password" type="password" required minLength={8} className="input-field" placeholder="••••••••" />
        </div>

        <div>
          <label htmlFor="password_confirmation" className="label">Confirm password</label>
          <input id="password_confirmation" name="password_confirmation" type="password" required className="input-field" placeholder="••••••••" />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-500">
        <input type="checkbox" required className="mt-0.5 rounded border-line-200" />
        <span>
          I agree to the{' '}
          <Link href="/terms" className="font-semibold text-navy-800 hover:underline">Terms & Conditions</Link>
        </span>
      </label>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
