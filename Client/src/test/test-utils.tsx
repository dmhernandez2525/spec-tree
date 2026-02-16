/**
 * Test Utilities
 *
 * Custom render function and test helpers for Spec Tree tests
 */

import * as React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, RenderOptions, RenderResult, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { faker } from '@faker-js/faker';

// Import actual reducers for realistic testing
import { authReducer } from '@/lib/store/auth-slice';
import { userReducer } from '@/lib/store/user-slice';
import { organizationReducer } from '@/lib/store/organization-slice';
import { settingsReducer } from '@/lib/store/settings-slice';
import subscriptionReducer from '@/lib/store/subscription-slice';
import sowReducer from '@/lib/store/sow-slice';
import demoReducer from '@/lib/store/demo-slice';
import { collaborationReducer } from '@/lib/store/collaboration-slice';
import commentsReducer from '@/lib/store/comments-slice';
import { workspaceReducer } from '@/lib/store/workspace-slice';
import restApiReducer from '@/lib/store/rest-api-slice';
import webhookReducer from '@/lib/store/webhook-slice';

// Store reducers for testing
const testReducer = {
  auth: authReducer,
  user: userReducer,
  organization: organizationReducer,
  settings: settingsReducer,
  subscription: subscriptionReducer,
  sow: sowReducer,
  demo: demoReducer,
  collaboration: collaborationReducer,
  comments: commentsReducer,
  workspace: workspaceReducer,
  restApi: restApiReducer,
  webhooks: webhookReducer,
};

// Test store state type - matches actual RootState shape
export interface TestStoreState {
  auth: ReturnType<typeof authReducer>;
  user: ReturnType<typeof userReducer>;
  organization: ReturnType<typeof organizationReducer>;
  settings: ReturnType<typeof settingsReducer>;
  subscription: ReturnType<typeof subscriptionReducer>;
  sow: ReturnType<typeof sowReducer>;
  demo: ReturnType<typeof demoReducer>;
  collaboration: ReturnType<typeof collaborationReducer>;
  comments: ReturnType<typeof commentsReducer>;
  workspace: ReturnType<typeof workspaceReducer>;
  restApi: ReturnType<typeof restApiReducer>;
  webhooks: ReturnType<typeof webhookReducer>;
}

// Create a test store with optional preloaded state
export const createTestStore = (preloadedState?: Partial<TestStoreState>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = configureStore({
    reducer: testReducer,
    preloadedState: preloadedState as Parameters<typeof configureStore>[0]['preloadedState'],
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
  return store;
};

// All providers wrapper
interface AllProvidersProps {
  children: React.ReactNode;
  initialState?: Partial<TestStoreState>;
}

const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  initialState = {},
}) => {
  const store = createTestStore(initialState);

  return <Provider store={store}>{children}</Provider>;
};

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Partial<TestStoreState>;
}

// Custom render function with user event
const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } => {
  const { initialState, ...renderOptions } = options;
  const user = userEvent.setup();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllProviders initialState={initialState}>{children}</AllProviders>
  );

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Helper functions

/**
 * Wait for loading to finish (useful for async operations)
 */
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

/**
 * Mock API call with delay
 */
export const mockApiCall = <T,>(data: T, delay = 100): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

/**
 * Mock API error
 */
export const mockApiError = (
  message = 'API Error',
  delay = 100
): Promise<never> => {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), delay)
  );
};

/**
 * Fill form fields using Testing Library patterns
 * Falls back to direct DOM query if field not found via accessible queries
 */
export const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  formData: Record<string, string>
) => {
  for (const [fieldName, value] of Object.entries(formData)) {
    // Try to find by label first (more accessible)
    let field: HTMLElement | null = null;
    try {
      field = screen.getByLabelText(new RegExp(fieldName, 'i'));
    } catch {
      // Fall back to name attribute query
      field = document.querySelector(`[name="${fieldName}"]`);
    }
    if (field) {
      await user.clear(field);
      await user.type(field, value);
    }
  }
};

/**
 * Submit a form using Testing Library patterns
 */
export const submitForm = async (
  user: ReturnType<typeof userEvent.setup>,
  formSelector = 'form'
) => {
  // Try to find submit button via accessible query first
  let submitButton: HTMLElement | null = null;
  try {
    submitButton = screen.getByRole('button', { name: /submit/i });
  } catch {
    // Fall back to form-based query
    const form = document.querySelector(formSelector) as HTMLFormElement;
    if (form) {
      submitButton = form.querySelector('[type="submit"]');
    }
  }
  if (submitButton) {
    await user.click(submitButton);
  }
};

/**
 * Get table rows as array of arrays
 */
export const getTableRows = (tableSelector = 'table') => {
  const table = document.querySelector(tableSelector);
  if (!table) return [];

  const rows = Array.from(table.querySelectorAll('tbody tr'));
  return rows.map((row) => {
    const cells = Array.from(row.querySelectorAll('td'));
    return cells.map((cell) => cell.textContent?.trim() || '');
  });
};

/**
 * Wait for a modal to appear using Testing Library's waitFor
 * This properly handles cleanup and avoids timer leaks
 */
export const waitForModal = async (
  modalSelector = '[role="dialog"]'
): Promise<HTMLElement> => {
  return waitFor(
    () => {
      const modal = document.querySelector(modalSelector) as HTMLElement;
      if (!modal || getComputedStyle(modal).display === 'none') {
        throw new Error('Modal not found or not visible');
      }
      return modal;
    },
    { timeout: 5000, interval: 100 }
  );
};

/**
 * Basic accessibility check for quick sanity testing.
 * NOTE: For comprehensive accessibility testing, consider using @axe-core/react
 * which provides automated WCAG compliance checking.
 *
 * @example
 * // For comprehensive a11y testing, install and use axe-core:
 * // npm install -D @axe-core/react
 * // import { axe, toHaveNoViolations } from 'jest-axe';
 * // expect.extend(toHaveNoViolations);
 * // const results = await axe(container);
 * // expect(results).toHaveNoViolations();
 */
export const checkAccessibility = (container: HTMLElement): string[] => {
  const issues: string[] = [];

  // Check for missing alt text on images
  const images = container.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push(`Image at index ${index} is missing alt text`);
    }
  });

  // Check for missing labels on form inputs
  const inputs = container.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const hasLabel =
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      container.querySelector(`label[for="${input.id}"]`);
    if (!hasLabel && input.getAttribute('type') !== 'hidden') {
      issues.push(`Form input at index ${index} is missing a label`);
    }
  });

  return issues;
};

/**
 * Measure render time
 */
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  await waitForLoadingToFinish();
  const end = performance.now();
  return end - start;
};

// Export everything from testing-library for convenience
export * from '@testing-library/react';
export { customRender as render };
export { userEvent };
export { faker };
