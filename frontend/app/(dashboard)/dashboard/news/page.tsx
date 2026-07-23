'use client';

import { useEffect, useState } from 'react';
import { Pin, Plus, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { useCurrentUser } from '@/lib/user-context';

interface NewsItem {
  id: number;
  title: string;
  category: string | null;
  body: string;
  is_pinned: boolean;
  author: string | null;
  published_at: string | null;
}

// Mirrors NewsPolicy::create() on the backend.
const CAN_MANAGE_ROLES = ['administrator', 'super_administrator'];

export default function NewsPage() {
  const user = useCurrentUser();
  const canManage = !!user && CAN_MANAGE_ROLES.includes(user.role.slug);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    apiFetch<{ data: NewsItem[] }>('/news', { method: 'GET' })
      .then((res) => setNews(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load news.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">News & Announcements</h1>
          <p className="mt-1 text-sm text-slate-500">Updates from Gateway ICT Polytechnic Saapade.</p>
        </div>
        {canManage && (
          <button onClick={() => setShowForm((v) => !v)} className="btn-primary inline-flex items-center gap-1.5 text-xs">
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? 'Cancel' : 'New post'}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {canManage && showForm && (
        <NewPostForm
          onCreated={(item) => {
            setNews((prev) => [item, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}
        </div>
      ) : news.length === 0 ? (
        <div className="card py-12 text-center text-sm text-slate-500">No news posted yet.</div>
      ) : (
        <div className="space-y-4">
          {news.map((n) => (
            <article key={n.id} className="card cursor-pointer" onClick={() => setExpanded(expanded === n.id ? null : n.id)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  {n.is_pinned && (
                    <span className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-gold-500">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                  <p className="font-display text-base font-semibold text-ink">{n.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {n.category ? `${n.category} · ` : ''}
                    {n.published_at ? new Date(n.published_at).toLocaleDateString() : ''} · {n.author}
                  </p>
                </div>
              </div>
              <p className={`mt-3 text-sm text-slate-500 ${expanded === n.id ? '' : 'line-clamp-2'}`}>{n.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function NewPostForm({ onCreated }: { onCreated: (item: NewsItem) => void }) {
  const [saving, setSaving] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const res = await apiFetch<{ data: NewsItem }>('/admin/news', {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          category: form.get('category') || null,
          body: form.get('body'),
          is_pinned: isPinned,
          // Publish immediately — the public /news list only shows items
          // with a published_at set, so leaving this out would silently
          // hide the post (same trap the job/event forms avoid via DB defaults).
          published_at: new Date().toISOString(),
        }),
      });
      onCreated(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post this announcement.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <p className="font-display text-sm font-semibold text-ink">New post</p>
      {error && <p className="text-sm text-danger">{error}</p>}

      <div>
        <label htmlFor="title" className="label">Title</label>
        <input id="title" name="title" required className="input-field" />
      </div>
      <div>
        <label htmlFor="category" className="label">Category</label>
        <input id="category" name="category" className="input-field" placeholder="e.g. Announcement, Reunion, Career" />
      </div>
      <div>
        <label htmlFor="body" className="label">Body</label>
        <textarea id="body" name="body" required rows={5} className="input-field" />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-500">
        <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded border-line-200" />
        Pin to top
      </label>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Posting…' : 'Post announcement'}
      </button>
    </form>
  );
}

