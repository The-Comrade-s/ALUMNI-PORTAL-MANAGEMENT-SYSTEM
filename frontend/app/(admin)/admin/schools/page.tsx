'use client';

import { CrudTable } from '@/components/admin/CrudTable';

export default function SchoolsAdminPage() {
  return (
    <CrudTable
      title="Schools"
      description="The top level of the academic hierarchy. Departments are nested under a school."
      resourcePath="/admin/schools"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'departments_count', label: 'Departments' },
      ]}
      fields={[
        { name: 'name', label: 'School name', type: 'text', required: true },
        { name: 'code', label: 'Code (e.g. SICT)', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
    />
  );
}
