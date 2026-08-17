'use client';

import React, { useState, useMemo } from 'react';
import { DesignPlaceholder } from '../../types/analysis';

interface PlaceholderListViewProps {
  placeholders: DesignPlaceholder[];
  selectedPlaceholderId: string | null;
  onSelectPlaceholder: (id: string | null) => void;
}

const TYPE_ICONS: Record<string, string> = {
  text: '📝',
  image: '🖼️',
  button: '🔘',
  link: '🔗',
  icon: '⭐',
  video: '🎬',
  logo: '🏷️',
};

const TYPE_STYLES: Record<string, string> = {
  text: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  image: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  button: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  link: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  icon: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  video: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  logo: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export function PlaceholderListView({
  placeholders,
  selectedPlaceholderId,
  onSelectPlaceholder,
}: PlaceholderListViewProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const safePlaceholders = useMemo(() => placeholders ?? [], [placeholders]);

  // Extract unique types present in placeholders
  const availableTypes = useMemo(() => {
    const types = new Set(safePlaceholders.map((p) => (p.type || 'other').toLowerCase()));
    return ['all', ...Array.from(types)];
  }, [safePlaceholders]);

  // Filter placeholders
  const filteredPlaceholders = useMemo(() => {
    return safePlaceholders.filter((ph) => {
      const matchesType =
        selectedType === 'all' || (ph.type || 'other').toLowerCase() === selectedType;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        ph.id.toLowerCase().includes(q) ||
        ph.role.toLowerCase().includes(q) ||
        ph.section_id.toLowerCase().includes(q) ||
        (ph.content_hint && ph.content_hint.toLowerCase().includes(q));

      return matchesType && matchesQuery;
    });
  }, [safePlaceholders, selectedType, searchQuery]);

  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>Detected Placeholders</span>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-300">
            {filteredPlaceholders.length} of {safePlaceholders.length}
          </span>
        </h3>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by role, id, section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex flex-wrap gap-1.5 border-b border-zinc-800 pb-2.5">
        {availableTypes.map((type) => {
          const count =
            type === 'all'
              ? safePlaceholders.length
              : safePlaceholders.filter((p) => (p.type || 'other').toLowerCase() === type).length;

          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <span>{type === 'all' ? '✨' : TYPE_ICONS[type] || '📦'}</span>
              <span className="capitalize">{type}</span>
              <span className="rounded bg-black/30 px-1.5 py-0.2 text-[10px] font-mono opacity-80">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Placeholders List */}
      {filteredPlaceholders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-6 text-center text-xs text-zinc-500">
          No placeholders matched your current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredPlaceholders.map((ph, idx) => {
            const isSelected = selectedPlaceholderId === ph.id;
            const phType = (ph.type || 'custom').toLowerCase();
            const badgeStyle = TYPE_STYLES[phType] || 'bg-zinc-800 text-zinc-300 border-zinc-700';
            const icon = TYPE_ICONS[phType] || '📦';
            const bounds = ph.bounds || { x: 0, y: 0, width: 0, height: 0 };

            return (
              <div
                key={ph.id || idx}
                onClick={() => onSelectPlaceholder(isSelected ? null : ph.id)}
                className={`group cursor-pointer rounded-xl border p-3 transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500 shadow-md'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <div>
                      <div className="font-semibold text-xs text-zinc-100 flex items-center gap-1.5">
                        <span>{ph.role}</span>
                        {isSelected && (
                          <span className="rounded bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.2">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500 mt-0.5">{ph.id}</div>
                    </div>
                  </div>

                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize shrink-0 ${badgeStyle}`}
                  >
                    {ph.type}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-950/50 rounded-lg p-2 border border-zinc-800/60">
                  <span>
                    Section: <span className="font-mono text-zinc-300">{ph.section_id}</span>
                  </span>
                  <span className="font-mono text-zinc-400">
                    {bounds.width} × {bounds.height}px
                  </span>
                </div>

                {ph.content_hint && (
                  <div className="mt-2 text-[11px] text-zinc-400 line-clamp-1 bg-zinc-950/80 px-2 py-1 rounded border border-zinc-800/80">
                    <span className="text-zinc-500 mr-1">Hint:</span>
                    <span className="italic text-zinc-300">{ph.content_hint}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
