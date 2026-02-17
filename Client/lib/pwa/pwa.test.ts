import { describe, it, expect } from 'vitest';
import {
  SPECTREE_MANIFEST,
  generateManifest,
  checkPwaSupport,
  requestNotificationPermission,
  cacheStrategies,
  getInstallPromptStatus,
} from './pwa-config';
import {
  BREAKPOINTS,
  getBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
  getColumnsForBreakpoint,
  clampFontSize,
  getTouchTarget,
} from './responsive-utils';
import type { Breakpoint } from './responsive-utils';

// ─── PWA Config Tests ──────────────────────────────────────────────

describe('SPECTREE_MANIFEST', () => {
  it('has the required name field', () => {
    expect(SPECTREE_MANIFEST.name).toBe('SpecTree');
  });

  it('has the required short_name field', () => {
    expect(SPECTREE_MANIFEST.short_name).toBe('SpecTree');
  });

  it('has a non-empty description', () => {
    expect(SPECTREE_MANIFEST.description.length).toBeGreaterThan(0);
  });

  it('has a valid start_url', () => {
    expect(SPECTREE_MANIFEST.start_url).toBe('/');
  });

  it('has a valid display mode', () => {
    const validModes = ['standalone', 'fullscreen', 'minimal-ui', 'browser'];
    expect(validModes).toContain(SPECTREE_MANIFEST.display);
  });

  it('has a valid hex theme_color', () => {
    expect(SPECTREE_MANIFEST.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('has a valid hex background_color', () => {
    expect(SPECTREE_MANIFEST.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('includes at least one icon', () => {
    expect(SPECTREE_MANIFEST.icons.length).toBeGreaterThanOrEqual(1);
  });

  it('icons have src, sizes, and type properties', () => {
    SPECTREE_MANIFEST.icons.forEach((icon) => {
      expect(icon).toHaveProperty('src');
      expect(icon).toHaveProperty('sizes');
      expect(icon).toHaveProperty('type');
    });
  });
});

describe('generateManifest', () => {
  it('returns default manifest when called without arguments', () => {
    const manifest = generateManifest();
    expect(manifest.name).toBe('SpecTree');
    expect(manifest.theme_color).toBe('#7c3aed');
  });

  it('returns a new object (not the same reference as the default)', () => {
    const manifest = generateManifest();
    expect(manifest).not.toBe(SPECTREE_MANIFEST);
  });

  it('merges name override', () => {
    const manifest = generateManifest({ name: 'Custom App' });
    expect(manifest.name).toBe('Custom App');
    expect(manifest.short_name).toBe('SpecTree');
  });

  it('merges theme_color override', () => {
    const manifest = generateManifest({ theme_color: '#000000' });
    expect(manifest.theme_color).toBe('#000000');
  });

  it('allows overriding icons', () => {
    const customIcons = [{ src: '/custom.png', sizes: '64x64', type: 'image/png' }];
    const manifest = generateManifest({ icons: customIcons });
    expect(manifest.icons).toEqual(customIcons);
  });

  it('preserves default icons when not overridden', () => {
    const manifest = generateManifest({ name: 'Other' });
    expect(manifest.icons).toEqual(SPECTREE_MANIFEST.icons);
  });
});

describe('checkPwaSupport', () => {
  it('returns an object with serviceWorker, manifest, and notifications keys', () => {
    const support = checkPwaSupport();
    expect(support).toHaveProperty('serviceWorker');
    expect(support).toHaveProperty('manifest');
    expect(support).toHaveProperty('notifications');
  });

  it('returns boolean values for all fields', () => {
    const support = checkPwaSupport();
    expect(typeof support.serviceWorker).toBe('boolean');
    expect(typeof support.manifest).toBe('boolean');
    expect(typeof support.notifications).toBe('boolean');
  });
});

describe('requestNotificationPermission', () => {
  it('returns a string result', async () => {
    const result = await requestNotificationPermission();
    expect(typeof result).toBe('string');
  });
});

describe('cacheStrategies', () => {
  it('has staleWhileRevalidate strategy', () => {
    expect(cacheStrategies.staleWhileRevalidate).toBeDefined();
    expect(cacheStrategies.staleWhileRevalidate.name).toBe('stale-while-revalidate');
  });

  it('has cacheFirst strategy', () => {
    expect(cacheStrategies.cacheFirst).toBeDefined();
    expect(cacheStrategies.cacheFirst.name).toBe('cache-first');
  });

  it('has networkFirst strategy', () => {
    expect(cacheStrategies.networkFirst).toBeDefined();
    expect(cacheStrategies.networkFirst.name).toBe('network-first');
  });

  it('each strategy has a non-empty description', () => {
    expect(cacheStrategies.staleWhileRevalidate.description.length).toBeGreaterThan(0);
    expect(cacheStrategies.cacheFirst.description.length).toBeGreaterThan(0);
    expect(cacheStrategies.networkFirst.description.length).toBeGreaterThan(0);
  });
});

describe('getInstallPromptStatus', () => {
  it('returns one of the expected status strings', () => {
    const status = getInstallPromptStatus();
    expect(['available', 'installed', 'unsupported']).toContain(status);
  });
});

// ─── Responsive Utils Tests ────────────────────────────────────────

describe('BREAKPOINTS', () => {
  it('has all six breakpoint sizes', () => {
    const keys: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    keys.forEach((key) => {
      expect(BREAKPOINTS[key]).toBeDefined();
    });
  });

  it('xs starts at 0', () => {
    expect(BREAKPOINTS.xs).toBe(0);
  });

  it('breakpoints are in ascending order', () => {
    const ordered: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    for (let i = 1; i < ordered.length; i++) {
      expect(BREAKPOINTS[ordered[i]]).toBeGreaterThan(BREAKPOINTS[ordered[i - 1]]);
    }
  });

  it('md is 768', () => {
    expect(BREAKPOINTS.md).toBe(768);
  });

  it('lg is 1024', () => {
    expect(BREAKPOINTS.lg).toBe(1024);
  });
});

describe('getBreakpoint', () => {
  it('returns xs for width 0', () => {
    expect(getBreakpoint(0)).toBe('xs');
  });

  it('returns xs for width 320', () => {
    expect(getBreakpoint(320)).toBe('xs');
  });

  it('returns sm for width 640', () => {
    expect(getBreakpoint(640)).toBe('sm');
  });

  it('returns md for width 768', () => {
    expect(getBreakpoint(768)).toBe('md');
  });

  it('returns lg for width 1024', () => {
    expect(getBreakpoint(1024)).toBe('lg');
  });

  it('returns xl for width 1280', () => {
    expect(getBreakpoint(1280)).toBe('xl');
  });

  it('returns 2xl for width 1536', () => {
    expect(getBreakpoint(1536)).toBe('2xl');
  });

  it('returns 2xl for very large width', () => {
    expect(getBreakpoint(3000)).toBe('2xl');
  });
});

describe('isMobile', () => {
  it('returns true for width 320', () => {
    expect(isMobile(320)).toBe(true);
  });

  it('returns true for width 767', () => {
    expect(isMobile(767)).toBe(true);
  });

  it('returns false for width 768', () => {
    expect(isMobile(768)).toBe(false);
  });

  it('returns false for width 1024', () => {
    expect(isMobile(1024)).toBe(false);
  });
});

describe('isTablet', () => {
  it('returns false for width 767', () => {
    expect(isTablet(767)).toBe(false);
  });

  it('returns true for width 768', () => {
    expect(isTablet(768)).toBe(true);
  });

  it('returns true for width 1023', () => {
    expect(isTablet(1023)).toBe(true);
  });

  it('returns false for width 1024', () => {
    expect(isTablet(1024)).toBe(false);
  });
});

describe('isDesktop', () => {
  it('returns false for width 1023', () => {
    expect(isDesktop(1023)).toBe(false);
  });

  it('returns true for width 1024', () => {
    expect(isDesktop(1024)).toBe(true);
  });

  it('returns true for width 1920', () => {
    expect(isDesktop(1920)).toBe(true);
  });
});

describe('getColumnsForBreakpoint', () => {
  it('returns 1 for xs', () => {
    expect(getColumnsForBreakpoint('xs')).toBe(1);
  });

  it('returns 1 for sm', () => {
    expect(getColumnsForBreakpoint('sm')).toBe(1);
  });

  it('returns 2 for md', () => {
    expect(getColumnsForBreakpoint('md')).toBe(2);
  });

  it('returns 3 for lg', () => {
    expect(getColumnsForBreakpoint('lg')).toBe(3);
  });

  it('returns 4 for xl', () => {
    expect(getColumnsForBreakpoint('xl')).toBe(4);
  });

  it('returns 4 for 2xl', () => {
    expect(getColumnsForBreakpoint('2xl')).toBe(4);
  });
});

describe('clampFontSize', () => {
  it('returns minSize when width is at or below sm breakpoint', () => {
    expect(clampFontSize(16, 12, 20, 400)).toBe(12);
  });

  it('returns maxSize when width is at or above xl breakpoint', () => {
    expect(clampFontSize(16, 12, 20, 1400)).toBe(20);
  });

  it('returns a value between min and max for mid-range widths', () => {
    const size = clampFontSize(16, 12, 20, 960);
    expect(size).toBeGreaterThan(12);
    expect(size).toBeLessThan(20);
  });

  it('returns minSize at exactly the sm breakpoint (640)', () => {
    expect(clampFontSize(16, 14, 22, 640)).toBe(14);
  });

  it('returns maxSize at exactly the xl breakpoint (1280)', () => {
    expect(clampFontSize(16, 14, 22, 1280)).toBe(22);
  });
});

describe('getTouchTarget', () => {
  it('returns 44 for xs (mobile)', () => {
    expect(getTouchTarget('xs')).toBe(44);
  });

  it('returns 44 for sm (mobile)', () => {
    expect(getTouchTarget('sm')).toBe(44);
  });

  it('returns 36 for md (tablet/desktop)', () => {
    expect(getTouchTarget('md')).toBe(36);
  });

  it('returns 36 for lg (desktop)', () => {
    expect(getTouchTarget('lg')).toBe(36);
  });

  it('returns 36 for xl (desktop)', () => {
    expect(getTouchTarget('xl')).toBe(36);
  });

  it('returns 36 for 2xl (desktop)', () => {
    expect(getTouchTarget('2xl')).toBe(36);
  });
});
