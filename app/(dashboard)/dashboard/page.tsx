import { DashboardHeader } from '@/src/components/dashboard/dashboard-header';
import { DesignList } from '@/src/components/designs/design-list';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <DashboardHeader />
      <DesignList />
    </div>
  );
}
