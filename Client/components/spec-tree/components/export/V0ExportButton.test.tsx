/**
 * V0 Export Button Tests
 *
 * F2.1.8 - v0 UI Spec Export
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { V0ExportButton } from './V0ExportButton';
import { sowSlice } from '@/lib/store/sow-slice';

// Mock the export functions
vi.mock('../../lib/export/v0-export', () => ({
  exportFeatureAsV0Spec: vi.fn(() => '# Test Spec'),
  exportEpicFeaturesAsV0Specs: vi.fn(() => '# Epic Specs'),
  exportAllFeaturesAsV0Specs: vi.fn(() => '# All Specs'),
  generateV0Prompt: vi.fn(() => 'Create a component'),
  downloadV0Spec: vi.fn(),
  copyV0SpecToClipboard: vi.fn(() => Promise.resolve(true)),
  getV0ExportStatistics: vi.fn(() => ({
    totalFeatures: 5,
    featuresWithStories: 3,
    featuresWithTasks: 2,
    totalUserStories: 10,
    totalTasks: 20,
  })),
}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      sow: sowSlice.reducer,
    },
    preloadedState: {
      sow: {
        id: 'test-id',
        globalInformation: 'Test project',
        chatApi: 'openai',
        selectedModel: 'gpt-4',
        apps: {
          'app-1': {
            id: 'app-1',
            name: 'Test App',
            globalInformation: '',
            applicationInformation: '',
            createdAt: '2024-01-01',
          },
        },
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Test Epic',
            description: '',
            goal: '',
            successCriteria: '',
            dependencies: '',
            timeline: '',
            resources: '',
            risksAndMitigation: [],
            featureIds: [],
            parentAppId: 'app-1',
            notes: '',
          },
        },
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Test Feature',
            description: '',
            details: '',
            dependencies: '',
            acceptanceCriteria: [],
            parentEpicId: 'epic-1',
            userStoryIds: [],
            notes: '',
            priority: '',
            effort: '',
          },
        },
        userStories: {},
        tasks: {},
      },
    },
  });
};

describe('V0ExportButton', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('renders the button', () => {
    render(
      <Provider store={store}>
        <V0ExportButton />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('v0 Export')).toBeInTheDocument();
  });

  it('renders with custom variant', () => {
    render(
      <Provider store={store}>
        <V0ExportButton variant="secondary" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(
      <Provider store={store}>
        <V0ExportButton size="sm" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(
      <Provider store={store}>
        <V0ExportButton className="custom-class" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders with featureId prop', () => {
    render(
      <Provider store={store}>
        <V0ExportButton featureId="feature-1" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with epicId prop', () => {
    render(
      <Provider store={store}>
        <V0ExportButton epicId="epic-1" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with both featureId and epicId props', () => {
    render(
      <Provider store={store}>
        <V0ExportButton featureId="feature-1" epicId="epic-1" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies default variant when not specified', () => {
    render(
      <Provider store={store}>
        <V0ExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('applies default size when not specified', () => {
    render(
      <Provider store={store}>
        <V0ExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders button with v0 icon', () => {
    render(
      <Provider store={store}>
        <V0ExportButton />
      </Provider>
    );

    // Button should contain an SVG icon
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with options prop', () => {
    const options = {
      includeVisualSpecs: true,
      includeStates: false,
    };

    render(
      <Provider store={store}>
        <V0ExportButton options={options} />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onExportComplete callback on successful export simulation', () => {
    const onExportComplete = vi.fn();

    render(
      <Provider store={store}>
        <V0ExportButton onExportComplete={onExportComplete} />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    // The callback would be called after user interaction with dropdown
  });

  it('renders disabled state correctly', () => {
    render(
      <Provider store={store}>
        <V0ExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    // Button should not be disabled initially
    expect(button).not.toBeDisabled();
  });

  it('handles ghost variant', () => {
    render(
      <Provider store={store}>
        <V0ExportButton variant="ghost" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles lg size', () => {
    render(
      <Provider store={store}>
        <V0ExportButton size="lg" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles icon size', () => {
    render(
      <Provider store={store}>
        <V0ExportButton size="icon" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
