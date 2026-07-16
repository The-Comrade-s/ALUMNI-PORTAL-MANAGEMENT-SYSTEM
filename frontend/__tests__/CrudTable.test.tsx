import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CrudTable } from '@/components/admin/CrudTable';

describe('CrudTable', () => {
  it('renders an empty state when there are no records', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    ) as unknown as typeof fetch;

    render(
      <CrudTable
        title="Schools"
        description="Test"
        resourcePath="/admin/schools"
        columns={[{ key: 'name', label: 'Name' }]}
        fields={[{ name: 'name', label: 'Name', type: 'text', required: true }]}
      />
    );

    await waitFor(() => expect(screen.getByText(/no records yet/i)).toBeInTheDocument());
  });
});
