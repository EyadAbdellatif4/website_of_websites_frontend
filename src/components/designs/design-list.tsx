'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Design } from '@/src/types/design';
import { designsApi } from '@/src/lib/api/designs.api';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  READY: {
    label: 'Ready',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  ready: {
    label: 'Ready',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  PROCESSING: {
    label: 'Processing',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400 animate-ping',
  },
  processing: {
    label: 'Processing',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400 animate-ping',
  },
  UPLOADED: {
    label: 'Uploaded',
    bg: 'bg-blue-500/15',
    text: 'text-blue-300',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
  },
  uploaded: {
    label: 'Uploaded',
    bg: 'bg-blue-500/15',
    text: 'text-blue-300',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
  },
  FAILED: {
    label: 'Failed',
    bg: 'bg-red-500/15',
    text: 'text-red-300',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-500/15',
    text: 'text-red-300',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
  },
};

export function DesignList() {
  const router = useRouter();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Search, Filter & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY' | 'PROCESSING' | 'UPLOADED' | 'FAILED'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Action states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Delete Modal State (replaces window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Execute design deletion from modal
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setActionError(null);
    setActionSuccess(null);
    setIsDeleting(true);

    try {
      const res = await designsApi.deleteDesign(deleteTarget.id);
      if (res.error) {
        const errMsg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setActionError(`Delete failed: ${errMsg}`);
      } else {
        setActionSuccess(`Design "${deleteTarget.name}" was permanently removed.`);
        setDesigns((prev) => prev.filter((d) => d.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch {
      setActionError('Delete failed due to a network error.');
    } finally {
      setIsDeleting(false);
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
          `Extracted ${s.totalFiles} assets successfully from "${name}". Ready for AI analysis!`
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
          `AI Analysis completed for "${name}"! Redirecting to review layout...`
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

  // Stats calculation
  const stats = useMemo(() => {
    const total = designs.length;
    const ready = designs.filter((d) => d.status.toUpperCase() === 'READY').length;
    const processing = designs.filter((d) => d.status.toUpperCase() === 'PROCESSING').length;
    const uploaded = designs.filter((d) => d.status.toUpperCase() === 'UPLOADED').length;
    return { total, ready, processing, uploaded };
  }, [designs]);

  // Filtered designs
  const filteredDesigns = useMemo(() => {
    return designs.filter((design) => {
      const matchesSearch =
        design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (design.fileName ?? design.file_name ?? '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || design.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [designs, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-sm text-slate-400">
        <div className="relative mb-4 h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
        <p className="font-medium text-slate-200">Loading your design studio...</p>
        <span className="mt-1 text-xs text-slate-500">Connecting to AI neural pipeline</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-6 text-sm text-red-400 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-red-300">Connection Error</h4>
            <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
          </div>
        </div>
        <button
          onClick={() => void fetchDesigns()}
          className="rounded-xl bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/30 transition shadow"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dynamic KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-indigo-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Designs</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 text-sm border border-indigo-500/20">📁</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-white tracking-tight">{stats.total}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>In repository</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Ready for Preview</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 text-sm border border-emerald-500/20">🚀</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-400 tracking-tight">{stats.ready}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-500/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive sites</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-400">Pending AI Analysis</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 text-sm border border-blue-500/20">⚡</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-blue-400 tracking-tight">{stats.uploaded}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-400/80">
            <span>Ready for extraction</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-amber-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400">In Pipeline</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 text-sm border border-amber-500/20">⚙️</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-400 tracking-tight">{stats.processing}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-500/80">
            <span>Background workers</span>
          </div>
        </div>
      </div>

      {/* Notifications / Feedback */}
      {actionSuccess && (
        <div className="flex items-start justify-between rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs text-emerald-200 shadow-xl backdrop-blur-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/25 text-emerald-300 text-sm font-bold">✓</span>
            <div>
              <h4 className="font-semibold text-emerald-300">Success</h4>
              <p className="mt-0.5 text-emerald-200/90">{actionSuccess}</p>
            </div>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-400 hover:text-emerald-200 p-1 text-sm transition"
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div className="flex items-start justify-between rounded-2xl bg-red-500/15 border border-red-500/30 p-4 text-xs text-red-200 shadow-xl backdrop-blur-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/25 text-red-300 text-sm font-bold">✕</span>
            <div>
              <h4 className="font-semibold text-red-300">Notice</h4>
              <p className="mt-0.5 text-red-200/90">{actionError}</p>
            </div>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-red-400 hover:text-red-200 p-1 text-sm transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter, Search & View Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-y border-white/10 py-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'READY', 'PROCESSING', 'UPLOADED', 'FAILED'] as const).map((filter) => {
            const count =
              filter === 'ALL'
                ? designs.length
                : designs.filter((d) => d.status.toUpperCase() === filter).length;

            const isActive = statusFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-105 ring-1 ring-white/20'
                    : 'border border-white/10 bg-slate-900/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 backdrop-blur-md'
                }`}
              >
                <span>{filter === 'ALL' ? 'All Designs' : filter}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive ? 'bg-white/25 text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Layout Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-500 pointer-events-none">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 backdrop-blur-md"
            />
          </div>

          <div className="flex items-center rounded-xl border border-white/10 bg-slate-900/60 p-1 backdrop-blur-md">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Zero State */}
      {filteredDesigns.length === 0 && (
        <div className="text-center py-20 px-6 rounded-3xl border border-dashed border-white/15 bg-slate-900/50 backdrop-blur-2xl shadow-2xl space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-3xl border border-indigo-500/30 text-indigo-400 shadow-inner">
            📦
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {searchQuery ? 'No matching designs found' : 'No design packages uploaded yet'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {searchQuery
              ? `No design matches your query "${searchQuery}". Try clearing the search or status filter.`
              : 'Upload a Figma SVG export or a full ZIP package to extract layouts and generate production websites.'}
          </p>
          <div className="pt-2">
            <Link
              href="/designs/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
            >
              <span>+ Upload Your First Design</span>
            </Link>
          </div>
        </div>
      )}

      {/* Grid View Mode */}
      {viewMode === 'grid' && filteredDesigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesigns.map((design) => {
            const fileName = design.fileName ?? design.file_name ?? 'design.zip';
            const fileSize = design.fileSize ?? design.file_size ?? 0;
            const createdAt = design.createdAt ?? design.created_at;
            const hasAnalysis = Boolean(design.layoutData || design.layout_data);
            const isSvg = fileName.toLowerCase().endsWith('.svg');
            const statusConfig = STATUS_CONFIG[design.status] || STATUS_CONFIG.UPLOADED;

            return (
              <div
                key={design.id}
                onClick={() => router.push(`/designs/${design.id}`)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-2xl shadow-xl transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-indigo-500/15 hover:-translate-y-1 cursor-pointer"
              >
                {/* Ambient Card Glow on Hover */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/0 blur-2xl transition-all duration-300 group-hover:bg-indigo-500/20" />

                <div>
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                      <span>{isSvg ? '🎨' : '📦'}</span>
                      <span>{isSvg ? 'SVG Vector' : 'ZIP Bundle'}</span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                      <span>{statusConfig.label}</span>
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="mt-5">
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-indigo-300 transition line-clamp-1">
                      {design.name}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-slate-400 truncate">
                      {fileName}
                    </p>
                  </div>

                  {/* Badges and Details */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-0.5 font-medium text-slate-300">
                      {formatFileSize(fileSize)}
                    </span>
                    {hasAnalysis && (
                      <span className="rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 font-medium text-indigo-300 flex items-center gap-1">
                        <span>✨</span> AI Analyzed
                      </span>
                    )}
                    {createdAt && (
                      <span className="text-slate-500 ml-auto">
                        {new Date(createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Controls */}
                <div
                  className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {hasAnalysis && (
                    <>
                      <Link
                        href={`/designs/${design.id}/preview`}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-3 py-2 text-xs font-bold text-cyan-300 shadow-md shadow-cyan-500/10 transition hover:bg-cyan-500/25 hover:scale-[1.02]"
                      >
                        <span>👁️</span> Preview
                      </Link>
                      <Link
                        href={`/designs/${design.id}/editor`}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 hover:scale-[1.02]"
                      >
                        <span>✏️</span> Edit
                      </Link>
                    </>
                  )}

                  {!hasAnalysis && (
                    <button
                      onClick={(e) => void handleAnalyze(e, design.id, design.name)}
                      disabled={analyzingId === design.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:opacity-95 hover:scale-[1.02] disabled:opacity-50"
                    >
                      {analyzingId === design.id && (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      )}
                      <span>{analyzingId === design.id ? 'Analyzing...' : '⚡ AI Analyze'}</span>
                    </button>
                  )}

                  {design.status === 'UPLOADED' && !hasAnalysis && (
                    <button
                      onClick={(e) => void handleProcess(e, design.id, design.name)}
                      disabled={processingId === design.id}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                    >
                      {processingId === design.id ? 'Extracting...' : 'Extract'}
                    </button>
                  )}

                  <Link
                    href={`/designs/${design.id}`}
                    title="View Design Structure & Sections"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </Link>

                  {/* Delete Button -> Opens Custom Modal */}
                  <button
                    onClick={() => setDeleteTarget({ id: design.id, name: design.name })}
                    title="Delete Design"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-red-400 transition hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-300"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View Mode */}
      {viewMode === 'list' && filteredDesigns.length > 0 && (
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl overflow-hidden shadow-2xl">
          {filteredDesigns.map((design) => {
            const fileName = design.fileName ?? design.file_name ?? 'design.zip';
            const fileSize = design.fileSize ?? design.file_size ?? 0;
            const createdAt = design.createdAt ?? design.created_at;
            const hasAnalysis = Boolean(design.layoutData || design.layout_data);
            const isSvg = fileName.toLowerCase().endsWith('.svg');
            const statusConfig = STATUS_CONFIG[design.status] || STATUS_CONFIG.UPLOADED;

            return (
              <div
                key={design.id}
                onClick={() => router.push(`/designs/${design.id}`)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-800/60 transition cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400 font-semibold text-xl border border-indigo-500/25 group-hover:scale-105 transition">
                    {isSvg ? '🎨' : '📦'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                        {design.name}
                      </h4>
                      {hasAnalysis && (
                        <span className="rounded-md bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.2 text-[10px] font-semibold text-indigo-300">
                          AI Analyzed
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="font-mono text-slate-300">{fileName}</span>
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

                <div className="flex flex-wrap items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                  >
                    {statusConfig.label}
                  </span>

                  {hasAnalysis && (
                    <>
                      <Link
                        href={`/designs/${design.id}/preview`}
                        className="rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/25 shadow-sm"
                      >
                        👁️ Preview
                      </Link>
                      <Link
                        href={`/designs/${design.id}/editor`}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-sm"
                      >
                        ✏️ Edit Content
                      </Link>
                    </>
                  )}

                  {!hasAnalysis && (
                    <button
                      onClick={(e) => void handleAnalyze(e, design.id, design.name)}
                      disabled={analyzingId === design.id}
                      className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-95 disabled:opacity-50 shadow-sm"
                    >
                      {analyzingId === design.id ? 'Analyzing...' : '⚡ AI Analyze'}
                    </button>
                  )}

                  <Link
                    href={`/designs/${design.id}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Details →
                  </Link>

                  <button
                    onClick={() => setDeleteTarget({ id: design.id, name: design.name })}
                    className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-red-400 transition hover:bg-red-500/15 hover:border-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Delete Confirmation Modal Popup */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Design Package"
        description={
          <div>
            <p>
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-white">
                &ldquo;{deleteTarget?.name}&rdquo;
              </span>
              ?
            </p>
            <p className="mt-2 text-xs text-slate-400">
              This action cannot be undone. All extracted layouts, detected placeholders, and generated Next.js preview files will be permanently erased.
            </p>
          </div>
        }
        confirmText="Delete Design"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
