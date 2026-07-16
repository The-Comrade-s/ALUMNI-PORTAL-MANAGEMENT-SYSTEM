'use client';

import { useEffect, useState } from 'react';
import { MapPin, Calendar, Users, Video } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface EventItem {
  id: number;
  title: string;
  description: string;
  venue: string | null;
  is_virtual: boolean;
  start_at: string;
  status: string;
  registrations_count: number;
  is_registered: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Events</h1>
        <p className="mt-1 text-sm text-slate-500">Reunions, career talks, and workshops from the institution.</p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-40 animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="card py-12 text-center text-sm text-slate-500">No upcoming events at the moment.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((e) => (
            <div key={e.id} className="card">
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
          ))}
        </div>
      )}
    </div>
  );
}
