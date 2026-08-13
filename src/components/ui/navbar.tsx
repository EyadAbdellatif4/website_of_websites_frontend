import Link from 'next/link';

export function Navbar() {
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
          <Link href="/designs/upload" className="transition hover:text-white">
            Upload
          </Link>
          <Link href="/login" className="rounded-lg border border-zinc-700 px-4 py-2 text-white transition hover:bg-zinc-800">
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
