'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { designsApi } from '@/src/lib/api/designs.api';

interface DesignUploaderProps {
  onSuccess?: () => void;
}

export function DesignUploader({ onSuccess }: DesignUploaderProps) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const lowerName = selected.name.toLowerCase();

      const isValidExtension =
        lowerName.endsWith('.zip') || lowerName.endsWith('.svg');

      if (!isValidExtension) {
        setError('Only .zip archives or standalone .svg files are allowed.');
        setFile(null);
        return;
      }

      if (selected.size > 50 * 1024 * 1024) {
        setError('File size cannot exceed 50 MB.');
        setFile(null);
        return;
      }

      setFile(selected);

      // Auto-fill design name from file name if empty
      if (!name) {
        const defaultName = selected.name
          .replace(/\.(zip|svg)$/i, '')
          .replace(/[-_]/g, ' ');
        setName(defaultName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a name for your design.');
      return;
    }

    if (!file) {
      setError('Please select a valid ZIP or SVG file to upload.');
      return;
    }

    setIsUploading(true);

    try {
      const res = await designsApi.uploadDesign(file, name.trim());
      if (res.error) {
        const errMsg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setError(errMsg);
      } else {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard');
        }
      }
    } catch {
      setError('An unexpected upload error occurred. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const isSvg = file?.name.toLowerCase().endsWith('.svg');

  return (
    <Card
      title="Upload Design File"
      description="Upload a .zip archive or standalone .svg design file"
      className="max-w-xl mx-auto"
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Design Name
          </label>
          <input
            type="text"
            placeholder="e.g. Serendale AI Blockchain Website"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isUploading}
            required
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Design File (.ZIP or .SVG)
          </label>
          <div className="border-2 border-dashed border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition bg-zinc-950/50">
            <input
              type="file"
              accept=".zip,.svg,image/svg+xml,application/zip,application/x-zip-compressed"
              onChange={handleFileChange}
              disabled={isUploading}
              id="zip-file-input"
              className="hidden"
            />
            <label
              htmlFor="zip-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="h-10 w-10 text-xl text-zinc-400 flex items-center justify-center rounded-full bg-zinc-800/60">
                {isSvg ? '🎨' : '📦'}
              </div>
              {file ? (
                <div className="text-sm font-medium text-indigo-400">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-zinc-300">
                    Click to select a ZIP or SVG file
                  </p>
                  <p className="text-xs text-zinc-500">
                    Accepts single .zip or .svg file up to 50MB
                  </p>
                </>
              )}
            </label>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 font-medium"
          disabled={isUploading || !file || !name.trim()}
        >
          {isUploading ? 'Uploading Design File...' : 'Upload Design'}
        </Button>
      </form>
    </Card>
  );
}
