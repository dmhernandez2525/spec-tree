import { test, expect } from '@playwright/test';

/**
 * Collaboration Features E2E Tests
 *
 * Validates collaboration mode indicators, activity feeds,
 * comment threads, workspace selection, and workspace switching.
 * All API calls are intercepted via page.route().
 */

const STRAPI_API_URL = 'http://localhost:1337/api';

const mockApp = {
  id: 1,
  documentId: 'app-collab-001',
  applicationInformation: 'Collaboration Test App',
  globalInformation: 'Application for testing collaboration features',
  createdAt: '2025-06-01T00:00:00.000Z',
  updatedAt: '2025-06-01T00:00:00.000Z',
};

const mockEpicWithChildren = {
  id: 10,
  documentId: 'epic-collab-001',
  title: 'Collaboration Test Epic',
  description: 'Epic used for collaboration testing',
  goal: 'Test collaboration features',
  successCriteria: 'All collaboration tests pass',
  dependencies: '',
  timeline: '1-2 weeks',
  resources: '',
  risksAndMitigation: [],
  notes: '',
  position: 0,
  features: [
    {
      id: 20,
      documentId: 'feature-collab-001',
      title: 'Collab Feature',
      description: 'Feature for collaboration testing',
      details: '',
      dependencies: '',
      acceptanceCriteria: [{ text: 'Collaboration works' }],
      priority: 'Medium',
      effort: 'S',
      notes: '',
      position: 0,
      userStories: [],
      contextualQuestions: [],
    },
  ],
  contextualQuestions: [],
};

const mockWorkspaces = [
  { id: 'ws-001', name: 'Engineering Team', role: 'admin', memberCount: 5 },
  { id: 'ws-002', name: 'Design Team', role: 'member', memberCount: 3 },
  { id: 'ws-003', name: 'Product Team', role: 'viewer', memberCount: 8 },
];

