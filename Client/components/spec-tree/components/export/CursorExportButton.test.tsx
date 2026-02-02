/**
 * Tests for Cursor Export Button
 *
 * F2.1.1 - Cursor Rules Export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CursorExportButton } from './CursorExportButton';

// Mock the export functions
vi.mock('../../lib/export/cursor-export', () => ({
  exportProjectToCursorRules: vi.fn(() => '# Project Rules'),
  exportFeatureToCursorRules: vi.fn(() => '# Feature Rules'),
  exportEpicToCursorRules: vi.fn(() => '# Epic Rules'),
  downloadCursorRules: vi.fn(),
  copyCursorRulesToClipboard: vi.fn().mockResolvedValue(true),
  getExportStatistics: vi.fn(() => ({
    totalEpics: 2,
    totalFeatures: 5,
    totalUserStories: 10,
    totalTasks: 20,
    totalAcceptanceCriteria: 15,
  })),
}));

// Helper to create mock state
function createMockState() {
  return {
    sow: {
      epics: {},
      features: {},
      userStories: {},
      tasks: {},
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

// Create a mock store
function createMockStore(initialState = createMockState()) {
  return configureStore({
    reducer: {
      sow: (state = initialState.sow) => state,
      auth: (state = initialState.auth) => state,
      user: (state = initialState.user) => state,
      organization: (state = initialState.organization) => state,
      settings: (state = initialState.settings) => state,
      subscription: (state = initialState.subscription) => state,
      demo: (state = initialState.demo) => state,
    },
    preloadedState: initialState,
  });
}

describe('CursorExportButton', () => {
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
        <CursorExportButton />
      </Provider>
    );

    expect(screen.getByText('Cursor Export')).toBeInTheDocument();
  });

  it('renders with trigger button that has correct attributes', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CursorExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('supports outline variant by default', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CursorExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-input');
  });

  it('supports default variant', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CursorExportButton variant="default" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('supports secondary variant', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CursorExportButton variant="secondary" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });

  it('supports ghost variant', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CursorExportButton variant="ghost" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('supports small size', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CursorExportButton size="sm" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8');
  });

  it('supports large size', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CursorExportButton size="lg" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
  });

  it('applies custom className', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CursorExportButton className="custom-class" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders with featureId prop', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CursorExportButton featureId="feature-1" />
      </Provider>
    );

    expect(screen.getByText('Cursor Export')).toBeInTheDocument();
  });

  it('renders with epicId prop', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CursorExportButton epicId="epic-1" />
      </Provider>
    );

    expect(screen.getByText('Cursor Export')).toBeInTheDocument();
  });

  it('renders button not disabled by default', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CursorExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('renders icon SVGs in button', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CursorExportButton />
      </Provider>
    );

    // Button should contain SVG icons
    const svgs = screen.getByRole('button').querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('passes custom options prop', () => {
    const store = createMockStore();
    const customOptions = {
      includeTechStack: false,
    };

    render(
      <Provider store={store}>
        <CursorExportButton options={customOptions} />
      </Provider>
    );

    // Component should render without errors
    expect(screen.getByText('Cursor Export')).toBeInTheDocument();
  });
});
