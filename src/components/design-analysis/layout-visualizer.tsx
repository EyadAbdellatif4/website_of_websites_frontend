'use client';

import React, { useState, useMemo } from 'react';
import { DesignLayout, DesignPlaceholder, DesignSection, SectionStyles } from '../../types/analysis';
import { designsApi } from '../../lib/api/designs.api';

interface LayoutVisualizerProps {
  layout: DesignLayout;
  placeholders: DesignPlaceholder[];
  selectedPlaceholderId: string | null;
  onSelectPlaceholder: (id: string | null) => void;
  designId?: string;
  onSectionStylesUpdated?: (sectionId: string, styles: SectionStyles) => void;
}

interface SectionTheme {
  border: string;
  bg: string;
  badgeBg: string;
  text: string;
  icon: string;
  stroke: string;
}

const SECTION_THEMES: Record<string, SectionTheme> = {
  header: {
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-950/20',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    text: 'text-cyan-400',
    icon: '🧭',
    stroke: '#06b6d4',
  },
  navbar: {
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-950/20',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    text: 'text-cyan-400',
    icon: '🧭',
    stroke: '#06b6d4',
  },
  hero: {
    border: 'border-indigo-500/40',
    bg: 'bg-indigo-950/20',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    text: 'text-indigo-400',
    icon: '⚡',
    stroke: '#6366f1',
  },
  features: {
    border: 'border-purple-500/40',
    bg: 'bg-purple-950/20',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    text: 'text-purple-400',
    icon: '🧩',
    stroke: '#a855f7',
  },
  services: {
    border: 'border-blue-500/40',
    bg: 'bg-blue-950/20',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    text: 'text-blue-400',
    icon: '💼',
    stroke: '#3b82f6',
  },
  about: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-950/20',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    text: 'text-emerald-400',
    icon: '📖',
    stroke: '#10b981',
  },
  testimonials: {
    border: 'border-amber-500/40',
    bg: 'bg-amber-950/20',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    text: 'text-amber-400',
    icon: '💬',
    stroke: '#f59e0b',
  },
  pricing: {
    border: 'border-rose-500/40',
    bg: 'bg-rose-950/20',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    text: 'text-rose-400',
    icon: '💳',
    stroke: '#f43f5e',
  },
  gallery: {
    border: 'border-teal-500/40',
    bg: 'bg-teal-950/20',
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    text: 'text-teal-400',
    icon: '🖼️',
    stroke: '#14b8a6',
  },
  contact: {
    border: 'border-orange-500/40',
    bg: 'bg-orange-950/20',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    text: 'text-orange-400',
    icon: '✉️',
    stroke: '#f97316',
  },
  footer: {
    border: 'border-zinc-600/40',
    bg: 'bg-zinc-900/40',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    text: 'text-zinc-400',
    icon: '⚓',
    stroke: '#71717a',
  },
};

const DEFAULT_THEME: SectionTheme = {
  border: 'border-zinc-700/50',
  bg: 'bg-zinc-900/30',
  badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  text: 'text-zinc-300',
  icon: '📦',
  stroke: '#71717a',
};

const PLACEHOLDER_TYPE_CONFIG: Record<
  string,
  { label: string; icon: string; border: string; bg: string; text: string }
> = {
  text: {
    label: 'Text',
    icon: '📝',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
  },
  image: {
    label: 'Image',
    icon: '🖼️',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
  },
  button: {
    label: 'Button',
    icon: '🔘',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
  },
  link: {
    label: 'Link',
    icon: '🔗',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
  },
  icon: {
    label: 'Icon',
    icon: '⭐',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-300',
  },
  video: {
    label: 'Video',
    icon: '🎬',
    border: 'border-rose-500/40',
    bg: 'bg-rose-500/10',
    text: 'text-rose-300',
  },
  logo: {
    label: 'Logo',
    icon: '🏷️',
    border: 'border-teal-500/40',
    bg: 'bg-teal-500/10',
    text: 'text-teal-300',
  },
};

