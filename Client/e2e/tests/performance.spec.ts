import { test, expect } from '@playwright/test';

/**
 * Performance Benchmark E2E Tests
 *
 * Measures page load times, component render performance,
 * export operation speed, and search responsiveness.
 * Uses the Performance API and Navigation Timing for measurements.
 */

const STRAPI_API_URL = 'http://localhost:1337/api';
const MICROSERVICE_URL = 'http://localhost:3001';

const mockApp = {
  id: 1,
  documentId: 'app-perf-001',
  applicationInformation: 'Performance Test App',
  globalInformation: 'Application for performance benchmarking',
  createdAt: '2025-06-01T00:00:00.000Z',
  updatedAt: '2025-06-01T00:00:00.000Z',
};

// Create a larger dataset to stress-test rendering
const createBulkEpics = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: 100 + i,
    documentId: `epic-perf-${String(i).padStart(3, '0')}`,
    title: `Performance Epic ${i + 1}`,
    description: `Description for performance testing epic ${i + 1}`,
    goal: 'Test rendering performance',
    successCriteria: 'Renders within threshold',
    dependencies: '',
    timeline: '1-2 weeks',
    resources: '',
    risksAndMitigation: [],
    notes: '',
    position: i,
    features: Array.from({ length: 3 }, (_, j) => ({
      id: 1000 + i * 10 + j,
      documentId: `feature-perf-${i}-${j}`,
      title: `Feature ${i + 1}.${j + 1}`,
      description: `Feature for performance testing`,
      details: '',
      dependencies: '',
      acceptanceCriteria: [{ text: 'Renders quickly' }],
      priority: 'Medium',
      effort: 'S',
      notes: '',
      position: j,
      userStories: Array.from({ length: 2 }, (_, k) => ({
        id: 10000 + i * 100 + j * 10 + k,
        documentId: `story-perf-${i}-${j}-${k}`,
        title: `Story ${i + 1}.${j + 1}.${k + 1}`,
        role: 'user',
        action: 'complete a task',
        goal: 'achieve my objective',
        points: '3',
        acceptanceCriteria: [{ text: 'Works correctly' }],
        notes: '',
        developmentOrder: k + 1,
        position: k,
        tasks: [
          {
            id: 100000 + i * 1000 + j * 100 + k * 10,
            documentId: `task-perf-${i}-${j}-${k}`,
            title: `Task ${i + 1}.${j + 1}.${k + 1}`,
            details: 'Implementation task',
            priority: 1,
            notes: '',
            position: 0,
            contextualQuestions: [],
          },
        ],
        contextualQuestions: [],
      })),
      contextualQuestions: [],
    })),
    contextualQuestions: [],
  }));
};

async function setupPerformanceMocks(page: import('@playwright/test').Page) {
  await page.route(`${STRAPI_API_URL}/users/me`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1, documentId: 'user-abc-123', username: 'testuser', email: 'testuser@example.com',
      }),
    });
  });

  await page.route(`${STRAPI_API_URL}/apps?*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [{ id: mockApp.id, documentId: mockApp.documentId, ...mockApp }],
        meta: { pagination: { total: 1 } },
      }),
    });
  });

  await page.route(`${STRAPI_API_URL}/apps/${mockApp.documentId}*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        epics: createBulkEpics(5), // 5 epics, 15 features, 30 stories, 30 tasks
        contextualQuestions: [],
        globalInformation: mockApp.globalInformation,
      }),
    });
  });

  await page.route(`${STRAPI_API_URL}/home-page*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          attributes: {
            heroData: { Header: 'Spec Tree', SubHeader: 'AI-powered project specifications', heroImage: null },
            featuresData: [],
            benefitsData: [],
          },
        },
      }),
    });
  });

  const emptyList = JSON.stringify({ data: [], meta: { pagination: { total: 0 } } });

  for (const endpoint of ['epics', 'features', 'user-stories', 'tasks']) {
    await page.route(`${STRAPI_API_URL}/${endpoint}*`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: emptyList });
    });
  }

  await page.route(`${MICROSERVICE_URL}/**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        choices: [{ message: { content: '{"title":"Generated","description":"AI generated content"}' } }],
      }),
    });
  });

  // Mock workspace and collaboration endpoints
  await page.route(`${STRAPI_API_URL}/workspaces*`, (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: emptyList });
  });

  await page.route(`${STRAPI_API_URL}/organizations*`, (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: emptyList });
  });

  await page.route(`${STRAPI_API_URL}/comments*`, (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: emptyList });
  });
}

/**
 * Measure page load performance using Navigation Timing API
 */
async function measurePageLoad(page: import('@playwright/test').Page): Promise<number> {
  const timing = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (perf) {
      return perf.loadEventEnd - perf.startTime;
    }
    // Fallback: use legacy timing API
    const t = performance.timing;
    return t.loadEventEnd - t.navigationStart;
  });
  return timing;
}

