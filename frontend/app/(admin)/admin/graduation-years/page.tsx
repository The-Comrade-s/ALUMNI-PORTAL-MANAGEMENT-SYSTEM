'use client';

import { CrudTable } from '@/components/admin/CrudTable';

export default function GraduationYearsAdminPage() {
  return (
    <CrudTable
      title="Graduation Years"
      description="Years alumni can select when registering."
      resourcePath="/admin/graduation-years"
      columns={[
        { key: 'year', label: 'Year' },
        { key: 'label', label: 'Label' },
        { key: 'alumni_profiles_count', label: 'Alumni' },
      ]}
      fields={[
        { name: 'year', label: 'Year (e.g. 2026)', type: 'number', required: true },
        { name: 'label', label: 'Label (optional)', type: 'text' },
      ]}
    />
  );
}