const PRESET_BG_COLORS = ['#09090b', '#0f172a', '#18181b', '#022c22', '#1e1b4b', '#ffffff'];
const PRESET_TEXT_COLORS = ['#ffffff', '#f4f4f5', '#94a3b8', '#38bdf8', '#09090b'];
const PRESET_ACCENT_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

export function LayoutVisualizer({
  layout,
  placeholders,
  selectedPlaceholderId,
  onSelectPlaceholder,
  designId,
  onSectionStylesUpdated,
}: LayoutVisualizerProps) {
  const [viewMode, setViewMode] = useState<'structured' | 'spatial'>('structured');
  const [activeFilterSection, setActiveFilterSection] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Section Color Palette Customization State
  const [editingSectionStyleId, setEditingSectionStyleId] = useState<string | null>(null);
  const [customStyles, setCustomStyles] = useState<Record<string, SectionStyles>>({});
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);
  const [saveSuccessSectionId, setSaveSuccessSectionId] = useState<string | null>(null);

  const canvasWidth = layout.width || 1280;
  const canvasHeight = layout.height || 2000;

  const sections: DesignSection[] = layout.sections ?? [];
  const validPlaceholders: DesignPlaceholder[] = placeholders ?? [];

  const filledCount = validPlaceholders.filter(
    (p) => p.value !== null && p.value !== undefined && p.value !== '',
  ).length;

  // Group placeholders by section ID
  const placeholdersBySection = useMemo(() => {
    const map = new Map<string, DesignPlaceholder[]>();
    const currentSections = layout.sections ?? [];
    const currentPlaceholders = placeholders ?? [];

    for (const sec of currentSections) {
      map.set(sec.id, []);
    }
    for (const ph of currentPlaceholders) {
      const list = map.get(ph.section_id);
      if (list) {
        list.push(ph);
      } else {
        const unmapped = map.get('unmapped') || [];
        unmapped.push(ph);
        map.set('unmapped', unmapped);
      }
    }
    return map;
  }, [layout.sections, placeholders]);

  const handleStyleChange = (sectionId: string, key: keyof SectionStyles, val: string) => {
    setCustomStyles((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || sections.find((s) => s.id === sectionId)?.styles || {}),
        [key]: val,
      },
    }));
  };

  const handleSaveSectionStyles = async (section: DesignSection) => {
    if (!designId) return;
    const stylesToSave = customStyles[section.id] || section.styles || {};
    setSavingSectionId(section.id);
    try {
      const res = await designsApi.updateSectionStyles(designId, section.id, stylesToSave);
      if (res.data) {
        setSaveSuccessSectionId(section.id);
        if (onSectionStylesUpdated) {
          onSectionStylesUpdated(section.id, stylesToSave);
        }
        setTimeout(() => {
          setSaveSuccessSectionId(null);
          setEditingSectionStyleId(null);
        }, 1500);
      }
    } catch {
      // ignore
    } finally {
      setSavingSectionId(null);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl overflow-hidden">
      {/* Top Header & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-zinc-400">
          <span className="flex items-center gap-1.5 font-bold text-white">
            <span>🎨</span>
            <span>Design Blueprint & Layout</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="font-mono text-zinc-400">
            {canvasWidth} × {canvasHeight}px
          </span>
          <span className="text-zinc-600">•</span>
          <span className="rounded bg-zinc-800 text-zinc-300 px-2 py-0.5 font-medium">
            {sections.length} Sections
          </span>
          <span className="text-zinc-600">•</span>
          <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 font-medium">
            {filledCount} / {validPlaceholders.length} Filled
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-zinc-950 rounded-lg p-1 border border-zinc-800">
          <button
            onClick={() => setViewMode('structured')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
              viewMode === 'structured'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>📑</span>
            <span>Section Blueprint</span>
          </button>
          <button
            onClick={() => setViewMode('spatial')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
              viewMode === 'spatial'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🗺️</span>
            <span>2D Canvas Map</span>
          </button>
        </div>
      </div>

      {/* Section Quick Jump Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-zinc-850 bg-zinc-950/60 px-4 py-2 text-xs scrollbar-none">
        <button
          onClick={() => setActiveFilterSection(null)}
          className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
            activeFilterSection === null
              ? 'bg-zinc-200 text-zinc-900 font-bold shadow'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          All Sections ({sections.length})
        </button>
        {sections.map((sec, idx) => {
          const theme = SECTION_THEMES[sec.type?.toLowerCase()] || DEFAULT_THEME;
          const secPlaceholders = placeholdersBySection.get(sec.id) || [];
          const isCurrent = activeFilterSection === sec.id;

          return (
            <button
              key={sec.id || idx}
              onClick={() => setActiveFilterSection(isCurrent ? null : sec.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition border ${
                isCurrent
                  ? `${theme.badgeBg} font-bold shadow`
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <span>{theme.icon}</span>
              <span className="capitalize">{sec.type || 'Section'}</span>
              <span className="text-[10px] opacity-70">({secPlaceholders.length})</span>
            </button>
          );
        })}
      </div>

      {/* MAIN VIEW: Mode 1 - Structured Section Blueprint */}
      {viewMode === 'structured' && (
        <div className="max-h-[640px] overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
          {sections.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs">
              No sections detected in this layout.
            </div>
          ) : (
            sections
              .filter((sec) => activeFilterSection === null || sec.id === activeFilterSection)
              .map((section, idx) => {
                const theme = SECTION_THEMES[section.type?.toLowerCase()] || DEFAULT_THEME;
                const sectionPlaceholders = placeholdersBySection.get(section.id) || [];
                const filledSecCount = sectionPlaceholders.filter(
                  (p) => p.value !== null && p.value !== undefined && p.value !== '',
                ).length;

                const activeStyles = customStyles[section.id] || section.styles || {};
                const isEditingStyles = editingSectionStyleId === section.id;
                const isSaving = savingSectionId === section.id;
                const isSaved = saveSuccessSectionId === section.id;

                const currentBg = activeStyles.background_color || '#09090b';
                const currentText = activeStyles.text_color || '#fafafa';
                const currentPrimary = activeStyles.primary_color || theme.stroke;
                const currentSecondary = activeStyles.secondary_color || '#06b6d4';

                return (
                  <div
                    key={section.id || idx}
                    className={`rounded-xl border ${theme.border} ${theme.bg} p-4 space-y-3 transition-all duration-200 hover:border-zinc-600`}
                    style={{
                      backgroundColor: activeStyles.background_color
                        ? `${activeStyles.background_color}18`
                        : undefined,
                    }}
                  >
                    {/* Section Header Card */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{theme.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-bold capitalize ${theme.text}`}>
                              {section.type || 'Section'} Section
                            </h3>
                            <span className="rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono px-1.5 py-0.5">
                              #{section.order ?? idx + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                            <span>
                              {section.bounds.width} × {section.bounds.height}px
                            </span>
                            <span>•</span>
                            <span>
                              (x: {section.bounds.x}, y: {section.bounds.y})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Section Color Customizer Button */}
                        {designId && (
                          <button
                            onClick={() =>
                              setEditingSectionStyleId((prev) =>
                                prev === section.id ? null : section.id,
                              )
                            }
                            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                              isEditingStyles
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                            }`}
                          >
                            <span>🎨</span>
                            <span>{isEditingStyles ? 'Close Palette' : 'Customize Colors'}</span>
                          </button>
                        )}

                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            filledSecCount === sectionPlaceholders.length &&
                            sectionPlaceholders.length > 0
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : filledSecCount > 0
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {filledSecCount} / {sectionPlaceholders.length} Configured
                        </span>
                      </div>
                    </div>

                    {/* SECTION COLOR CUSTOMIZER ACCORDION */}
                    {isEditingStyles && (
                      <div className="rounded-xl border border-indigo-500/30 bg-zinc-950 p-4 space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            <span>🎨</span>
                            <span>Section Color Palette & Styling</span>
                          </h4>
                          <span className="text-[11px] text-zinc-400">
                            Updates live generator styles
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                          {/* 1. Background Color */}
                          <div className="space-y-1.5">
                            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                              <span
                                className="h-3 w-3 rounded-full border border-zinc-700"
                                style={{ backgroundColor: currentBg }}
                              />
                              Background Color:
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={currentBg}
                                onChange={(e) =>
                                  handleStyleChange(section.id, 'background_color', e.target.value)
                                }
                                className="h-8 w-10 cursor-pointer rounded border border-zinc-800 bg-zinc-900 p-0.5"
                              />
                              <input
                                type="text"
                                value={currentBg}
                                onChange={(e) =>
                                  handleStyleChange(section.id, 'background_color', e.target.value)
                                }
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-200"
                              />
                            </div>
                            <div className="flex items-center gap-1 pt-1">
                              {PRESET_BG_COLORS.map((c) => (
                                <button
                                  key={c}
                                  onClick={() =>
                                    handleStyleChange(section.id, 'background_color', c)
                                  }
                                  style={{ backgroundColor: c }}
                                  className="h-4 w-4 rounded-full border border-zinc-700 hover:scale-125 transition-transform"
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>

                          {/* 2. Text Color */}
                          <div className="space-y-1.5">
                            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                              <span
                                className="h-3 w-3 rounded-full border border-zinc-700"
                                style={{ backgroundColor: currentText }}
                              />
                              Text Color:
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={currentText}
                                onChange={(e) =>
                                  handleStyleChange(section.id, 'text_color', e.target.value)
                                }
                                className="h-8 w-10 cursor-pointer rounded border border-zinc-800 bg-zinc-900 p-0.5"
                              />
                              <input
                                type="text"
                                value={currentText}
                                onChange={(e) =>
                                  handleStyleChange(section.id, 'text_color', e.target.value)
                                }
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-200"
                              />
                            </div>
                            <div className="flex items-center gap-1 pt-1">
                              {PRESET_TEXT_COLORS.map((c) => (
                                <button
                                  key={c}
                                  onClick={() => handleStyleChange(section.id, 'text_color', c)}
                                  style={{ backgroundColor: c }}
                                  className="h-4 w-4 rounded-full border border-zinc-700 hover:scale-125 transition-transform"
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>

                          {/* 3. Primary Accent / Button Color */}
                          <div className="space-y-1.5">
                            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                              <span
                                className="h-3 w-3 rounded-full border border-zinc-700"
                                style={{ backgroundColor: currentPrimary }}
                              />
                              Primary Accent / Button:
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={currentPrimary}
                                onChange={(e) =>
                                  handleStyleChange(section.id, 'primary_color', e.target.value)
                                }
                                className="h-8 w-10 cursor-pointer rounded border border-zinc-800 bg-zinc-900 p-0.5"
                              />
                              <input
                                type="text"
                                value={currentPrimary}
                                onChange={(e) =>
                                  handleStyleChange(section.id, 'primary_color', e.target.value)
                                }
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-200"
                              />
                            </div>
                            <div className="flex items-center gap-1 pt-1">
                              {PRESET_ACCENT_COLORS.map((c) => (
                                <button
                                  key={c}
                                  onClick={() => handleStyleChange(section.id, 'primary_color', c)}
                                  style={{ backgroundColor: c }}
                                  className="h-4 w-4 rounded-full border border-zinc-700 hover:scale-125 transition-transform"
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>

                          {/* 4. Secondary Accent */}
                          <div className="space-y-1.5">
                            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                              <span
                                className="h-3 w-3 rounded-full border border-zinc-700"
                                style={{ backgroundColor: currentSecondary }}
                              />
                              Secondary Accent:
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={currentSecondary}
                                onChange={(e) =>
                                  handleStyleChange(section.id, 'secondary_color', e.target.value)
                                }
                                className="h-8 w-10 cursor-pointer rounded border border-zinc-800 bg-zinc-900 p-0.5"
                              />
                              <input
                                type="text"
                                value={currentSecondary}
                                onChange={(e) =>
                                  handleStyleChange(section.id, 'secondary_color', e.target.value)
                                }
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-200"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Save Palette CTA */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
                          {isSaved && (
                            <span className="text-xs text-emerald-400 font-semibold animate-pulse mr-2">
                              ✓ Section Palette Saved!
                            </span>
                          )}
                          <button
                            onClick={() => void handleSaveSectionStyles(section)}
                            disabled={isSaving}
                            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
                          >
                            {isSaving ? 'Saving Palette...' : '💾 Save Section Palette'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Section Placeholders Container */}
                    {sectionPlaceholders.length === 0 ? (
                      <div className="rounded-lg bg-zinc-950/60 p-3 text-center text-xs text-zinc-500 italic border border-dashed border-zinc-850">
                        No placeholders detected for this section.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {sectionPlaceholders.map((ph) => {
                          const isSelected = selectedPlaceholderId === ph.id;
                          const hasValue =
                            ph.value !== null && ph.value !== undefined && ph.value !== '';
                          const pType =
                            PLACEHOLDER_TYPE_CONFIG[ph.type?.toLowerCase()] ||
                            PLACEHOLDER_TYPE_CONFIG.text;

                          let valuePreview = '';
                          if (hasValue) {
                            if (typeof ph.value === 'string') {
                              valuePreview = ph.value;
                            } else if (typeof ph.value === 'object' && ph.value !== null) {
                              const valObj = ph.value as Record<string, unknown>;
                              valuePreview =
                                (valObj.text as string) ||
                                (valObj.file_name as string) ||
                                (valObj.src as string) ||
                                'Custom Config';
                            }
                          }

                          return (
                            <div
                              key={ph.id}
                              onClick={() => onSelectPlaceholder(isSelected ? null : ph.id)}
                              className={`group cursor-pointer rounded-xl border p-3 transition-all duration-150 ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-950/40 shadow-lg ring-1 ring-indigo-500'
                                  : hasValue
                                  ? 'border-emerald-500/40 bg-zinc-900/80 hover:border-emerald-500/70 hover:bg-zinc-900'
                                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900/90'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{pType.icon}</span>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-zinc-200 capitalize">
                                        {ph.role || ph.type}
                                      </span>
                                      <span
                                        className={`rounded text-[10px] font-semibold px-1.5 py-0.2 border ${pType.bg} ${pType.border} ${pType.text}`}
                                      >
                                        {pType.label}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                      {ph.bounds.width} × {ph.bounds.height}px
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  {hasValue ? (
                                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold">
                                      ✓ Ready
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-zinc-800 text-zinc-400 px-2 py-0.5 text-[10px] font-medium">
                                      ⚪ Empty
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Value Preview or Hint */}
                              <div className="mt-2 text-xs">
                                {hasValue ? (
                                  <div className="rounded bg-zinc-950/80 p-2 font-mono text-[11px] text-emerald-300 truncate border border-emerald-500/20">
                                    {valuePreview}
                                  </div>
                                ) : ph.content_hint ? (
                                  <div className="rounded bg-zinc-950/50 p-2 text-[11px] text-zinc-400 truncate italic border border-zinc-850">
                                    Hint: &ldquo;{ph.content_hint}&rdquo;
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-zinc-500 italic">
                                    Click to configure content
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* MAIN VIEW: Mode 2 - 2D Coordinate Scaled Canvas */}
      {viewMode === 'spatial' && (
        <div className="flex flex-col bg-zinc-950 p-4 space-y-3">
          {/* Spatial Zoom Control */}
          <div className="flex items-center justify-between text-xs text-zinc-400 px-2">
            <span>Canvas Viewport Scale:</span>
            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              {[50, 75, 100, 150].map((z) => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    zoomLevel === z
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {z}%
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 max-h-[580px] flex justify-center">
            <div style={{ width: `${(canvasWidth * zoomLevel) / 100}px`, maxWidth: 'none' }}>
              <svg
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                className="w-full h-auto rounded-lg shadow-2xl bg-zinc-950"
              >
                <defs>
                  <pattern
                    id="grid-blueprint"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="#27272a"
                      strokeWidth="0.5"
                      strokeOpacity="0.4"
                    />
                  </pattern>
                </defs>

                <rect width={canvasWidth} height={canvasHeight} fill="url(#grid-blueprint)" />

                {/* Sections */}
                {sections.map((sec, idx) => {
                  const theme = SECTION_THEMES[sec.type?.toLowerCase()] || DEFAULT_THEME;
                  const bounds = sec.bounds || { x: 0, y: 0, width: canvasWidth, height: 100 };
                  const activeStyles = customStyles[sec.id] || sec.styles || {};
                  const strokeColor = activeStyles.primary_color || theme.stroke;

                  return (
                    <g key={sec.id || idx}>
                      <rect
                        x={bounds.x}
                        y={bounds.y}
                        width={bounds.width}
                        height={bounds.height}
                        fill={activeStyles.background_color || strokeColor}
                        fillOpacity="0.08"
                        stroke={strokeColor}
                        strokeWidth="2"
                        strokeDasharray="6 3"
                        rx="8"
                      />
                      <rect
                        x={bounds.x + 12}
                        y={bounds.y + 12}
                        width={Math.min(bounds.width - 24, 220)}
                        height="32"
                        rx="6"
                        fill="#18181b"
                        stroke={strokeColor}
                        strokeWidth="1.5"
                      />
                      <text
                        x={bounds.x + 24}
                        y={bounds.y + 33}
                        fill={activeStyles.text_color || strokeColor}
                        fontSize="14"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {theme.icon} {sec.type?.toUpperCase()} #{sec.order ?? idx + 1}
                      </text>
                    </g>
                  );
                })}

                {/* Placeholders */}
                {validPlaceholders.map((ph, idx) => {
                  const isSelected = selectedPlaceholderId === ph.id;
                  const hasValue = ph.value !== null && ph.value !== undefined && ph.value !== '';
                  const bounds = ph.bounds || { x: 0, y: 0, width: 60, height: 30 };
                  const pConfig =
                    PLACEHOLDER_TYPE_CONFIG[ph.type?.toLowerCase()] || PLACEHOLDER_TYPE_CONFIG.text;

                  const stroke = isSelected ? '#38bdf8' : hasValue ? '#10b981' : '#818cf8';
                  const fill = isSelected
                    ? 'rgba(56, 189, 248, 0.35)'
                    : hasValue
                    ? 'rgba(16, 185, 129, 0.25)'
                    : 'rgba(99, 102, 241, 0.15)';

                  return (
                    <g
                      key={ph.id || idx}
                      onClick={() => onSelectPlaceholder(isSelected ? null : ph.id)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={bounds.x}
                        y={bounds.y}
                        width={bounds.width}
                        height={bounds.height}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isSelected ? 3 : 1.5}
                        rx="6"
                      />
                      <text
                        x={bounds.x + 8}
                        y={bounds.y + 18}
                        fill={stroke}
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {pConfig.icon} {hasValue ? '✓ ' : ''}
                        {ph.role || ph.type}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-[11px] text-zinc-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-zinc-300">Placeholder Legend:</span>
          {Object.entries(PLACEHOLDER_TYPE_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1">
              <span>{config.icon}</span>
              <span className="capitalize">{config.label}</span>
            </div>
          ))}
        </div>
        <div className="text-emerald-400 font-medium">
          💡 Click any placeholder card to edit content or &ldquo;Customize Colors&rdquo; to edit section palette
        </div>
      </div>
    </div>
  );
}
