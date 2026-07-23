'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Calendar, Users, Video, Plus, X, Upload } from 'lucide-react';
import { apiFetch, apiUpload } from '@/lib/api-client';
import { useCurrentUser } from '@/lib/user-context';

interface EventItem {
  id: number;
  title: string;
  description: string;
  cover_image_url: string | null;
  venue: string | null;
  is_virtual: boolean;
  start_at: string;
  status: string;
  registrations_count: number;
  is_registered: boolean;
}

const CAN_MANAGE_ROLES = ['administrator', 'super_administrator'];

export default function EventsPage() {
  const user = useCurrentUser();
  const canManage = !!user && CAN_MANAGE_ROLES.includes(user.role.slug);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    apiFetch<{ data: EventItem[] }>('/events?status=upcoming', { method: 'GET' })
      .then((res) => setEvents(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleRegister(eventId: number) {
    setRegisteringId(eventId);
    try {
      await apiFetch(`/events/${eventId}/register`, { method: 'POST' });
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, is_registered: true, registrations_count: e.registrations_count + 1 } : e)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register for this event.');
    } finally {
      setRegisteringId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Events</h1>
          <p className="mt-1 text-sm text-slate-500">Reunions, career talks, and workshops from the institution.</p>
        </div>
        {canManage && (
          <button onClick={() => setShowForm((v) => !v)} className="btn-primary inline-flex items-center gap-1.5 text-xs">
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? 'Cancel' : 'New event'}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {canManage && showForm && (
        <NewEventForm
          onCreated={(event) => {
            setEvents((prev) => [event, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-40 animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="card py-12 text-center text-sm text-slate-500">No upcoming events at the moment.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((e) => (
            <div key={e.id} className="card overflow-hidden !p-0">
              {e.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.cover_image_url} alt={e.title} className="h-36 w-full object-cover" />
              )}
              <div className="p-5">
                <p className="font-display text-base font-semibold text-ink">{e.title}</p>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{e.description}</p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(e.start_at).toLocaleString()}</p>
                  <p className="flex items-center gap-1.5">
                    {e.is_virtual ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                    {e.is_virtual ? 'Virtual event' : e.venue}
                  </p>
                  <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {e.registrations_count} registered</p>
                </div>

                <button
                  onClick={() => handleRegister(e.id)}
                  disabled={e.is_registered || registeringId === e.id}
                  className={e.is_registered ? 'btn-outline mt-4 w-full text-xs' : 'btn-gold mt-4 w-full text-xs'}
                >
                  {e.is_registered ? 'Registered ✓' : registeringId === e.id ? 'Registering…' : 'Register'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewEventForm({ onCreated }: { onCreated: (event: EventItem) => void }) {
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isVirtual, setIsVirtual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('banner', file);
      const res = await apiUpload<{ cover_image_url: string }>('/admin/events/banner', fd);
      setBannerUrl(res.cover_image_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload banner.');
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const res = await apiFetch<{ data: EventItem }>('/admin/events', {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          description: form.get('description'),
          cover_image_url: bannerUrl,
          venue: isVirtual ? null : form.get('venue') || null,
          is_virtual: isVirtual,
          start_at: form.get('start_at'),
          end_at: form.get('end_at') || null,
          registration_deadline: form.get('registration_deadline') || null,
        }),
      });
      onCreated(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create this event.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <p className="font-display text-sm font-semibold text-ink">New event</p>
      {error && <p className="text-sm text-danger">{error}</p>}

      <div>
        <p className="label">Banner image</p>
        <div className="flex items-center gap-3">
          <input ref={bannerInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleBannerChange} className="hidden" id="banner-upload" />
          <label htmlFor="banner-upload" className="btn-outline inline-flex cursor-pointer items-center gap-2 text-xs">
            <Upload className="h-3.5 w-3.5" /> {uploadingBanner ? 'Uploading…' : bannerUrl ? 'Change banner' : 'Upload banner'}
          </label>
          {bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerUrl} alt="Banner preview" className="h-10 w-16 rounded object-cover" />
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="label">Title</label>
          <input id="title" name="title" required className="input-field" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="label">Description / announcement</label>
          <textarea id="description" name="description" required rows={4} className="input-field" />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-500 sm:col-span-2">
          <input type="checkbox" checked={isVirtual} onChange={(e) => setIsVirtual(e.target.checked)} className="rounded border-line-200" />
          This is a virtual event
        </label>

        {!isVirtual && (
          <div className="sm:col-span-2">
            <label htmlFor="venue" className="label">Venue</label>
            <input id="venue" name="venue" className="input-field" />
          </div>
        )}

        <div>
          <label htmlFor="start_at" className="label">Start</label>
          <input id="start_at" name="start_at" type="datetime-local" required className="input-field" />
        </div>
        <div>
          <label htmlFor="end_at" className="label">End</label>
          <input id="end_at" name="end_at" type="datetime-local" className="input-field" />
        </div>
        <div>
          <label htmlFor="registration_deadline" className="label">Registration deadline</label>
          <input id="registration_deadline" name="registration_deadline" type="datetime-local" className="input-field" />
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Creating…' : 'Create event'}
      </button>
    </form>
  );
}
