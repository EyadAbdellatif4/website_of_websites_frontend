import Link from 'next/link';

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-400 font-medium">
          Platform Architecture & Foundation Established
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Website Generation Platform
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed">
          Upload reference design ZIP packages, extract structural layouts and placeholders,
          and seamlessly generate high-performance web applications.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 shadow-lg shadow-indigo-600/25"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/designs/upload"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
          >
            Upload Reference ZIP
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          <div className="text-2xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-white mb-2">Design Package Storage</h3>
          <p className="text-sm text-zinc-400">
            Abstracted file storage service isolating local file storage and future S3 migration.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          <div className="text-2xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">Layout & Placeholder Extraction</h3>
          <p className="text-sm text-zinc-400">
            Analyzes reference designs to extract layout geometry, sections, and editable placeholders.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          <div className="text-2xl mb-4">🚀</div>
          <h3 className="text-xl font-bold text-white mb-2">Website Generation</h3>
          <p className="text-sm text-zinc-400">
            Fills placeholder slots with real assets and content to output clean production website code.
          </p>
        </div>
      </div>
    </div>
  );
}
