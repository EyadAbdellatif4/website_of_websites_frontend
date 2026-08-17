'use client';

import React, { useState } from 'react';
import { DesignAnalysisResult } from '../../types/analysis';
import { LayoutVisualizer } from './layout-visualizer';
import { SectionListView } from './section-list-view';
import { PlaceholderListView } from './placeholder-list-view';
import { PlaceholderDetailInspector } from './placeholder-detail-inspector';
import { RawAnalysisDebugView } from './raw-analysis-debug-view';

interface DesignAnalysisViewProps {
  analysis?: DesignAnalysisResult;
}

export function DesignAnalysisView({ analysis }: DesignAnalysisViewProps) {
  const [selectedPlaceholderId, setSelectedPlaceholderId] = useState<string | null>(null);

  const layout = analysis?.layout ?? { width: 1440, height: 2000, sections: [] };
  const placeholders = analysis?.placeholders ?? [];

  const selectedPlaceholder =
    placeholders.find((p) => p.id === selectedPlaceholderId) || null;

  return (
    <div className="space-y-8">
      {/* Layout Canvas */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-white">Visual Layout & Bounding Boxes</h2>
        <LayoutVisualizer
          layout={layout}
          placeholders={placeholders}
          selectedPlaceholderId={selectedPlaceholderId}
          onSelectPlaceholder={setSelectedPlaceholderId}
        />
      </section>

      {/* Placeholders & Sections Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-8">
          <PlaceholderListView
            placeholders={placeholders}
            selectedPlaceholderId={selectedPlaceholderId}
            onSelectPlaceholder={setSelectedPlaceholderId}
          />

          <SectionListView
            sections={layout.sections}
            placeholders={placeholders}
          />
        </div>

        <div className="lg:col-span-1 sticky top-6">
          <PlaceholderDetailInspector
            placeholder={selectedPlaceholder}
            onClearSelection={() => setSelectedPlaceholderId(null)}
          />
        </div>
      </section>

      {analysis && (
        <section>
          <RawAnalysisDebugView analysis={analysis} />
        </section>
      )}
    </div>
  );
}
