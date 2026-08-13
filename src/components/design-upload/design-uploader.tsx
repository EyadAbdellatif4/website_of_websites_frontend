'use client';

import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function DesignUploader() {
  return (
    <Card
      title="Upload Design File"
      description="Select ONE .zip file containing design SVGs, images, and fonts."
      className="max-w-xl mx-auto text-center"
    >
      <div className="my-6 border-2 border-dashed border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition">
        <div className="mx-auto h-12 w-12 text-zinc-500 mb-3 flex items-center justify-center rounded-full bg-zinc-800/50">
          📦
        </div>
        <p className="text-sm font-medium text-zinc-300">Drag and drop your ZIP file here</p>
        <p className="text-xs text-zinc-500 mt-1">Accepts single .zip file (up to 50MB)</p>
      </div>

      <Button variant="primary" className="w-full" disabled>
        Upload & Extract Design (Phase 2)
      </Button>
    </Card>
  );
}
