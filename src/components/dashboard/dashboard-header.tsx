import Link from 'next/link';

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-zinc-800 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Design Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage and inspect your website design packages.</p>
      </div>
      <Link
        href="/designs/upload"
        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
      >
        Upload Design ZIP
      </Link>
    </div>
  );
}
