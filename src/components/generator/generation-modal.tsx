'use client';

import React, { useState, useEffect } from 'react';
import { designsApi, GenerationResponseData } from '../../lib/api/designs.api';

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  designId: string;
  designName: string;
}

const GENERATION_STEPS = [
  'Validating Design Layout & Semantic Sections...',
  'Mapping Placeholders & User Content Values...',
  'Bundling & Normalizing Media Assets...',
  'Compiling Standalone Next.js App Router Codebase...',
];

export function GenerationModal({
  isOpen,
  onClose,
  designId,
  designName,
}: GenerationModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generationData, setGenerationData] = useState<GenerationResponseData['project'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null);
      setGenerationData(null);
      setIsGenerating(true);
      setCurrentStep(0);

      // Step interval animation
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
      }, 500);

      designsApi
        .generateWebsite(designId)
        .then((res) => {
          clearInterval(interval);
          if (res.error) {
            const msg = Array.isArray(res.error.message)
              ? res.error.message.join(', ')
              : res.error.message;
            setError(msg || 'Failed to generate website codebase');
          } else if (res.data) {
            const projectData = res.data.manifest || res.data.project;
            setGenerationData(projectData || null);
          }
        })
        .catch(() => {
          clearInterval(interval);
          setError('Network error while generating website.');
        })
        .finally(() => {
          setIsGenerating(false);
        });

      return () => clearInterval(interval);
    }
  }, [isOpen, designId]);

  if (!isOpen) return null;

  const handleCopyInstructions = () => {
    const text = `unzip ${designName.toLowerCase().replace(/[^a-z0-9-_]/g, '_')}_nextjs_website.zip\ncd website\nnpm install\nnpm run dev`;
    void navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    const safeName = `${designName.toLowerCase().replace(/[^a-z0-9-_]/g, '_')}_nextjs_website.zip`;
    const success = await designsApi.downloadGenerationZip(designId, safeName);
    if (!success) {
      setError('Failed to download generated ZIP archive.');
    }
    setIsDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Engine Output
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Website Codebase Generation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-900 border border-zinc-800 p-1.5 text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* In-Progress State */}
        {isGenerating && (
          <div className="py-8 space-y-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">
                Generating Standalone Next.js Website...
              </h3>
              <p className="text-xs text-indigo-400 font-mono animate-pulse">
                {GENERATION_STEPS[currentStep]}
              </p>
            </div>

            <div className="mx-auto max-w-xs space-y-2">
              {GENERATION_STEPS.map((st, i) => (
                <div
                  key={st}
                  className={`flex items-center gap-2 text-xs transition-opacity ${
                    i <= currentStep ? 'text-zinc-300 opacity-100' : 'text-zinc-600 opacity-40'
                  }`}
                >
                  <span>{i < currentStep ? '✅' : i === currentStep ? '⏳' : '⚪'}</span>
                  <span className="truncate">{st.replace('...', '')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!isGenerating && error && (
          <div className="py-6 text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-base font-semibold text-red-400">Generation Failed</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">{error}</p>
            <button
              onClick={onClose}
              className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
        )}

        {/* Success State */}
        {!isGenerating && generationData && (
          <div className="space-y-5">
            {/* Stats Badge Banner */}
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <span>🎉</span>
                <span>Next.js App Router Project Ready</span>
              </div>
              <p className="text-xs text-emerald-300/80">
                Generated from structured design specifications. Ready for production and local development.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="rounded-xl bg-zinc-900/60 p-3 border border-zinc-800">
                <div className="text-xl font-extrabold text-white">
                  {generationData.summary?.totalFiles ?? generationData.manifest?.totalFiles ?? generationData.files?.length ?? 0}
                </div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">
                  Files Created
                </div>
              </div>
              <div className="rounded-xl bg-zinc-900/60 p-3 border border-zinc-800">
                <div className="text-xl font-extrabold text-indigo-400">
                  {generationData.summary?.sectionsCount ?? generationData.manifest?.sectionsCount ?? 0}
                </div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">
                  Sections
                </div>
              </div>
              <div className="rounded-xl bg-zinc-900/60 p-3 border border-zinc-800">
                <div className="text-xl font-extrabold text-cyan-400">
                  {generationData.summary?.placeholdersCount ?? generationData.manifest?.placeholdersCount ?? 0}
                </div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">
                  Placeholders
                </div>
              </div>
              <div className="rounded-xl bg-zinc-900/60 p-3 border border-zinc-800">
                <div className="text-xl font-extrabold text-emerald-400">
                  {generationData.summary?.assetsCount ?? generationData.manifest?.assetsCount ?? 0}
                </div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">
                  Assets Bundled
                </div>
              </div>
            </div>

            {/* File Tree Preview */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-zinc-300">Generated File Structure:</div>
              <div className="max-h-36 overflow-y-auto rounded-lg bg-zinc-900/80 p-3 font-mono text-[11px] text-zinc-400 border border-zinc-800 space-y-1">
                {(generationData.files || []).map((fileItem, idx) => {
                  const filePath = typeof fileItem === 'string' ? fileItem : fileItem.path;
                  return (
                    <div key={filePath || idx} className="flex items-center gap-1.5">
                      <span className="text-indigo-400">📄</span>
                      <span className="text-zinc-200">{filePath}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Run Commands */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">How to Run Locally</span>
                <button
                  onClick={handleCopyInstructions}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {copiedCmd ? '✓ Copied Commands!' : '📋 Copy Commands'}
                </button>
              </div>
              <div className="rounded-lg bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-300 border border-zinc-850">
                <div>npm install</div>
                <div>npm run dev</div>
              </div>
            </div>

            {/* Download CTA Action */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <button
                onClick={onClose}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Close
              </button>

              <button
                onClick={() => void handleDownloadZip()}
                disabled={isDownloading}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-indigo-500 hover:shadow-indigo-500/25 disabled:opacity-50"
              >
                {isDownloading ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
                ) : (
                  <span>⬇️</span>
                )}
                <span>{isDownloading ? 'Downloading ZIP...' : 'Download Next.js Project (.ZIP)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
