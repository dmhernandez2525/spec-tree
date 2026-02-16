/**
 * Devin Export Tests
 *
 * F2.2.1 - Devin Task Format Export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as importExport from '../utils/import-export';
import {
  exportTaskAsDevin,
  exportUserStoryTasksAsDevin,
  exportFeatureTasksAsDevin,
  exportEpicTasksAsDevin,
  exportAllTasksAsDevin,
  generateLinearDevinTask,
  downloadDevinTasks,
  copyDevinTasksToClipboard,
  getDevinExportStatistics,
  getProjectName,
  getPlaybookForTask,
  exportPlaybook,
  DevinExportOptions,
} from './devin-export';
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

describe('devin-export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockState = (
    overrides: Partial<RootState['sow']> = {},
    commentOverrides = {}
  ): RootState => ({
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
          acceptanceCriteria: [
            { text: 'Criterion 1' },
            { text: 'Criterion 2' },
          ],
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
    comments: {
      commentsById: {
        'comment-1': {
          id: 'comment-1',
          targetType: 'task',
          targetId: 'task-1',
          authorId: 'user-1',
          authorName: 'Test User',
          body: 'Please verify edge cases.',
          mentions: [],
          status: 'open',
          createdAt: '2026-02-03T10:00:00.000Z',
        },
      },
      targetIndex: {
        'task:task-1': ['comment-1'],
      },
      notifications: [],
      ...commentOverrides,
    },
    auth: {} as RootState['auth'],
    user: {} as RootState['user'],
    organization: {} as RootState['organization'],
    settings: {} as RootState['settings'],
    subscription: {} as RootState['subscription'],
    demo: {} as RootState['demo'],
    workspace: {} as RootState['workspace'],
    collaboration: {
      mode: 'edit' as const,
      isEnabled: true,
      activity: [],
    },
    restApi: {
      keys: [],
      usage: null,
      usageHistory: [],
      isLoading: false,
      error: null,
    },
    webhooks: {
      webhooks: [],
      deliveries: [],
      templates: [],
      isLoading: false,
      error: null,
    },
  } as RootState);

  describe('exportTaskAsDevin', () => {
    it('exports task as Devin format', () => {
      const state = createMockState();
      const result = exportTaskAsDevin('task-1', state);

      expect(result).toContain('## Task: Test Task');
      expect(result).toContain('### Acceptance Criteria');
      expect(result).toContain('### Verification Commands');
    });

    it('includes user story acceptance criteria', () => {
      const state = createMockState();
      const result = exportTaskAsDevin('task-1', state);

      expect(result).toContain('Criterion 1');
      expect(result).toContain('Criterion 2');
    });

    it('includes parent context', () => {
      const state = createMockState();
      const result = exportTaskAsDevin('task-1', state);

      expect(result).toContain('**Epic:** Test Epic');
      expect(result).toContain('**Feature:** Test Feature');
      expect(result).toContain('**User Story:**');
    });

    it('includes comments when available', () => {
      const state = createMockState();
      const result = exportTaskAsDevin('task-1', state);

      expect(result).toContain('### Comments');
      expect(result).toContain('Test User (Open).');
      expect(result).toContain('Please verify edge cases.');
    });

    it('throws error for non-existent task', () => {
      const state = createMockState();

      expect(() => {
        exportTaskAsDevin('non-existent', state);
      }).toThrow('Task with ID non-existent not found');
    });

    it('throws error for empty task ID', () => {
      const state = createMockState();

      expect(() => {
        exportTaskAsDevin('', state);
      }).toThrow('Task ID is required and cannot be empty');
    });

    it('throws error for whitespace-only task ID', () => {
      const state = createMockState();

      expect(() => {
        exportTaskAsDevin('   ', state);
      }).toThrow('Task ID is required and cannot be empty');
    });

    it('uses custom options', () => {
      const state = createMockState();
      const options: DevinExportOptions = {
        estimatedHours: 8,
        customVerificationCommands: ['custom-cmd'],
      };

      const result = exportTaskAsDevin('task-1', state, options);

      expect(result).toContain('8 hours');
      expect(result).toContain('custom-cmd');
    });
  });

  describe('exportUserStoryTasksAsDevin', () => {
    it('exports all tasks in a user story', () => {
      const state = createMockState();
      const result = exportUserStoryTasksAsDevin('story-1', state);

      expect(result).toContain('Test Task');
    });

    it('throws error for non-existent user story', () => {
      const state = createMockState();

      expect(() => {
        exportUserStoryTasksAsDevin('non-existent', state);
      }).toThrow('User story with ID non-existent not found');
    });

    it('throws error when story has no tasks', () => {
      const state = createMockState({
        tasks: {},
      });

      expect(() => {
        exportUserStoryTasksAsDevin('story-1', state);
      }).toThrow('No tasks found for user story story-1');
    });

    it('throws error for empty user story ID', () => {
      const state = createMockState();

      expect(() => {
        exportUserStoryTasksAsDevin('', state);
      }).toThrow('User story ID is required and cannot be empty');
    });

    it('throws error for whitespace-only user story ID', () => {
      const state = createMockState();

      expect(() => {
        exportUserStoryTasksAsDevin('   ', state);
      }).toThrow('User story ID is required and cannot be empty');
    });
  });

  describe('exportFeatureTasksAsDevin', () => {
    it('exports all tasks in a feature', () => {
      const state = createMockState();
      const result = exportFeatureTasksAsDevin('feature-1', state);

      expect(result).toContain('Test Task');
    });

    it('throws error for non-existent feature', () => {
      const state = createMockState();

      expect(() => {
        exportFeatureTasksAsDevin('non-existent', state);
      }).toThrow('Feature with ID non-existent not found');
    });

    it('throws error for empty feature ID', () => {
      const state = createMockState();

      expect(() => {
        exportFeatureTasksAsDevin('', state);
      }).toThrow('Feature ID is required and cannot be empty');
    });

    it('throws error for whitespace-only feature ID', () => {
      const state = createMockState();

      expect(() => {
        exportFeatureTasksAsDevin('   ', state);
      }).toThrow('Feature ID is required and cannot be empty');
    });
  });

  describe('exportEpicTasksAsDevin', () => {
    it('exports all tasks in an epic', () => {
      const state = createMockState();
      const result = exportEpicTasksAsDevin('epic-1', state);

      expect(result).toContain('Test Task');
    });

    it('throws error for non-existent epic', () => {
      const state = createMockState();

      expect(() => {
        exportEpicTasksAsDevin('non-existent', state);
      }).toThrow('Epic with ID non-existent not found');
    });

    it('throws error for empty epic ID', () => {
      const state = createMockState();

      expect(() => {
        exportEpicTasksAsDevin('', state);
      }).toThrow('Epic ID is required and cannot be empty');
    });

    it('throws error for whitespace-only epic ID', () => {
      const state = createMockState();

      expect(() => {
        exportEpicTasksAsDevin('   ', state);
      }).toThrow('Epic ID is required and cannot be empty');
    });
  });

  describe('exportAllTasksAsDevin', () => {
    it('exports all tasks in the project', () => {
      const state = createMockState();
      const result = exportAllTasksAsDevin(state);

      expect(result).toContain('Test Task');
    });

    it('throws error when no tasks exist', () => {
      const state = createMockState({
        tasks: {},
      });

      expect(() => {
        exportAllTasksAsDevin(state);
      }).toThrow('No tasks found in the project');
    });

    it('exports multiple tasks', () => {
      const state = createMockState({
        tasks: {
          'task-1': {
            id: 'task-1',
            title: 'First Task',
            details: '',
            priority: 1,
            notes: '',
            parentUserStoryId: 'story-1',
            dependentTaskIds: [],
          },
          'task-2': {
            id: 'task-2',
            title: 'Second Task',
            details: '',
            priority: 2,
            notes: '',
            parentUserStoryId: 'story-1',
            dependentTaskIds: [],
          },
        },
      });

      const result = exportAllTasksAsDevin(state);

      expect(result).toContain('First Task');
      expect(result).toContain('Second Task');
    });
  });

  describe('generateLinearDevinTask', () => {
    it('generates Linear-compatible format', () => {
      const state = createMockState();
      const result = generateLinearDevinTask('task-1', state);

      expect(result).toContain('---');
      expect(result).toContain('title: "Test Task"');
      expect(result).toContain('labels:');
      expect(result).toContain('priority:');
    });

    it('throws error for non-existent task', () => {
      const state = createMockState();

      expect(() => {
        generateLinearDevinTask('non-existent', state);
      }).toThrow('Task with ID non-existent not found');
    });

    it('throws error for empty task ID', () => {
      const state = createMockState();

      expect(() => {
        generateLinearDevinTask('', state);
      }).toThrow('Task ID is required and cannot be empty');
    });

    it('throws error for whitespace-only task ID', () => {
      const state = createMockState();

      expect(() => {
        generateLinearDevinTask('   ', state);
      }).toThrow('Task ID is required and cannot be empty');
    });
  });

  describe('downloadDevinTasks', () => {
    it('calls downloadFile with correct parameters', () => {
      const content = '# Test Content';
      downloadDevinTasks(content, 'test.md');

      expect(importExport.downloadFile).toHaveBeenCalledWith(
        content,
        'test.md',
        'text/markdown'
      );
    });

    it('uses default filename when not provided', () => {
      const content = '# Test Content';
      downloadDevinTasks(content);

      expect(importExport.downloadFile).toHaveBeenCalledWith(
        content,
        'devin-tasks.md',
        'text/markdown'
      );
    });
  });

  describe('copyDevinTasksToClipboard', () => {
    it('copies content to clipboard successfully', async () => {
      mockWriteText.mockResolvedValue(undefined);

      const result = await copyDevinTasksToClipboard('test content');

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith('test content');
    });

    it('returns false on clipboard error', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard error'));

      const result = await copyDevinTasksToClipboard('test content');

      expect(result).toBe(false);
    });
  });

  describe('getDevinExportStatistics', () => {
    it('returns correct statistics', () => {
      const state = createMockState();
      const stats = getDevinExportStatistics(state);

      expect(stats.totalTasks).toBe(1);
      expect(stats.tasksWithAcceptanceCriteria).toBe(1);
      expect(stats.averageTasksPerStory).toBe(1);
    });

    it('handles empty state', () => {
      const state = createMockState({
        tasks: {},
        userStories: {},
      });

      const stats = getDevinExportStatistics(state);

      expect(stats.totalTasks).toBe(0);
      expect(stats.tasksWithAcceptanceCriteria).toBe(0);
      expect(stats.averageTasksPerStory).toBe(0);
    });

    it('counts tasks by type', () => {
      const state = createMockState({
        tasks: {
          'task-1': {
            id: 'task-1',
            title: 'Create component',
            details: '',
            priority: 1,
            notes: '',
            parentUserStoryId: 'story-1',
            dependentTaskIds: [],
          },
          'task-2': {
            id: 'task-2',
            title: 'Fix bug',
            details: '',
            priority: 1,
            notes: '',
            parentUserStoryId: 'story-1',
            dependentTaskIds: [],
          },
          'task-3': {
            id: 'task-3',
            title: 'Create API endpoint',
            details: '',
            priority: 1,
            notes: '',
            parentUserStoryId: 'story-1',
            dependentTaskIds: [],
          },
        },
      });

      const stats = getDevinExportStatistics(state);

      expect(stats.tasksByType.frontend).toBe(1);
      expect(stats.tasksByType.bugfix).toBe(1);
      expect(stats.tasksByType.backend).toBe(1);
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
  });

  describe('getPlaybookForTask', () => {
    it('returns frontend playbook for component tasks', () => {
      const task = {
        id: 'task-1',
        title: 'Create component',
        details: '',
        priority: 1,
        notes: '',
        parentUserStoryId: '',
        dependentTaskIds: [],
      };

      const playbook = getPlaybookForTask(task);

      expect(playbook).toBeDefined();
      expect(playbook?.taskType).toBe('frontend');
    });

    it('returns backend playbook for API tasks', () => {
      const task = {
        id: 'task-1',
        title: 'Create API endpoint',
        details: '',
        priority: 1,
        notes: '',
        parentUserStoryId: '',
        dependentTaskIds: [],
      };

      const playbook = getPlaybookForTask(task);

      expect(playbook).toBeDefined();
      expect(playbook?.taskType).toBe('backend');
    });

    it('returns bugfix playbook for bug tasks', () => {
      const task = {
        id: 'task-1',
        title: 'Fix bug in login',
        details: '',
        priority: 1,
        notes: '',
        parentUserStoryId: '',
        dependentTaskIds: [],
      };

      const playbook = getPlaybookForTask(task);

      expect(playbook).toBeDefined();
      expect(playbook?.taskType).toBe('bugfix');
    });

    it('returns undefined for unknown task types', () => {
      const task = {
        id: 'task-1',
        title: 'Some generic task',
        details: '',
        priority: 1,
        notes: '',
        parentUserStoryId: '',
        dependentTaskIds: [],
      };

      const playbook = getPlaybookForTask(task);

      expect(playbook).toBeUndefined();
    });
  });

  describe('exportPlaybook', () => {
    it('exports frontend playbook', () => {
      const result = exportPlaybook('frontend');

      expect(result).not.toBeNull();
      expect(result).toContain('Playbook');
      expect(result).toContain('React Component');
    });

    it('exports backend playbook', () => {
      const result = exportPlaybook('backend');

      expect(result).not.toBeNull();
      expect(result).toContain('API Endpoint');
    });

    it('returns null for unknown type', () => {
      const result = exportPlaybook('unknown');

      expect(result).toBeNull();
    });
  });
});
