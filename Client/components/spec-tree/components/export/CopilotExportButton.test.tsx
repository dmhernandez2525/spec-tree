/**
 * Tests for Copilot Export Button
 *
 * F2.1.5 - GitHub Copilot Export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CopilotExportButton } from './CopilotExportButton';

// Mock the export functions
vi.mock('../../lib/export/copilot-export', () => ({
  exportCopilotInstructions: vi.fn(() => '# Instructions'),
  exportTaskAsWRAP: vi.fn(() => '## WRAP'),
  exportUserStoryTasksAsWRAP: vi.fn(() => '## Story WRAP'),
  exportFeatureTasksAsWRAP: vi.fn(() => '## Feature WRAP'),
  downloadCopilotInstructions: vi.fn(),
  downloadWRAPIssues: vi.fn(),
  copyCopilotToClipboard: vi.fn().mockResolvedValue(true),
  getWRAPStatistics: vi.fn(() => ({
    totalTasks: 10,
    tasksWithStories: 8,
    tasksWithFeatures: 6,
    tasksWithEpics: 4,
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

describe('CopilotExportButton', () => {
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
        <CopilotExportButton />
      </Provider>
    );

    expect(screen.getByText('Copilot Export')).toBeInTheDocument();
  });

  it('renders with trigger button that has correct attributes', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CopilotExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('supports outline variant by default', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CopilotExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-input');
  });

  it('supports default variant', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CopilotExportButton variant="default" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('supports secondary variant', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CopilotExportButton variant="secondary" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });

  it('supports small size', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CopilotExportButton size="sm" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8');
  });

  it('supports large size', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CopilotExportButton size="lg" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
  });

  it('applies custom className', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CopilotExportButton className="custom-class" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders with taskId prop', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CopilotExportButton taskId="task-1" />
      </Provider>
    );

    expect(screen.getByText('Copilot Export')).toBeInTheDocument();
  });

  it('renders with userStoryId prop', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CopilotExportButton userStoryId="story-1" />
      </Provider>
    );

    expect(screen.getByText('Copilot Export')).toBeInTheDocument();
  });

  it('renders with featureId prop', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CopilotExportButton featureId="feature-1" />
      </Provider>
    );

    expect(screen.getByText('Copilot Export')).toBeInTheDocument();
  });

  it('renders button not disabled by default', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CopilotExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });
});
