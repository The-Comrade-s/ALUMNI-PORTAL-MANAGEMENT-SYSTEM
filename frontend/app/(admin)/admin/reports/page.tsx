'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const formats = [
  { format: 'csv', label: 'CSV', desc: 'Spreadsheet-friendly, works everywhere.' },
  { format: 'xlsx', label: 'Excel (XLSX)', desc: 'Formatted workbook via maatwebsite/excel.' },
  { format: 'pdf', label: 'PDF', desc: 'Printable report via barryvdh/laravel-dompdf.' },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownload(format: string) {
    setDownloading(format);
    try {
      // Direct navigation lets the browser handle the file download/auth cookies natively.
      window.open(`${API_URL}/api/v1/admin/reports/alumni?format=${format}`, '_blank');
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

      <div className="grid gap-4 sm:grid-cols-3">
        {formats.map((f) => (
          <div key={f.format} className="card flex flex-col items-start">
            <p className="font-display text-base font-semibold text-ink">{f.label}</p>
            <p className="mt-1 flex-1 text-sm text-slate-500">{f.desc}</p>
            <button
              onClick={() => handleDownload(f.format)}
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
