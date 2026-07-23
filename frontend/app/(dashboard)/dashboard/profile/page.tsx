'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { apiFetch, apiUpload } from '@/lib/api-client';

interface Profile {
  id: number;
  name: string;
  matric_number: string;
  date_of_birth: string | null;
  photo_url: string | null;
  cv_url: string | null;
  bio: string | null;
  occupation: string | null;
  employer: string | null;
  employment_status: string;
  location: string | null;
  programme: string | null;
  department: string | null;
  school: string | null;
  graduation_year: number | null;
  social: { linkedin: string | null; twitter: string | null; website: string | null };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    setError(null);
    apiFetch<{ user: { alumni_profile: Profile | null } }>('/auth/me', { method: 'GET' })
      .then((res) => setProfile(res.user.alumni_profile))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your profile.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      await apiFetch('/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          date_of_birth: form.get('date_of_birth') || null,
          bio: form.get('bio'),
          current_occupation: form.get('current_occupation'),
          employer: form.get('employer'),
          employment_status: form.get('employment_status'),
          location_city: form.get('location_city'),
          location_country: form.get('location_country'),
          linkedin_url: form.get('linkedin_url'),
          twitter_url: form.get('twitter_url'),
          website_url: form.get('website_url'),
        }),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const updated = await apiUpload<{ data: Profile }>('/profile/photo', fd);
      setProfile((prev) => (prev ? { ...prev, photo_url: updated.data.photo_url } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photo.');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  }

  async function handleCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('cv', file);
      const updated = await apiUpload<{ data: Profile }>('/profile/cv', fd);
      setProfile((prev) => (prev ? { ...prev, cv_url: updated.data.cv_url } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload CV.');
    } finally {
      setUploadingCv(false);
      if (cvInputRef.current) cvInputRef.current.value = '';
    }
  }

  if (loading) {
    return <div className="card h-64 animate-pulse" />;
  }

  if (error && !profile) {
    return (
      <div className="max-w-2xl space-y-3">
        <p role="alert" className="rounded-card border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
        <button onClick={load} className="btn-outline">Try again</button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-slate-500">
          We couldn&apos;t find an alumni profile for your account yet. If you just registered, this can take a
          moment — try refreshing, or contact an administrator if it persists.
        </p>
      </div>
    );
  }

  const initials = (profile.name ?? '').split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        {profile.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.photo_url} alt={profile.name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-800 text-lg font-semibold text-white">
            {initials}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{profile.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {profile.department ? `${profile.department} · ` : ''}
            {profile.programme} · Class of {profile.graduation_year} ·{' '}
            <span className="font-mono">{profile.matric_number}</span>
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Profile updated.</p>}

      <div className="card space-y-4">
        <p className="label">Profile photo</p>
        <div className="flex items-center gap-3">
          <input ref={photoInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
          <label htmlFor="photo-upload" className="btn-outline inline-flex cursor-pointer items-center gap-2 text-xs">
            <Upload className="h-3.5 w-3.5" /> {uploadingPhoto ? 'Uploading…' : profile.photo_url ? 'Change photo' : 'Upload photo'}
          </label>
          <span className="text-xs text-slate-500">JPG, PNG, or WEBP. Max 2MB.</span>
        </div>

        <p className="label mt-4">Curriculum Vitae / Resume</p>
        <div className="flex items-center gap-3">
          <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} className="hidden" id="cv-upload" />
          <label htmlFor="cv-upload" className="btn-outline inline-flex cursor-pointer items-center gap-2 text-xs">
            <Upload className="h-3.5 w-3.5" /> {uploadingCv ? 'Uploading…' : profile.cv_url ? 'Replace CV' : 'Upload CV'}
          </label>
          {profile.cv_url && (
            <a href={profile.cv_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-navy-800 hover:underline">
              <FileText className="h-3.5 w-3.5" /> View current CV
            </a>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label htmlFor="date_of_birth" className="label">Date of birth</label>
          <input id="date_of_birth" name="date_of_birth" type="date" defaultValue={profile.date_of_birth ?? ''} className="input-field" />
        </div>

        <div>
          <label htmlFor="bio" className="label">Bio</label>
          <textarea id="bio" name="bio" defaultValue={profile.bio ?? ''} rows={4} className="input-field" placeholder="Tell classmates a bit about yourself…" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="current_occupation" className="label">Occupation</label>
            <input id="current_occupation" name="current_occupation" defaultValue={profile.occupation ?? ''} className="input-field" />
          </div>
          <div>
            <label htmlFor="employer" className="label">Employer</label>
            <input id="employer" name="employer" defaultValue={profile.employer ?? ''} className="input-field" />
          </div>
          <div>
            <label htmlFor="employment_status" className="label">Employment status</label>
            <select id="employment_status" name="employment_status" defaultValue={profile.employment_status} className="input-field">
              <option value="employed">Employed</option>
              <option value="self_employed">Self-employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div>
            <label htmlFor="location_city" className="label">City</label>
            <input id="location_city" name="location_city" defaultValue={profile.location?.split(',')[0]?.trim() ?? ''} className="input-field" />
          </div>
          <div>
            <label htmlFor="location_country" className="label">Country</label>
            <input id="location_country" name="location_country" defaultValue={profile.location?.split(',')[1]?.trim() ?? ''} className="input-field" />
          </div>
          <div>
            <label htmlFor="linkedin_url" className="label">LinkedIn URL</label>
            <input id="linkedin_url" name="linkedin_url" defaultValue={profile.social.linkedin ?? ''} className="input-field" />
          </div>
          <div>
            <label htmlFor="twitter_url" className="label">Twitter / X URL</label>
            <input id="twitter_url" name="twitter_url" defaultValue={profile.social.twitter ?? ''} className="input-field" />
          </div>
          <div>
            <label htmlFor="website_url" className="label">Portfolio / Website URL</label>
            <input id="website_url" name="website_url" defaultValue={profile.social.website ?? ''} className="input-field" placeholder="https://your-portfolio.com" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
