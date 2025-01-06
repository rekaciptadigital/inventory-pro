import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardShellProps {
  children: React.ReactNode;
  onToggleSidebar?: () => void;
}

export function DashboardShell({
  children,
  onToggleSidebar,
}: DashboardShellProps) {
  return (
    <div className="flex-1 flex flex-col h-screen">
      <header className="shrink-0 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggleSidebar}
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
