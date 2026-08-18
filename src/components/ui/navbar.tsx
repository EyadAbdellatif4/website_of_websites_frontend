'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/lib/auth/auth-context';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/designs');

  return (
    <header className="sticky top-3 z-50 mx-auto w-full max-w-7xl px-4 sm:px-6">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 shadow-2xl shadow-indigo-950/40 backdrop-blur-2xl transition-all">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/30 ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-105">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-white">
              Website<span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Generator</span>
            </span>
            <span className="hidden sm:inline-block rounded-md border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
              AI Studio
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-3 sm:gap-5 text-sm">
          {user && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                isDashboard
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isDashboard ? 'bg-indigo-400' : 'bg-zinc-500'}`} />
              <span>Dashboard</span>
            </Link>
          )}

          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-3 border-l border-white/10 pl-3 sm:pl-5">
                  {/* User Profile Pill */}
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-[10px] font-bold text-white uppercase shadow-sm">
                      {user.email.charAt(0)}
                    </span>
                    <span className="hidden md:inline-block font-medium truncate max-w-[140px]">
                      {user.email}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => void logout()}
                    title="Sign Out"
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 active:scale-95"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                      />
                    </svg>
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-purple-500"
                  >
                    Register
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
