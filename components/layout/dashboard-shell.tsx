'use client';

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({
  children,
}: DashboardShellProps) {
  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && (window as any).toggleSidebar) {
      (window as any).toggleSidebar();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <header className="shrink-0 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={handleToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}