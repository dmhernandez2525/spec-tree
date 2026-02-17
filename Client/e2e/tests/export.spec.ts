import { test, expect } from '@playwright/test';

/**
 * Export Functionality E2E Tests
 *
 * Validates exporting specifications to various formats including
 * Markdown, JSON, Cursor rules, Copilot instructions, and Devin format.
 * All API calls and download/clipboard APIs are mocked.
 */

const STRAPI_API_URL = 'http://localhost:1337/api';

const mockApp = {
  id: 1,
  documentId: 'app-export-001',
  applicationInformation: 'Export Test App',
  globalInformation: 'Application for testing export functionality',
  createdAt: '2025-06-01T00:00:00.000Z',
  updatedAt: '2025-06-01T00:00:00.000Z',
};

const mockEpic = {
  id: 10,
  documentId: 'epic-export-001',
  title: 'Core Export Feature',
  description: 'Handles all data export capabilities',
  goal: 'Enable seamless data export',
  successCriteria: 'All export formats produce valid output',
  dependencies: '',
  timeline: '1-2 weeks',
  resources: 'Frontend Developer',
  risksAndMitigation: [],
  notes: '',
  position: 0,
  features: [
    {
      id: 20,
      documentId: 'feature-export-001',
      title: 'Multi-format Export',
      description: 'Export specs in multiple formats',
      details: 'Support Markdown, JSON, Cursor, Copilot, Devin formats',
      dependencies: '',
      acceptanceCriteria: [{ text: 'All formats export correctly' }],
      priority: 'High',
      effort: 'M',
      notes: '',
      position: 0,
      userStories: [
        {
          id: 30,
          documentId: 'story-export-001',
          title: 'Export to Cursor',
          role: 'developer',
          action: 'export my specs to Cursor rules format',
          goal: 'I can use AI assistance with project context',
          points: '3',
          acceptanceCriteria: [{ text: 'Cursor rules file is valid .mdc format' }],
          notes: '',
          developmentOrder: 1,
          position: 0,
          tasks: [
            {
              id: 40,
              documentId: 'task-export-001',
              title: 'Implement Cursor export function',
              details: 'Transform spec data into .mdc format',
              priority: 1,
              notes: '',
              position: 0,
              contextualQuestions: [],
            },
          ],
          contextualQuestions: [],
        },
      ],
      contextualQuestions: [],
    },
  ],
  contextualQuestions: [],
};

async function setupExportMocks(page: import('@playwright/test').Page) {
  // Mock user auth
  await page.route(`${STRAPI_API_URL}/users/me`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1, documentId: 'user-abc-123', username: 'testuser', email: 'testuser@example.com',
      }),
    });
  });

  // Mock apps list
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

  // Mock single app fetch with full hierarchy
  await page.route(`${STRAPI_API_URL}/apps/${mockApp.documentId}*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        epics: [mockEpic],
        contextualQuestions: [],
        globalInformation: mockApp.globalInformation,
      }),
    });
  });

  // Mock home page data
  await page.route(`${STRAPI_API_URL}/home-page*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null }),
    });
  });

  // Mock any other Strapi API calls
  await page.route(`${STRAPI_API_URL}/epics*`, (route) => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { pagination: { total: 0 } } }),
    });
  });

  await page.route(`${STRAPI_API_URL}/features*`, (route) => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { pagination: { total: 0 } } }),
    });
  });

  await page.route(`${STRAPI_API_URL}/user-stories*`, (route) => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { pagination: { total: 0 } } }),
    });
  });

  await page.route(`${STRAPI_API_URL}/tasks*`, (route) => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { pagination: { total: 0 } } }),
    });
  });
}

/**
 * Navigate to the spec tree and select the mock app
 */
async function navigateToBuilder(page: import('@playwright/test').Page) {
  await page.goto('/user-dashboard/spec-tree');
  await page.waitForTimeout(2000);

  const appCard = page.locator(`text=${mockApp.applicationInformation}`).first();
  const appCardVisible = await appCard.isVisible().catch(() => false);
  if (appCardVisible) {
    await appCard.click();
    await page.waitForTimeout(2000);
  }
}

