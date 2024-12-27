export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <main className="flex-1 relative">
        <div className="absolute inset-0 overflow-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}