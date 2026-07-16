'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { apiDownload } from '@/lib/api-client';

const formats = [
  { format: 'csv', label: 'CSV', desc: 'Spreadsheet-friendly, works everywhere.', filename: 'alumni-report.csv' },
  { format: 'xlsx', label: 'Excel (XLSX)', desc: 'Formatted workbook via maatwebsite/excel.', filename: 'alumni-report.xlsx' },
  { format: 'pdf', label: 'PDF', desc: 'Printable report via barryvdh/laravel-dompdf.', filename: 'alumni-report.pdf' },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload(format: string, filename: string) {
    setDownloading(format);
    setError(null);
    try {
      // Plain window.open()/<a href> can't attach the Authorization header
      // this app's bearer-token auth requires, so the download goes
      // through apiFetch's fetch-as-blob helper instead.
      await apiDownload(`/admin/reports/alumni?format=${format}`, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download this report.');
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Export the active alumni directory in the format you need.</p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {formats.map((f) => (
          <div key={f.format} className="card flex flex-col items-start">
            <p className="font-display text-base font-semibold text-ink">{f.label}</p>
            <p className="mt-1 flex-1 text-sm text-slate-500">{f.desc}</p>
            <button
              onClick={() => handleDownload(f.format, f.filename)}
              disabled={downloading === f.format}
              className="btn-outline mt-4 w-full text-xs"
            >
              <Download className="h-3.5 w-3.5" /> {downloading === f.format ? 'Preparing…' : `Download ${f.label}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
