import { DesignUploader } from '@/src/components/design-upload/design-uploader';

export default function DesignUploadPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Upload Design Reference</h1>
        <p className="text-sm text-zinc-400 mt-1">Upload a single ZIP package containing design assets and SVGs.</p>
      </div>
      <DesignUploader />
    </div>
  );
}