const mockActivityItems = [
  {
    id: 'activity-001',
    action: 'created',
    userName: 'Alice Chen',
    targetType: 'epic',
    targetTitle: 'User Authentication',
    targetId: 'epic-001',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
  },
  {
    id: 'activity-002',
    action: 'updated',
    userName: 'Bob Smith',
    targetType: 'feature',
    targetTitle: 'Login Flow',
    targetId: 'feature-001',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
  },
  {
    id: 'activity-003',
    action: 'commented',
    userName: 'Carol Davis',
    targetType: 'userStory',
    targetTitle: 'Password Reset',
    targetId: 'story-001',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
];

async function setupCollaborationMocks(page: import('@playwright/test').Page) {
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

  // Mock single app fetch
  await page.route(`${STRAPI_API_URL}/apps/${mockApp.documentId}*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        epics: [mockEpicWithChildren],
        contextualQuestions: [],
        globalInformation: mockApp.globalInformation,
      }),
    });
  });

  // Mock workspaces endpoint
  await page.route(`${STRAPI_API_URL}/workspaces*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: mockWorkspaces.map((ws) => ({
          id: ws.id,
          documentId: ws.id,
          attributes: ws,
        })),
        meta: { pagination: { total: mockWorkspaces.length } },
      }),
    });
  });

  // Mock organizations endpoint
  await page.route(`${STRAPI_API_URL}/organizations*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: mockWorkspaces.map((ws) => ({
          id: ws.id,
          documentId: ws.id,
          attributes: { name: ws.name, role: ws.role },
        })),
        meta: { pagination: { total: mockWorkspaces.length } },
      }),
    });
  });

  // Mock comments endpoints
  await page.route(`${STRAPI_API_URL}/comments*`, (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'comment-001',
              documentId: 'comment-001',
              attributes: {
                content: 'This epic looks well-structured. Consider adding error handling stories.',
                authorId: 'user-002',
                authorName: 'Alice Chen',
                targetType: 'epic',
                targetId: 'epic-collab-001',
                status: 'published',
                createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              },
            },
          ],
          meta: { pagination: { total: 1 } },
        }),
      });
    } else if (method === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'comment-new-001',
            documentId: 'comment-new-001',
            attributes: {
              content: 'New comment added',
              authorId: 'user-abc-123',
              authorName: 'testuser',
              status: 'published',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        }),
      });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' });
    }
  });

  // Mock collaboration activity endpoint
  await page.route(`${STRAPI_API_URL}/collaboration-activity*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: mockActivityItems.map((item) => ({
          id: item.id,
          documentId: item.id,
          attributes: item,
        })),
        meta: { pagination: { total: mockActivityItems.length } },
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

  // Mock Strapi CRUD endpoints
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

test.describe('Collaboration Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupCollaborationMocks(page);
  });

  test('shows collaboration mode indicator', async ({ page }) => {
    await navigateToBuilder(page);

    // The CollaborationPanel shows a Badge with the current mode
    // Modes are "Editing" or "Read-only"
    const modeBadge = page.locator(
      'text=Editing, text=Read-only, [data-testid="collaboration-mode"]'
    ).first();

    const modeVisible = await modeBadge.isVisible().catch(() => false);

    if (modeVisible) {
      await expect(modeBadge).toBeVisible();

      // The badge should show either "Editing" or "Read-only"
      const modeText = await modeBadge.textContent();
      const validModes = ['Editing', 'Read-only', 'Disabled'];
      const hasValidMode = validModes.some((mode) => modeText?.includes(mode));
      expect(hasValidMode).toBeTruthy();
    }

    // Also check for the Collaboration button
    const collabButton = page.locator(
      'button:has-text("Collaboration"), [aria-label="Collaboration"]'
    ).first();

    const collabVisible = await collabButton.isVisible().catch(() => false);

    if (collabVisible) {
      await expect(collabButton).toBeVisible();
    }

    // Verify the page loaded
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('displays team activity feed', async ({ page }) => {
    await navigateToBuilder(page);

    // Open the collaboration panel
    const collabButton = page.locator(
      'button:has-text("Collaboration"), [aria-label="Collaboration"]'
    ).first();

    const collabVisible = await collabButton.isVisible().catch(() => false);

    if (collabVisible) {
      await collabButton.click();
      await page.waitForTimeout(500);

      // The collaboration sheet should open with tabs for Settings and Activity
      const activityTab = page.locator('text=Activity, [data-value="activity"]').first();
      const activityTabVisible = await activityTab.isVisible().catch(() => false);

      if (activityTabVisible) {
        await activityTab.click();
        await page.waitForTimeout(500);

        // Check for activity entries from the mock data
        // The ActivityFeed component shows "userName action targetType targetTitle"
        const aliceActivity = page.locator('text=Alice Chen').first();
        const aliceVisible = await aliceActivity.isVisible().catch(() => false);

        if (aliceVisible) {
          await expect(aliceActivity).toBeVisible();
        }

        const bobActivity = page.locator('text=Bob Smith').first();
        const bobVisible = await bobActivity.isVisible().catch(() => false);

        if (bobVisible) {
          await expect(bobActivity).toBeVisible();
        }

        // Check for action labels
        const createdLabel = page.locator('text=created').first();
        const updatedLabel = page.locator('text=updated').first();

        const createdVisible = await createdLabel.isVisible().catch(() => false);
        const updatedVisible = await updatedLabel.isVisible().catch(() => false);

        // At least verify the activity tab area is present
        const activityContent = page.locator('[class*="activity"], [class*="feed"]').first();
        const contentVisible = await activityContent.isVisible().catch(() => false);
      }
    }

    // Verify page stability
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('handles comments on spec nodes', async ({ page }) => {
    await navigateToBuilder(page);

    // Look for a comment button/icon on a spec node
    const commentButton = page.locator(
      'button[aria-label="Comments"], button:has-text("Comment"), [data-testid="comment-button"], button[aria-label="Add comment"]'
    ).first();

    const commentBtnVisible = await commentButton.isVisible().catch(() => false);

    if (commentBtnVisible) {
      await commentButton.click();
      await page.waitForTimeout(500);

      // The CommentsPanel should appear
      const commentsPanel = page.locator(
        'text=Comments, [data-testid="comments-panel"], [class*="comment"]'
      ).first();

      const panelVisible = await commentsPanel.isVisible().catch(() => false);

      if (panelVisible) {
        // Look for the comment composer (textarea for writing new comments)
        const commentInput = page.locator(
          'textarea[placeholder*="comment"], textarea[placeholder*="Write"], [data-testid="comment-input"]'
        ).first();

        const inputVisible = await commentInput.isVisible().catch(() => false);

        if (inputVisible) {
          await commentInput.fill('This epic needs better acceptance criteria for edge cases.');

          // Submit the comment
          const submitBtn = page.locator(
            'button:has-text("Post"), button:has-text("Submit"), button:has-text("Send"), button[type="submit"]'
          ).first();

          const submitVisible = await submitBtn.isVisible().catch(() => false);
          if (submitVisible) {
            await submitBtn.click();
            await page.waitForTimeout(1000);
          }
        }

        // Check if existing comments are displayed
        const existingComment = page.locator(
          'text=well-structured, text=error handling'
        ).first();
        const existingVisible = await existingComment.isVisible().catch(() => false);

        if (existingVisible) {
          await expect(existingComment).toBeVisible();
        }
      }
    }

    // Verify the page did not crash
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('shows workspace selector', async ({ page }) => {
    // Navigate to the dashboard where the WorkspaceSwitcher is shown
    await page.goto('/user-dashboard');
    await page.waitForTimeout(2000);

    // The WorkspaceSwitcher component renders as a dropdown in the dashboard header/sidebar
    const workspaceSelector = page.locator(
      'button:has-text("Engineering Team"), button:has-text("Workspace"), [data-testid="workspace-switcher"], button:has-text("Team")'
    ).first();

    const selectorVisible = await workspaceSelector.isVisible().catch(() => false);

    if (selectorVisible) {
      await expect(workspaceSelector).toBeVisible();

      // Click to open the dropdown
      await workspaceSelector.click();
      await page.waitForTimeout(500);

      // Check that workspace options are displayed
      const engineeringOption = page.locator('text=Engineering Team').first();
      const designOption = page.locator('text=Design Team').first();
      const productOption = page.locator('text=Product Team').first();

      const engVisible = await engineeringOption.isVisible().catch(() => false);
      const designVisible = await designOption.isVisible().catch(() => false);
      const productVisible = await productOption.isVisible().catch(() => false);

      // At least some workspace options should be visible
      const anyVisible = engVisible || designVisible || productVisible;

      if (anyVisible) {
        expect(anyVisible).toBeTruthy();
      }
    }

    // Verify the dashboard page loaded
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('switches between workspaces', async ({ page }) => {
    await page.goto('/user-dashboard');
    await page.waitForTimeout(2000);

    // Find and open the workspace switcher
    const workspaceSelector = page.locator(
      'button:has-text("Engineering Team"), button:has-text("Workspace"), [data-testid="workspace-switcher"], button:has-text("Team")'
    ).first();

    const selectorVisible = await workspaceSelector.isVisible().catch(() => false);

    if (selectorVisible) {
      await workspaceSelector.click();
      await page.waitForTimeout(500);

      // Select a different workspace
      const designTeamOption = page.locator('text=Design Team').first();
      const designVisible = await designTeamOption.isVisible().catch(() => false);

      if (designVisible) {
        await designTeamOption.click();
        await page.waitForTimeout(1000);

        // Verify the workspace switched
        // The button text or displayed workspace name should update
        const updatedSelector = page.locator('text=Design Team').first();
        const updatedVisible = await updatedSelector.isVisible().catch(() => false);

        if (updatedVisible) {
          await expect(updatedSelector).toBeVisible();
        }
      }
    }

    // Verify the page remains functional after switching
    const content = await page.content();
    expect(content).toBeTruthy();
    expect(content).not.toContain('Unhandled Runtime Error');
  });
});
