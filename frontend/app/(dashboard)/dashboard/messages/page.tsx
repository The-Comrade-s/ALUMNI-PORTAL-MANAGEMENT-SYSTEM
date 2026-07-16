'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
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

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function loadConversations() {
    apiFetch<{ data: ConversationSummary[] }>('/conversations', { method: 'GET' })
      .then((res) => {
        setConversations(res.data);
        if (!activeId && res.data.length) setActiveId(res.data[0].id);
      });
  }

  useEffect(loadConversations, []);

  useEffect(() => {
    if (!activeId) return;
    apiFetch<{ data: Message[] }>(`/conversations/${activeId}/messages`, { method: 'GET' })
      .then((res) => setMessages(res.data));
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
      const message = await apiFetch<Message>(`/conversations/${activeId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: draft }),
      });
      setMessages((prev) => [...prev, message]);
      setDraft('');
    } finally {
      setSending(false);
    }
  }

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Conversation list */}
      <div className="w-72 shrink-0 overflow-y-auto rounded-card border border-line-200 bg-white">
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No conversations yet.</p>
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
            Select a conversation to start messaging.
          </div>
        )}
      </div>
    </div>
  );
}
