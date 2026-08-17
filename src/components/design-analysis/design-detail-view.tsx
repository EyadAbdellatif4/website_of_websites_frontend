'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Design } from '../../types/design';
import { DesignAnalysisResult, DesignPlaceholder } from '../../types/analysis';
import { designsApi } from '../../lib/api/designs.api';
import { LayoutVisualizer } from './layout-visualizer';
import { SectionListView } from './section-list-view';
import { PlaceholderListView } from './placeholder-list-view';
import { PlaceholderDetailInspector } from './placeholder-detail-inspector';
import { RawAnalysisDebugView } from './raw-analysis-debug-view';
import { GenerationModal } from '../generator/generation-modal';

interface DesignDetailViewProps {
  designId: string;
}

export function DesignDetailView({ designId }: DesignDetailViewProps) {
  const [design, setDesign] = useState<Design | null>(null);
  const [analysis, setAnalysis] = useState<DesignAnalysisResult | null>(null);
  const [selectedPlaceholderId, setSelectedPlaceholderId] = useState<string | null>(null);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const designRes = await designsApi.getDesignById(designId);
      if (designRes.error) {
        const msg = Array.isArray(designRes.error.message)
          ? designRes.error.message.join(', ')
          : designRes.error.message;
        setError(msg || 'Design not found');
        setIsLoading(false);
        return;
      }

      if (designRes.data) {
        setDesign(designRes.data);

        // Check if layout and placeholder data are already stored in design entity
        const layoutData = designRes.data.layoutData || designRes.data.layout_data;
        const placeholdersData =
          designRes.data.placeholdersData || designRes.data.placeholders_data;

        if (layoutData && placeholdersData) {
          setAnalysis({
            layout: layoutData as unknown as DesignAnalysisResult['layout'],
            placeholders: placeholdersData as unknown as DesignPlaceholder[],
          });
        } else {
          // Attempt to fetch analysis if status is READY
          try {
            const analysisRes = await designsApi.getAnalysis(designId);
            if (analysisRes.data) {
              setAnalysis(analysisRes.data.result);
            }
          } catch {
            // Not analyzed yet
          }
        }
      }
    } catch {
      setError('Failed to load design details due to a network error.');
    } finally {
      setIsLoading(false);
    }
  }, [designId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const handleProcessZip = async () => {
    setActionError(null);
    setActionSuccess(null);
    setIsProcessing(true);
    try {
      const res = await designsApi.processDesign(designId);
      if (res.error) {
        const msg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setActionError(`Processing failed: ${msg}`);
      } else if (res.data) {
        setActionSuccess(
          `ZIP archive securely processed! Found ${res.data.summary.totalFiles} design assets.`
        );
        await loadData();
      }
    } catch {
      setActionError('ZIP processing failed due to network error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    setActionError(null);
    setActionSuccess(null);
    setIsAnalyzing(true);
    try {
      const res = await designsApi.analyzeDesign(designId);
      if (res.error) {
        const msg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setActionError(`AI Analysis failed: ${msg}`);
      } else if (res.data) {
        setAnalysis(res.data.result);
        setDesign(res.data.design);
        setActionSuccess(
          `AI Analysis completed! Extracted ${res.data.result.layout.sections.length} layout sections and ${res.data.result.placeholders.length} content placeholders.`
        );
      }
    } catch {
      setActionError('AI Analysis failed due to network error.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Find active placeholder object
  const selectedPlaceholder =
    analysis?.placeholders.find((p) => p.id === selectedPlaceholderId) || null;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-zinc-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mr-2.5" />
        Loading design details & analysis...
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300 space-y-4">
        <div className="text-3xl">⚠️</div>
        <h3 className="text-base font-semibold text-red-400">Unable to load design</h3>
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

  const fileName = design.fileName ?? design.file_name ?? 'design.zip';
  const fileSize = design.fileSize ?? design.file_size ?? 0;
  const createdAt = design.createdAt ?? design.created_at;
  const hasAnalysis = Boolean(analysis);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link href="/dashboard" className="hover:text-zinc-300">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-zinc-400">Designs</span>
            <span>/</span>
            <span className="font-mono text-zinc-300">{design.id.slice(0, 8)}</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>{design.name}</span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              {design.status}
            </span>
          </h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
            <span>Archive: {fileName}</span>
            <span>•</span>
            <span>Size: {formatFileSize(fileSize)}</span>
            {createdAt && (
              <>
                <span>•</span>
                <span>Uploaded: {new Date(createdAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800"
          >
            ← Back
          </Link>

          {design.status === 'UPLOADED' && !hasAnalysis && (
            <button
              onClick={handleProcessZip}
              disabled={isProcessing || isAnalyzing}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {isProcessing && (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent mr-1" />
              )}
              {isProcessing ? 'Processing ZIP...' : 'Process ZIP'}
            </button>
          )}

          {hasAnalysis && (
            <Link
              href={`/designs/${design.id}/editor`}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-emerald-500"
            >
              ✏️ Fill Placeholders
            </Link>
          )}

          {hasAnalysis && (
            <Link
              href={`/designs/${design.id}/preview`}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
            >
              👁️ Preview
            </Link>
          )}

          {hasAnalysis && (
            <button
              onClick={() => setIsGenModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg transition hover:from-indigo-500 hover:to-cyan-500 hover:shadow-indigo-500/20"
            >
              🚀 Generate Website
            </button>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || isProcessing}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-850 border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {isAnalyzing && (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
            )}
            {isAnalyzing
              ? 'Analyzing with AI...'
              : hasAnalysis
              ? '✨ Re-analyze AI'
              : '✨ Start AI Analysis'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="flex items-start justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs text-emerald-300">
          <div className="flex items-start gap-2.5">
            <span className="text-base">✅</span>
            <div>
              <h4 className="font-semibold text-emerald-400">Success</h4>
              <p className="mt-0.5 text-emerald-300/90">{actionSuccess}</p>
            </div>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="ml-3 text-emerald-400 hover:text-emerald-200 font-bold text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div className="flex items-start justify-between rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-xs text-red-300">
          <div className="flex items-start gap-2.5">
            <span className="text-base">⚠️</span>
            <div>
              <h4 className="font-semibold text-red-400">Analysis Notice</h4>
              <p className="mt-0.5 text-red-300/90">{actionError}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="rounded bg-red-500/20 px-2 py-1 text-[11px] font-medium text-red-300 hover:bg-red-500/30"
            >
              Retry
            </button>
            <button
              onClick={() => setActionError(null)}
              className="text-red-400 hover:text-red-200 font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!analysis ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center space-y-4">
          <div className="text-4xl">🤖</div>
          <h3 className="text-base font-semibold text-zinc-100">
            Design Ready for Structural AI Analysis
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Run the AI Design Analyzer to extract layout dimensions, semantic sections, and content placeholders from this design.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {isAnalyzing && (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
            )}
            {isAnalyzing ? 'Analyzing AI Structure...' : 'Start AI Analysis Now'}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Layout Visualizer */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">Visual Layout & Bounding Boxes</h2>
            <LayoutVisualizer
              designId={design.id}
              layout={analysis.layout}
              placeholders={analysis.placeholders}
              selectedPlaceholderId={selectedPlaceholderId}
              onSelectPlaceholder={setSelectedPlaceholderId}
            />
          </section>

          {/* Section & Placeholder Inspector Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: Placeholders & Sections */}
            <div className="lg:col-span-2 space-y-8">
              <PlaceholderListView
                placeholders={analysis.placeholders}
                selectedPlaceholderId={selectedPlaceholderId}
                onSelectPlaceholder={setSelectedPlaceholderId}
              />

              <SectionListView
                sections={analysis.layout.sections}
                placeholders={analysis.placeholders}
              />
            </div>

            {/* Right 1 Col: Selected Placeholder Inspector */}
            <div className="lg:col-span-1 sticky top-6">
              <PlaceholderDetailInspector
                placeholder={selectedPlaceholder}
                onClearSelection={() => setSelectedPlaceholderId(null)}
              />
            </div>
          </section>

          {/* Developer Raw JSON Debug Drawer */}
          <section>
            <RawAnalysisDebugView analysis={analysis} />
          </section>
        </div>
      )}

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
