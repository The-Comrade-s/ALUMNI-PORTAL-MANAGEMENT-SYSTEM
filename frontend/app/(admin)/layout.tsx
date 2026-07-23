'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/shared/AdminSidebar';
import { Topbar } from '@/components/shared/Topbar';
import { AuthGuard } from '@/components/shared/AuthGuard';

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard allowedRoles={['administrator', 'super_administrator']}>
      <div className="flex min-h-screen bg-mist-50">
        <AdminSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
