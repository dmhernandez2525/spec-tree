import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ---------------------------------------------------------------------------
// Page lifecycle helpers
// ---------------------------------------------------------------------------

/**
 * Wait until the page reaches the "networkidle" state, meaning there are
 * no more than 0 network connections for at least 500 ms.
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

// ---------------------------------------------------------------------------
// API mocking
// ---------------------------------------------------------------------------

/**
 * Intercept requests matching `urlPattern` and respond with `data`.
 * Optionally set a custom HTTP status (defaults to 200).
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  data: unknown,
  status = 200,
): Promise<void> {
  await page.route(urlPattern, (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(data),
    }),
  );
}

/**
 * Convenience wrapper that mocks the AI generation endpoint
 * (`/api/generate` by default) with a predetermined response.
 */
export async function mockAIGeneration(
  page: Page,
  response: unknown,
): Promise<void> {
  await mockApiResponse(page, '**/api/generate*', response);
}

// ---------------------------------------------------------------------------
// Screenshots
// ---------------------------------------------------------------------------

/**
 * Capture a screenshot and store it in the `screenshots` directory
 * relative to the e2e root.
 */
export async function captureScreenshot(
  page: Page,
  name: string,
): Promise<void> {
  await page.screenshot({ path: `./e2e/screenshots/${name}.png` });
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export interface AccessibilityViolation {
  id: string;
  impact: string | undefined;
  description: string;
  helpUrl: string;
  nodes: number;
}

/**
 * Run an axe-core accessibility audit on the current page and return
 * any violations found.
 */
export async function checkAccessibility(
  page: Page,
): Promise<AccessibilityViolation[]> {
  const results = await new AxeBuilder({ page }).analyze();

  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? undefined,
    description: v.description,
    helpUrl: v.helpUrl,
    nodes: v.nodes.length,
  }));
}

// ---------------------------------------------------------------------------
// Performance
// ---------------------------------------------------------------------------

export interface PageLoadMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
}

/**
 * Navigate to `url` and measure key performance timings via the
 * Performance API.
 */
export async function measurePageLoad(
  page: Page,
  url: string,
): Promise<PageLoadMetrics> {
  await page.goto(url, { waitUntil: 'load' });

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType(
      'navigation',
    )[0] as PerformanceNavigationTiming;

    const paintEntries = performance.getEntriesByType('paint');
    const firstPaintEntry = paintEntries.find(
      (e) => e.name === 'first-paint',
    );

    return {
      loadTime: nav.loadEventEnd - nav.startTime,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      firstPaint: firstPaintEntry ? firstPaintEntry.startTime : 0,
    };
  });

  return metrics;
}

// ---------------------------------------------------------------------------
// Test data seeding
// ---------------------------------------------------------------------------

/**
 * Seed the backend with test data by posting to the internal
 * `/api/test/seed` endpoint.
 */
export async function seedTestData(
  page: Page,
  data: Record<string, unknown>,
): Promise<void> {
  const response = await page.request.post('/api/test/seed', {
    data,
    headers: { 'Content-Type': 'application/json' },
  });

  expect(response.ok()).toBeTruthy();
}

/**
 * Clear all test data by posting to the internal `/api/test/clear`
 * endpoint.
 */
export async function clearTestData(page: Page): Promise<void> {
  const response = await page.request.post('/api/test/clear');
  expect(response.ok()).toBeTruthy();
}
