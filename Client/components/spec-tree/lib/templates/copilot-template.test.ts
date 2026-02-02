/**
 * Tests for Copilot Template
 *
 * F2.1.5 - GitHub Copilot Export
 */

import { describe, it, expect } from 'vitest';
import {
  generateCopilotInstructions,
  generateWRAPFormat,
  generateBulkWRAPIssues,
  DEFAULT_COPILOT_TECH_STACK,
  DEFAULT_COPILOT_CONVENTIONS,
  DEFAULT_COPILOT_PATTERNS,
  DEFAULT_TEST_REQUIREMENTS,
  CopilotInstructionsConfig,
  WRAPContext,
} from './copilot-template';
import { TaskType, UserStoryType, FeatureType, EpicType } from '../types/work-items';

describe('Copilot Template', () => {
  describe('generateCopilotInstructions', () => {
    it('generates basic instructions with project name', () => {
      const config: CopilotInstructionsConfig = {
        projectName: 'My Project',
        description: 'A test project',
      };

      const result = generateCopilotInstructions(config);

      expect(result).toContain('# My Project');
      expect(result).toContain('A test project');
    });

    it('generates instructions with tech stack', () => {
      const config: CopilotInstructionsConfig = {
        projectName: 'Test',
        description: '',
        techStack: {
          framework: 'Next.js 14',
          language: 'TypeScript',
          styling: 'Tailwind CSS',
        },
      };

      const result = generateCopilotInstructions(config);

      expect(result).toContain('## Tech Stack');
      expect(result).toContain('**Framework:** Next.js 14');
      expect(result).toContain('**Language:** TypeScript');
      expect(result).toContain('**Styling:** Tailwind CSS');
    });

    it('generates instructions with conventions', () => {
      const config: CopilotInstructionsConfig = {
        projectName: 'Test',
        description: '',
        conventions: {
          naming: {
            components: 'PascalCase',
            hooks: 'camelCase with use prefix',
          },
          fileStructure: ['components/', 'lib/'],
          codePatterns: ['Use cn() for classes'],
        },
      };

      const result = generateCopilotInstructions(config);

      expect(result).toContain('## Coding Conventions');
      expect(result).toContain('### Naming Conventions');
      expect(result).toContain('**Components:** PascalCase');
      expect(result).toContain('### File Structure');
      expect(result).toContain('components/');
      expect(result).toContain('### Code Patterns');
      expect(result).toContain('Use cn() for classes');
    });

    it('generates instructions with patterns', () => {
      const config: CopilotInstructionsConfig = {
        projectName: 'Test',
        description: '',
        patterns: {
          componentPattern: 'Follow ui/ patterns',
          apiPattern: 'Follow api/ patterns',
          referenceFiles: {
            Button: 'components/ui/button.tsx',
          },
        },
      };

      const result = generateCopilotInstructions(config);

      expect(result).toContain('## Architecture Patterns');
      expect(result).toContain('**Component Pattern:** Follow ui/ patterns');
      expect(result).toContain('### Reference Files');
      expect(result).toContain('**Button:** `components/ui/button.tsx`');
    });

    it('generates instructions with test requirements', () => {
      const config: CopilotInstructionsConfig = {
        projectName: 'Test',
        description: '',
        testRequirements: {
          framework: 'Vitest',
          coverageThreshold: 80,
          patterns: ['Test rendering', 'Test interactions'],
        },
      };

      const result = generateCopilotInstructions(config);

      expect(result).toContain('## Testing Requirements');
      expect(result).toContain('**Framework:** Vitest');
      expect(result).toContain('**Coverage Threshold:** 80%');
      expect(result).toContain('Test rendering');
    });
  });

  describe('generateWRAPFormat', () => {
    const mockTask: TaskType = {
      id: 'task-1',
      title: 'Implement login form',
      details: 'Create a login form with email and password fields',
      priority: 1,
      notes: 'Use shadcn form components',
      parentUserStoryId: 'story-1',
      dependentTaskIds: [],
    };

    it('generates WRAP format with basic task', () => {
      const context: WRAPContext = { task: mockTask };

      const result = generateWRAPFormat(context);

      expect(result).toContain('## Implement login form');
      expect(result).toContain('## What');
      expect(result).toContain('Create a login form with email and password fields');
      expect(result).toContain('## Requirements');
      expect(result).toContain('## Actual files');
      expect(result).toContain('## Patterns');
      expect(result).toContain('**Priority:** 1');
    });

    it('generates WRAP format with full hierarchy context', () => {
      const userStory: UserStoryType = {
        id: 'story-1',
        title: 'User Login',
        role: 'user',
        action: 'log in with email',
        goal: 'access my account',
        points: '5',
        acceptanceCriteria: [
          { text: 'Valid credentials allow login' },
          { text: 'Invalid credentials show error' },
        ],
        notes: '',
        parentFeatureId: 'feature-1',
        taskIds: [],
        developmentOrder: 1,
      };

      const feature: FeatureType = {
        id: 'feature-1',
        title: 'Authentication',
        description: 'User authentication system',
        details: '',
        acceptanceCriteria: [],
        parentEpicId: 'epic-1',
        userStoryIds: [],
        notes: '',
        priority: 'High',
        effort: 'M',
      };

      const epic: EpicType = {
        id: 'epic-1',
        title: 'Security',
        description: 'Security features',
        goal: 'Secure application',
        successCriteria: '',
        dependencies: '',
        timeline: '',
        resources: '',
        risksAndMitigation: [],
        featureIds: [],
        parentAppId: 'app-1',
        notes: '',
      };

      const context: WRAPContext = {
        task: mockTask,
        userStory,
        feature,
        epic,
      };

      const result = generateWRAPFormat(context);

      expect(result).toContain('### Context');
      expect(result).toContain('**Epic:** Security');
      expect(result).toContain('**Feature:** Authentication');
      expect(result).toContain('As a user, I want to log in with email');
      expect(result).toContain('- [ ] Valid credentials allow login');
      expect(result).toContain('- [ ] Invalid credentials show error');
    });

    it('generates WRAP format with affected files', () => {
      const context: WRAPContext = {
        task: mockTask,
        affectedFiles: [
          'src/components/auth/LoginForm.tsx',
          'src/hooks/useAuth.ts',
        ],
      };

      const result = generateWRAPFormat(context);

      expect(result).toContain('`src/components/auth/LoginForm.tsx`');
      expect(result).toContain('`src/hooks/useAuth.ts`');
    });

    it('generates WRAP format with reference patterns', () => {
      const context: WRAPContext = {
        task: mockTask,
        referencePatterns: [
          'Follow the pattern in src/components/ui/form.tsx',
          'Use Zod for validation',
        ],
      };

      const result = generateWRAPFormat(context);

      expect(result).toContain('Follow the pattern in src/components/ui/form.tsx');
      expect(result).toContain('Use Zod for validation');
    });
  });

  describe('generateBulkWRAPIssues', () => {
    it('generates multiple issues separated by dividers', () => {
      const task1: TaskType = {
        id: 'task-1',
        title: 'Task One',
        details: 'First task',
        priority: 1,
        notes: '',
        parentUserStoryId: 'story-1',
        dependentTaskIds: [],
      };

      const task2: TaskType = {
        id: 'task-2',
        title: 'Task Two',
        details: 'Second task',
        priority: 2,
        notes: '',
        parentUserStoryId: 'story-1',
        dependentTaskIds: [],
      };

      const contexts: WRAPContext[] = [
        { task: task1 },
        { task: task2 },
      ];

      const result = generateBulkWRAPIssues(contexts);

      expect(result).toContain('# Issue 1');
      expect(result).toContain('# Issue 2');
      expect(result).toContain('Task One');
      expect(result).toContain('Task Two');
      expect(result).toContain('---');
    });
  });

  describe('Default Constants', () => {
    it('DEFAULT_COPILOT_TECH_STACK has expected values', () => {
      expect(DEFAULT_COPILOT_TECH_STACK.framework).toContain('Next.js');
      expect(DEFAULT_COPILOT_TECH_STACK.language).toContain('TypeScript');
    });

    it('DEFAULT_COPILOT_CONVENTIONS has naming conventions', () => {
      expect(DEFAULT_COPILOT_CONVENTIONS.naming?.components).toContain('PascalCase');
      expect(DEFAULT_COPILOT_CONVENTIONS.naming?.hooks).toContain('use');
    });

    it('DEFAULT_COPILOT_PATTERNS has reference files', () => {
      expect(DEFAULT_COPILOT_PATTERNS.referenceFiles).toBeDefined();
      expect(Object.keys(DEFAULT_COPILOT_PATTERNS.referenceFiles || {}).length).toBeGreaterThan(0);
    });

    it('DEFAULT_TEST_REQUIREMENTS has coverage threshold', () => {
      expect(DEFAULT_TEST_REQUIREMENTS.coverageThreshold).toBe(80);
    });
  });
});
