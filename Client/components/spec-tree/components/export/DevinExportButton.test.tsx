/**
 * Devin Export Button Tests
 *
 * F2.2.1 - Devin Task Format Export
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DevinExportButton } from './DevinExportButton';
import { sowSlice } from '@/lib/store/sow-slice';

// Mock the export functions
vi.mock('../../lib/export/devin-export', () => ({
  exportTaskAsDevin: vi.fn(() => '# Task Spec'),
  exportUserStoryTasksAsDevin: vi.fn(() => '# Story Tasks'),
  exportFeatureTasksAsDevin: vi.fn(() => '# Feature Tasks'),
  exportEpicTasksAsDevin: vi.fn(() => '# Epic Tasks'),
  exportAllTasksAsDevin: vi.fn(() => '# All Tasks'),
  generateLinearDevinTask: vi.fn(() => '---\ntitle: Task\n---'),
  downloadDevinTasks: vi.fn(),
  copyDevinTasksToClipboard: vi.fn(() => Promise.resolve(true)),
  getDevinExportStatistics: vi.fn(() => ({
    totalTasks: 10,
    tasksByType: { frontend: 5, backend: 3, testing: 2 },
    tasksWithAcceptanceCriteria: 8,
    averageTasksPerStory: 2.5,
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
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Test Story',
            role: 'user',
            action: 'do something',
            goal: 'achieve something',
            points: '3',
            acceptanceCriteria: [],
            notes: '',
            parentFeatureId: 'feature-1',
            taskIds: [],
            developmentOrder: 1,
          },
        },
        tasks: {
          'task-1': {
            id: 'task-1',
            title: 'Test Task',
            details: '',
            priority: 1,
            notes: '',
            parentUserStoryId: 'story-1',
            dependentTaskIds: [],
          },
        },
      },
    },
  });
};

describe('DevinExportButton', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('renders the button', () => {
    render(
      <Provider store={store}>
        <DevinExportButton />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Devin Export')).toBeInTheDocument();
  });

  it('renders with custom variant', () => {
    render(
      <Provider store={store}>
        <DevinExportButton variant="secondary" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(
      <Provider store={store}>
        <DevinExportButton size="sm" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(
      <Provider store={store}>
        <DevinExportButton className="custom-class" />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders with taskId prop', () => {
    render(
      <Provider store={store}>
        <DevinExportButton taskId="task-1" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with userStoryId prop', () => {
    render(
      <Provider store={store}>
        <DevinExportButton userStoryId="story-1" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with featureId prop', () => {
    render(
      <Provider store={store}>
        <DevinExportButton featureId="feature-1" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with epicId prop', () => {
    render(
      <Provider store={store}>
        <DevinExportButton epicId="epic-1" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies default variant when not specified', () => {
    render(
      <Provider store={store}>
        <DevinExportButton />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders button with Devin icon', () => {
    render(
      <Provider store={store}>
        <DevinExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with options prop', () => {
    const options = {
      estimatedHours: 6,
      includeVerification: true,
    };

    render(
      <Provider store={store}>
        <DevinExportButton options={options} />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles onExportComplete callback prop', () => {
    const onExportComplete = vi.fn();

    render(
      <Provider store={store}>
        <DevinExportButton onExportComplete={onExportComplete} />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders not disabled initially', () => {
    render(
      <Provider store={store}>
        <DevinExportButton />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('handles ghost variant', () => {
    render(
      <Provider store={store}>
        <DevinExportButton variant="ghost" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles lg size', () => {
    render(
      <Provider store={store}>
        <DevinExportButton size="lg" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles all target IDs together', () => {
    render(
      <Provider store={store}>
        <DevinExportButton
          taskId="task-1"
          userStoryId="story-1"
          featureId="feature-1"
          epicId="epic-1"
        />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