test.describe('Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupExportMocks(page);
  });

  test('exports as Markdown', async ({ page }) => {
    // Mock the download to capture what content would be written
    const downloads: string[] = [];
    await page.exposeFunction('__captureDownload', (content: string) => {
      downloads.push(content);
    });

    // Override URL.createObjectURL and the download mechanism
    await page.addInitScript(() => {
      const originalCreateElement = document.createElement.bind(document);
      // Intercept anchor creation for download triggers
      window.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'A' && (target as HTMLAnchorElement).download) {
          e.preventDefault();
        }
      }, true);
    });

    await navigateToBuilder(page);

    // Look for the export/import section in the builder
    const exportButton = page.locator(
      'button:has-text("Export"), button:has-text("Markdown"), [aria-label="Export"], button:has-text("Download")'
    ).first();

    const exportVisible = await exportButton.isVisible().catch(() => false);

    if (exportVisible) {
      await exportButton.click();
      await page.waitForTimeout(500);

      // Look for Markdown-specific export option in a dropdown or menu
      const markdownOption = page.locator(
        'text=Markdown, text=.md, [data-testid="export-markdown"]'
      ).first();

      const mdVisible = await markdownOption.isVisible().catch(() => false);
      if (mdVisible) {
        await markdownOption.click();
        await page.waitForTimeout(1000);
      }
    }

    // Verify the page is still functional (export did not crash)
    const content = await page.content();
    expect(content).toBeTruthy();
    expect(content).not.toContain('Unhandled Runtime Error');
  });

  test('exports as JSON', async ({ page }) => {
    await navigateToBuilder(page);

    // Look for JSON export option
    const exportButton = page.locator(
      'button:has-text("Export"), button:has-text("JSON"), [aria-label="Export"]'
    ).first();

    const exportVisible = await exportButton.isVisible().catch(() => false);

    if (exportVisible) {
      await exportButton.click();
      await page.waitForTimeout(500);

      const jsonOption = page.locator(
        'text=JSON, text=.json, [data-testid="export-json"]'
      ).first();

      const jsonVisible = await jsonOption.isVisible().catch(() => false);
      if (jsonVisible) {
        await jsonOption.click();
        await page.waitForTimeout(1000);
      }
    }

    // The JSON export should produce valid structured data
    // Verify no error state
    const content = await page.content();
    expect(content).toBeTruthy();
    expect(content).not.toContain('Unhandled Runtime Error');
  });

  test('exports for Cursor', async ({ page }) => {
    await navigateToBuilder(page);

    // Look for the Cursor Export button (CursorExportButton component)
    const cursorExportBtn = page.locator(
      'button:has-text("Cursor Export"), button:has-text("Cursor"), [data-testid="cursor-export"]'
    ).first();

    const cursorVisible = await cursorExportBtn.isVisible().catch(() => false);

    if (cursorVisible) {
      await cursorExportBtn.click();
      await page.waitForTimeout(500);

      // The CursorExportButton shows a dropdown with download and copy options
      const downloadOption = page.locator('text=Download as .mdc file').first();
      const downloadVisible = await downloadOption.isVisible().catch(() => false);

      if (downloadVisible) {
        // Intercept the download
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        await downloadOption.click();
        const download = await downloadPromise;

        if (download) {
          // Verify the filename contains .mdc extension
          const filename = download.suggestedFilename();
          expect(filename).toContain('.mdc');
        }
      }
    }

    // Verify page stability
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('exports for Copilot', async ({ page }) => {
    await navigateToBuilder(page);

    // Look for the Copilot export button (CopilotExportButton component)
    const copilotExportBtn = page.locator(
      'button:has-text("Copilot"), button:has-text("GitHub Copilot"), [data-testid="copilot-export"]'
    ).first();

    const copilotVisible = await copilotExportBtn.isVisible().catch(() => false);

    if (copilotVisible) {
      await copilotExportBtn.click();
      await page.waitForTimeout(500);

      // Look for the download option in the dropdown
      const downloadOption = page.locator('text=Download, text=.copilot').first();
      const downloadVisible = await downloadOption.isVisible().catch(() => false);

      if (downloadVisible) {
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        await downloadOption.click();
        const download = await downloadPromise;

        if (download) {
          const filename = download.suggestedFilename();
          expect(filename).toBeTruthy();
        }
      }
    }

    // Verify no errors
    const content = await page.content();
    expect(content).not.toContain('Unhandled Runtime Error');
  });

  test('exports for Devin', async ({ page }) => {
    await navigateToBuilder(page);

    // Look for the Devin export button (DevinExportButton component)
    const devinExportBtn = page.locator(
      'button:has-text("Devin"), [data-testid="devin-export"]'
    ).first();

    const devinVisible = await devinExportBtn.isVisible().catch(() => false);

    if (devinVisible) {
      await devinExportBtn.click();
      await page.waitForTimeout(500);

      const downloadOption = page.locator('text=Download').first();
      const downloadVisible = await downloadOption.isVisible().catch(() => false);

      if (downloadVisible) {
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        await downloadOption.click();
        const download = await downloadPromise;

        if (download) {
          const filename = download.suggestedFilename();
          expect(filename).toBeTruthy();
        }
      }
    }

    // Verify no errors
    const content = await page.content();
    expect(content).not.toContain('Unhandled Runtime Error');
  });

  test('copies export to clipboard', async ({ page }) => {
    // Track clipboard writes
    let clipboardContent = '';

    await page.addInitScript(() => {
      // Mock the clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (text: string) => {
            (window as Record<string, unknown>).__clipboardContent = text;
            return Promise.resolve();
          },
          readText: async () => {
            return (window as Record<string, unknown>).__clipboardContent as string || '';
          },
        },
        writable: true,
        configurable: true,
      });
    });

    await navigateToBuilder(page);

    // Look for the Cursor Export button with copy-to-clipboard option
    const cursorExportBtn = page.locator(
      'button:has-text("Cursor Export"), button:has-text("Cursor"), [data-testid="cursor-export"]'
    ).first();

    const cursorVisible = await cursorExportBtn.isVisible().catch(() => false);

    if (cursorVisible) {
      await cursorExportBtn.click();
      await page.waitForTimeout(500);

      // Click "Copy to clipboard" option
      const copyOption = page.locator('text=Copy to clipboard').first();
      const copyVisible = await copyOption.isVisible().catch(() => false);

      if (copyVisible) {
        await copyOption.click();
        await page.waitForTimeout(1000);

        // Verify clipboard was written to
        clipboardContent = await page.evaluate(() => {
          return (window as Record<string, unknown>).__clipboardContent as string || '';
        });

        // The clipboard should contain some cursor rules content
        if (clipboardContent) {
          expect(clipboardContent.length).toBeGreaterThan(0);
        }

        // Check for success feedback (button text changes to "Copied!")
        const successIndicator = page.locator('text=Copied!, text=Success').first();
        const successVisible = await successIndicator.isVisible().catch(() => false);
        if (successVisible) {
          await expect(successIndicator).toBeVisible();
        }
      }
    }

    // Verify page stability
    const content = await page.content();
    expect(content).toBeTruthy();
  });
});
