import { DashboardNav } from '@/components/layout/dashboard-nav';

export default function StockLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
