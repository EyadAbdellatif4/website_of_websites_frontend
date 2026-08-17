'use client';

import React from 'react';
import { DesignPlaceholder } from '../../types/analysis';

interface PlaceholderDetailInspectorProps {
  placeholder: DesignPlaceholder | null;
  onClearSelection: () => void;
}

export function PlaceholderDetailInspector({
  placeholder,
  onClearSelection,
}: PlaceholderDetailInspectorProps) {
  if (!placeholder) {
    return (
      <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-6 text-center text-xs text-zinc-500">
        <div className="text-2xl mb-2">🎯</div>
        <p className="font-medium text-zinc-400">No Placeholder Selected</p>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
          Click any placeholder on the canvas visualizer or from the list to inspect its geometry and details.
        </p>
      </div>
    );
  }

  const bounds = placeholder.bounds || { x: 0, y: 0, width: 0, height: 0 };
  const aspectRatio =
    bounds.height > 0 ? (bounds.width / bounds.height).toFixed(2) : '1.0';

  return (
    <div className="flex flex-col justify-between rounded-xl border border-indigo-500/40 bg-zinc-950 p-4 shadow-lg ring-1 ring-indigo-500/20">
      <div>
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Inspector: Placeholder
            </span>
          </div>
          <button
            onClick={onClearSelection}
            className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400 hover:text-white"
          >
            ✕ Deselect
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <div className="text-[11px] font-semibold text-zinc-400">Role & Identifier</div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-white">{placeholder.role}</span>
              <span className="font-mono text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {placeholder.id}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Content Type</div>
              <div className="font-semibold text-zinc-200 capitalize mt-0.5">
                {placeholder.type}
              </div>
            </div>

            <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Parent Section</div>
              <div className="font-mono text-zinc-200 font-medium truncate mt-0.5">
                {placeholder.section_id}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/60 p-3 border border-zinc-800 space-y-2">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Geometric Bounds
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
              <div className="bg-zinc-950 p-1.5 rounded border border-zinc-850">
                <div className="text-[9px] text-zinc-500">X</div>
                <div className="text-zinc-200">{bounds.x}</div>
              </div>
              <div className="bg-zinc-950 p-1.5 rounded border border-zinc-850">
                <div className="text-[9px] text-zinc-500">Y</div>
                <div className="text-zinc-200">{bounds.y}</div>
              </div>
              <div className="bg-zinc-950 p-1.5 rounded border border-zinc-850">
                <div className="text-[9px] text-zinc-500">WIDTH</div>
                <div className="text-zinc-200">{bounds.width}</div>
              </div>
              <div className="bg-zinc-950 p-1.5 rounded border border-zinc-850">
                <div className="text-[9px] text-zinc-500">HEIGHT</div>
                <div className="text-zinc-200">{bounds.height}</div>
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400 pt-1">
              <span>Aspect Ratio:</span>
              <span className="font-mono text-zinc-300">{aspectRatio} : 1</span>
            </div>
          </div>

          {placeholder.content_hint && (
            <div className="rounded-lg bg-zinc-900/60 p-3 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                Detected Content Hint / Reference
              </div>
              <div className="mt-1 text-xs italic text-zinc-300 bg-zinc-950 p-2 rounded border border-zinc-850">
                &ldquo;{placeholder.content_hint}&rdquo;
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2 text-center text-[10px] text-indigo-300">
        ℹ️ In the next phase, you will supply replacement content for this placeholder.
      </div>
    </div>
  );
}
