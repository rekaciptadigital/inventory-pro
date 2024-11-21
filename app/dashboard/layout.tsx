import { DashboardNav } from '@/components/layout/dashboard-nav';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <DashboardNav />
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}