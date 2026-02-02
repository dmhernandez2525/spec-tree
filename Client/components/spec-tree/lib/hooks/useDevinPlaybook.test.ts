/**
 * Tests for useDevinPlaybook hook
 *
 * F2.2.2 - Devin playbook generation
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  useDevinPlaybook,
  formatUserStory,
  formatAcceptanceCriteria,
  formatFileSpecs,
  formatVerificationCommands,
  formatTaskSpecAsMarkdown,
  generateBranchName,
  getComponentPlaybook,
  getApiEndpointPlaybook,
  getFeaturePlaybook,
  getBugfixPlaybook,
  getRefactorPlaybook,
  getDefaultVerificationCommands,
  type DevinTaskSpec,
  type TaskMetadata,
  type UserStory,
  type AcceptanceCriterion,
  type FileSpec,
  type VerificationCommand,
} from './useDevinPlaybook';

describe('formatUserStory', () => {
  it('should format user story correctly', () => {
    const story: UserStory = {
      role: 'admin user',
      action: 'filter orders by date range',
      benefit: 'I can analyze sales for specific periods',
    };

    const result = formatUserStory(story);

    expect(result).toBe(
      'As admin user, I want to filter orders by date range so that I can analyze sales for specific periods.'
    );
  });
});

describe('formatAcceptanceCriteria', () => {
  it('should format criteria as checklist', () => {
    const criteria: AcceptanceCriterion[] = [
      { id: 'AC-1', description: 'Component renders without errors', testable: true },
      { id: 'AC-2', description: 'All tests pass', testable: true },
    ];

    const result = formatAcceptanceCriteria(criteria);

    expect(result).toContain('- [ ] Component renders without errors');
    expect(result).toContain('- [ ] All tests pass');
  });
});

describe('formatFileSpecs', () => {
  it('should format files with action indicators', () => {
    const files: FileSpec[] = [
      { path: 'src/components/Button.tsx', action: 'create', description: 'Main component' },
      { path: 'src/components/index.ts', action: 'modify' },
    ];

    const result = formatFileSpecs(files);

    expect(result).toContain('+ src/components/Button.tsx');
    expect(result).toContain('# Main component');
    expect(result).toContain('~ src/components/index.ts');
    expect(result).toContain('```');
  });

  it('should use - for delete action', () => {
    const files: FileSpec[] = [{ path: 'src/deprecated.ts', action: 'delete' }];

    const result = formatFileSpecs(files);

    expect(result).toContain('- src/deprecated.ts');
  });
});

describe('formatVerificationCommands', () => {
  it('should format commands as bash block', () => {
    const commands: VerificationCommand[] = [
      { description: 'Run tests', command: 'npm test' },
      { description: 'Check types', command: 'npm run typecheck' },
    ];

    const result = formatVerificationCommands(commands);

    expect(result).toContain('```bash');
    expect(result).toContain('# Run tests');
    expect(result).toContain('npm test');
    expect(result).toContain('# Check types');
    expect(result).toContain('npm run typecheck');
    expect(result).toContain('```');
  });
});

describe('generateBranchName', () => {
  it('should generate feature branch name', () => {
    const metadata: TaskMetadata = {
      title: 'Add User Profile Component',
      scope: '4-6 hours',
      labels: ['frontend', 'component'],
    };

    const result = generateBranchName(metadata);

    expect(result).toBe('feat/add-user-profile-component');
  });

  it('should generate fix branch name for bugfix', () => {
    const metadata: TaskMetadata = {
      title: 'Fix Login Error',
      scope: '2-4 hours',
      labels: ['bugfix'],
    };

    const result = generateBranchName(metadata);

    expect(result).toBe('fix/fix-login-error');
  });

  it('should generate refactor branch name', () => {
    const metadata: TaskMetadata = {
      title: 'Refactor Auth Module',
      scope: '4-6 hours',
      labels: ['refactor'],
    };

    const result = generateBranchName(metadata);

    expect(result).toBe('refactor/refactor-auth-module');
  });

  it('should include ID in branch name', () => {
    const metadata: TaskMetadata = {
      id: 'F2.1.1',
      title: 'Date Range Picker',
      scope: '4-6 hours',
      labels: ['component'],
    };

    const result = generateBranchName(metadata);

    expect(result).toBe('feat/F2.1.1-date-range-picker');
  });

  it('should use provided branch name', () => {
    const metadata: TaskMetadata = {
      title: 'Some Task',
      scope: '4-6 hours',
      labels: ['feature'],
      branch: 'custom/branch-name',
    };

    const result = generateBranchName(metadata);

    expect(result).toBe('custom/branch-name');
  });
});

describe('playbook templates', () => {
  it('should return component playbook', () => {
    const playbook = getComponentPlaybook();

    expect(playbook.name).toBe('component-creation');
    expect(playbook.steps).toBeDefined();
    expect(playbook.steps!.length).toBeGreaterThan(0);
    expect(playbook.steps!.some((s) => s.includes('test'))).toBe(true);
  });

  it('should return API endpoint playbook', () => {
    const playbook = getApiEndpointPlaybook();

    expect(playbook.name).toBe('api-endpoint');
    expect(playbook.steps!.some((s) => s.includes('validation'))).toBe(true);
  });

  it('should return feature playbook', () => {
    const playbook = getFeaturePlaybook();

    expect(playbook.name).toBe('feature-implementation');
    expect(playbook.steps!.some((s) => s.includes('acceptance'))).toBe(true);
  });

  it('should return bugfix playbook', () => {
    const playbook = getBugfixPlaybook();

    expect(playbook.name).toBe('bugfix');
    expect(playbook.steps!.some((s) => s.includes('Reproduce'))).toBe(true);
  });

  it('should return refactor playbook', () => {
    const playbook = getRefactorPlaybook();

    expect(playbook.name).toBe('refactor');
    expect(playbook.steps!.some((s) => s.includes('tests'))).toBe(true);
  });
});

describe('getDefaultVerificationCommands', () => {
  it('should return default commands with npm', () => {
    const commands = getDefaultVerificationCommands();

    expect(commands.some((c) => c.command.includes('npm'))).toBe(true);
    expect(commands.some((c) => c.description.includes('TypeScript'))).toBe(true);
    expect(commands.some((c) => c.description.includes('test'))).toBe(true);
    expect(commands.some((c) => c.description.includes('lint'))).toBe(true);
    expect(commands.some((c) => c.description.includes('Build'))).toBe(true);
  });

  it('should use pnpm when specified', () => {
    const commands = getDefaultVerificationCommands({ packageManager: 'pnpm' });

    expect(commands.some((c) => c.command.includes('pnpm'))).toBe(true);
  });

  it('should use yarn when specified', () => {
    const commands = getDefaultVerificationCommands({ packageManager: 'yarn' });

    expect(commands.some((c) => c.command.includes('yarn'))).toBe(true);
  });
});

describe('formatTaskSpecAsMarkdown', () => {
  const sampleSpec: DevinTaskSpec = {
    metadata: {
      id: 'F2.1.1',
      title: 'Date Range Picker Component',
      scope: '4-6 hours',
      labels: ['devin', 'frontend', 'component'],
      branch: 'feat/F2.1.1-date-range-picker',
      priority: 'medium',
    },
    context: {
      description: 'Part of the Order History feature',
      dependsOn: [{ id: 'F1.2.3', name: 'Order List Component', status: 'complete' }],
      blocks: [{ id: 'F2.1.5', name: 'Order Export', status: 'pending' }],
      parentFeature: 'Order History',
    },
    userStory: {
      role: 'admin user',
      action: 'filter orders by date range',
      benefit: 'I can analyze sales for specific periods',
    },
    acceptanceCriteria: [
      { id: 'AC-1', description: 'Component renders without errors', testable: true },
      { id: 'AC-2', description: 'All tests pass', testable: true },
    ],
    technicalDetails: {
      files: [
        { path: 'src/components/DateRangePicker.tsx', action: 'create', description: 'Main component' },
        { path: 'src/components/index.ts', action: 'modify' },
      ],
      interfaces: [
        {
          name: 'DateRangePickerProps',
          code: 'interface DateRangePickerProps {\n  value: DateRange | null;\n  onChange: (range: DateRange) => void;\n}',
        },
      ],
      patterns: [{ name: 'Calendar', path: 'src/components/ui/calendar.tsx', description: 'calendar rendering' }],
    },
    playbook: getComponentPlaybook(),
    verificationCommands: [
      { description: 'Run tests', command: 'npm test' },
      { description: 'Type check', command: 'npm run typecheck' },
    ],
    resources: [
      { name: 'Design mockup', url: 'https://figma.com/mock' },
      { name: 'Similar component', path: 'src/components/ui/date-picker.tsx' },
    ],
  };

  it('should include task header', () => {
    const markdown = formatTaskSpecAsMarkdown(sampleSpec);

    expect(markdown).toContain('## Task: Date Range Picker Component');
  });

  it('should include metadata', () => {
    const markdown = formatTaskSpecAsMarkdown(sampleSpec);

    expect(markdown).toContain('**Scope**: 4-6 hours');
    expect(markdown).toContain('**Labels**: devin, frontend, component');
    expect(markdown).toContain('**Branch**: `feat/F2.1.1-date-range-picker`');
    expect(markdown).toContain('**Priority**: medium');
  });

  it('should include context section', () => {
    const markdown = formatTaskSpecAsMarkdown(sampleSpec);

    expect(markdown).toContain('### Context');
    expect(markdown).toContain('Part of the Order History feature');
    expect(markdown).toContain('Feature Order History');
    expect(markdown).toContain('**Depends on**: F1.2.3');
    expect(markdown).toContain('**Blocks**: F2.1.5');
  });

  it('should include user story', () => {
    const markdown = formatTaskSpecAsMarkdown(sampleSpec);

    expect(markdown).toContain('### User Story');
    expect(markdown).toContain('As admin user');
  });

  it('should include acceptance criteria', () => {
    const markdown = formatTaskSpecAsMarkdown(sampleSpec);

    expect(markdown).toContain('### Acceptance Criteria');
    expect(markdown).toContain('- [ ] Component renders without errors');
  });

  it('should include technical details', () => {
    const markdown = formatTaskSpecAsMarkdown(sampleSpec);

    expect(markdown).toContain('### Technical Details');
    expect(markdown).toContain('**Files to create:**');
    expect(markdown).toContain('+ src/components/DateRangePicker.tsx');
    expect(markdown).toContain('**Interfaces:**');
    expect(markdown).toContain('DateRangePickerProps');
    expect(markdown).toContain('**Follow patterns:**');
    expect(markdown).toContain('calendar.tsx');
  });

  it('should include playbook reference', () => {
    const markdown = formatTaskSpecAsMarkdown(sampleSpec);

    expect(markdown).toContain('### Playbook Reference');
    expect(markdown).toContain('component-creation');
  });

  it('should include verification commands', () => {
    const markdown = formatTaskSpecAsMarkdown(sampleSpec);

    expect(markdown).toContain('### Verification Commands');
    expect(markdown).toContain('```bash');
    expect(markdown).toContain('npm test');
  });

  it('should include resources', () => {
    const markdown = formatTaskSpecAsMarkdown(sampleSpec);

    expect(markdown).toContain('### Resources');
    expect(markdown).toContain('Design mockup: https://figma.com/mock');
    expect(markdown).toContain('Similar component: `src/components/ui/date-picker.tsx`');
  });

  it('should respect options to exclude sections', () => {
    const markdown = formatTaskSpecAsMarkdown(sampleSpec, {
      includeContext: false,
      includeUserStory: false,
      includePlaybook: false,
      includeResources: false,
    });

    expect(markdown).not.toContain('### Context');
    expect(markdown).not.toContain('### User Story');
    expect(markdown).not.toContain('### Playbook Reference');
    expect(markdown).not.toContain('### Resources');
    // Should still include required sections
    expect(markdown).toContain('### Acceptance Criteria');
    expect(markdown).toContain('### Verification Commands');
  });
});

describe('useDevinPlaybook', () => {
  describe('generatePlaybook', () => {
    it('should generate a complete playbook', () => {
      const { result } = renderHook(() => useDevinPlaybook());

      let spec;
      act(() => {
        spec = result.current.generatePlaybook(
          {
            title: 'Create User Avatar Component',
            scope: '4-6 hours',
            labels: ['devin', 'frontend', 'component'],
          },
          {
            userStory: result.current.createUserStory('user', 'see my avatar', 'I know I am logged in'),
            acceptanceCriteria: [
              result.current.createAcceptanceCriterion('Avatar displays user image'),
              result.current.createAcceptanceCriterion('Fallback shows initials'),
            ],
            technicalDetails: {
              files: [result.current.createFileSpec('src/components/Avatar.tsx', 'create')],
            },
            playbook: result.current.getComponentPlaybook(),
          }
        );
      });

      expect(spec!.metadata.title).toBe('Create User Avatar Component');
      expect(spec!.metadata.labels).toContain('devin');
      expect(spec!.userStory?.role).toBe('user');
      expect(spec!.acceptanceCriteria.length).toBe(2);
      expect(spec!.verificationCommands.length).toBeGreaterThan(0);
    });

    it('should update state', () => {
      const { result } = renderHook(() => useDevinPlaybook());

      expect(result.current.lastPlaybook).toBeNull();
      expect(result.current.playbooks.length).toBe(0);

      act(() => {
        result.current.generatePlaybook(
          { title: 'Test Task', scope: '2-4 hours', labels: [] },
          {}
        );
      });

      expect(result.current.lastPlaybook).not.toBeNull();
      expect(result.current.playbooks.length).toBe(1);
    });

    it('should call onPlaybookGenerated callback', () => {
      const onPlaybookGenerated = vi.fn();
      const { result } = renderHook(() => useDevinPlaybook({ onPlaybookGenerated }));

      act(() => {
        result.current.generatePlaybook(
          { title: 'Test', scope: '2-4 hours', labels: [] },
          {}
        );
      });

      expect(onPlaybookGenerated).toHaveBeenCalledTimes(1);
      expect(onPlaybookGenerated).toHaveBeenCalledWith(expect.any(Object), expect.any(String));
    });

    it('should use default labels from options', () => {
      const { result } = renderHook(() =>
        useDevinPlaybook({ defaultLabels: ['devin', 'backend'] })
      );

      let spec;
      act(() => {
        spec = result.current.generatePlaybook(
          { title: 'API Task', scope: '4-6 hours', labels: [] },
          {}
        );
      });

      expect(spec!.metadata.labels).toContain('devin');
      expect(spec!.metadata.labels).toContain('backend');
    });
  });

  describe('builder functions', () => {
    it('should create user story', () => {
      const { result } = renderHook(() => useDevinPlaybook());

      const story = result.current.createUserStory('developer', 'write clean code', 'the project is maintainable');

      expect(story.role).toBe('developer');
      expect(story.action).toBe('write clean code');
      expect(story.benefit).toBe('the project is maintainable');
    });

    it('should create acceptance criterion with ID', () => {
      const { result } = renderHook(() => useDevinPlaybook());

      const criterion = result.current.createAcceptanceCriterion('Tests pass');

      expect(criterion.id).toMatch(/^AC-\d+$/);
      expect(criterion.description).toBe('Tests pass');
      expect(criterion.testable).toBe(true);
    });

    it('should create file spec', () => {
      const { result } = renderHook(() => useDevinPlaybook());

      const file = result.current.createFileSpec('src/utils.ts', 'create', 'Utility functions');

      expect(file.path).toBe('src/utils.ts');
      expect(file.action).toBe('create');
      expect(file.description).toBe('Utility functions');
    });

    it('should create dependency', () => {
      const { result } = renderHook(() => useDevinPlaybook());

      const dep = result.current.createDependency('F1.2.3', 'Auth Module', 'complete');

      expect(dep.id).toBe('F1.2.3');
      expect(dep.name).toBe('Auth Module');
      expect(dep.status).toBe('complete');
    });
  });

  describe('formatAsMarkdown', () => {
    it('should format playbook as markdown', () => {
      const { result } = renderHook(() => useDevinPlaybook());

      let spec;
      act(() => {
        spec = result.current.generatePlaybook(
          { title: 'Test Component', scope: '2-4 hours', labels: ['component'] },
          {
            acceptanceCriteria: [result.current.createAcceptanceCriterion('Works correctly')],
          }
        );
      });

      const markdown = result.current.formatAsMarkdown(spec!);

      expect(markdown).toContain('## Task: Test Component');
      expect(markdown).toContain('- [ ] Works correctly');
    });

    it('should use configured package manager', () => {
      const { result } = renderHook(() => useDevinPlaybook({ packageManager: 'pnpm' }));

      const commands = result.current.getDefaultVerificationCommands();

      expect(commands.some((c) => c.command.includes('pnpm'))).toBe(true);
    });
  });

  describe('playbook templates access', () => {
    it('should expose all playbook templates', () => {
      const { result } = renderHook(() => useDevinPlaybook());

      expect(typeof result.current.getComponentPlaybook).toBe('function');
      expect(typeof result.current.getApiEndpointPlaybook).toBe('function');
      expect(typeof result.current.getFeaturePlaybook).toBe('function');
      expect(typeof result.current.getBugfixPlaybook).toBe('function');
      expect(typeof result.current.getRefactorPlaybook).toBe('function');
    });
  });
});

describe('integration', () => {
  it('should generate complete Devin-compatible task spec', () => {
    const { result } = renderHook(() => useDevinPlaybook({ packageManager: 'pnpm' }));

    let spec;
    act(() => {
      spec = result.current.generatePlaybook(
        {
          id: 'F2.1.1',
          title: 'Implement Date Range Picker',
          scope: '4-6 hours',
          labels: ['devin', 'frontend', 'component'],
          priority: 'high',
        },
        {
          context: {
            description: 'Part of the Order Management feature',
            dependsOn: [result.current.createDependency('F1.2.3', 'Order List', 'complete')],
            blocks: [result.current.createDependency('F2.1.5', 'Export Feature', 'pending')],
            parentFeature: 'Order Management',
          },
          userStory: result.current.createUserStory(
            'store manager',
            'filter orders by custom date ranges',
            'I can generate accurate sales reports'
          ),
          acceptanceCriteria: [
            result.current.createAcceptanceCriterion('Date picker opens on click'),
            result.current.createAcceptanceCriterion('Start and end dates can be selected'),
            result.current.createAcceptanceCriterion('Validation prevents invalid ranges'),
            result.current.createAcceptanceCriterion('Selected range updates URL params'),
            result.current.createAcceptanceCriterion('All tests pass'),
          ],
          technicalDetails: {
            files: [
              result.current.createFileSpec('src/components/DateRangePicker.tsx', 'create', 'Main component'),
              result.current.createFileSpec('src/components/DateRangePicker.test.tsx', 'create', 'Test file'),
              result.current.createFileSpec('src/components/index.ts', 'modify', 'Update exports'),
            ],
            interfaces: [
              {
                name: 'DateRangePickerProps',
                code: `interface DateRangePickerProps {
  value: DateRange | null;
  onChange: (range: DateRange) => void;
  presets?: DatePreset[];
}`,
              },
            ],
            patterns: [{ name: 'Calendar', path: 'src/components/ui/calendar.tsx' }],
          },
          playbook: result.current.getComponentPlaybook(),
          resources: [
            { name: 'Design spec', url: 'https://figma.com/file/123' },
            { name: 'date-fns docs', url: 'https://date-fns.org' },
          ],
        }
      );
    });

    const markdown = result.current.formatAsMarkdown(spec!);

    // Verify all required sections
    expect(markdown).toContain('## Task: Implement Date Range Picker');
    expect(markdown).toContain('**Scope**: 4-6 hours');
    expect(markdown).toContain('**Labels**: devin, frontend, component');
    expect(markdown).toContain('**Branch**: `feat/F2.1.1-implement-date-range-picker`');
    expect(markdown).toContain('### Context');
    expect(markdown).toContain('### User Story');
    expect(markdown).toContain('### Acceptance Criteria');
    expect(markdown).toContain('### Technical Details');
    expect(markdown).toContain('### Playbook Reference');
    expect(markdown).toContain('### Verification Commands');
    expect(markdown).toContain('pnpm');
    expect(markdown).toContain('### Resources');
  });
});
