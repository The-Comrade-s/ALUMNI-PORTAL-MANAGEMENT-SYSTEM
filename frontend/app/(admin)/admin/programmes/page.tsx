'use client';

import { useEffect, useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { apiFetch } from '@/lib/api-client';

interface Department { id: number; name: string }

export default function ProgrammesAdminPage() {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    apiFetch<Department[]>('/admin/departments', { method: 'GET' }).then(setDepartments).catch(() => {});
  }, []);

  return (
    <CrudTable
      title="Programmes"
      description="ND / HND (or others you define) nested under a department."
      resourcePath="/admin/programmes"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'department', label: 'Department', render: (row) => (row.department as Department | undefined)?.name ?? '—' },
        { key: 'duration_years', label: 'Duration (yrs)' },
        { key: 'alumni_profiles_count', label: 'Alumni' },
      ]}
      fields={[
        {
          name: 'department_id',
          label: 'Department',
          type: 'select',
          required: true,
          options: departments.map((d) => ({ value: d.id, label: d.name })),
        },
        { name: 'name', label: 'Programme name (e.g. ND, HND)', type: 'text', required: true },
        { name: 'duration_years', label: 'Duration (years)', type: 'number', required: true },
      ]}
    />
  );
}
