'use client';

import React from 'react';
import { DesignSection, DesignPlaceholder } from '../../types/analysis';

interface SectionListViewProps {
  sections: DesignSection[];
  placeholders: DesignPlaceholder[];
}

const SECTION_BADGES: Record<string, string> = {
  navbar: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  header: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  hero: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  features: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  services: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  about: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  testimonials: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  pricing: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  gallery: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  contact: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  footer: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export function SectionListView({ sections, placeholders }: SectionListViewProps) {
  const safeSections = sections ?? [];
  const safePlaceholders = placeholders ?? [];

  if (safeSections.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-6 text-center text-xs text-zinc-500">
        No sections detected in layout data.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>Semantic Sections</span>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-300">
            {safeSections.length}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {safeSections.map((sec, idx) => {
          const secType = (sec.type || 'section').toLowerCase();
          const badgeStyle = SECTION_BADGES[secType] || 'bg-zinc-800 text-zinc-300 border-zinc-700';
          const bounds = sec.bounds || { x: 0, y: 0, width: 0, height: 0 };
          const containedPlaceholders = safePlaceholders.filter(
            (p) => p.section_id === sec.id
          );

          return (
            <div
              key={sec.id || idx}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 hover:border-zinc-700 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-zinc-200 truncate">
                    {sec.id}
                  </span>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${badgeStyle}`}
                  >
                    {sec.type}
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                  <div className="rounded-lg bg-zinc-950/60 p-2 border border-zinc-800/80">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Dimensions</div>
                    <div className="font-mono font-medium text-zinc-300 mt-0.5">
                      {bounds.width} × {bounds.height}px
                    </div>
                  </div>
                  <div className="rounded-lg bg-zinc-950/60 p-2 border border-zinc-800/80">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Position Offset</div>
                    <div className="font-mono font-medium text-zinc-300 mt-0.5">
                      x: {bounds.x}, y: {bounds.y}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-zinc-800/80 pt-2.5 text-[11px]">
                <span className="text-zinc-500">Order: #{sec.order ?? idx + 1}</span>
                <span className="font-medium text-indigo-400">
                  {containedPlaceholders.length} {containedPlaceholders.length === 1 ? 'Placeholder' : 'Placeholders'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
