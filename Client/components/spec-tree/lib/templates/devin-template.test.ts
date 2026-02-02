/**
 * Devin Template Tests
 *
 * F2.2.1 - Devin Task Format Export
 */

import { describe, it, expect } from 'vitest';
import {
  generateDevinTask,
  generateDevinTaskFromContext,
  generateBulkDevinTasks,
  generatePlaybook,
  DevinTaskConfig,
  DevinTaskContext,
  DevinContext,
  DevinTechnicalDetails,
  DevinPlaybook,
  DEFAULT_DEVIN_LABELS,
  DEFAULT_VERIFICATION_COMMANDS,
  DEFAULT_PLAYBOOKS,
} from './devin-template';
import { TaskType, UserStoryType, FeatureType, EpicType } from '../types/work-items';

describe('devin-template', () => {
  describe('generateDevinTask', () => {
    it('generates basic task with title and scope', () => {
      const config: DevinTaskConfig = {
        title: 'Implement DatePicker Component',
        scope: '4-6 hours estimated work',
        labels: ['devin', 'frontend'],
        context: {},
        acceptanceCriteria: ['Component renders correctly'],
        technicalDetails: { files: [] },
        verificationCommands: ['npm test'],
      };

      const result = generateDevinTask(config);

      expect(result).toContain('## Task: Implement DatePicker Component');
      expect(result).toContain('**Scope**: 4-6 hours estimated work');
      expect(result).toContain('**Labels**: devin, frontend');
    });

    it('generates task with full context', () => {
      const context: DevinContext = {
        epic: 'User Management',
        feature: 'Profile Settings',
        userStory: 'As a user, I want to update my profile so that my info is current',
        dependencies: ['Task-1', 'Task-2'],
        blockedBy: ['Task-0'],
      };

      const config: DevinTaskConfig = {
        title: 'Add profile picture upload',
        scope: '4 hours',
        labels: ['devin'],
        context,
        acceptanceCriteria: ['Upload works'],
        technicalDetails: { files: [] },
        verificationCommands: ['npm test'],
      };

      const result = generateDevinTask(config);

      expect(result).toContain('### Context');
      expect(result).toContain('**Epic:** User Management');
      expect(result).toContain('**Feature:** Profile Settings');
      expect(result).toContain('**User Story:**');
      expect(result).toContain('**Depends on:** Task-1, Task-2');
      expect(result).toContain('**Blocked by:** Task-0');
    });

    it('generates task with acceptance criteria', () => {
      const config: DevinTaskConfig = {
        title: 'Test Task',
        scope: '2 hours',
        labels: [],
        context: {},
        acceptanceCriteria: [
          'First criterion',
          'Second criterion',
          'Third criterion',
        ],
        technicalDetails: { files: [] },
        verificationCommands: [],
      };

      const result = generateDevinTask(config);

      expect(result).toContain('### Acceptance Criteria');
      expect(result).toContain('- [ ] First criterion');
      expect(result).toContain('- [ ] Second criterion');
      expect(result).toContain('- [ ] Third criterion');
    });

    it('generates task with technical details', () => {
      const technicalDetails: DevinTechnicalDetails = {
        files: [
          { path: 'src/components/Button.tsx', description: 'Main component', action: 'create' },
          { path: 'src/components/Button.test.tsx', description: 'Tests', action: 'create' },
          { path: 'src/index.ts', description: 'Export', action: 'modify' },
        ],
        dependencies: ['react', 'tailwindcss'],
        patterns: ['Follow existing component structure'],
        interfaces: ['interface ButtonProps { label: string; }'],
      };

      const config: DevinTaskConfig = {
        title: 'Create Button Component',
        scope: '3 hours',
        labels: [],
        context: {},
        acceptanceCriteria: ['Works'],
        technicalDetails,
        verificationCommands: [],
      };

      const result = generateDevinTask(config);

      expect(result).toContain('### Technical Details');
      expect(result).toContain('**Files:**');
      expect(result).toContain('`src/components/Button.tsx` (new) - Main component');
      expect(result).toContain('`src/index.ts` (modify) - Export');
      expect(result).toContain('**Dependencies:**');
      expect(result).toContain('react');
      expect(result).toContain('**Patterns:**');
      expect(result).toContain('**Interface:**');
      expect(result).toContain('interface ButtonProps');
    });

    it('generates task with verification commands', () => {
      const config: DevinTaskConfig = {
        title: 'Test Task',
        scope: '2 hours',
        labels: [],
        context: {},
        acceptanceCriteria: ['Works'],
        technicalDetails: { files: [] },
        verificationCommands: [
          'npm run lint',
          'npm run type-check',
          'npm test -- --run',
          'npm run build',
        ],
      };

      const result = generateDevinTask(config);

      expect(result).toContain('### Verification Commands');
      expect(result).toContain('```bash');
      expect(result).toContain('npm run lint');
      expect(result).toContain('npm test -- --run');
      expect(result).toContain('```');
    });

    it('generates task with references', () => {
      const config: DevinTaskConfig = {
        title: 'Test Task',
        scope: '2 hours',
        labels: [],
        context: {},
        acceptanceCriteria: ['Works'],
        technicalDetails: { files: [] },
        verificationCommands: [],
        references: [
          { type: 'design', description: 'Figma Design', link: 'https://figma.com/...' },
          { type: 'similar', description: 'Similar component: Button.tsx' },
          { type: 'documentation', description: 'API docs' },
        ],
      };

      const result = generateDevinTask(config);

      expect(result).toContain('### Reference');
      expect(result).toContain('[Figma Design](https://figma.com/...)');
      expect(result).toContain('**Similar:** Similar component: Button.tsx');
    });
  });

  describe('generateDevinTaskFromContext', () => {
    const mockTask: TaskType = {
      id: 'task-1',
      title: 'Implement login form',
      details: 'Create form with email and password fields',
      priority: 1,
      notes: '',
      parentUserStoryId: 'story-1',
      dependentTaskIds: [],
    };

    const mockUserStory: UserStoryType = {
      id: 'story-1',
      title: 'User Login',
      role: 'user',
      action: 'log into my account',
      goal: 'access my dashboard',
      points: '5',
      acceptanceCriteria: [
        { text: 'Email field is validated' },
        { text: 'Password is masked' },
        { text: 'Error messages are shown' },
      ],
      notes: '',
      parentFeatureId: 'feature-1',
      taskIds: ['task-1'],
      developmentOrder: 1,
    };

    const mockFeature: FeatureType = {
      id: 'feature-1',
      title: 'Authentication',
      description: 'User authentication system',
      details: '',
      dependencies: '',
      acceptanceCriteria: [],
      parentEpicId: 'epic-1',
      userStoryIds: ['story-1'],
      notes: 'Follow OAuth best practices',
      priority: '',
      effort: '',
    };

    const mockEpic: EpicType = {
      id: 'epic-1',
      title: 'User Management',
      description: 'All user-related features',
      goal: '',
      successCriteria: '',
      dependencies: '',
      timeline: '',
      resources: '',
      risksAndMitigation: [],
      featureIds: ['feature-1'],
      parentAppId: 'app-1',
      notes: '',
    };

    it('generates task from context', () => {
      const context: DevinTaskContext = {
        task: mockTask,
      };

      const result = generateDevinTaskFromContext(context);

      expect(result).toContain('## Task: Implement login form');
      expect(result).toContain('Implement Implement login form');
    });

    it('includes user story acceptance criteria', () => {
      const context: DevinTaskContext = {
        task: mockTask,
        userStory: mockUserStory,
      };

      const result = generateDevinTaskFromContext(context);

      expect(result).toContain('### Acceptance Criteria');
      expect(result).toContain('Email field is validated');
      expect(result).toContain('Password is masked');
      expect(result).toContain('Error messages are shown');
    });

    it('includes full hierarchy context', () => {
      const context: DevinTaskContext = {
        task: mockTask,
        userStory: mockUserStory,
        feature: mockFeature,
        epic: mockEpic,
      };

      const result = generateDevinTaskFromContext(context);

      expect(result).toContain('**Epic:** User Management');
      expect(result).toContain('**Feature:** Authentication');
      expect(result).toContain('As a user, I want to log into my account');
    });

    it('includes estimated hours', () => {
      const context: DevinTaskContext = {
        task: mockTask,
        estimatedHours: 6,
      };

      const result = generateDevinTaskFromContext(context);

      expect(result).toContain('6 hours estimated work');
    });

    it('includes custom verification commands', () => {
      const context: DevinTaskContext = {
        task: mockTask,
        verificationCommands: ['custom-lint', 'custom-test'],
      };

      const result = generateDevinTaskFromContext(context);

      expect(result).toContain('custom-lint');
      expect(result).toContain('custom-test');
    });

    it('adds test requirement to acceptance criteria', () => {
      const context: DevinTaskContext = {
        task: mockTask,
        userStory: mockUserStory,
      };

      const result = generateDevinTaskFromContext(context);

      expect(result).toContain('Tests pass with no regressions');
    });

    it('infers frontend labels for UI tasks', () => {
      const uiTask: TaskType = {
        ...mockTask,
        title: 'Create component for header',
      };

      const context: DevinTaskContext = {
        task: uiTask,
      };

      const result = generateDevinTaskFromContext(context);

      expect(result).toContain('frontend');
      expect(result).toContain('component');
    });

    it('infers backend labels for API tasks', () => {
      const apiTask: TaskType = {
        ...mockTask,
        title: 'Create API endpoint for users',
      };

      const context: DevinTaskContext = {
        task: apiTask,
      };

      const result = generateDevinTaskFromContext(context);

      expect(result).toContain('backend');
      expect(result).toContain('api');
    });
  });

  describe('generateBulkDevinTasks', () => {
    it('generates multiple tasks with dividers', () => {
      const task1: TaskType = {
        id: 'task-1',
        title: 'First Task',
        details: '',
        priority: 1,
        notes: '',
        parentUserStoryId: '',
        dependentTaskIds: [],
      };

      const task2: TaskType = {
        id: 'task-2',
        title: 'Second Task',
        details: '',
        priority: 2,
        notes: '',
        parentUserStoryId: '',
        dependentTaskIds: [],
      };

      const contexts: DevinTaskContext[] = [
        { task: task1 },
        { task: task2 },
      ];

      const result = generateBulkDevinTasks(contexts);

      expect(result).toContain('# Task 1');
      expect(result).toContain('First Task');
      expect(result).toContain('# Task 2');
      expect(result).toContain('Second Task');
      expect(result).toContain('---');
    });

    it('handles empty array', () => {
      const result = generateBulkDevinTasks([]);
      expect(result).toBe('');
    });
  });

  describe('generatePlaybook', () => {
    it('generates playbook with all sections', () => {
      const playbook: DevinPlaybook = {
        name: 'Test Playbook',
        description: 'A test playbook',
        taskType: 'testing',
        steps: [
          { order: 1, action: 'First step', details: 'Details here' },
          { order: 2, action: 'Second step' },
        ],
        defaultLabels: ['devin', 'testing'],
        defaultVerificationCommands: ['npm test'],
      };

      const result = generatePlaybook(playbook);

      expect(result).toContain('# Playbook: Test Playbook');
      expect(result).toContain('A test playbook');
      expect(result).toContain('**Task Type:** testing');
      expect(result).toContain('**Default Labels:** devin, testing');
      expect(result).toContain('## Steps');
      expect(result).toContain('1. First step');
      expect(result).toContain('- Details here');
      expect(result).toContain('2. Second step');
      expect(result).toContain('## Verification');
      expect(result).toContain('npm test');
    });
  });

  describe('DEFAULT constants', () => {
    it('DEFAULT_DEVIN_LABELS has common task types', () => {
      expect(DEFAULT_DEVIN_LABELS.frontend).toBeDefined();
      expect(DEFAULT_DEVIN_LABELS.backend).toBeDefined();
      expect(DEFAULT_DEVIN_LABELS.testing).toBeDefined();
      expect(DEFAULT_DEVIN_LABELS.bugfix).toBeDefined();
      expect(DEFAULT_DEVIN_LABELS.feature).toBeDefined();
    });

    it('DEFAULT_VERIFICATION_COMMANDS covers common cases', () => {
      expect(DEFAULT_VERIFICATION_COMMANDS.typescript).toBeDefined();
      expect(DEFAULT_VERIFICATION_COMMANDS.test).toBeDefined();
      expect(DEFAULT_VERIFICATION_COMMANDS.all).toBeDefined();
      expect(DEFAULT_VERIFICATION_COMMANDS.all).toContain('npm run lint');
      expect(DEFAULT_VERIFICATION_COMMANDS.all).toContain('npm run build');
    });

    it('DEFAULT_PLAYBOOKS includes common workflows', () => {
      expect(DEFAULT_PLAYBOOKS.length).toBeGreaterThan(0);

      const componentPlaybook = DEFAULT_PLAYBOOKS.find((p) => p.taskType === 'frontend');
      expect(componentPlaybook).toBeDefined();
      expect(componentPlaybook?.name).toContain('Component');

      const apiPlaybook = DEFAULT_PLAYBOOKS.find((p) => p.taskType === 'backend');
      expect(apiPlaybook).toBeDefined();

      const bugPlaybook = DEFAULT_PLAYBOOKS.find((p) => p.taskType === 'bugfix');
      expect(bugPlaybook).toBeDefined();
    });
  });
});
