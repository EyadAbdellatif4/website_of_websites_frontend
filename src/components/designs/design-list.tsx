'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Design } from '@/src/types/design';
import { designsApi } from '@/src/lib/api/designs.api';

const STATUS_BADGES: Record<string, string> = {
  READY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ready: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PROCESSING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  processing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  UPLOADED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  uploaded: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function DesignList() {
  const router = useRouter();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

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
      setError('Failed to load designs due to a network error.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDesigns();
  }, [fetchDesigns]);

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
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

  const handleProcess = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setActionError(null);
    setActionSuccess(null);
    setProcessingId(id);
    try {
      const res = await designsApi.processDesign(id);
      if (res.error) {
        const errMsg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setActionError(`Processing failed for "${name}": ${errMsg}`);
      } else if (res.data) {
        const s = res.data.summary;
        setActionSuccess(
          `Design processed successfully for "${name}"! Extracted ${s.totalFiles} design assets.`
        );
        await fetchDesigns();
      }
    } catch {
      setActionError(`Processing failed for "${name}" due to a network error.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAnalyze = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
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
          `AI Analysis completed for "${name}"! Redirecting to review...`
        );
        await fetchDesigns();
        router.push(`/designs/${id}`);
      }
    } catch {
      setActionError(`AI Analysis failed for "${name}" due to a network error.`);
    } finally {
      setAnalyzingId(null);
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
      <div className="flex items-center justify-center p-12 text-sm text-zinc-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mr-2.5" />
        Loading designs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-5 text-sm text-red-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
        <button
          onClick={() => void fetchDesigns()}
          className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-500/30"
        >
          Retry
        </button>
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 space-y-3">
        <div className="text-4xl mb-2">📁</div>
        <h3 className="text-base font-semibold text-zinc-200">No designs uploaded yet</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Upload your first design ZIP or SVG file to extract layout, sections, and placeholders with AI.
        </p>
        <Link
          href="/designs/upload"
          className="inline-block mt-3 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-indigo-500"
        >
          + Upload Design
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Your Uploaded Designs</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Click any design to review its structural layout, sections, and detected placeholders
          </p>
        </div>
        <Link
          href="/designs/upload"
          className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-indigo-500"
        >
          + Upload New
        </Link>
      </div>

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
              <h4 className="font-semibold text-red-400">Action Notice</h4>
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

      <div className="grid grid-cols-1 gap-3">
        {designs.map((design) => {
          const fileName = design.fileName ?? design.file_name ?? 'design.zip';
          const fileSize = design.fileSize ?? design.file_size ?? 0;
          const createdAt = design.createdAt ?? design.created_at;
          const hasAnalysis = Boolean(design.layoutData || design.layout_data);
          const statusStyle =
            STATUS_BADGES[design.status] || 'bg-zinc-800 text-zinc-300 border-zinc-700';

          return (
            <div
              key={design.id}
              onClick={() => router.push(`/designs/${design.id}`)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-700 hover:bg-zinc-900/40 transition cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 font-semibold text-xl border border-indigo-500/20 group-hover:scale-105 transition">
                  {fileName.toLowerCase().endsWith('.svg') ? '🎨' : '📦'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition">
                      {design.name}
                    </h4>
                    {hasAnalysis && (
                      <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-1.5 py-0.2 font-medium">
                        AI Analyzed
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-500">
                    <span className="font-mono text-zinc-400">{fileName}</span>
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

              <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusStyle}`}
                >
                  {design.status}
                </span>

                {design.status === 'UPLOADED' && !hasAnalysis && (
                  <button
                    onClick={(e) => void handleProcess(e, design.id, design.name)}
                    disabled={processingId === design.id}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {processingId === design.id && (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent mr-1" />
                    )}
                    {processingId === design.id ? 'Processing...' : 'Process File'}
                  </button>
                )}

                <button
                  onClick={(e) => void handleAnalyze(e, design.id, design.name)}
                  disabled={analyzingId === design.id}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {analyzingId === design.id && (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
                  )}
                  {analyzingId === design.id
                    ? 'Analyzing AI...'
                    : hasAnalysis
                    ? 'Re-analyze'
                    : 'Analyze AI'}
                </button>

                <Link
                  href={`/designs/${design.id}`}
                  className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20"
                >
                  {hasAnalysis ? 'Review Structure →' : 'View Details →'}
                </Link>

                {hasAnalysis && (
                  <Link
                    href={`/designs/${design.id}/editor`}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-emerald-500"
                  >
                    ✏️ Fill Content
                  </Link>
                )}

                {hasAnalysis && (
                  <Link
                    href={`/designs/${design.id}/preview`}
                    className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                  >
                    👁️ Preview
                  </Link>
                )}

                <button
                  onClick={(e) => void handleDelete(e, design.id, design.name)}
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
    </div>
  );
}
