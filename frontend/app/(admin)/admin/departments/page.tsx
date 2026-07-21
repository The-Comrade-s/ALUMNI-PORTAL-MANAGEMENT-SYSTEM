'use client';

import { useEffect, useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { apiFetch } from '@/lib/api-client';

interface School { id: number; name: string }

export default function DepartmentsAdminPage() {
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    apiFetch<School[]>('/admin/schools', { method: 'GET' }).then(setSchools).catch(() => {});
  }, []);

  return (
    <CrudTable
      title="Departments"
      description="Nested under a School. Programmes are nested under a department."
      resourcePath="/admin/departments"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'school', label: 'School', render: (row) => (row.school as School | undefined)?.name ?? '—' },
        { key: 'programmes_count', label: 'Programmes' },
      ]}
      fields={[
        {
          name: 'school_id',
          label: 'School',
          type: 'select',
          required: true,
          options: schools.map((s) => ({ value: s.id, label: s.name })),
        },
        { name: 'name', label: 'Department name', type: 'text', required: true },
        { name: 'code', label: 'Code', type: 'text', required: true },
      ]}
    />
  );
}
