'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

export interface CrudField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select';
  options?: { value: string | number; label: string }[]; // for select
  required?: boolean;
}

export interface CrudColumn {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface CrudTableProps {
  title: string;
  description: string;
  resourcePath: string; // e.g. '/admin/schools'
  columns: CrudColumn[];
  fields: CrudField[];
}

export function CrudTable({ title, description, resourcePath, columns, fields }: CrudTableProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    apiFetch<Record<string, unknown>[]>(resourcePath, { method: 'GET' })
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [resourcePath]);

  function openCreate() {
    setEditingId(null);
    setFormValues({});
    setFormOpen(true);
  }

  function openEdit(row: Record<string, unknown>) {
    setEditingId(row.id as number);
    const values: Record<string, string> = {};
    fields.forEach((f) => { values[f.name] = String(row[f.name] ?? ''); });
    setFormValues(values);
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await apiFetch(`${resourcePath}/${editingId}`, { method: 'PATCH', body: JSON.stringify(formValues) });
      } else {
        await apiFetch(resourcePath, { method: 'POST', body: JSON.stringify(formValues) });
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Check the fields and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this record? This cannot be undone.')) return;
    try {
      await apiFetch(`${resourcePath}/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete this record.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Add new
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-200 bg-mist-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              {columns.map((c) => <th key={c.key} className="px-4 py-3">{c.label}</th>)}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-500">No records yet.</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={String(row.id)} className="border-b border-line-200 last:border-0 hover:bg-mist-50">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-ink">
                      {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(row)} className="mr-2 rounded-card p-1.5 text-slate-500 hover:bg-mist-100 hover:text-navy-800" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(row.id as number)} className="rounded-card p-1.5 text-slate-500 hover:bg-mist-100 hover:text-danger" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-card-hover">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">{editingId ? 'Edit record' : 'Add new'}</h2>
              <button onClick={() => setFormOpen(false)} aria-label="Close"><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <label htmlFor={f.name} className="label">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      id={f.name}
                      required={f.required}
                      value={formValues[f.name] ?? ''}
                      onChange={(e) => setFormValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      className="input-field"
                      rows={3}
                    />
                  ) : f.type === 'select' ? (
                    <select
                      id={f.name}
                      required={f.required}
                      value={formValues[f.name] ?? ''}
                      onChange={(e) => setFormValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      className="input-field"
                    >
                      <option value="" disabled>Select…</option>
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      id={f.name}
                      type={f.type}
                      required={f.required}
                      value={formValues[f.name] ?? ''}
                      onChange={(e) => setFormValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      className="input-field"
                    />
                  )}
                </div>
              ))}
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
