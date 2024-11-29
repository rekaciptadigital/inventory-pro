import { StatsCards } from '@/components/dashboard/stats-cards';
import { ActivityCards } from '@/components/dashboard/activity-cards';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your inventory management dashboard
        </p>
      </div>

      <StatsCards />
      <ActivityCards />
    </div>
  );
}