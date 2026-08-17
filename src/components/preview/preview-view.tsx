'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Design } from '../../types/design';
import { DesignAnalysisResult } from '../../types/analysis';
import {
  designsApi,
  PreviewStatusResponseData,
} from '../../lib/api/designs.api';
import { LayoutVisualizer } from '../design-analysis/layout-visualizer';
import { PreviewFrame, ViewportPreset } from './preview-frame';
import { GenerationModal } from '../generator/generation-modal';

interface PreviewViewProps {
  designId: string;
}

export function PreviewView({ designId }: PreviewViewProps) {
  const [design, setDesign] = useState<Design | null>(null);
  const [analysis, setAnalysis] = useState<DesignAnalysisResult | null>(null);
  const [previewStatus, setPreviewStatus] = useState<PreviewStatusResponseData | null>(null);
  const [selectedPlaceholderId, setSelectedPlaceholderId] = useState<string | null>(null);

  const [viewportMode, setViewportMode] = useState<ViewportPreset>('desktop');
  const [isSideBySide, setIsSideBySide] = useState(true);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        // Fetch analysis
        try {
          const analysisRes = await designsApi.getAnalysis(designId);
          if (analysisRes.data?.result) {
            setAnalysis(analysisRes.data.result);
          }
        } catch {
          // fallback to design jsonb fields
          const layoutData = designRes.data.layoutData || designRes.data.layout_data;
          const placeholdersData =
            designRes.data.placeholdersData || designRes.data.placeholders_data;
          if (layoutData && placeholdersData) {
            setAnalysis({
              layout: layoutData as unknown as DesignAnalysisResult['layout'],
              placeholders: placeholdersData as unknown as DesignAnalysisResult['placeholders'],
            });
          }
        }

        // Fetch preview status
        try {
          const statusRes = await designsApi.getPreviewStatus(designId);
          if (statusRes.data) {
            setPreviewStatus(statusRes.data);
          }
        } catch {
          // preview status endpoint failed
        }
      }
    } catch {
      setError('Network error while loading preview details.');
    } finally {
      setIsLoading(false);
    }
  }, [designId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const handleStartPreview = async () => {
    setError(null);
    setIsActionLoading(true);
    try {
      const res = await designsApi.startPreview(designId);
      if (res.error) {
        const msg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setError(msg || 'Failed to start preview');
      } else if (res.data) {
        setPreviewStatus(res.data);
      }
    } catch {
      setError('Failed to start preview server due to network error.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStopPreview = async () => {
    setError(null);
    setIsActionLoading(true);
    try {
      const res = await designsApi.stopPreview(designId);
      if (res.error) {
        const msg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setError(msg || 'Failed to stop preview');
      } else if (res.data) {
        setPreviewStatus(res.data);
      }
    } catch {
      setError('Failed to stop preview server.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-zinc-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mr-2.5" />
        Loading preview workspace...
      </div>
    );
  }

  if (error && !design) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300 space-y-4">
        <div className="text-3xl">⚠️</div>
        <h3 className="text-base font-semibold text-red-400">Design Not Found</h3>
        <p className="text-xs text-red-300/80 max-w-md mx-auto">{error}</p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const isRunning = previewStatus?.status === 'RUNNING';
  const isStarting = previewStatus?.status === 'STARTING' || isActionLoading;
  const isNotReady = previewStatus?.status === 'NOT_READY';

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link href="/dashboard" className="hover:text-zinc-300">
              Dashboard
            </Link>
            <span>/</span>
            <Link href={`/designs/${design?.id}`} className="hover:text-zinc-300">
              {design?.name}
            </Link>
            <span>/</span>
            <span className="text-indigo-400 font-medium">Live Preview</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Generated Website Preview
            </h1>

            {/* Status Pill */}
            {isRunning ? (
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Live on Port :{previewStatus?.port}
              </span>
            ) : isStarting ? (
              <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1.5">
                <div className="h-2 w-2 animate-spin rounded-full border border-amber-400 border-t-transparent" />
                Starting Server...
              </span>
            ) : isNotReady ? (
              <span className="rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 px-2.5 py-0.5 text-xs font-medium">
                ⚠️ Not Generated Yet
              </span>
            ) : (
              <span className="rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 px-2.5 py-0.5 text-xs font-medium">
                ○ Server Stopped
              </span>
            )}
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Viewport Selector */}
          <div className="flex items-center gap-1 bg-zinc-950 rounded-lg p-1 border border-zinc-800 text-xs">
            {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewportMode(mode)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition ${
                  viewportMode === mode
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mode === 'desktop' ? '🖥️ Desktop' : mode === 'tablet' ? '📱 Tablet' : '📲 Mobile'}
              </button>
            ))}
          </div>

          {/* Side-by-Side Toggle */}
          <button
            onClick={() => setIsSideBySide((prev) => !prev)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              isSideBySide
                ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            {isSideBySide ? '🔲 Side-by-Side' : '🔳 Full Preview'}
          </button>

          {/* Start / Stop Preview Button */}
          {isRunning ? (
            <button
              onClick={handleStopPreview}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
            >
              ⏹️ Stop Preview
            </button>
          ) : (
            <button
              onClick={handleStartPreview}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
            >
              {isStarting && (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
              )}
              ▶️ Start Preview
            </button>
          )}

          {/* Regenerate Codebase CTA */}
          <button
            onClick={() => setIsGenModalOpen(true)}
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white shadow transition hover:from-indigo-500 hover:to-cyan-500"
          >
            🚀 Regenerate
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-xs text-red-300 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <span className="text-base">⚠️</span>
            <div>
              <h4 className="font-semibold text-red-400">Notice</h4>
              <p className="mt-0.5 text-red-300/90">{error}</p>
            </div>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      {isSideBySide && analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Original Design Layout Visualizer (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <span>🎨 Original Design Blueprint</span>
                <span className="rounded bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.2">
                  Reference
                </span>
              </h2>
            </div>
            <LayoutVisualizer
              designId={designId}
              layout={analysis.layout}
              placeholders={analysis.placeholders}
              selectedPlaceholderId={selectedPlaceholderId}
              onSelectPlaceholder={setSelectedPlaceholderId}
            />
          </div>

          {/* Right: Live Generated Website Preview Frame (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>⚡ Live Generated Codebase</span>
                {isRunning && (
                  <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2">
                    Next.js Active
                  </span>
                )}
              </h2>
            </div>
            <PreviewFrame
              url={previewStatus?.url || null}
              viewportMode={viewportMode}
              isLoading={isStarting}
              onRefresh={() => void handleStartPreview()}
            />
          </div>
        </div>
      ) : (
        /* Full Width Preview */
        <div className="w-full space-y-3">
          <PreviewFrame
            url={previewStatus?.url || null}
            viewportMode={viewportMode}
            isLoading={isStarting}
            onRefresh={() => void handleStartPreview()}
          />
        </div>
      )}

      {/* Standalone Next.js Generation Modal */}
      {design && (
        <GenerationModal
          isOpen={isGenModalOpen}
          onClose={() => {
            setIsGenModalOpen(false);
            void loadData();
          }}
          designId={design.id}
          designName={design.name}
        />
      )}
    </div>
  );
}
