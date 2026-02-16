/**
 * PWA Configuration and Utilities
 *
 * Provides Progressive Web App manifest generation, feature detection,
 * caching strategy definitions, and install prompt status tracking
 * for the SpecTree application.
 */

export interface PwaManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  icons: { src: string; sizes: string; type: string }[];
}

export interface PwaSupport {
  serviceWorker: boolean;
  manifest: boolean;
  notifications: boolean;
}

/**
 * Default PWA manifest for the SpecTree application.
 */
export const SPECTREE_MANIFEST: PwaManifest = {
  name: 'SpecTree',
  short_name: 'SpecTree',
  description: 'Build better specs with AI-powered project planning',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#7c3aed',
  icons: [
    { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
};

/**
 * Generate a PWA manifest by merging optional overrides with the
 * default SpecTree manifest.
 */
export function generateManifest(overrides?: Partial<PwaManifest>): PwaManifest {
  if (!overrides) return { ...SPECTREE_MANIFEST };

  return {
    ...SPECTREE_MANIFEST,
    ...overrides,
    icons: overrides.icons ?? SPECTREE_MANIFEST.icons,
  };
}

/**
 * Check browser support for core PWA features including service workers,
 * web app manifest link detection, and the Notification API.
 */
export function checkPwaSupport(): PwaSupport {
  const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';

  return {
    serviceWorker: isBrowser && 'serviceWorker' in navigator,
    manifest: isBrowser && !!document.querySelector('link[rel="manifest"]'),
    notifications: isBrowser && 'Notification' in window,
  };
}

/**
 * Request notification permission from the user.
 * Returns the resulting permission status string.
 */
export async function requestNotificationPermission(): Promise<string> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'error';
  }
}

/**
 * Named caching strategies with descriptions for service worker configuration.
 */
export const cacheStrategies = {
  staleWhileRevalidate: {
    name: 'stale-while-revalidate',
    description:
      'Serve cached content immediately while fetching an updated version in the background',
  },
  cacheFirst: {
    name: 'cache-first',
    description:
      'Serve from cache if available, only fetching from network on cache miss',
  },
  networkFirst: {
    name: 'network-first',
    description:
      'Attempt network fetch first, falling back to cache if the network is unavailable',
  },
} as const;

/**
 * Determine the current PWA install prompt status.
 * Returns 'available' if the app can be installed, 'installed' if it is
 * already running in standalone mode, or 'unsupported' if the browser
 * does not support PWA installation.
 */
export function getInstallPromptStatus(): 'available' | 'installed' | 'unsupported' {
  if (typeof window === 'undefined') {
    return 'unsupported';
  }

  // Check if already running as installed PWA
  const mediaMatch = typeof window.matchMedia === 'function'
    ? window.matchMedia('(display-mode: standalone)')
    : null;
  const isStandalone =
    (mediaMatch?.matches ?? false) ||
    (navigator as unknown as Record<string, unknown>).standalone === true;

  if (isStandalone) {
    return 'installed';
  }

  // Check if the browser supports the beforeinstallprompt event (Chromium-based)
  const supportsInstall = 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window;

  return supportsInstall ? 'available' : 'unsupported';
}
