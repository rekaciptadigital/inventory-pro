"use client";

import { DashboardNav } from "@/components/layout/dashboard-nav";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && (window as any).toggleSidebar) {
      (window as any).toggleSidebar();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardNav />
      <DashboardShell onToggleSidebar={handleToggleSidebar}>
        {children}
      </DashboardShell>
    </div>
  );
}
