'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Design } from '../../types/design';
import { DesignAnalysisResult, DesignPlaceholder } from '../../types/analysis';
import { designsApi } from '../../lib/api/designs.api';
import { LayoutVisualizer } from '../design-analysis/layout-visualizer';
import { PlaceholderForm } from './placeholder-form';
import { GenerationModal } from '../generator/generation-modal';

interface PlaceholderEditorViewProps {
  designId: string;
}

export function PlaceholderEditorView({ designId }: PlaceholderEditorViewProps) {
  const [design, setDesign] = useState<Design | null>(null);
  const [analysis, setAnalysis] = useState<DesignAnalysisResult | null>(null);
  const [selectedPlaceholderId, setSelectedPlaceholderId] = useState<string | null>(null);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'unfilled' | 'filled'>('all');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const designRes = await designsApi.getDesignById(designId);
      if (designRes.error) {
        const msg = Array.isArray(designRes.error.message)
          ? designRes.error.message.join(', ')
          : designRes.error.message;
        setError(msg || 'Failed to load design');
        setIsLoading(false);
        return;
      }

      if (designRes.data) {
        setDesign(designRes.data);

        // Fetch latest analysis / placeholders
        try {
          const analysisRes = await designsApi.getAnalysis(designId);
          if (analysisRes.data?.result) {
            const resData = analysisRes.data.result;
            setAnalysis(resData);
            if (resData.placeholders.length > 0) {
              setSelectedPlaceholderId((prev) => prev || resData.placeholders[0].id);
            }
          }
        } catch {
          // If analysis endpoint returns not analyzed
          const layoutData = designRes.data.layoutData || designRes.data.layout_data;
          const placeholdersData =
            designRes.data.placeholdersData || designRes.data.placeholders_data;
          if (layoutData && placeholdersData) {
            setAnalysis({
              layout: layoutData as unknown as DesignAnalysisResult['layout'],
              placeholders: placeholdersData as unknown as DesignPlaceholder[],
            });
          }
        }
      }
    } catch {
      setError('Failed to load placeholder editor data due to a network error.');
    } finally {
      setIsLoading(false);
    }
  }, [designId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const handlePlaceholderUpdated = (updated: DesignPlaceholder) => {
    if (!analysis) return;

    const updatedPlaceholders = analysis.placeholders.map((p) =>
      p.id === updated.id ? updated : p
    );

    setAnalysis({
      ...analysis,
      placeholders: updatedPlaceholders,
    });
  };

  const placeholders = useMemo(() => analysis?.placeholders ?? [], [analysis]);

  const filledCount = useMemo(() => {
    return placeholders.filter(
      (p) => p.value !== null && p.value !== undefined && p.value !== ''
    ).length;
  }, [placeholders]);

  const totalCount = placeholders.length;
  const progressPercent = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  const filteredPlaceholders = useMemo(() => {
    return placeholders.filter((p) => {
      const hasVal = p.value !== null && p.value !== undefined && p.value !== '';
      if (filterMode === 'filled') return hasVal;
      if (filterMode === 'unfilled') return !hasVal;
      return true;
    });
  }, [placeholders, filterMode]);

  const activePlaceholder =
    placeholders.find((p) => p.id === selectedPlaceholderId) || null;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-zinc-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mr-2.5" />
        Loading content editor...
      </div>
    );
  }

  if (error || !design || !analysis) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300 space-y-4">
        <div className="text-3xl">⚠️</div>
        <h3 className="text-base font-semibold text-red-400">Design Not Ready for Content Editing</h3>
        <p className="text-xs text-red-300/80 max-w-md mx-auto">
          {error || 'This design has not been analyzed yet. Please run AI analysis first.'}
        </p>
        <Link
          href={`/designs/${designId}`}
          className="inline-block rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
        >
          ← Go to Design Analysis
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link href="/dashboard" className="hover:text-zinc-300">
              Dashboard
            </Link>
            <span>/</span>
            <Link href={`/designs/${design.id}`} className="hover:text-zinc-300">
              {design.name}
            </Link>
            <span>/</span>
            <span className="text-indigo-400 font-medium">Content Editor</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Placeholder Content Editor</span>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-400">
              {design.name}
            </span>
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href={`/designs/${design.id}`}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800"
          >
            ← Review Structure
          </Link>

          <button
            onClick={() => setIsGenModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg transition hover:from-indigo-500 hover:to-cyan-500 hover:shadow-indigo-500/25"
          >
            🚀 Generate Website
          </button>
        </div>
      </div>

      {/* Progress & Completion Meter */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-200">Content Completion Progress</span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.2 text-[11px] font-medium font-mono">
              {filledCount} of {totalCount} Placeholders Filled
            </span>
          </div>
          <span className="font-bold text-sm font-mono text-emerald-400">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Split Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Layout Canvas Visualizer (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-semibold text-white">Visual Design Canvas</h2>
          <LayoutVisualizer
            layout={analysis.layout}
            placeholders={analysis.placeholders}
            selectedPlaceholderId={selectedPlaceholderId}
            onSelectPlaceholder={setSelectedPlaceholderId}
          />
        </div>

        {/* Right: Active Placeholder Form & Quick Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 sticky top-6">
          <PlaceholderForm
            placeholder={activePlaceholder}
            designId={design.id}
            onPlaceholderUpdated={handlePlaceholderUpdated}
            onClearSelection={() => setSelectedPlaceholderId(null)}
          />

          {/* Quick Placeholder Selector Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-300">All Placeholders</h3>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-[11px]">
                {(['all', 'unfilled', 'filled'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-2 py-0.5 rounded capitalize transition ${
                      filterMode === mode
                        ? 'bg-zinc-800 text-white font-medium shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-zinc-850 max-h-[300px] overflow-y-auto pr-1">
              {filteredPlaceholders.map((ph) => {
                const isSelected = selectedPlaceholderId === ph.id;
                const hasVal = ph.value !== null && ph.value !== undefined && ph.value !== '';

                return (
                  <div
                    key={ph.id}
                    onClick={() => setSelectedPlaceholderId(ph.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 text-white border border-indigo-500/30'
                        : 'hover:bg-zinc-900/60 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs">
                        {hasVal ? '✅' : '⚪'}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-medium truncate">{ph.role}</div>
                        <div className="font-mono text-[10px] text-zinc-500 truncate">{ph.id}</div>
                      </div>
                    </div>

                    <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-mono capitalize shrink-0 text-zinc-400">
                      {ph.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Next.js Generation Modal */}
      <GenerationModal
        isOpen={isGenModalOpen}
        onClose={() => setIsGenModalOpen(false)}
        designId={design.id}
        designName={design.name}
      />
    </div>
  );
}