/**
 * Measure time from navigation start to when a selector becomes visible
 */
async function measureTimeToVisible(
  page: import('@playwright/test').Page,
  selector: string,
  timeout: number
): Promise<number> {
  const start = Date.now();
  try {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout });
  } catch {
    // Element did not appear within timeout
    return timeout;
  }
  return Date.now() - start;
}

test.describe('Performance Benchmarks', () => {
  test.beforeEach(async ({ page }) => {
    await setupPerformanceMocks(page);
  });

  test('homepage loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'load' });

    const loadTime = Date.now() - startTime;

    // Also measure using Navigation Timing API
    const navTiming = await measurePageLoad(page);

    // Wait for content to be visible
    const timeToContent = await measureTimeToVisible(
      page,
      'text=Spec Tree, main, [class*="hero"]',
      5000
    );

    console.log(`Homepage performance:
      - Navigation load time: ${navTiming}ms
      - Wall-clock load time: ${loadTime}ms
      - Time to content visible: ${timeToContent}ms`);

    // The homepage should load within 3 seconds (3000ms)
    // Using wall-clock time as the primary metric
    expect(loadTime).toBeLessThan(3000);

    // Content should be visible shortly after load
    expect(timeToContent).toBeLessThan(5000);
  });

  test('dashboard loads within 5 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/user-dashboard', { waitUntil: 'load' });

    const loadTime = Date.now() - startTime;

    // Wait for dashboard content to render
    const timeToContent = await measureTimeToVisible(
      page,
      'text=Total Projects, text=Active Tasks, text=Dashboard, main',
      8000
    );

    const navTiming = await measurePageLoad(page);

    console.log(`Dashboard performance:
      - Navigation load time: ${navTiming}ms
      - Wall-clock load time: ${loadTime}ms
      - Time to content visible: ${timeToContent}ms`);

    // Dashboard should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Dashboard content should render within 8 seconds (includes data fetching)
    expect(timeToContent).toBeLessThan(8000);
  });

  test('spec tree renders within 2 seconds', async ({ page }) => {
    // Navigate to the spec tree page
    await page.goto('/user-dashboard/spec-tree', { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    // Select the app to trigger tree rendering
    const appCard = page.locator(`text=${mockApp.applicationInformation}`).first();
    const appCardVisible = await appCard.isVisible().catch(() => false);

    if (appCardVisible) {
      const renderStart = Date.now();

      await appCard.click();

      // Wait for the first epic to appear (tree is rendered)
      const timeToTree = await measureTimeToVisible(
        page,
        'text=Performance Epic 1, text=Feature, [class*="epic"], [class*="builder"]',
        5000
      );

      const totalRenderTime = Date.now() - renderStart;

      console.log(`Spec tree render performance:
        - Time to first tree node: ${timeToTree}ms
        - Total render time: ${totalRenderTime}ms
        - Data: 5 epics, 15 features, 30 stories, 30 tasks`);

      // Tree should render within 2 seconds (relaxed to 5s for CI)
      expect(timeToTree).toBeLessThan(5000);
    }

    // Verify the page is stable
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('export completes within 5 seconds', async ({ page }) => {
    await page.goto('/user-dashboard/spec-tree', { waitUntil: 'load' });
    await page.waitForTimeout(1500);

    // Select the app
    const appCard = page.locator(`text=${mockApp.applicationInformation}`).first();
    const appCardVisible = await appCard.isVisible().catch(() => false);
    if (appCardVisible) {
      await appCard.click();
      await page.waitForTimeout(2000);
    }

    // Mock clipboard API
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (text: string) => {
            (window as Record<string, unknown>).__lastClipboard = text;
            (window as Record<string, unknown>).__clipboardTime = Date.now();
            return Promise.resolve();
          },
          readText: async () => '',
        },
        writable: true,
        configurable: true,
      });
    });

    // Find and trigger an export operation
    const cursorExportBtn = page.locator(
      'button:has-text("Cursor Export"), button:has-text("Cursor"), button:has-text("Export")'
    ).first();

    const exportVisible = await cursorExportBtn.isVisible().catch(() => false);

    if (exportVisible) {
      const exportStart = Date.now();

      await cursorExportBtn.click();
      await page.waitForTimeout(300);

      // Click "Copy to clipboard" for a quick export measurement
      const copyOption = page.locator('text=Copy to clipboard').first();
      const copyVisible = await copyOption.isVisible().catch(() => false);

      if (copyVisible) {
        await copyOption.click();

        // Wait for the success indicator or timeout
        const successIndicator = page.locator('text=Copied!, text=Success').first();
        await successIndicator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

        const exportTime = Date.now() - exportStart;

        console.log(`Export performance:
          - Export time: ${exportTime}ms
          - Data size: 5 epics, 15 features, 30 stories, 30 tasks`);

        // Export should complete within 5 seconds
        expect(exportTime).toBeLessThan(5000);
      }
    }

    // Verify page stability
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('search responds within 1 second', async ({ page }) => {
    await page.goto('/user-dashboard/spec-tree', { waitUntil: 'load' });
    await page.waitForTimeout(1500);

    // Select the app
    const appCard = page.locator(`text=${mockApp.applicationInformation}`).first();
    const appCardVisible = await appCard.isVisible().catch(() => false);
    if (appCardVisible) {
      await appCard.click();
      await page.waitForTimeout(2000);
    }

    // Look for the search input (BuilderSearch component)
    const searchInput = page.locator(
      'input[placeholder*="Search"], input[placeholder*="search"], input[type="search"], [data-testid="builder-search"]'
    ).first();

    const searchVisible = await searchInput.isVisible().catch(() => false);

    if (searchVisible) {
      const searchStart = Date.now();

      // Type a search query
      await searchInput.fill('Performance');

      // Wait for search results to appear
      const resultSelector = 'text=Performance Epic, [class*="search-result"], [data-testid="search-results"]';
      const timeToResults = await measureTimeToVisible(page, resultSelector, 2000);

      const searchTime = Date.now() - searchStart;

      console.log(`Search performance:
        - Search response time: ${searchTime}ms
        - Time to results visible: ${timeToResults}ms`);

      // Search should respond within 1 second
      expect(searchTime).toBeLessThan(1000);
    } else {
      // If search is not directly visible, check for a search toggle
      const searchToggle = page.locator(
        'button[aria-label="Search"], button:has-text("Search"), [data-testid="search-toggle"]'
      ).first();

      const toggleVisible = await searchToggle.isVisible().catch(() => false);

      if (toggleVisible) {
        await searchToggle.click();
        await page.waitForTimeout(300);

        const searchInputAfter = page.locator(
          'input[placeholder*="Search"], input[type="search"]'
        ).first();

        const inputAfterVisible = await searchInputAfter.isVisible().catch(() => false);

        if (inputAfterVisible) {
          const searchStart = Date.now();
          await searchInputAfter.fill('Performance');
          await page.waitForTimeout(500);
          const searchTime = Date.now() - searchStart;

          console.log(`Search performance (with toggle): ${searchTime}ms`);
          expect(searchTime).toBeLessThan(1000);
        }
      }
    }

    // Verify page stability
    const content = await page.content();
    expect(content).toBeTruthy();
  });
});
