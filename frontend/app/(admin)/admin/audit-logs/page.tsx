'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

interface AuditLog {
  id: number;
  action: string;
  auditable_type: string | null;
  user: { name: string } | null;
  created_at: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ data: AuditLog[] }>('/admin/audit-logs', { method: 'GET' })
      .then((res) => setLogs(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">Every create/update/delete on structural and admin-managed data.</p>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-200 bg-mist-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No audit activity yet.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-line-200 last:border-0 hover:bg-mist-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{log.user?.name ?? 'System'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium capitalize text-navy-800">{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{log.auditable_type?.split('\\').pop()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
