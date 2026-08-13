'use client';

import { Card } from '../ui/card';

export function PlaceholderEditorView() {
  return (
    <Card
      title="Placeholder Content Editor"
      description="Fill detected layout placeholders with real content and assets."
    >
      <div className="py-8 text-center text-zinc-500 text-sm">
        Placeholder editor interface will be enabled in a future phase after design analysis is connected.
      </div>
    </Card>
  );
}
