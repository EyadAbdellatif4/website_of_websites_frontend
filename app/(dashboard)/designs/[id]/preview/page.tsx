import { PreviewView } from '@/src/components/preview/preview-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DesignPreviewPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <PreviewView designId={id} />
    </div>
  );
}
