'use client';

import React, { useState } from 'react';
import { DesignAnalysisResult } from '../../types/analysis';

interface RawAnalysisDebugViewProps {
  analysis: DesignAnalysisResult;
}

export function RawAnalysisDebugView({ analysis }: RawAnalysisDebugViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(analysis, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard permission fails
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between p-4 hover:bg-zinc-900/40 transition"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">🛠️</span>
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">
              Developer Debug View (Raw Analysis JSON)
            </h4>
            <p className="text-[11px] text-zinc-500">
              Inspect raw deterministic JSON returned by AI analyzer & backend schema validator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-mono">
            {isOpen ? '▲ Collapse' : '▼ Expand'}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono">
              Schema: AnalysisResult (Layout + Placeholders)
            </span>
            <button
              onClick={handleCopy}
              className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition"
            >
              {copied ? '✅ Copied!' : '📋 Copy JSON'}
            </button>
          </div>

          <pre className="max-h-96 overflow-auto rounded-lg bg-zinc-950 p-4 font-mono text-[11px] text-emerald-400 border border-zinc-800 leading-relaxed">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
}
