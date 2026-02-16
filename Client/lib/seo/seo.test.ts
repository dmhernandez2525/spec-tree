import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildPageTitle,
  generateOpenGraphTags,
  generateStructuredData,
  generateSitemap,
  generateRobotsTxt,
  DEFAULT_METADATA,
  type PageMetadata,
  type SitemapPage,
} from './metadata';
import {
  createAnalyticsTracker,
  isTrackingAllowed,
  anonymizeUserId,
} from './analytics-tracking';

// ============================================================
// SEO Metadata Tests
// ============================================================

describe('DEFAULT_METADATA', () => {
  it('has the correct default title', () => {
    expect(DEFAULT_METADATA.title).toBe('SpecTree - AI-Powered Software Design Documents');
  });

  it('has a description', () => {
    expect(DEFAULT_METADATA.description).toBeTruthy();
    expect(DEFAULT_METADATA.description.length).toBeGreaterThan(0);
  });

  it('has keywords', () => {
    expect(DEFAULT_METADATA.keywords).toContain('software design');
    expect(DEFAULT_METADATA.keywords).toContain('AI');
  });

  it('defaults noIndex to false', () => {
    expect(DEFAULT_METADATA.noIndex).toBe(false);
  });
});

describe('buildPageTitle', () => {
  it('returns "page | SpecTree" when a page name is provided', () => {
    expect(buildPageTitle('Dashboard')).toBe('Dashboard | SpecTree');
  });

  it('returns just "SpecTree" when no page name is provided', () => {
    expect(buildPageTitle()).toBe('SpecTree');
  });

  it('returns just "SpecTree" for empty string', () => {
    expect(buildPageTitle('')).toBe('SpecTree');
  });
});

describe('generateOpenGraphTags', () => {
  const metadata: PageMetadata = {
    title: 'Test Page',
    description: 'A test page description',
    keywords: ['test'],
    ogImage: 'https://example.com/image.png',
    ogType: 'website',
    canonical: 'https://example.com/test',
    noIndex: false,
  };

  it('includes og:title', () => {
    const tags = generateOpenGraphTags(metadata);
    const titleTag = tags.find((t) => t.property === 'og:title');
    expect(titleTag?.content).toBe('Test Page');
  });

  it('includes og:description', () => {
    const tags = generateOpenGraphTags(metadata);
    const descTag = tags.find((t) => t.property === 'og:description');
    expect(descTag?.content).toBe('A test page description');
  });

  it('includes og:type', () => {
    const tags = generateOpenGraphTags(metadata);
    const typeTag = tags.find((t) => t.property === 'og:type');
    expect(typeTag?.content).toBe('website');
  });

  it('includes og:image when provided', () => {
    const tags = generateOpenGraphTags(metadata);
    const imageTag = tags.find((t) => t.property === 'og:image');
    expect(imageTag?.content).toBe('https://example.com/image.png');
  });

  it('omits og:image when not provided', () => {
    const metaNoImage: PageMetadata = {
      ...metadata,
      ogImage: undefined,
    };
    const tags = generateOpenGraphTags(metaNoImage);
    const imageTag = tags.find((t) => t.property === 'og:image');
    expect(imageTag).toBeUndefined();
  });

  it('includes og:url from canonical', () => {
    const tags = generateOpenGraphTags(metadata);
    const urlTag = tags.find((t) => t.property === 'og:url');
    expect(urlTag?.content).toBe('https://example.com/test');
  });
});

