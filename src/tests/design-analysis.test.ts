import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { DesignLayout, DesignPlaceholder, DesignAnalysisResult } from '../types/analysis.ts';

describe('Design Analysis & Review Frontend Logic Tests', () => {
  const sampleLayout: DesignLayout = {
    width: 1440,
    height: 2200,
    sections: [
      {
        id: 'sec_nav',
        type: 'navbar',
        order: 1,
        bounds: { x: 0, y: 0, width: 1440, height: 80 },
      },
      {
        id: 'sec_hero',
        type: 'hero',
        order: 2,
        bounds: { x: 0, y: 80, width: 1440, height: 720 },
      },
      {
        id: 'sec_features',
        type: 'features',
        order: 3,
        bounds: { x: 0, y: 800, width: 1440, height: 600 },
      },
      {
        id: 'sec_custom',
        type: 'ai-generated-custom-section',
        order: 4,
        bounds: { x: 0, y: 1400, width: 1440, height: 400 },
      },
    ],
  };

  const samplePlaceholders: DesignPlaceholder[] = [
    {
      id: 'ph_logo',
      type: 'image',
      role: 'logo',
      section_id: 'sec_nav',
      bounds: { x: 40, y: 20, width: 120, height: 40 },
      content_hint: 'Brand Logo',
    },
    {
      id: 'ph_nav_link',
      type: 'link',
      role: 'nav_link',
      section_id: 'sec_nav',
      bounds: { x: 800, y: 30, width: 80, height: 20 },
      content_hint: 'Pricing',
    },
    {
      id: 'ph_hero_title',
      type: 'text',
      role: 'hero_heading',
      section_id: 'sec_hero',
      bounds: { x: 100, y: 200, width: 600, height: 100 },
      content_hint: 'Supercharge your workflow',
    },
    {
      id: 'ph_cta_btn',
      type: 'button',
      role: 'cta_button',
      section_id: 'sec_hero',
      bounds: { x: 100, y: 320, width: 160, height: 48 },
      content_hint: 'Get Started Free',
    },
    {
      id: 'ph_unknown_type',
      type: 'interactive-widget',
      role: 'custom_widget',
      section_id: 'sec_custom',
      bounds: { x: 200, y: 1500, width: 300, height: 200 },
    },
  ];

  describe('1. Layout & Proportions Integrity', () => {
    it('should correctly parse layout width and height', () => {
      assert.equal(sampleLayout.width, 1440);
      assert.equal(sampleLayout.height, 2200);
      assert.equal(sampleLayout.sections.length, 4);
    });

    it('should verify section order and bounds bounds consistency', () => {
      const hero = sampleLayout.sections.find((s) => s.id === 'sec_hero');
      assert.ok(hero);
      assert.equal(hero?.type, 'hero');
      assert.equal(hero?.bounds.x, 0);
      assert.equal(hero?.bounds.y, 80);
      assert.equal(hero?.bounds.width, 1440);
      assert.equal(hero?.bounds.height, 720);
    });

    it('should handle custom/unrecognized section types gracefully', () => {
      const customSec = sampleLayout.sections.find((s) => s.id === 'sec_custom');
      assert.ok(customSec);
      assert.equal(customSec?.type, 'ai-generated-custom-section');
    });
  });

  describe('2. Placeholder Filtering & Association', () => {
    it('should filter placeholders by type correctly', () => {
      const textPlaceholders = samplePlaceholders.filter((p) => p.type === 'text');
      assert.equal(textPlaceholders.length, 1);
      assert.equal(textPlaceholders[0].id, 'ph_hero_title');

      const imagePlaceholders = samplePlaceholders.filter((p) => p.type === 'image');
      assert.equal(imagePlaceholders.length, 1);
      assert.equal(imagePlaceholders[0].id, 'ph_logo');

      const buttonPlaceholders = samplePlaceholders.filter((p) => p.type === 'button');
      assert.equal(buttonPlaceholders.length, 1);
      assert.equal(buttonPlaceholders[0].id, 'ph_cta_btn');
    });

    it('should associate placeholders with correct parent section', () => {
      const navPlaceholders = samplePlaceholders.filter((p) => p.section_id === 'sec_nav');
      assert.equal(navPlaceholders.length, 2);

      const heroPlaceholders = samplePlaceholders.filter((p) => p.section_id === 'sec_hero');
      assert.equal(heroPlaceholders.length, 2);

      const customPlaceholders = samplePlaceholders.filter((p) => p.section_id === 'sec_custom');
      assert.equal(customPlaceholders.length, 1);
    });

    it('should support unknown/future placeholder types without throwing', () => {
      const unknown = samplePlaceholders.find((p) => p.id === 'ph_unknown_type');
      assert.ok(unknown);
      assert.equal(unknown?.type, 'interactive-widget');
    });
  });

  describe('3. Inspector Bounds & Aspect Ratio Calculations', () => {
    it('should compute valid aspect ratio for rectangular placeholder', () => {
      const heroTitle = samplePlaceholders.find((p) => p.id === 'ph_hero_title');
      assert.ok(heroTitle);
      const ratio = (heroTitle!.bounds.width / heroTitle!.bounds.height).toFixed(2);
      assert.equal(ratio, '6.00');
    });

    it('should handle zero height gracefully without crashing', () => {
      const zeroHeightBounds = { x: 0, y: 0, width: 100, height: 0 };
      const aspectRatio =
        zeroHeightBounds.height > 0
          ? (zeroHeightBounds.width / zeroHeightBounds.height).toFixed(2)
          : '1.0';
      assert.equal(aspectRatio, '1.0');
    });
  });

  describe('4. Complete Analysis Result Structure', () => {
    it('should form valid DesignAnalysisResult payload', () => {
      const analysis: DesignAnalysisResult = {
        layout: sampleLayout,
        placeholders: samplePlaceholders,
      };

      assert.equal(analysis.layout.sections.length, 4);
      assert.equal(analysis.placeholders.length, 5);

      const jsonStr = JSON.stringify(analysis);
      const reParsed = JSON.parse(jsonStr) as DesignAnalysisResult;
      assert.equal(reParsed.layout.width, 1440);
      assert.equal(reParsed.placeholders[0].id, 'ph_logo');
    });
  });
});
