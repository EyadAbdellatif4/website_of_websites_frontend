import { DesignDetailView } from '@/src/components/design-analysis/design-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DesignDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <DesignDetailView designId={id} />
    </div>
  );
}