describe('generateStructuredData', () => {
  it('generates valid JSON-LD for Organization type', () => {
    const result = generateStructuredData('Organization', {
      name: 'SpecTree',
      url: 'https://spectree.dev',
      logo: 'https://spectree.dev/logo.png',
      description: 'AI-powered software design documents',
    });

    expect(result).toContain('application/ld+json');
    const jsonContent = result.replace(/<\/?script[^>]*>/g, '');
    const parsed = JSON.parse(jsonContent);
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('Organization');
    expect(parsed.name).toBe('SpecTree');
  });

  it('generates valid JSON-LD for WebApplication type', () => {
    const result = generateStructuredData('WebApplication', {
      name: 'SpecTree',
      url: 'https://spectree.dev',
      description: 'Design document generator',
      applicationCategory: 'DeveloperApplication',
    });

    const jsonContent = result.replace(/<\/?script[^>]*>/g, '');
    const parsed = JSON.parse(jsonContent);
    expect(parsed['@type']).toBe('WebApplication');
    expect(parsed.applicationCategory).toBe('DeveloperApplication');
  });

  it('generates valid JSON-LD for FAQ type', () => {
    const result = generateStructuredData('FAQ', {
      questions: [
        { question: 'What is SpecTree?', answer: 'A design document tool.' },
        { question: 'Is it free?', answer: 'Yes, there is a free tier.' },
      ],
    });

    const jsonContent = result.replace(/<\/?script[^>]*>/g, '');
    const parsed = JSON.parse(jsonContent);
    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity).toHaveLength(2);
    expect(parsed.mainEntity[0].name).toBe('What is SpecTree?');
  });

  it('wraps output in a script tag', () => {
    const result = generateStructuredData('Organization', {
      name: 'Test',
      url: 'https://test.com',
    });
    expect(result).toMatch(/^<script type="application\/ld\+json">/);
    expect(result).toMatch(/<\/script>$/);
  });
});

describe('generateSitemap', () => {
  const pages: SitemapPage[] = [
    { url: 'https://spectree.dev/', lastmod: '2025-01-15', changefreq: 'daily', priority: 1.0 },
    { url: 'https://spectree.dev/docs', lastmod: '2025-01-10', changefreq: 'weekly', priority: 0.8 },
    { url: 'https://spectree.dev/pricing', lastmod: '2025-01-05', changefreq: 'monthly', priority: 0.6 },
  ];

  it('produces valid XML with the urlset element', () => {
    const result = generateSitemap(pages);
    expect(result).toContain('<?xml version="1.0"');
    expect(result).toContain('<urlset');
    expect(result).toContain('</urlset>');
  });

  it('includes all page URLs', () => {
    const result = generateSitemap(pages);
    expect(result).toContain('<loc>https://spectree.dev/</loc>');
    expect(result).toContain('<loc>https://spectree.dev/docs</loc>');
    expect(result).toContain('<loc>https://spectree.dev/pricing</loc>');
  });

  it('includes correct priorities', () => {
    const result = generateSitemap(pages);
    expect(result).toContain('<priority>1.0</priority>');
    expect(result).toContain('<priority>0.8</priority>');
    expect(result).toContain('<priority>0.6</priority>');
  });

  it('includes lastmod dates', () => {
    const result = generateSitemap(pages);
    expect(result).toContain('<lastmod>2025-01-15</lastmod>');
  });

  it('includes changefreq values', () => {
    const result = generateSitemap(pages);
    expect(result).toContain('<changefreq>daily</changefreq>');
    expect(result).toContain('<changefreq>weekly</changefreq>');
  });

  it('handles empty pages array', () => {
    const result = generateSitemap([]);
    expect(result).toContain('<urlset');
    expect(result).toContain('</urlset>');
    expect(result).not.toContain('<url>');
  });
});

describe('generateRobotsTxt', () => {
  it('includes User-agent directive', () => {
    const result = generateRobotsTxt({ allow: ['/'], disallow: [] });
    expect(result).toContain('User-agent: *');
  });

  it('includes Allow rules', () => {
    const result = generateRobotsTxt({ allow: ['/', '/docs'], disallow: [] });
    expect(result).toContain('Allow: /');
    expect(result).toContain('Allow: /docs');
  });

  it('includes Disallow rules', () => {
    const result = generateRobotsTxt({ allow: [], disallow: ['/admin', '/api'] });
    expect(result).toContain('Disallow: /admin');
    expect(result).toContain('Disallow: /api');
  });

  it('includes Sitemap URL when provided', () => {
    const result = generateRobotsTxt({
      allow: ['/'],
      disallow: [],
      sitemapUrl: 'https://spectree.dev/sitemap.xml',
    });
    expect(result).toContain('Sitemap: https://spectree.dev/sitemap.xml');
  });

  it('uses custom user-agent when specified', () => {
    const result = generateRobotsTxt({
      userAgent: 'Googlebot',
      allow: ['/'],
      disallow: [],
    });
    expect(result).toContain('User-agent: Googlebot');
  });
});

// ============================================================
// Analytics Tracking Tests
// ============================================================

