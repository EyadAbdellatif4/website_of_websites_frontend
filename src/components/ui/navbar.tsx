'use client';

import Link from 'next/link';
import { useAuth } from '@/src/lib/auth/auth-context';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <span className="h-6 w-6 rounded-md bg-indigo-500" />
          <span>Website Generator</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/dashboard" className="transition hover:text-white">
            Dashboard
          </Link>

          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-300 font-medium bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
                    {user.email}
                  </span>
                  <button
                    onClick={() => void logout()}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="rounded-lg border border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
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
