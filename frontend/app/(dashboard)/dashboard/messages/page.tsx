'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Plus, Search, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface ConversationSummary {
  id: number;
  title: string | null;
  participants: { id: number; name: string }[];
  last_message: { body: string; sender_id: number; created_at: string } | null;
  unread_count: number;
}

interface Message {
  id: number;
  body: string;
  sender_name: string;
  is_mine: boolean;
  created_at: string;
}

interface AlumniSearchResult {
  id: number;
  name: string;
  programme: string | null;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  function loadConversations() {
    apiFetch<{ data: ConversationSummary[] }>('/conversations', { method: 'GET' })
      .then((res) => {
        setConversations(res.data);
        setLoadError(null);
        if (!activeId && res.data.length) setActiveId(res.data[0].id);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load conversations.'));
  }

  useEffect(loadConversations, []);

  useEffect(() => {
    if (!activeId) return;
    apiFetch<{ data: Message[] }>(`/conversations/${activeId}/messages`, { method: 'GET' })
      .then((res) => setMessages(res.data))
      .catch(() => {});
    apiFetch(`/conversations/${activeId}/read`, { method: 'POST' }).catch(() => {});
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    setSending(true);
    try {
      const res = await apiFetch<{ data: Message }>(`/conversations/${activeId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: draft }),
      });
      setMessages((prev) => [...prev, res.data]);
      setDraft('');
    } finally {
      setSending(false);
    }
  }

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Conversation list */}
      <div className="flex w-72 shrink-0 flex-col overflow-hidden rounded-card border border-line-200 bg-white">
        <div className="flex items-center justify-between border-b border-line-200 px-4 py-3">
          <p className="font-display text-sm font-semibold text-ink">Messages</p>
          <button onClick={() => setShowNew(true)} className="rounded-card p-1.5 text-navy-800 hover:bg-navy-100" aria-label="New message">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadError ? (
            <p className="p-4 text-sm text-danger">{loadError}</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No conversations yet — start one with the + button.</p>
          ) : (
            conversations.map((c) => {
              const otherNames = c.title ?? c.participants.map((p) => p.name).join(', ');
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full flex-col items-start gap-0.5 border-b border-line-200 px-4 py-3 text-left transition-colors ${
                    activeId === c.id ? 'bg-navy-100' : 'hover:bg-mist-50'
                  }`}
                >
                  <span className="flex w-full items-center justify-between text-sm font-medium text-ink">
                    {otherNames}
                    {c.unread_count > 0 && (
                      <span className="ml-2 rounded-full bg-danger px-1.5 py-0.5 text-[10px] text-white">{c.unread_count}</span>
                    )}
                  </span>
                  {c.last_message && <span className="line-clamp-1 text-xs text-slate-500">{c.last_message.body}</span>}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex flex-1 flex-col rounded-card border border-line-200 bg-white">
        {activeConversation ? (
          <>
            <div className="border-b border-line-200 px-5 py-3">
              <p className="font-display text-sm font-semibold text-ink">
                {activeConversation.title ?? activeConversation.participants.map((p) => p.name).join(', ')}
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.is_mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-card px-4 py-2 text-sm ${m.is_mine ? 'bg-navy-800 text-white' : 'bg-mist-100 text-ink'}`}>
                    {m.body}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line-200 p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="input-field flex-1"
              />
              <button type="submit" disabled={sending} className="btn-primary px-4 py-2.5" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            Select a conversation, or start a new one, to begin messaging.
          </div>
        )}
      </div>

      {showNew && (
        <NewConversationModal
          onClose={() => setShowNew(false)}
          onStarted={(conversation) => {
            setConversations((prev) => [conversation, ...prev.filter((c) => c.id !== conversation.id)]);
            setActiveId(conversation.id);
            setShowNew(false);
          }}
        />
      )}
    </div>
  );
}

function NewConversationModal({
  onClose,
  onStarted,
}: {
  onClose: () => void;
  onStarted: (conversation: ConversationSummary) => void;
}) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<AlumniSearchResult[]>([]);
  const [recipient, setRecipient] = useState<AlumniSearchResult | null>(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      apiFetch<{ data: AlumniSearchResult[] }>(`/alumni?q=${encodeURIComponent(q)}`, {
        method: 'GET',
        signal: controller.signal,
      })
        .then((res) => setResults(res.data))
        .catch(() => {});
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [q]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!recipient || !body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: ConversationSummary }>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ participant_ids: [recipient.id], body }),
      });
      onStarted(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start this conversation.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-card bg-white p-5 shadow-card-hover">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-sm font-semibold text-ink">New message</p>
          <button onClick={onClose} className="rounded-card p-1 text-slate-500 hover:bg-mist-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        {!recipient ? (
          <div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search alumni by name…"
                className="input-field pl-9"
              />
            </div>
            <div className="mt-2 max-h-56 overflow-y-auto">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRecipient(r)}
                  className="flex w-full flex-col items-start rounded-card px-3 py-2 text-left text-sm hover:bg-mist-50"
                >
                  <span className="font-medium text-ink">{r.name}</span>
                  {r.programme && <span className="text-xs text-slate-500">{r.programme}</span>}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleStart} className="space-y-3">
            <div className="flex items-center justify-between rounded-card bg-mist-50 px-3 py-2 text-sm">
              <span>To: <strong>{recipient.name}</strong></span>
              <button type="button" onClick={() => setRecipient(null)} className="text-xs text-navy-800 hover:underline">Change</button>
            </div>
            <textarea
              autoFocus
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              required
              className="input-field"
              placeholder="Write your message…"
            />
            <button type="submit" disabled={sending} className="btn-primary w-full">
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
