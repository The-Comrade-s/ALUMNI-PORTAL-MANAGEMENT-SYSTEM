'use client';

import { useEffect, useState } from 'react';
import { Pin } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface NewsItem {
  id: number;
  title: string;
  category: string | null;
  body: string;
  is_pinned: boolean;
  author: string | null;
  published_at: string | null;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<{ data: NewsItem[] }>('/news', { method: 'GET' })
      .then((res) => setNews(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">News & Announcements</h1>
        <p className="mt-1 text-sm text-slate-500">Updates from Gateway ICT Polytechnic Saapade.</p>
      </div>

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
