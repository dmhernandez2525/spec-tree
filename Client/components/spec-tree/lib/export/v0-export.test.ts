/**
 * v0 Export Tests
 *
 * F2.1.8 - v0 UI Spec Export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as importExport from '../utils/import-export';
import {
  exportFeatureAsV0Spec,
  exportCustomV0Spec,
  exportEpicFeaturesAsV0Specs,
  exportAllFeaturesAsV0Specs,
  downloadV0Spec,
  copyV0SpecToClipboard,
  getV0ExportStatistics,
  getProjectName,
  generateV0Prompt,
  V0ExportOptions,
} from './v0-export';
import { RootState } from '@/lib/store';

// Mock the import-export utility
vi.mock('../utils/import-export', () => ({
  downloadFile: vi.fn(),
}));

// Mock navigator.clipboard
const mockWriteText = vi.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
});

describe('v0-export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockState = (overrides: Partial<RootState['sow']> = {}): RootState => ({
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
          description: 'Epic description',
          goal: 'Epic goal',
          successCriteria: '',
          dependencies: '',
          timeline: '',
          resources: '',
          risksAndMitigation: [],
          featureIds: ['feature-1'],
          parentAppId: 'app-1',
          notes: '',
        },
      },
      features: {
        'feature-1': {
          id: 'feature-1',
          title: 'Test Feature',
          description: 'Feature description',
          details: 'Feature details',
          dependencies: '',
          acceptanceCriteria: [
            { text: 'Should work correctly' },
            { text: 'Should be responsive' },
          ],
          parentEpicId: 'epic-1',
          userStoryIds: ['story-1'],
          notes: '',
          priority: 'high',
          effort: 'medium',
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
          acceptanceCriteria: [{ text: 'Criterion 1' }],
          notes: '',
          parentFeatureId: 'feature-1',
          taskIds: ['task-1'],
          developmentOrder: 1,
        },
      },
      tasks: {
        'task-1': {
          id: 'task-1',
          title: 'Test Task',
          details: 'Task details',
          priority: 1,
          notes: '',
          parentUserStoryId: 'story-1',
          dependentTaskIds: [],
        },
      },
      ...overrides,
    },
  } as RootState);

  describe('exportFeatureAsV0Spec', () => {
    it('exports feature as v0 spec', () => {
      const state = createMockState();
      const result = exportFeatureAsV0Spec('feature-1', state);

      expect(result).toContain('# UI Specification: Test Feature');
      expect(result).toContain('Feature description');
      expect(result).toContain('Feature details');
    });

    it('includes acceptance criteria', () => {
      const state = createMockState();
      const result = exportFeatureAsV0Spec('feature-1', state);

      expect(result).toContain('## Acceptance Criteria');
      expect(result).toContain('Should work correctly');
      expect(result).toContain('Should be responsive');
    });

    it('includes user stories as interactions', () => {
      const state = createMockState();
      const result = exportFeatureAsV0Spec('feature-1', state);

      expect(result).toContain('## Interactions');
      expect(result).toContain('do something');
    });

    it('includes tasks', () => {
      const state = createMockState();
      const result = exportFeatureAsV0Spec('feature-1', state);

      expect(result).toContain('## Implementation Tasks');
      expect(result).toContain('Test Task');
    });

    it('throws error for non-existent feature', () => {
      const state = createMockState();

      expect(() => {
        exportFeatureAsV0Spec('non-existent', state);
      }).toThrow('Feature with ID non-existent not found');
    });

    it('includes visual specifications', () => {
      const state = createMockState();
      const result = exportFeatureAsV0Spec('feature-1', state);

      expect(result).toContain('## Visual Specifications');
    });

    it('includes responsive behavior', () => {
      const state = createMockState();
      const result = exportFeatureAsV0Spec('feature-1', state);

      expect(result).toContain('## Responsive Behavior');
      expect(result).toContain('Mobile');
      expect(result).toContain('Desktop');
    });

    it('includes accessibility section', () => {
      const state = createMockState();
      const result = exportFeatureAsV0Spec('feature-1', state);

      expect(result).toContain('## Accessibility');
    });
  });

  describe('exportCustomV0Spec', () => {
    it('exports custom component spec', () => {
      const config = {
        componentName: 'CustomButton',
        description: 'A custom button',
      };

      const result = exportCustomV0Spec(config);

      expect(result).toContain('# Component: CustomButton');
      expect(result).toContain('A custom button');
    });

    it('includes default visual specs when enabled', () => {
      const config = {
        componentName: 'Button',
        description: 'Button',
      };

      const options: V0ExportOptions = {
        includeVisualSpecs: true,
      };

      const result = exportCustomV0Spec(config, options);

      expect(result).toContain('## Visual Specifications');
    });

    it('excludes visual specs when disabled', () => {
      const config = {
        componentName: 'Button',
        description: 'Button',
      };

      const options: V0ExportOptions = {
        includeVisualSpecs: false,
        includeStates: false,
        includeResponsive: false,
        includeInteractions: false,
        includeAccessibility: false,
      };

      const result = exportCustomV0Spec(config, options);

      expect(result).not.toContain('## Visual Specifications');
      expect(result).not.toContain('## States');
    });

    it('uses custom visual specs when provided', () => {
      const config = {
        componentName: 'Button',
        description: 'Button',
      };

      const options: V0ExportOptions = {
        includeVisualSpecs: true,
        customVisualSpecs: {
          container: 'custom-container',
        },
      };

      const result = exportCustomV0Spec(config, options);

      expect(result).toContain('custom-container');
    });
  });

  describe('exportEpicFeaturesAsV0Specs', () => {
    it('exports all features in an epic', () => {
      const state = createMockState();
      const result = exportEpicFeaturesAsV0Specs('epic-1', state);

      expect(result).toContain('Test Feature');
      expect(result).toContain('---');
    });

    it('throws error for non-existent epic', () => {
      const state = createMockState();

      expect(() => {
        exportEpicFeaturesAsV0Specs('non-existent', state);
      }).toThrow('Epic with ID non-existent not found');
    });

    it('throws error when epic has no features', () => {
      const state = createMockState({
        features: {},
      });

      expect(() => {
        exportEpicFeaturesAsV0Specs('epic-1', state);
      }).toThrow('No features found for epic epic-1');
    });

    it('exports multiple features', () => {
      const state = createMockState({
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature One',
            description: 'First',
            details: '',
            dependencies: '',
            acceptanceCriteria: [],
            parentEpicId: 'epic-1',
            userStoryIds: [],
            notes: '',
            priority: '',
            effort: '',
          },
          'feature-2': {
            id: 'feature-2',
            title: 'Feature Two',
            description: 'Second',
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
      });

      const result = exportEpicFeaturesAsV0Specs('epic-1', state);

      expect(result).toContain('Feature One');
      expect(result).toContain('Feature Two');
    });
  });

  describe('exportAllFeaturesAsV0Specs', () => {
    it('exports all features in the project', () => {
      const state = createMockState();
      const result = exportAllFeaturesAsV0Specs(state);

      expect(result).toContain('Test Feature');
    });

    it('throws error when no features exist', () => {
      const state = createMockState({
        features: {},
      });

      expect(() => {
        exportAllFeaturesAsV0Specs(state);
      }).toThrow('No features found in the project');
    });
  });

  describe('downloadV0Spec', () => {
    it('calls downloadFile with correct parameters', () => {
      const content = '# Test Spec';
      downloadV0Spec(content, 'test.md');

      expect(importExport.downloadFile).toHaveBeenCalledWith(
        content,
        'test.md',
        'text/markdown'
      );
    });

    it('uses default filename when not provided', () => {
      const content = '# Test Spec';
      downloadV0Spec(content);

      expect(importExport.downloadFile).toHaveBeenCalledWith(
        content,
        'v0-ui-spec.md',
        'text/markdown'
      );
    });
  });

  describe('copyV0SpecToClipboard', () => {
    it('copies content to clipboard successfully', async () => {
      mockWriteText.mockResolvedValue(undefined);

      const result = await copyV0SpecToClipboard('test content');

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith('test content');
    });

    it('returns false on clipboard error', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard error'));

      const result = await copyV0SpecToClipboard('test content');

      expect(result).toBe(false);
    });
  });

  describe('getV0ExportStatistics', () => {
    it('returns correct statistics', () => {
      const state = createMockState();
      const stats = getV0ExportStatistics(state);

      expect(stats.totalFeatures).toBe(1);
      expect(stats.featuresWithStories).toBe(1);
      expect(stats.featuresWithTasks).toBe(1);
      expect(stats.totalUserStories).toBe(1);
      expect(stats.totalTasks).toBe(1);
    });

    it('handles empty state', () => {
      const state = createMockState({
        features: {},
        userStories: {},
        tasks: {},
      });

      const stats = getV0ExportStatistics(state);

      expect(stats.totalFeatures).toBe(0);
      expect(stats.featuresWithStories).toBe(0);
      expect(stats.featuresWithTasks).toBe(0);
      expect(stats.totalUserStories).toBe(0);
      expect(stats.totalTasks).toBe(0);
    });

    it('counts features without stories correctly', () => {
      const state = createMockState({
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature without stories',
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
      });

      const stats = getV0ExportStatistics(state);

      expect(stats.totalFeatures).toBe(1);
      expect(stats.featuresWithStories).toBe(0);
      expect(stats.featuresWithTasks).toBe(0);
    });
  });

  describe('getProjectName', () => {
    it('returns app name when available', () => {
      const state = createMockState();
      const name = getProjectName(state);

      expect(name).toBe('Test App');
    });

    it('returns default name when no apps exist', () => {
      const state = createMockState({
        apps: {},
      });

      const name = getProjectName(state);

      expect(name).toBe('Spec Tree Project');
    });

    it('returns default name when app has no name', () => {
      const state = createMockState({
        apps: {
          'app-1': {
            id: 'app-1',
            name: '',
            globalInformation: '',
            applicationInformation: '',
            createdAt: '',
          },
        },
      });

      const name = getProjectName(state);

      expect(name).toBe('Spec Tree Project');
    });
  });

  describe('generateV0Prompt', () => {
    it('generates a v0 prompt for a feature', () => {
      const state = createMockState();
      const prompt = generateV0Prompt('feature-1', state);

      expect(prompt).toContain('Create a Test Feature component');
      expect(prompt).toContain('React, TypeScript, and Tailwind CSS');
      expect(prompt).toContain('Feature description');
    });

    it('includes acceptance criteria as requirements', () => {
      const state = createMockState();
      const prompt = generateV0Prompt('feature-1', state);

      expect(prompt).toContain('Requirements:');
      expect(prompt).toContain('Should work correctly');
      expect(prompt).toContain('Should be responsive');
    });

    it('includes shadcn/ui mention', () => {
      const state = createMockState();
      const prompt = generateV0Prompt('feature-1', state);

      expect(prompt).toContain('shadcn/ui');
    });

    it('includes responsive and accessible mention', () => {
      const state = createMockState();
      const prompt = generateV0Prompt('feature-1', state);

      expect(prompt).toContain('responsive and accessible');
    });

    it('throws error for non-existent feature', () => {
      const state = createMockState();

      expect(() => {
        generateV0Prompt('non-existent', state);
      }).toThrow('Feature with ID non-existent not found');
    });
  });
});
