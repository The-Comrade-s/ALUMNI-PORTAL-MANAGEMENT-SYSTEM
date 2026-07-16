import { AdminSidebar } from '@/components/shared/AdminSidebar';
import { Topbar } from '@/components/shared/Topbar';

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-mist-50">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar userName="Admin" />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
