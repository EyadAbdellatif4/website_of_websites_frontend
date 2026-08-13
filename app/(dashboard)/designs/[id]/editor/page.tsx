import { PlaceholderEditorView } from '@/src/components/placeholder-editor/placeholder-editor-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DesignEditorPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Content & Placeholder Editor</h1>
        <p className="text-sm text-zinc-400 mt-1">Design ID: <span className="font-mono text-zinc-200">{id}</span></p>
      </div>
      <PlaceholderEditorView />
    </div>
  );
}
