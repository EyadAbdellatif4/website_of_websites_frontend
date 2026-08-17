import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isUrlSafe } from '../lib/utils/url.util.ts';
import type {
  DesignPlaceholder,
  ButtonPlaceholderValue,
  LinkPlaceholderValue,
  ImagePlaceholderValue,
} from '../types/analysis.ts';

describe('Placeholder Content Editor Frontend Logic & Validation Tests', () => {
  describe('1. URL Safety & Sanitization Validator', () => {
    it('should approve valid https and http URLs', () => {
      assert.equal(isUrlSafe('https://myhotel.com/booking'), true);
      assert.equal(isUrlSafe('http://example.com'), true);
    });

    it('should approve valid relative paths and anchor links', () => {
      assert.equal(isUrlSafe('/about'), true);
      assert.equal(isUrlSafe('/pricing?plan=pro'), true);
      assert.equal(isUrlSafe('#contact-us'), true);
    });

    it('should approve mailto: and tel: links', () => {
      assert.equal(isUrlSafe('mailto:info@hotel.com'), true);
      assert.equal(isUrlSafe('tel:+1234567890'), true);
    });

    it('should REJECT dangerous javascript: script execution URLs', () => {
      assert.equal(isUrlSafe('javascript:alert(document.cookie)'), false);
      assert.equal(isUrlSafe('JAVASCRIPT:alert(1)'), false);
      assert.equal(isUrlSafe('  javascript:void(0)'), false);
    });

    it('should REJECT dangerous data: and vbscript: URLs', () => {
      assert.equal(isUrlSafe('data:text/html,<script>alert(1)</script>'), false);
      assert.equal(isUrlSafe('vbscript:msgbox(1)'), false);
      assert.equal(isUrlSafe('file:///etc/passwd'), false);
    });

    it('should return false for empty or null URLs', () => {
      assert.equal(isUrlSafe(''), false);
    });
  });

  describe('2. Form Payload Structuring', () => {
    it('should construct valid Button placeholder value payload', () => {
      const buttonVal: ButtonPlaceholderValue = {
        text: 'Book A Room',
        url: '/booking',
      };
      assert.equal(buttonVal.text, 'Book A Room');
      assert.equal(buttonVal.url, '/booking');
      assert.ok(isUrlSafe(buttonVal.url!));
    });

    it('should construct valid Link placeholder value payload', () => {
      const linkVal: LinkPlaceholderValue = {
        text: 'Explore Amenities',
        url: '#amenities',
      };
      assert.equal(linkVal.text, 'Explore Amenities');
      assert.equal(linkVal.url, '#amenities');
      assert.ok(isUrlSafe(linkVal.url));
    });

    it('should construct valid Image placeholder metadata payload', () => {
      const imageVal: ImagePlaceholderValue = {
        storage_key: 'designs/user-1/design-1/content/ph_hero/hotel.jpg',
        file_name: 'hotel.jpg',
        width: 1920,
        height: 1080,
        size: 204800,
        mime_type: 'image/jpeg',
      };
      assert.equal(imageVal.width, 1920);
      assert.equal(imageVal.height, 1080);
      assert.equal(imageVal.mime_type, 'image/jpeg');
    });
  });

  describe('3. Completion Progress Calculations', () => {
    const placeholders: DesignPlaceholder[] = [
      {
        id: 'ph_1',
        type: 'text',
        role: 'heading',
        section_id: 'hero',
        bounds: { x: 0, y: 0, width: 100, height: 50 },
        value: 'Welcome to our hotel',
      },
      {
        id: 'ph_2',
        type: 'image',
        role: 'hero_img',
        section_id: 'hero',
        bounds: { x: 0, y: 0, width: 100, height: 50 },
        value: {
          storage_key: 'key',
          file_name: 'hero.png',
          width: 800,
          height: 600,
          size: 1000,
          mime_type: 'image/png',
        },
      },
      {
        id: 'ph_3',
        type: 'button',
        role: 'cta',
        section_id: 'hero',
        bounds: { x: 0, y: 0, width: 100, height: 50 },
        value: null,
      },
      {
        id: 'ph_4',
        type: 'link',
        role: 'nav',
        section_id: 'hero',
        bounds: { x: 0, y: 0, width: 100, height: 50 },
        value: undefined,
      },
    ];

    it('should accurately calculate filled vs unfilled counts and percentage', () => {
      const filled = placeholders.filter(
        (p) => p.value !== null && p.value !== undefined && p.value !== ''
      ).length;
      const total = placeholders.length;
      const pct = Math.round((filled / total) * 100);

      assert.equal(filled, 2);
      assert.equal(total, 4);
      assert.equal(pct, 50);
    });

    it('should handle zero placeholders without NaN', () => {
      const emptyList: DesignPlaceholder[] = [];
      const filled = emptyList.filter(
        (p) => p.value !== null && p.value !== undefined && p.value !== ''
      ).length;
      const total = emptyList.length;
      const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

      assert.equal(pct, 0);
    });

    it('should filter between filled and unfilled placeholders accurately', () => {
      const filledList = placeholders.filter(
        (p) => p.value !== null && p.value !== undefined && p.value !== ''
      );
      const unfilledList = placeholders.filter(
        (p) => p.value === null || p.value === undefined || p.value === ''
      );

      assert.equal(filledList.length, 2);
      assert.equal(unfilledList.length, 2);
      assert.equal(filledList[0].id, 'ph_1');
      assert.equal(unfilledList[0].id, 'ph_3');
    });
  });
});
