'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Design } from '@/src/types/design';
import { designsApi, AnalysisResponseData } from '@/src/lib/api/designs.api';

export function DesignList() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResponseData['result'] | null>(null);
  const [selectedDesignName, setSelectedDesignName] = useState<string | null>(null);

  const fetchDesigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await designsApi.getDesigns();
      if (res.error) {
        const errMsg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setError(errMsg);
      } else if (res.data) {
        setDesigns(res.data);
      }
    } catch {
      setError('Failed to load designs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDesigns();
  }, [fetchDesigns]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    setDeletingId(id);
    try {
      const res = await designsApi.deleteDesign(id);
      if (res.error) {
        const errMsg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setActionError(`Delete failed: ${errMsg}`);
      } else {
        setActionSuccess(`Design "${name}" deleted successfully.`);
        setDesigns((prev) => prev.filter((d) => d.id !== id));
      }
    } catch {
      setActionError('Delete failed due to a network error.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleProcess = async (id: string, name: string) => {
    setActionError(null);
    setActionSuccess(null);
    setProcessingId(id);
    try {
      const res = await designsApi.processDesign(id);
      if (res.error) {
        const errMsg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setActionError(`ZIP Processing failed for "${name}": ${errMsg}`);
      } else if (res.data) {
        const s = res.data.summary;
        setActionSuccess(
          `ZIP processed successfully for "${name}"! Extracted ${s.totalFiles} design assets (${s.svgCount} SVGs, ${s.imageCount} Images, ${s.fontCount} Fonts). Status updated to READY.`
        );
        await fetchDesigns();
      }
    } catch {
      setActionError(`ZIP Processing failed for "${name}" due to a network error.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAnalyze = async (id: string, name: string) => {
    setActionError(null);
    setActionSuccess(null);
    setAnalyzingId(id);
    try {
      const res = await designsApi.analyzeDesign(id);
      if (res.error) {
        const errMsg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setActionError(`AI Analysis failed for "${name}": ${errMsg}`);
      } else if (res.data) {
        setActionSuccess(
          `AI Analysis completed successfully for "${name}"! Extracted ${res.data.result.layout.sections.length} layout sections and ${res.data.result.placeholders.length} content placeholders.`
        );
        setSelectedAnalysis(res.data.result);
        setSelectedDesignName(name);
        await fetchDesigns();
      }
    } catch {
      setActionError(`AI Analysis failed for "${name}" due to a network error.`);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleViewAnalysis = async (id: string, name: string) => {
    setActionError(null);
    try {
      const res = await designsApi.getAnalysis(id);
      if (res.error) {
        const errMsg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setActionError(`Could not fetch analysis for "${name}": ${errMsg}`);
      } else if (res.data) {
        setSelectedAnalysis(res.data.result);
        setSelectedDesignName(name);
      }
    } catch {
      setActionError(`Could not fetch existing analysis for "${name}" due to a network error.`);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-zinc-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mr-2" />
        Loading designs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40">
        <div className="text-3xl mb-3">📁</div>
        <h3 className="text-sm font-semibold text-zinc-200">No designs uploaded yet</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Upload your first design ZIP archive to get started.
        </p>
        <Link
          href="/designs/upload"
          className="inline-block mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-500"
        >
          Upload Design
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Your Uploaded Designs</h2>
        <Link
          href="/designs/upload"
          className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
        >
          + Upload New
        </Link>
      </div>

      {actionSuccess && (
        <div className="flex items-start justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs text-emerald-300">
          <div className="flex items-start gap-2.5">
            <span className="text-base">✅</span>
            <div>
              <h4 className="font-semibold text-emerald-400">Operation Successful</h4>
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
              <h4 className="font-semibold text-red-400">Operation Exception</h4>
              <p className="mt-0.5 break-all text-red-300/90">{actionError}</p>
            </div>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="ml-3 text-red-400 hover:text-red-200 font-bold text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        {designs.map((design) => {
          const fileName = design.fileName ?? design.file_name ?? 'design.zip';
          const fileSize = design.fileSize ?? design.file_size ?? 0;
          const createdAt = design.createdAt ?? design.created_at;
          const hasAnalysis = Boolean(design.layoutData || design.layout_data);

          return (
            <div
              key={design.id}
              className="flex items-center justify-between p-4 hover:bg-zinc-900/50 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-semibold text-lg border border-indigo-500/20">
                  📦
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-100">{design.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                    <span>{fileName}</span>
                    <span>•</span>
                    <span>{formatFileSize(fileSize)}</span>
                    {createdAt && (
                      <>
                        <span>•</span>
                        <span>{new Date(createdAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 mr-2">
                  {design.status}
                </span>

                <button
                  onClick={() => void handleProcess(design.id, design.name)}
                  disabled={processingId === design.id}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
                >
                  {processingId === design.id && (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent mr-1" />
                  )}
                  {processingId === design.id ? 'Processing...' : 'Process ZIP'}
                </button>

                <button
                  onClick={() => void handleAnalyze(design.id, design.name)}
                  disabled={analyzingId === design.id}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {analyzingId === design.id && (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
                  )}
                  {analyzingId === design.id ? 'Analyzing AI...' : 'Analyze AI'}
                </button>

                {hasAnalysis && (
                  <button
                    onClick={() => void handleViewAnalysis(design.id, design.name)}
                    className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-xs text-indigo-300 transition hover:bg-indigo-500/20"
                  >
                    View Layout
                  </button>
                )}

                <button
                  onClick={() => void handleDelete(design.id, design.name)}
                  disabled={deletingId === design.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10 hover:border-red-500/30 disabled:opacity-50"
                >
                  {deletingId === design.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Structured Analysis Debug Result Modal / Drawer */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Analysis Result: {selectedDesignName}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Structured Layout & Placeholders extracted by AI
                </p>
              </div>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-indigo-400 mb-2">
                  Layout Structure ({selectedAnalysis.layout.sections.length} Sections, {selectedAnalysis.layout.width}x{selectedAnalysis.layout.height}px)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedAnalysis.layout.sections.map((section) => (
                    <div
                      key={section.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3"
                    >
                      <div className="flex items-center justify-between text-zinc-200 font-medium">
                        <span>{section.id} ({section.type})</span>
                        <span className="text-zinc-500">Order: {section.order ?? 1}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        Bounds: x:{section.bounds.x}, y:{section.bounds.y}, w:{section.bounds.width}, h:{section.bounds.height}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-emerald-400 mb-2">
                  Content Placeholders ({selectedAnalysis.placeholders.length} Items)
                </h4>
                <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900/60">
                  {selectedAnalysis.placeholders.map((ph) => (
                    <div key={ph.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-zinc-200">
                          {ph.id} — <span className="text-emerald-400">{ph.role}</span> ({ph.type})
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          Section: {ph.section_id} | Bounds: {ph.bounds.width}x{ph.bounds.height}
                        </div>
                      </div>
                      {ph.content_hint && (
                        <div className="max-w-xs truncate rounded bg-zinc-950 px-2 py-1 text-[11px] text-zinc-400 border border-zinc-800">
                          {ph.content_hint}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
