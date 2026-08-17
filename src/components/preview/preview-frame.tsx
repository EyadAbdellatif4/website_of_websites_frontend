'use client';

import React, { useRef } from 'react';

export type ViewportPreset = 'desktop' | 'tablet' | 'mobile';

interface PreviewFrameProps {
  url: string | null;
  viewportMode: ViewportPreset;
  isLoading: boolean;
  onRefresh: () => void;
}

const VIEWPORT_CONFIG: Record<
  ViewportPreset,
  { label: string; width: string; height: string; icon: string; frameClass: string }
> = {
  desktop: {
    label: 'Desktop (1440 × 900)',
    width: '100%',
    height: '780px',
    icon: '🖥️',
    frameClass: 'w-full rounded-xl border border-zinc-800 shadow-2xl',
  },
  tablet: {
    label: 'Tablet (768 × 1024)',
    width: '768px',
    height: '840px',
    icon: '📱',
    frameClass: 'w-[768px] rounded-2xl border-4 border-zinc-800 shadow-2xl ring-1 ring-zinc-700',
  },
  mobile: {
    label: 'Mobile (390 × 844)',
    width: '390px',
    height: '750px',
    icon: '📲',
    frameClass: 'w-[390px] rounded-3xl border-8 border-zinc-850 shadow-2xl ring-1 ring-zinc-700',
  },
};

export function PreviewFrame({
  url,
  viewportMode,
  isLoading,
  onRefresh,
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const currentConfig = VIEWPORT_CONFIG[viewportMode];

  const handleReload = () => {
    if (iframeRef.current && url) {
      iframeRef.current.src = url;
    }
    onRefresh();
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-950/70 p-4 border border-zinc-850 min-h-[600px] overflow-hidden">
      {/* Device Toolbar */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-zinc-850 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span>{currentConfig.icon}</span>
          <span className="font-semibold text-zinc-200">{currentConfig.label}</span>
          {url && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="font-mono text-[11px] text-indigo-400 truncate max-w-xs">{url}</span>
            </>
          )}
        </div>

        {url && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReload}
              className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
              title="Refresh Iframe"
            >
              🔄 Refresh
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-300 hover:bg-indigo-500/20 transition"
            >
              ↗ Open in Tab
            </a>
          </div>
        )}
      </div>

      {/* Frame Viewport Container */}
      <div className="w-full flex justify-center items-center py-2 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
            <p className="text-xs font-medium">Starting isolated preview server...</p>
          </div>
        ) : url ? (
          <div
            className={`transition-all duration-300 bg-zinc-900 overflow-hidden flex flex-col ${currentConfig.frameClass}`}
            style={{ width: currentConfig.width, height: currentConfig.height, maxWidth: '100%' }}
          >
            {/* Device mock header */}
            {viewportMode !== 'desktop' && (
              <div className="bg-zinc-900 h-6 flex items-center justify-center border-b border-zinc-800">
                <div className="w-16 h-2 bg-zinc-800 rounded-full" />
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={url}
              title="Generated Next.js Website Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="w-full flex-1 bg-zinc-950 border-0"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-3 text-center">
            <div className="text-4xl">⏹️</div>
            <h4 className="text-sm font-semibold text-zinc-300">Preview Server Is Stopped</h4>
            <p className="text-xs text-zinc-500 max-w-sm">
              Click &ldquo;Start Preview&rdquo; in the toolbar above to launch an isolated local preview server for this generated website.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