describe('createAnalyticsTracker', () => {
  let mockFetch: typeof fetch;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
  });

  it('tracks events with correct properties', () => {
    const tracker = createAnalyticsTracker(mockFetch);
    tracker.track('button_click', 'feature_use', { button: 'export' });

    const events = tracker.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('button_click');
    expect(events[0].category).toBe('feature_use');
    expect(events[0].properties.button).toBe('export');
  });

  it('records a timestamp on each event', () => {
    const tracker = createAnalyticsTracker(mockFetch);
    const before = Date.now();
    tracker.track('test', 'page_view');
    const after = Date.now();

    const events = tracker.getEvents();
    expect(events[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(events[0].timestamp).toBeLessThanOrEqual(after);
  });

  it('pageView creates a page_view event', () => {
    const tracker = createAnalyticsTracker(mockFetch);
    tracker.pageView('/dashboard', 'Dashboard');

    const events = tracker.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('page_view');
    expect(events[0].category).toBe('page_view');
    expect(events[0].properties.path).toBe('/dashboard');
    expect(events[0].properties.title).toBe('Dashboard');
  });

  it('pageView works without a title', () => {
    const tracker = createAnalyticsTracker(mockFetch);
    tracker.pageView('/home');

    const events = tracker.getEvents();
    expect(events[0].properties.path).toBe('/home');
    expect(events[0].properties.title).toBeUndefined();
  });

  it('flush sends events to the analytics endpoint', async () => {
    const tracker = createAnalyticsTracker(mockFetch);
    tracker.track('test_event', 'feature_use');

    await tracker.flush();

    expect(mockFetch).toHaveBeenCalledWith('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('test_event'),
    });
  });

  it('flush clears the event queue on success', async () => {
    const tracker = createAnalyticsTracker(mockFetch);
    tracker.track('event1', 'page_view');
    tracker.track('event2', 'feature_use');

    await tracker.flush();

    expect(tracker.getEvents()).toHaveLength(0);
  });

  it('flush re-queues events on failure', async () => {
    const failingFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const tracker = createAnalyticsTracker(failingFetch);
    tracker.track('event1', 'page_view');

    await tracker.flush();

    expect(tracker.getEvents()).toHaveLength(1);
    expect(tracker.getEvents()[0].name).toBe('event1');
  });

  it('flush does nothing when queue is empty', async () => {
    const tracker = createAnalyticsTracker(mockFetch);
    await tracker.flush();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('getEventCounts returns accurate category counts', () => {
    const tracker = createAnalyticsTracker(mockFetch);
    tracker.track('event1', 'page_view');
    tracker.track('event2', 'page_view');
    tracker.track('event3', 'feature_use');
    tracker.track('event4', 'export');

    const counts = tracker.getEventCounts();
    expect(counts['page_view']).toBe(2);
    expect(counts['feature_use']).toBe(1);
    expect(counts['export']).toBe(1);
  });

  it('getEventCounts returns empty object when no events', () => {
    const tracker = createAnalyticsTracker(mockFetch);
    const counts = tracker.getEventCounts();
    expect(Object.keys(counts)).toHaveLength(0);
  });
});

describe('isTrackingAllowed', () => {
  it('returns false when DNT is set to 1', () => {
    const original = navigator.doNotTrack;
    Object.defineProperty(navigator, 'doNotTrack', {
      value: '1',
      configurable: true,
    });

    expect(isTrackingAllowed()).toBe(false);

    Object.defineProperty(navigator, 'doNotTrack', {
      value: original,
      configurable: true,
    });
  });

  it('returns true when DNT is not set', () => {
    const original = navigator.doNotTrack;
    Object.defineProperty(navigator, 'doNotTrack', {
      value: null,
      configurable: true,
    });

    expect(isTrackingAllowed()).toBe(true);

    Object.defineProperty(navigator, 'doNotTrack', {
      value: original,
      configurable: true,
    });
  });
});

describe('anonymizeUserId', () => {
  it('returns a consistent hash for the same input', () => {
    const hash1 = anonymizeUserId('user-123');
    const hash2 = anonymizeUserId('user-123');
    expect(hash1).toBe(hash2);
  });

  it('returns a value different from the original input', () => {
    const result = anonymizeUserId('user-123');
    expect(result).not.toBe('user-123');
  });

  it('starts with the anon_ prefix', () => {
    const result = anonymizeUserId('test-user');
    expect(result).toMatch(/^anon_/);
  });

  it('produces different hashes for different inputs', () => {
    const hash1 = anonymizeUserId('user-a');
    const hash2 = anonymizeUserId('user-b');
    expect(hash1).not.toBe(hash2);
  });
});
