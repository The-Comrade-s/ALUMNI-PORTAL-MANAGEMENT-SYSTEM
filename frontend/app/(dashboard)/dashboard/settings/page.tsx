'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { useCurrentUser } from '@/lib/user-context';
import { LogoutButton } from '@/components/shared/LogoutButton';

export default function SettingsPage() {
  const user = useCurrentUser();

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      setSaved(true);
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your password.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account.</p>
      </div>

      <div className="card space-y-3">
        <p className="label">Account</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">Name</p>
            <p className="text-sm font-medium text-ink">{user?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm font-medium text-ink">{user?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Role</p>
            <p className="text-sm font-medium capitalize text-ink">{user?.role?.name ?? user?.role?.slug ?? '—'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <p className="label">Change password</p>

        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && <p className="text-sm text-success">Password updated.</p>}

        <div>
          <label htmlFor="current_password" className="label">Current password</label>
          <input
            id="current_password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input-field"
            autoComplete="current-password"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="label">New password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div>
          <label htmlFor="password_confirmation" className="label">Confirm new password</label>
          <input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="input-field"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </form>

      <div className="card">
        <p className="label mb-3">Session</p>
        <LogoutButton className="btn-outline inline-flex items-center gap-2 text-sm text-danger" />
      </div>
    </div>
  );
}
