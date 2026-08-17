import { PlaceholderEditorView } from '@/src/components/placeholder-editor/placeholder-editor-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DesignEditorPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <PlaceholderEditorView designId={id} />
    </div>
  );
}
