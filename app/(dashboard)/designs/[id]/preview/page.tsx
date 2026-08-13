import { Card } from '@/src/components/ui/card';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DesignPreviewPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Generated Website Preview</h1>
        <p className="text-sm text-zinc-400 mt-1">Design ID: <span className="font-mono text-zinc-200">{id}</span></p>
      </div>
      <Card title="Website Preview" description="Live preview of the generated website output.">
        <div className="py-12 text-center text-zinc-500 text-sm">
          Website code generation will be enabled in a future phase.
        </div>
      </Card>
    </div>
  );
}
