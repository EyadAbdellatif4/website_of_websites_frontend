'use client';

import { Card } from '../ui/card';
import { DesignAnalysisResult } from '../../types/analysis';

interface DesignAnalysisViewProps {
  analysis?: DesignAnalysisResult;
}

export function DesignAnalysisView({ analysis }: DesignAnalysisViewProps) {
  const layout = analysis?.layout ?? { width: 1440, height: 3000, sections: [] };
  const placeholders = analysis?.placeholders ?? [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Detected Layout Structure" description="Structural frame and section bounds extracted from design reference.">
        <div className="space-y-3 text-sm text-zinc-400">
          <div className="flex justify-between border-b border-zinc-800 pb-2">
            <span>Canvas Dimensions:</span>
            <span className="font-mono text-zinc-200">{layout.width}px × {layout.height}px</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800 pb-2">
            <span>Detected Sections:</span>
            <span className="font-mono text-zinc-200">{layout.sections.length}</span>
          </div>
        </div>
      </Card>

      <Card title="Extracted Placeholders" description="Dynamic content slots pending user custom text, assets, and images.">
        <div className="space-y-3 text-sm text-zinc-400">
          <div className="flex justify-between border-b border-zinc-800 pb-2">
            <span>Total Placeholders:</span>
            <span className="font-mono text-zinc-200">{placeholders.length}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
