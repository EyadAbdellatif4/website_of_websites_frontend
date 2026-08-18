'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DesignPlaceholder,
  ImagePlaceholderValue,
  ButtonPlaceholderValue,
  LinkPlaceholderValue,
} from '../../types/analysis';
import { designsApi } from '../../lib/api/designs.api';
import { isUrlSafe } from '../../lib/utils/url.util';
import { ConfirmModal } from '../ui/confirm-modal';

interface PlaceholderFormProps {
  placeholder: DesignPlaceholder | null;
  designId: string;
  onPlaceholderUpdated: (updated: DesignPlaceholder) => void;
  onClearSelection: () => void;
}

export function PlaceholderForm({
  placeholder,
  designId,
  onPlaceholderUpdated,
  onClearSelection,
}: PlaceholderFormProps) {
  // Form values state
  const [textValue, setTextValue] = useState<string>('');
  const [buttonText, setButtonText] = useState<string>('');
  const [buttonUrl, setButtonUrl] = useState<string>('');
  const [linkText, setLinkText] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when active placeholder changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsDirty(false);

    if (!placeholder) {
      setTextValue('');
      setButtonText('');
      setButtonUrl('');
      setLinkText('');
      setLinkUrl('');
      return;
    }

    const val = placeholder.value;
    const phType = (placeholder.type || 'text').toLowerCase();

    if (phType === 'text') {
      setTextValue(typeof val === 'string' ? val : '');
    } else if (phType === 'button') {
      const bVal = val as ButtonPlaceholderValue | undefined;
      setButtonText(bVal?.text || '');
      setButtonUrl(bVal?.url || '');
    } else if (phType === 'link') {
      const lVal = val as LinkPlaceholderValue | undefined;
      setLinkText(lVal?.text || '');
      setLinkUrl(lVal?.url || '');
    }
  }, [placeholder]);

  if (!placeholder) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-6 text-center text-xs text-zinc-500">
        <div className="text-3xl mb-2">🎯</div>
        <p className="font-semibold text-zinc-300">Select a Placeholder to Edit</p>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
          Click any placeholder on the canvas or from the selector list to supply real content, text, links, or upload images.
        </p>
      </div>
    );
  }

  const phType = (placeholder.type || 'text').toLowerCase();
  const isImage = phType === 'image' || phType === 'logo';
  const bounds = placeholder.bounds || { x: 0, y: 0, width: 0, height: 0 };
  const imageVal = isImage ? (placeholder.value as ImagePlaceholderValue | null) : null;
  const hasValue = placeholder.value !== null && placeholder.value !== undefined && placeholder.value !== '';

  const handleSaveText = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSaving(true);
    try {
      const res = await designsApi.updatePlaceholderValue(
        designId,
        placeholder.id,
        textValue.trim() || null,
      );
      if (res.error) {
        const msg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setErrorMsg(msg || 'Failed to save placeholder value');
      } else if (res.data) {
        setSuccessMsg('Text content saved successfully!');
        setIsDirty(false);
        onPlaceholderUpdated(res.data.placeholder);
      }
    } catch {
      setErrorMsg('Network error while saving text content.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveButton = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!buttonText.trim()) {
      setErrorMsg('Button text label is required.');
      return;
    }

    if (buttonUrl.trim() && !isUrlSafe(buttonUrl.trim())) {
      setErrorMsg('Invalid or unsafe URL format (e.g. javascript: links are not allowed).');
      return;
    }

    setIsSaving(true);
    try {
      const payload: ButtonPlaceholderValue = {
        text: buttonText.trim(),
        url: buttonUrl.trim() || undefined,
      };
      const res = await designsApi.updatePlaceholderValue(designId, placeholder.id, payload);
      if (res.error) {
        const msg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setErrorMsg(msg || 'Failed to save button parameters');
      } else if (res.data) {
        setSuccessMsg('Button configuration saved successfully!');
        setIsDirty(false);
        onPlaceholderUpdated(res.data.placeholder);
      }
    } catch {
      setErrorMsg('Network error while saving button configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!linkText.trim()) {
      setErrorMsg('Link text label is required.');
      return;
    }
    if (!linkUrl.trim()) {
      setErrorMsg('Link target URL is required.');
      return;
    }
    if (!isUrlSafe(linkUrl.trim())) {
      setErrorMsg('Invalid or unsafe URL format (e.g. javascript: links are not allowed).');
      return;
    }

    setIsSaving(true);
    try {
      const payload: LinkPlaceholderValue = {
        text: linkText.trim(),
        url: linkUrl.trim(),
      };
      const res = await designsApi.updatePlaceholderValue(designId, placeholder.id, payload);
      if (res.error) {
        const msg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setErrorMsg(msg || 'Failed to save link parameters');
      } else if (res.data) {
        setSuccessMsg('Hyperlink configuration saved successfully!');
        setIsDirty(false);
        onPlaceholderUpdated(res.data.placeholder);
      }
    } catch {
      setErrorMsg('Network error while saving link configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUploading(true);
    try {
      const res = await designsApi.uploadPlaceholderImage(designId, placeholder.id, file);
      if (res.error) {
        const msg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setErrorMsg(msg || 'Failed to upload placeholder image');
      } else if (res.data) {
        setSuccessMsg(`Image "${file.name}" uploaded and attached successfully!`);
        setIsDirty(false);
        onPlaceholderUpdated(res.data.placeholder);
      }
    } catch {
      setErrorMsg('Network error while uploading image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const executeClearValue = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsClearing(true);
    try {
      const res = await designsApi.clearPlaceholderValue(designId, placeholder.id);
      if (res.error) {
        const msg = Array.isArray(res.error.message)
          ? res.error.message.join(', ')
          : res.error.message;
        setErrorMsg(msg || 'Failed to clear placeholder value');
      } else if (res.data) {
        setSuccessMsg('Placeholder value reset to empty.');
        setTextValue('');
        setButtonText('');
        setButtonUrl('');
        setLinkText('');
        setLinkUrl('');
        setIsDirty(false);
        onPlaceholderUpdated(res.data.placeholder);
        setShowClearConfirm(false);
      }
    } catch {
      setErrorMsg('Network error while clearing placeholder.');
    } finally {
      setIsClearing(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-indigo-500/40 bg-zinc-950 p-5 shadow-2xl ring-1 ring-indigo-500/20 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Content Editor
            </span>
            {hasValue ? (
              <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0.2 font-medium">
                ✓ Filled
              </span>
            ) : (
              <span className="rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] px-1.5 py-0.2 font-medium">
                Empty
              </span>
            )}
            {isDirty && (
              <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.2 font-medium animate-pulse">
                ● Unsaved Changes
              </span>
            )}
          </div>
          <button
            onClick={onClearSelection}
            className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400 hover:text-white"
          >
            ✕ Close
          </button>
        </div>

        {/* Metadata Banner */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-zinc-900/60 p-2 border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Role & ID</div>
            <div className="font-semibold text-zinc-200 mt-0.5 truncate">{placeholder.role}</div>
            <div className="font-mono text-[10px] text-zinc-500 truncate">{placeholder.id}</div>
          </div>
          <div className="rounded-lg bg-zinc-900/60 p-2 border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Section & Bounds</div>
            <div className="font-mono text-zinc-200 mt-0.5 truncate">{placeholder.section_id}</div>
            <div className="font-mono text-[10px] text-zinc-500">
              {bounds.width} × {bounds.height}px
            </div>
          </div>
        </div>

        {placeholder.content_hint && (
          <div className="mt-2.5 rounded-lg bg-zinc-900/50 p-2.5 text-[11px] text-zinc-400 border border-zinc-850">
            <span className="text-zinc-500 font-semibold mr-1.5">Design Reference Hint:</span>
            <span className="italic text-zinc-300">&ldquo;{placeholder.content_hint}&rdquo;</span>
          </div>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200">
            ✕
          </button>
        </div>
      )}

      {/* Specific Form per Type */}
      <div className="space-y-4">
        {/* TEXT FORM */}
        {phType === 'text' && (
          <form onSubmit={handleSaveText} className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-semibold text-zinc-300">Text Content</label>
                <span className="text-[11px] font-mono text-zinc-500">
                  {textValue.length} / 10,000 characters
                </span>
              </div>
              <textarea
                rows={4}
                value={textValue}
                placeholder={placeholder.content_hint || 'Enter your custom text...'}
                onChange={(e) => {
                  setTextValue(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              {hasValue ? (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={isClearing || isSaving}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  {isClearing ? 'Clearing...' : 'Clear Content'}
                </button>
              ) : <div />}

              <button
                type="submit"
                disabled={isSaving || !isDirty}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {isSaving && (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
                )}
                {isSaving ? 'Saving...' : 'Save Text'}
              </button>
            </div>
          </form>
        )}

        {/* BUTTON FORM */}
        {phType === 'button' && (
          <form onSubmit={handleSaveButton} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Button Text Label <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={buttonText}
                placeholder={placeholder.content_hint || 'e.g. Get Started'}
                onChange={(e) => {
                  setButtonText(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Target URL or Action Route (Optional)
              </label>
              <input
                type="text"
                value={buttonUrl}
                placeholder="e.g. /pricing, #contact, https://example.com"
                onChange={(e) => {
                  setButtonUrl(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Allowed: relative routes (/about, #section) or secure URLs (https://...).
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              {hasValue ? (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={isClearing || isSaving}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  {isClearing ? 'Clearing...' : 'Clear Button'}
                </button>
              ) : <div />}

              <button
                type="submit"
                disabled={isSaving || !isDirty}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {isSaving && (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
                )}
                {isSaving ? 'Saving...' : 'Save Button'}
              </button>
            </div>
          </form>
        )}

        {/* LINK FORM */}
        {phType === 'link' && (
          <form onSubmit={handleSaveLink} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Link Text Label <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={linkText}
                placeholder={placeholder.content_hint || 'e.g. Features'}
                onChange={(e) => {
                  setLinkText(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Hyperlink Target URL <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={linkUrl}
                placeholder="e.g. #features, /docs, https://example.com"
                onChange={(e) => {
                  setLinkUrl(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              {hasValue ? (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={isClearing || isSaving}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  {isClearing ? 'Clearing...' : 'Clear Link'}
                </button>
              ) : <div />}

              <button
                type="submit"
                disabled={isSaving || !isDirty}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {isSaving && (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
                )}
                {isSaving ? 'Saving...' : 'Save Link'}
              </button>
            </div>
          </form>
        )}

        {/* IMAGE / LOGO UPLOAD FORM */}
        {isImage && (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={(e) => void handleImageFileSelected(e)}
              className="hidden"
            />

            {imageVal?.storage_key ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-3">
                <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 flex items-center justify-center min-h-[160px] max-h-[220px]">
                  {/* Authenticated Image Preview */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={designsApi.getPlaceholderImageUrl(designId, placeholder.id)}
                    alt={imageVal.file_name}
                    className="max-h-[200px] w-auto object-contain rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Filename</div>
                    <div className="font-mono text-zinc-200 truncate">{imageVal.file_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Resolution / Size</div>
                    <div className="font-mono text-zinc-200">
                      {imageVal.width && imageVal.height
                        ? `${imageVal.width}×${imageVal.height}px (${formatFileSize(imageVal.size)})`
                        : formatFileSize(imageVal.size)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    disabled={isClearing}
                    className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    {isClearing ? 'Removing...' : 'Remove Image'}
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
                  >
                    {isUploading && (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
                    )}
                    {isUploading ? 'Uploading...' : 'Replace Image'}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center transition hover:border-indigo-500 hover:bg-zinc-900/70 space-y-2"
              >
                <div className="text-3xl">🖼️</div>
                <h4 className="text-xs font-semibold text-zinc-200">
                  {isUploading ? 'Uploading & inspecting image...' : 'Upload Image Asset'}
                </h4>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  Click to select PNG, JPG, WEBP, GIF, or SVG from your device (Max 10MB).
                </p>
                {isUploading && (
                  <div className="pt-2 flex justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear Placeholder Content"
        description={
          <div>
            <p>
              Are you sure you want to reset and clear content for{' '}
              <span className="font-semibold text-white">&ldquo;{placeholder.role}&rdquo;</span>?
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              The assigned value will be removed and reverted to default.
            </p>
          </div>
        }
        confirmText="Clear Content"
        cancelText="Keep Content"
        isDestructive={true}
        isLoading={isClearing}
        onConfirm={() => void executeClearValue()}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
