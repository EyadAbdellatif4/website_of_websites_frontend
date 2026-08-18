'use client';

import React from 'react';
import Link from 'next/link';

interface DashboardHeaderProps {
  totalCount?: number;
  readyCount?: number;
}

export function DashboardHeader({ totalCount = 0, readyCount = 0 }: DashboardHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-zinc-950/80 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Decorative Ambient Background Gradients */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Design Engine v2.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Design <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Studio</span>
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-zinc-400">
            Extract structural layouts, auto-detect interactive placeholders, and generate production-ready Next.js web applications directly from your design files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/designs/upload"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-600/25 transition-all duration-300 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 text-white group-hover:rotate-90 transition-transform duration-300">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
            <span>Upload New Design</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
