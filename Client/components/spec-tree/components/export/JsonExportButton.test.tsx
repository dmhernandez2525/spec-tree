/**
 * Tests for JSON Export Button
 *
 * F1.1.11 - JSON Import/Export UI
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { JsonExportButton } from './JsonExportButton';

// Mock the import-export utilities
vi.mock('../../lib/utils/import-export', () => ({
  exportToJSON: vi.fn(() => '{"version":"1.0.0"}'),
  exportToCSV: vi.fn(() => 'Type,ID,Title'),
  exportToMarkdown: vi.fn(() => '# Export'),
  downloadFile: vi.fn(),
}));

// Helper to create mock state
function createMockState() {
  return {
    sow: {
      epics: { 'epic-1': { id: 'epic-1', title: 'Epic' } },
      features: { 'feature-1': { id: 'feature-1', title: 'Feature' } },
      userStories: { 'story-1': { id: 'story-1', title: 'Story' } },
      tasks: { 'task-1': { id: 'task-1', title: 'Task' } },
      contextualQuestions: [],
      globalInformation: 'Test project',
      selectedModel: 'gpt-3.5-turbo-16k',
      chatApi: 'StartState',
      id: 'test-app-id',
      apps: {},
      isLoading: false,
      error: null,
    },
    auth: { user: null, isAuthenticated: false },
    user: { profile: null },
    organization: { current: null },
    settings: { theme: 'light' },
    subscription: { plan: null },
    demo: { isDemo: false },
  };
}

// Create mock state with optional overrides
function createMockStateWithOverrides(sowOverrides: Record<string, unknown> = {}) {
  const base = createMockState();
  return {
    ...base,
    sow: {
      ...base.sow,
      ...sowOverrides,
    },
  };
}

// Create a mock store
function createMockStore(initialState?: ReturnType<typeof createMockState>) {
  const state = initialState ?? createMockState();
  return configureStore({
    reducer: {
      sow: (s = state.sow) => s,
      auth: (s = state.auth) => s,
      user: (s = state.user) => s,
      organization: (s = state.organization) => s,
      settings: (s = state.settings) => s,
      subscription: (s = state.subscription) => s,
      demo: (s = state.demo) => s,
    },
    preloadedState: state,
  });
}

describe('JsonExportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders export button', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <JsonExportButton />
      </Provider>
    );

    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders with trigger button that has correct attributes', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <JsonExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('supports outline variant by default', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <JsonExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-input');
  });

  it('supports default variant', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <JsonExportButton variant="default" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('supports secondary variant', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <JsonExportButton variant="secondary" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });

  it('supports ghost variant', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <JsonExportButton variant="ghost" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('supports small size', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <JsonExportButton size="sm" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8');
  });

  it('supports large size', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <JsonExportButton size="lg" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
  });

  it('applies custom className', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <JsonExportButton className="custom-class" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders button not disabled by default', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <JsonExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('renders icon SVGs in button', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <JsonExportButton />
      </Provider>
    );

    const svgs = screen.getByRole('button').querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('handles empty state gracefully', () => {
    const emptyState = createMockStateWithOverrides({
      epics: {},
      features: {},
      userStories: {},
      tasks: {},
    });
    const store = configureStore({
      reducer: {
        sow: (s = emptyState.sow) => s,
        auth: (s = emptyState.auth) => s,
        user: (s = emptyState.user) => s,
        organization: (s = emptyState.organization) => s,
        settings: (s = emptyState.settings) => s,
        subscription: (s = emptyState.subscription) => s,
        demo: (s = emptyState.demo) => s,
      },
      preloadedState: emptyState,
    });

    render(
      <Provider store={store}>
        <JsonExportButton />
      </Provider>
    );

    expect(screen.getByText('Export')).toBeInTheDocument();
  });
});
