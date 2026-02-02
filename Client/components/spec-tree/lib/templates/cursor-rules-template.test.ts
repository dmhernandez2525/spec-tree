/**
 * Tests for Cursor Rules Template
 *
 * F2.1.1 - Cursor Rules Export
 */

import { describe, it, expect } from 'vitest';
import {
  generateFrontmatter,
  generateTechStackSection,
  generateCodeStyleSection,
  generateArchitectureSection,
  generateAcceptanceCriteria,
  generateUserStorySection,
  generateTaskSection,
  generateFeatureContextSection,
  generateCursorRulesContent,
  DEFAULT_NEXTJS_TECH_STACK,
  DEFAULT_NEXTJS_CODE_STYLE,
  DEFAULT_NEXTJS_ARCHITECTURE,
  CursorRulesConfig,
  TechStackInfo,
  CodeStyleInfo,
  ArchitectureInfo,
  FeatureContext,
} from './cursor-rules-template';
import { FeatureType, UserStoryType, TaskType, EpicType } from '../types/work-items';

describe('Cursor Rules Template', () => {
  describe('generateFrontmatter', () => {
    it('generates valid frontmatter with project name', () => {
      const config: CursorRulesConfig = {
        projectName: 'My Project',
        description: 'A test project',
      };

      const result = generateFrontmatter(config);

      expect(result).toContain('---');
      expect(result).toContain('title: My Project Rules');
      expect(result).toContain('description: Spec Tree generated rules for My Project');
    });
  });

  describe('generateTechStackSection', () => {
    it('returns empty string when no tech stack provided', () => {
      const result = generateTechStackSection(undefined);
      expect(result).toBe('');
    });

    it('generates tech stack section with all fields', () => {
      const techStack: TechStackInfo = {
        framework: 'Next.js 14',
        language: 'TypeScript',
        styling: 'Tailwind CSS',
        stateManagement: 'Zustand',
        testing: 'Vitest',
        additionalTools: ['Radix UI', 'shadcn/ui'],
      };

      const result = generateTechStackSection(techStack);

      expect(result).toContain('## Tech Stack');
      expect(result).toContain('Framework: Next.js 14');
      expect(result).toContain('Language: TypeScript');
      expect(result).toContain('Styling: Tailwind CSS');
      expect(result).toContain('State: Zustand');
      expect(result).toContain('Testing: Vitest');
      expect(result).toContain('Radix UI');
      expect(result).toContain('shadcn/ui');
    });

    it('handles partial tech stack', () => {
      const techStack: TechStackInfo = {
        framework: 'React',
      };

      const result = generateTechStackSection(techStack);

      expect(result).toContain('## Tech Stack');
      expect(result).toContain('Framework: React');
      expect(result).not.toContain('Language:');
    });
  });

  describe('generateCodeStyleSection', () => {
    it('returns empty string when no code style provided', () => {
      const result = generateCodeStyleSection(undefined);
      expect(result).toBe('');
    });

    it('generates code style section with all fields', () => {
      const codeStyle: CodeStyleInfo = {
        componentNaming: 'PascalCase',
        hookNaming: 'camelCase with use prefix',
        typeNaming: 'PascalCase with Type suffix',
        fileNaming: 'kebab-case',
        importOrdering: ['React', 'Third-party', 'Local'],
        additionalRules: ['Use cn() for classes', 'Prefer named exports'],
      };

      const result = generateCodeStyleSection(codeStyle);

      expect(result).toContain('## Code Style');
      expect(result).toContain('Components: PascalCase');
      expect(result).toContain('Hooks: camelCase with use prefix');
      expect(result).toContain('Types: PascalCase with Type suffix');
      expect(result).toContain('Files: kebab-case');
      expect(result).toContain('Import ordering:');
      expect(result).toContain('1. React');
      expect(result).toContain('Use cn() for classes');
    });
  });

  describe('generateArchitectureSection', () => {
    it('returns empty string when no architecture provided', () => {
      const result = generateArchitectureSection(undefined);
      expect(result).toBe('');
    });

    it('generates architecture section with all fields', () => {
      const architecture: ArchitectureInfo = {
        componentPattern: 'src/components/',
        apiPattern: 'src/app/api/',
        hooksPattern: 'src/hooks/',
        storePattern: 'src/lib/store/',
        additionalPatterns: {
          Utils: 'src/lib/',
          Types: 'src/types/',
        },
      };

      const result = generateArchitectureSection(architecture);

      expect(result).toContain('## Architecture');
      expect(result).toContain('Components: src/components/');
      expect(result).toContain('API routes: src/app/api/');
      expect(result).toContain('Hooks: src/hooks/');
      expect(result).toContain('State: src/lib/store/');
      expect(result).toContain('Utils: src/lib/');
      expect(result).toContain('Types: src/types/');
    });
  });

  describe('generateAcceptanceCriteria', () => {
    it('returns empty string for empty criteria', () => {
      const result = generateAcceptanceCriteria([]);
      expect(result).toBe('');
    });

    it('generates checklist from criteria', () => {
      const criteria = [
        { text: 'User can log in' },
        { text: 'Session is persisted' },
        { text: 'Error messages shown' },
      ];

      const result = generateAcceptanceCriteria(criteria);

      expect(result).toContain('### Acceptance Criteria');
      expect(result).toContain('- [ ] User can log in');
      expect(result).toContain('- [ ] Session is persisted');
      expect(result).toContain('- [ ] Error messages shown');
    });

    it('skips empty criteria items', () => {
      const criteria = [
        { text: 'Valid item' },
        { text: '' },
      ];

      const result = generateAcceptanceCriteria(criteria);

      expect(result).toContain('- [ ] Valid item');
      expect(result.match(/- \[ \]/g)?.length).toBe(1);
    });
  });

  describe('generateUserStorySection', () => {
    it('generates user story with all fields', () => {
      const story: UserStoryType = {
        id: 'story-1',
        title: 'User Authentication',
        role: 'user',
        action: 'log in with email',
        goal: 'access my account',
        points: '5',
        acceptanceCriteria: [{ text: 'Valid credentials work' }],
        notes: 'Important',
        parentFeatureId: 'feature-1',
        taskIds: [],
        developmentOrder: 1,
      };

      const result = generateUserStorySection(story);

      expect(result).toContain('#### User Authentication');
      expect(result).toContain('As a **user**');
      expect(result).toContain('I want to **log in with email**');
      expect(result).toContain('so that **access my account**');
      expect(result).toContain('**Estimated Effort:** 5 points');
      expect(result).toContain('- [ ] Valid credentials work');
    });

    it('handles story without points', () => {
      const story: UserStoryType = {
        id: 'story-1',
        title: 'Test Story',
        role: 'admin',
        action: 'do something',
        goal: 'achieve goal',
        points: '',
        acceptanceCriteria: [],
        notes: '',
        parentFeatureId: 'feature-1',
        taskIds: [],
        developmentOrder: 1,
      };

      const result = generateUserStorySection(story);

      expect(result).not.toContain('**Estimated Effort:**');
    });
  });

  describe('generateTaskSection', () => {
    it('generates task with all fields', () => {
      const task: TaskType = {
        id: 'task-1',
        title: 'Implement login form',
        details: 'Create form with email and password fields',
        priority: 1,
        notes: 'Use shadcn form',
        parentUserStoryId: 'story-1',
        dependentTaskIds: [],
      };

      const result = generateTaskSection(task);

      expect(result).toContain('- [ ] **Implement login form**');
      expect(result).toContain('Create form with email and password fields');
      expect(result).toContain('Priority: 1');
    });

    it('handles task without details', () => {
      const task: TaskType = {
        id: 'task-1',
        title: 'Simple task',
        details: '',
        priority: 2,
        notes: '',
        parentUserStoryId: 'story-1',
        dependentTaskIds: [],
      };

      const result = generateTaskSection(task);

      expect(result).toContain('- [ ] **Simple task**');
      expect(result).toContain('Priority: 2');
    });
  });

  describe('generateFeatureContextSection', () => {
    it('returns empty string when no context provided', () => {
      const result = generateFeatureContextSection(undefined);
      expect(result).toBe('');
    });

    it('generates feature context with all data', () => {
      const feature: FeatureType = {
        id: 'feature-1',
        title: 'User Authentication',
        description: 'Allow users to authenticate',
        details: 'OAuth2 and email/password',
        acceptanceCriteria: [{ text: 'Users can log in' }],
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
        goal: 'Secure the application',
        successCriteria: 'All endpoints protected',
        dependencies: '',
        timeline: '',
        resources: '',
        risksAndMitigation: [],
        featureIds: [],
        parentAppId: 'app-1',
        notes: '',
      };

      const userStories: UserStoryType[] = [
        {
          id: 'story-1',
          title: 'Login',
          role: 'user',
          action: 'log in',
          goal: 'access account',
          points: '3',
          acceptanceCriteria: [],
          notes: '',
          parentFeatureId: 'feature-1',
          taskIds: [],
          developmentOrder: 1,
        },
      ];

      const tasks: TaskType[] = [
        {
          id: 'task-1',
          title: 'Create login form',
          details: 'Form with validation',
          priority: 1,
          notes: '',
          parentUserStoryId: 'story-1',
          dependentTaskIds: [],
        },
      ];

      const context: FeatureContext = {
        feature,
        epic,
        userStories,
        tasks,
      };

      const result = generateFeatureContextSection(context);

      expect(result).toContain('## Current Feature Context');
      expect(result).toContain('### Feature: User Authentication');
      expect(result).toContain('Allow users to authenticate');
      expect(result).toContain('**Details:** OAuth2 and email/password');
      expect(result).toContain('**Epic:** Security');
      expect(result).toContain('**Epic Goal:** Secure the application');
      expect(result).toContain('### User Stories');
      expect(result).toContain('#### Login');
      expect(result).toContain('### Tasks');
      expect(result).toContain('**Create login form**');
    });
  });

  describe('generateCursorRulesContent', () => {
    it('generates complete rules with all sections', () => {
      const config: CursorRulesConfig = {
        projectName: 'Test Project',
        description: 'A comprehensive test project',
        techStack: DEFAULT_NEXTJS_TECH_STACK,
        codeStyle: DEFAULT_NEXTJS_CODE_STYLE,
        architecture: DEFAULT_NEXTJS_ARCHITECTURE,
      };

      const result = generateCursorRulesContent(config);

      expect(result).toContain('---');
      expect(result).toContain('title: Test Project Rules');
      expect(result).toContain('# Project: Test Project');
      expect(result).toContain('A comprehensive test project');
      expect(result).toContain('## Tech Stack');
      expect(result).toContain('## Code Style');
      expect(result).toContain('## Architecture');
    });

    it('generates minimal rules without optional sections', () => {
      const config: CursorRulesConfig = {
        projectName: 'Minimal Project',
        description: '',
      };

      const result = generateCursorRulesContent(config);

      expect(result).toContain('# Project: Minimal Project');
      expect(result).not.toContain('## Tech Stack');
      expect(result).not.toContain('## Code Style');
      expect(result).not.toContain('## Architecture');
    });
  });

  describe('Default Constants', () => {
    it('DEFAULT_NEXTJS_TECH_STACK has expected values', () => {
      expect(DEFAULT_NEXTJS_TECH_STACK.framework).toContain('Next.js');
      expect(DEFAULT_NEXTJS_TECH_STACK.language).toContain('TypeScript');
      expect(DEFAULT_NEXTJS_TECH_STACK.styling).toContain('Tailwind');
    });

    it('DEFAULT_NEXTJS_CODE_STYLE has expected values', () => {
      expect(DEFAULT_NEXTJS_CODE_STYLE.componentNaming).toContain('PascalCase');
      expect(DEFAULT_NEXTJS_CODE_STYLE.hookNaming).toContain('use');
    });

    it('DEFAULT_NEXTJS_ARCHITECTURE has expected values', () => {
      expect(DEFAULT_NEXTJS_ARCHITECTURE.componentPattern).toBeDefined();
      expect(DEFAULT_NEXTJS_ARCHITECTURE.apiPattern).toBeDefined();
    });
  });
});
