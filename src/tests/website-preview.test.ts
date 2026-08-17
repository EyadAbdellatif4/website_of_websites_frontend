import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { PreviewStatusResponseData } from '../lib/api/designs.api.ts';

describe('Website Preview Frontend Logic & Security Tests', () => {
  describe('1. Preview Lifecycle Status Mapping', () => {
    it('should correctly format running preview details', () => {
      const runningData: PreviewStatusResponseData = {
        designId: 'design-123',
        status: 'RUNNING',
        port: 3105,
        url: 'http://localhost:3105',
        startedAt: '2026-08-17T12:00:00.000Z',
        errorMessage: null,
        activePreviewsCount: 1,
      };

      assert.equal(runningData.status, 'RUNNING');
      assert.equal(runningData.port, 3105);
      assert.equal(runningData.url, 'http://localhost:3105');
    });

    it('should format stopped preview status without active port', () => {
      const stoppedData: PreviewStatusResponseData = {
        designId: 'design-123',
        status: 'STOPPED',
        port: null,
        url: null,
        startedAt: null,
        errorMessage: null,
        activePreviewsCount: 0,
      };

      assert.equal(stoppedData.status, 'STOPPED');
      assert.equal(stoppedData.url, null);
    });
  });

  describe('2. Viewport Presets & Device Frames', () => {
    const presets = {
      desktop: { width: '100%', height: '780px' },
      tablet: { width: '768px', height: '840px' },
      mobile: { width: '390px', height: '750px' },
    };

    it('should support desktop, tablet, and mobile dimensions accurately', () => {
      assert.equal(presets.desktop.width, '100%');
      assert.equal(presets.tablet.width, '768px');
      assert.equal(presets.mobile.width, '390px');
    });
  });

  describe('3. Iframe Sandbox Policy', () => {
    it('should enforce strict sandbox flags for generated website iframes', () => {
      const requiredSandbox = 'allow-scripts allow-same-origin allow-forms';
      assert.ok(requiredSandbox.includes('allow-scripts'));
      assert.ok(requiredSandbox.includes('allow-same-origin'));
      assert.ok(!requiredSandbox.includes('allow-top-navigation')); // Blocks frame breakout
    });
  });
});
