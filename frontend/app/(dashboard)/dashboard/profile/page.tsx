'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

interface Profile {
  id: number;
  name: string;
  matric_number: string;
  bio: string | null;
  occupation: string | null;
  employer: string | null;
  employment_status: string;
  location: string | null;
  programme: string | null;
  graduation_year: number | null;
  social: { linkedin: string | null; twitter: string | null; website: string | null };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ user: { alumni_profile: Profile } }>('/auth/me', { method: 'GET' })
      .then((res) => setProfile(res.user.alumni_profile))
      .catch((err) => setError(err.message));
  }, []);

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
          bio: form.get('bio'),
          current_occupation: form.get('current_occupation'),
          employer: form.get('employer'),
          employment_status: form.get('employment_status'),
          location_city: form.get('location_city'),
          location_country: form.get('location_country'),
          linkedin_url: form.get('linkedin_url'),
        }),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return <div className="card h-64 animate-pulse" />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          {profile.name} · {profile.programme} · Class of {profile.graduation_year} · <span className="font-mono">{profile.matric_number}</span>
        </p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Profile updated.</p>}

      <form onSubmit={handleSubmit} className="card space-y-5">
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
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
