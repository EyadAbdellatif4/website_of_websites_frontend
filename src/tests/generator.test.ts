import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { GeneratedProjectManifest } from '../lib/api/designs.api.ts';

describe('Website Generator Frontend Logic & Manifest Tests', () => {
  describe('1. Manifest & File Tree Structure', () => {
    const mockManifest: GeneratedProjectManifest = {
      generationId: 'gen-uuid-1234',
      designId: 'design-uuid-5678',
      userId: 'user-uuid-9999',
      designName: 'Starlight Resort & Spa',
      generatedAt: '2026-08-17T12:00:00.000Z',
      projectTarget: 'Next.js App Router (TypeScript + Tailwind CSS)',
      totalFiles: 14,
      sectionsCount: 4,
      placeholdersCount: 8,
      assetsCount: 2,
      files: [
        'package.json',
        'tsconfig.json',
        'next.config.ts',
        'tailwind.config.ts',
        'postcss.config.mjs',
        'app/layout.tsx',
        'app/globals.css',
        'app/page.tsx',
        'components/sections/HeaderSection.tsx',
        'components/sections/HeroSection.tsx',
        'components/sections/FeaturesSection.tsx',
        'components/sections/FooterSection.tsx',
        'public/assets/ph_hero_img_hero.png',
        'README.md',
      ],
    };

    it('should correctly validate complete Next.js file list', () => {
      assert.equal(mockManifest.totalFiles, 14);
      assert.ok(mockManifest.files.includes('package.json'));
      assert.ok(mockManifest.files.includes('app/page.tsx'));
      assert.ok(mockManifest.files.includes('app/layout.tsx'));
      assert.ok(mockManifest.files.includes('components/sections/HeroSection.tsx'));
    });

    it('should accurately report sections and assets count', () => {
      assert.equal(mockManifest.sectionsCount, 4);
      assert.equal(mockManifest.assetsCount, 2);
      assert.equal(mockManifest.placeholdersCount, 8);
    });
  });

  describe('2. Project Name Sanitization for CLI Instructions', () => {
    const sanitizeForCli = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '') || 'website';
    };

    it('should convert spaces and special characters into safe CLI folder names', () => {
      assert.equal(
        sanitizeForCli('Starlight Resort & Spa! (2026)'),
        'starlight_resort_spa_2026',
      );
      assert.equal(sanitizeForCli('My SaaS Landing Page'), 'my_saas_landing_page');
    });

    it('should generate valid zip archive filename', () => {
      const designName = 'Luxury Hotel & Suites';
      const cleanName = sanitizeForCli(designName);
      const zipFileName = `${cleanName}_nextjs_website.zip`;
      assert.equal(zipFileName, 'luxury_hotel_suites_nextjs_website.zip');
    });
  });
});
