import { DashboardHeader } from '@/src/components/dashboard/dashboard-header';
import { Card } from '@/src/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <DashboardHeader />
      <Card title="Uploaded Designs" description="Your design uploads and extracted layout specs will appear here.">
        <div className="py-12 text-center text-zinc-500 text-sm">
          No design packages uploaded yet. Use the upload button above to upload a .zip reference design file.
        </div>
      </Card>
    </div>
  );
}
