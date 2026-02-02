/**
 * useDevinPlaybook
 *
 * F2.2.2 - Devin playbook generation
 *
 * Hook for generating atomic task specifications optimized for Devin AI.
 * Creates task specs with verifiable acceptance criteria, technical details,
 * and verification commands.
 */

import { useCallback, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Scope estimate for task sizing
 */
export type TaskScope = '2-4 hours' | '4-6 hours' | '6-8 hours' | '1-2 days';

/**
 * Task labels for categorization
 */
export type TaskLabel =
  | 'devin'
  | 'frontend'
  | 'backend'
  | 'api'
  | 'component'
  | 'feature'
  | 'bugfix'
  | 'refactor'
  | 'test'
  | 'docs'
  | 'infrastructure';

/**
 * Dependency status
 */
export type DependencyStatus = 'pending' | 'in-progress' | 'complete' | 'blocked';

/**
 * Task dependency
 */
export interface TaskDependency {
  id: string;
  name: string;
  status: DependencyStatus;
  description?: string;
}

/**
 * User story format
 */
export interface UserStory {
  role: string; // e.g., 'admin user', 'customer'
  action: string; // what they want to do
  benefit: string; // why they want to do it
}

/**
 * Acceptance criterion
 */
export interface AcceptanceCriterion {
  id: string;
  description: string;
  testable: boolean;
  verificationMethod?: 'manual' | 'automated' | 'visual';
}

/**
 * File to create or modify
 */
export interface FileSpec {
  path: string;
  action: 'create' | 'modify' | 'delete';
  description?: string;
}

/**
 * TypeScript interface definition
 */
export interface InterfaceSpec {
  name: string;
  code: string;
  description?: string;
}

/**
 * Pattern reference
 */
export interface PatternReference {
  name: string;
  path: string;
  description?: string;
}

/**
 * Technical details
 */
export interface TechnicalDetails {
  files: FileSpec[];
  interfaces?: InterfaceSpec[];
  patterns?: PatternReference[];
  dependencies?: string[];
  additionalNotes?: string[];
}

/**
 * Playbook reference
 */
export interface PlaybookReference {
  name: string;
  description?: string;
  steps?: string[];
}

/**
 * Verification command
 */
export interface VerificationCommand {
  description: string;
  command: string;
}

/**
 * Resource link
 */
export interface ResourceLink {
  name: string;
  url?: string;
  path?: string;
  description?: string;
}

/**
 * Task metadata
 */
export interface TaskMetadata {
  id?: string;
  title: string;
  scope: TaskScope;
  labels: TaskLabel[];
  branch?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  epic?: string;
  feature?: string;
}

/**
 * Complete Devin task specification
 */
export interface DevinTaskSpec {
  metadata: TaskMetadata;
  context: {
    description?: string;
    dependsOn: TaskDependency[];
    blocks: TaskDependency[];
    parentEpic?: string;
    parentFeature?: string;
  };
  userStory?: UserStory;
  acceptanceCriteria: AcceptanceCriterion[];
  technicalDetails: TechnicalDetails;
  playbook?: PlaybookReference;
  verificationCommands: VerificationCommand[];
  resources: ResourceLink[];
}

/**
 * Generation options
 */
export interface PlaybookOptions {
  includeContext?: boolean;
  includeUserStory?: boolean;
  includePlaybook?: boolean;
  includeResources?: boolean;
  packageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun';
  testCommand?: string;
  lintCommand?: string;
  buildCommand?: string;
  typecheckCommand?: string;
}

/**
 * Hook options
 */
export interface UseDevinPlaybookOptions {
  defaultLabels?: TaskLabel[];
  defaultScope?: TaskScope;
  packageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun';
  onPlaybookGenerated?: (spec: DevinTaskSpec, markdown: string) => void;
}

/**
 * Hook return type
 */
export interface UseDevinPlaybookReturn {
  // Generation functions
  generatePlaybook: (metadata: TaskMetadata, details: Partial<DevinTaskSpec>) => DevinTaskSpec;
  formatAsMarkdown: (spec: DevinTaskSpec, options?: PlaybookOptions) => string;

  // Builder functions
  createUserStory: (role: string, action: string, benefit: string) => UserStory;
  createAcceptanceCriterion: (
    description: string,
    options?: Partial<AcceptanceCriterion>
  ) => AcceptanceCriterion;
  createFileSpec: (path: string, action: FileSpec['action'], description?: string) => FileSpec;
  createDependency: (id: string, name: string, status: DependencyStatus) => TaskDependency;

  // Default verification commands
  getDefaultVerificationCommands: (options?: PlaybookOptions) => VerificationCommand[];

  // Playbook templates
  getComponentPlaybook: () => PlaybookReference;
  getApiEndpointPlaybook: () => PlaybookReference;
  getFeaturePlaybook: () => PlaybookReference;
  getBugfixPlaybook: () => PlaybookReference;
  getRefactorPlaybook: () => PlaybookReference;

  // State
  playbooks: DevinTaskSpec[];
  lastPlaybook: DevinTaskSpec | null;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_PACKAGE_MANAGER = 'npm';

const DEFAULT_OPTIONS: PlaybookOptions = {
  includeContext: true,
  includeUserStory: true,
  includePlaybook: true,
  includeResources: true,
  packageManager: DEFAULT_PACKAGE_MANAGER,
};

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format user story as string
 */
export function formatUserStory(story: UserStory): string {
  return `As ${story.role}, I want to ${story.action} so that ${story.benefit}.`;
}

/**
 * Format acceptance criteria as markdown checklist
 */
export function formatAcceptanceCriteria(criteria: AcceptanceCriterion[]): string {
  return criteria.map((c) => `- [ ] ${c.description}`).join('\n');
}

/**
 * Format file specs as code block
 */
export function formatFileSpecs(files: FileSpec[]): string {
  const lines: string[] = ['```'];
  for (const file of files) {
    const actionIcon = file.action === 'create' ? '+' : file.action === 'modify' ? '~' : '-';
    const desc = file.description ? `  # ${file.description}` : '';
    lines.push(`${actionIcon} ${file.path}${desc}`);
  }
  lines.push('```');
  return lines.join('\n');
}

/**
 * Format interface spec as code block
 */
export function formatInterfaceSpec(spec: InterfaceSpec): string {
  const lines: string[] = [];
  if (spec.description) {
    lines.push(`**${spec.name}**: ${spec.description}`);
  } else {
    lines.push(`**${spec.name}**:`);
  }
  lines.push('```typescript');
  lines.push(spec.code);
  lines.push('```');
  return lines.join('\n');
}

/**
 * Format verification commands as bash code block
 */
export function formatVerificationCommands(commands: VerificationCommand[]): string {
  const lines: string[] = ['```bash'];
  for (const cmd of commands) {
    lines.push(`# ${cmd.description}`);
    lines.push(cmd.command);
    lines.push('');
  }
  lines.pop(); // Remove trailing empty line
  lines.push('```');
  return lines.join('\n');
}

/**
 * Format dependencies list
 */
export function formatDependencies(deps: TaskDependency[], type: 'depends' | 'blocks'): string {
  const label = type === 'depends' ? 'Depends on' : 'Blocks';
  return deps
    .map((d) => {
      const status = d.status.toUpperCase();
      return `- **${label}**: ${d.id} (${d.name}) - ${status}`;
    })
    .join('\n');
}

/**
 * Format playbook reference
 */
export function formatPlaybook(playbook: PlaybookReference): string {
  const lines: string[] = [`Use playbook \`${playbook.name}\``];
  if (playbook.description) {
    lines[0] += ` for ${playbook.description}`;
  }
  lines[0] += ':';

  if (playbook.steps && playbook.steps.length > 0) {
    playbook.steps.forEach((step, i) => {
      lines.push(`${i + 1}. ${step}`);
    });
  }

  return lines.join('\n');
}

/**
 * Format resources list
 */
export function formatResources(resources: ResourceLink[]): string {
  return resources
    .map((r) => {
      if (r.url) {
        return `- ${r.name}: ${r.url}`;
      } else if (r.path) {
        return `- ${r.name}: \`${r.path}\``;
      } else {
        return `- ${r.name}${r.description ? `: ${r.description}` : ''}`;
      }
    })
    .join('\n');
}

/**
 * Generate branch name from task
 */
export function generateBranchName(metadata: TaskMetadata): string {
  if (metadata.branch) return metadata.branch;

  const prefix = metadata.labels.includes('bugfix')
    ? 'fix'
    : metadata.labels.includes('refactor')
      ? 'refactor'
      : 'feat';

  const id = metadata.id || '';
  const slug = metadata.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

  return id ? `${prefix}/${id}-${slug}` : `${prefix}/${slug}`;
}

/**
 * Format complete task spec as markdown
 */
export function formatTaskSpecAsMarkdown(spec: DevinTaskSpec, options: PlaybookOptions = DEFAULT_OPTIONS): string {
  const sections: string[] = [];

  // Task header
  sections.push(`## Task: ${spec.metadata.title}`);
  sections.push('');

  // Metadata
  sections.push(`**Scope**: ${spec.metadata.scope}`);
  sections.push(`**Labels**: ${spec.metadata.labels.join(', ')}`);
  sections.push(`**Branch**: \`${generateBranchName(spec.metadata)}\``);

  if (spec.metadata.priority) {
    sections.push(`**Priority**: ${spec.metadata.priority}`);
  }

  // Context
  if (options.includeContext && spec.context) {
    sections.push('\n### Context');
    if (spec.context.description) {
      sections.push(spec.context.description);
    }
    if (spec.context.parentEpic || spec.context.parentFeature) {
      const parent = spec.context.parentFeature
        ? `Feature ${spec.context.parentFeature}`
        : `Epic ${spec.context.parentEpic}`;
      sections.push(`This task is part of ${parent}.`);
    }

    if (spec.context.dependsOn.length > 0) {
      sections.push(formatDependencies(spec.context.dependsOn, 'depends'));
    }
    if (spec.context.blocks.length > 0) {
      sections.push(formatDependencies(spec.context.blocks, 'blocks'));
    }
  }

  // User Story
  if (options.includeUserStory && spec.userStory) {
    sections.push('\n### User Story');
    sections.push(formatUserStory(spec.userStory));
  }

  // Acceptance Criteria
  if (spec.acceptanceCriteria.length > 0) {
    sections.push('\n### Acceptance Criteria');
    sections.push(formatAcceptanceCriteria(spec.acceptanceCriteria));
  }

  // Technical Details
  if (spec.technicalDetails) {
    sections.push('\n### Technical Details');

    if (spec.technicalDetails.files.length > 0) {
      const createFiles = spec.technicalDetails.files.filter((f) => f.action === 'create');
      const modifyFiles = spec.technicalDetails.files.filter((f) => f.action === 'modify');

      if (createFiles.length > 0) {
        sections.push('\n**Files to create:**');
        sections.push(formatFileSpecs(createFiles));
      }
      if (modifyFiles.length > 0) {
        sections.push('\n**Files to modify:**');
        sections.push(formatFileSpecs(modifyFiles));
      }
    }

    if (spec.technicalDetails.interfaces && spec.technicalDetails.interfaces.length > 0) {
      sections.push('\n**Interfaces:**');
      for (const iface of spec.technicalDetails.interfaces) {
        sections.push(formatInterfaceSpec(iface));
      }
    }

    if (spec.technicalDetails.patterns && spec.technicalDetails.patterns.length > 0) {
      sections.push('\n**Follow patterns:**');
      for (const pattern of spec.technicalDetails.patterns) {
        const desc = pattern.description ? ` for ${pattern.description}` : '';
        sections.push(`- \`${pattern.path}\`${desc}`);
      }
    }

    if (spec.technicalDetails.dependencies && spec.technicalDetails.dependencies.length > 0) {
      sections.push('\n**Dependencies to install:**');
      sections.push('```bash');
      const pm = options.packageManager || DEFAULT_PACKAGE_MANAGER;
      const installCmd = pm === 'yarn' ? 'yarn add' : `${pm} install`;
      sections.push(`${installCmd} ${spec.technicalDetails.dependencies.join(' ')}`);
      sections.push('```');
    }

    if (spec.technicalDetails.additionalNotes && spec.technicalDetails.additionalNotes.length > 0) {
      sections.push('\n**Notes:**');
      for (const note of spec.technicalDetails.additionalNotes) {
        sections.push(`- ${note}`);
      }
    }
  }

  // Playbook Reference
  if (options.includePlaybook && spec.playbook) {
    sections.push('\n### Playbook Reference');
    sections.push(formatPlaybook(spec.playbook));
  }

  // Verification Commands
  if (spec.verificationCommands.length > 0) {
    sections.push('\n### Verification Commands');
    sections.push(formatVerificationCommands(spec.verificationCommands));
  }

  // Resources
  if (options.includeResources && spec.resources.length > 0) {
    sections.push('\n### Resources');
    sections.push(formatResources(spec.resources));
  }

  return sections.join('\n');
}

// ============================================================================
// Playbook Templates
// ============================================================================

/**
 * Component creation playbook
 */
export function getComponentPlaybook(): PlaybookReference {
  return {
    name: 'component-creation',
    description: 'standard component structure',
    steps: [
      'Create component file with TypeScript interface',
      'Implement component with accessibility',
      'Create test file with basic tests',
      'Update barrel exports',
      'Add Storybook story if applicable',
    ],
  };
}

/**
 * API endpoint playbook
 */
export function getApiEndpointPlaybook(): PlaybookReference {
  return {
    name: 'api-endpoint',
    description: 'RESTful API endpoint',
    steps: [
      'Define request/response types',
      'Create route handler',
      'Add input validation',
      'Implement business logic',
      'Add error handling',
      'Write integration tests',
      'Update API documentation',
    ],
  };
}

/**
 * Feature implementation playbook
 */
export function getFeaturePlaybook(): PlaybookReference {
  return {
    name: 'feature-implementation',
    description: 'end-to-end feature',
    steps: [
      'Review acceptance criteria and design',
      'Create/update database schema if needed',
      'Implement API endpoints',
      'Create UI components',
      'Connect frontend to backend',
      'Write unit and integration tests',
      'Update documentation',
    ],
  };
}

/**
 * Bug fix playbook
 */
export function getBugfixPlaybook(): PlaybookReference {
  return {
    name: 'bugfix',
    description: 'bug investigation and fix',
    steps: [
      'Reproduce the bug locally',
      'Write a failing test that demonstrates the bug',
      'Investigate root cause',
      'Implement the fix',
      'Verify test passes',
      'Check for regression',
      'Update changelog if applicable',
    ],
  };
}

/**
 * Refactor playbook
 */
export function getRefactorPlaybook(): PlaybookReference {
  return {
    name: 'refactor',
    description: 'code refactoring',
    steps: [
      'Ensure tests cover existing behavior',
      'Identify code to refactor',
      'Apply refactoring incrementally',
      'Verify tests still pass after each change',
      'Update documentation if API changes',
      'Review for performance implications',
    ],
  };
}

// ============================================================================
// Default Verification Commands
// ============================================================================

/**
 * Get default verification commands
 */
export function getDefaultVerificationCommands(options: PlaybookOptions = DEFAULT_OPTIONS): VerificationCommand[] {
  const pm = options.packageManager || DEFAULT_PACKAGE_MANAGER;
  const run = pm === 'yarn' ? 'yarn' : `${pm} run`;

  return [
    {
      description: 'Check for TypeScript errors',
      command: options.typecheckCommand || `${run} typecheck`,
    },
    {
      description: 'Run tests',
      command: options.testCommand || `${run} test`,
    },
    {
      description: 'Check for lint errors',
      command: options.lintCommand || `${run} lint`,
    },
    {
      description: 'Build to verify no issues',
      command: options.buildCommand || `${run} build`,
    },
  ];
}

// ============================================================================
// Hook Implementation
// ============================================================================

let criterionIdCounter = 0;

/**
 * Hook for generating Devin playbook specifications
 */
export function useDevinPlaybook(options: UseDevinPlaybookOptions = {}): UseDevinPlaybookReturn {
  const { defaultLabels = ['devin'], defaultScope = '4-6 hours', packageManager, onPlaybookGenerated } = options;

  const [playbooks, setPlaybooks] = useState<DevinTaskSpec[]>([]);
  const [lastPlaybook, setLastPlaybook] = useState<DevinTaskSpec | null>(null);

  /**
   * Create a user story
   */
  const createUserStory = useCallback((role: string, action: string, benefit: string): UserStory => {
    return { role, action, benefit };
  }, []);

  /**
   * Create an acceptance criterion
   */
  const createAcceptanceCriterion = useCallback(
    (description: string, opts?: Partial<AcceptanceCriterion>): AcceptanceCriterion => {
      criterionIdCounter += 1;
      return {
        id: `AC-${criterionIdCounter}`,
        description,
        testable: true,
        verificationMethod: 'automated',
        ...opts,
      };
    },
    []
  );

  /**
   * Create a file spec
   */
  const createFileSpec = useCallback(
    (path: string, action: FileSpec['action'], description?: string): FileSpec => {
      return { path, action, description };
    },
    []
  );

  /**
   * Create a dependency
   */
  const createDependency = useCallback(
    (id: string, name: string, status: DependencyStatus): TaskDependency => {
      return { id, name, status };
    },
    []
  );

  /**
   * Generate a complete playbook specification
   */
  const generatePlaybook = useCallback(
    (metadata: TaskMetadata, details: Partial<DevinTaskSpec>): DevinTaskSpec => {
      const spec: DevinTaskSpec = {
        metadata: {
          ...metadata,
          labels: metadata.labels.length > 0 ? metadata.labels : defaultLabels,
          scope: metadata.scope || defaultScope,
          branch: metadata.branch || generateBranchName(metadata),
        },
        context: {
          description: details.context?.description,
          dependsOn: details.context?.dependsOn || [],
          blocks: details.context?.blocks || [],
          parentEpic: details.context?.parentEpic,
          parentFeature: details.context?.parentFeature,
        },
        userStory: details.userStory,
        acceptanceCriteria: details.acceptanceCriteria || [],
        technicalDetails: details.technicalDetails || {
          files: [],
          interfaces: [],
          patterns: [],
        },
        playbook: details.playbook,
        verificationCommands:
          details.verificationCommands ||
          getDefaultVerificationCommands({ packageManager: packageManager || DEFAULT_PACKAGE_MANAGER }),
        resources: details.resources || [],
      };

      setPlaybooks((prev) => [...prev, spec]);
      setLastPlaybook(spec);

      const markdown = formatTaskSpecAsMarkdown(spec, { packageManager: packageManager || DEFAULT_PACKAGE_MANAGER });
      onPlaybookGenerated?.(spec, markdown);

      return spec;
    },
    [defaultLabels, defaultScope, packageManager, onPlaybookGenerated]
  );

  /**
   * Format spec as markdown
   */
  const formatAsMarkdown = useCallback(
    (spec: DevinTaskSpec, formatOptions?: PlaybookOptions): string => {
      return formatTaskSpecAsMarkdown(spec, {
        ...DEFAULT_OPTIONS,
        packageManager: packageManager || DEFAULT_PACKAGE_MANAGER,
        ...formatOptions,
      });
    },
    [packageManager]
  );

  return {
    // Generation functions
    generatePlaybook,
    formatAsMarkdown,

    // Builder functions
    createUserStory,
    createAcceptanceCriterion,
    createFileSpec,
    createDependency,

    // Default verification commands
    getDefaultVerificationCommands: useCallback(
      (cmdOptions?: PlaybookOptions) =>
        getDefaultVerificationCommands({
          packageManager: packageManager || DEFAULT_PACKAGE_MANAGER,
          ...cmdOptions,
        }),
      [packageManager]
    ),

    // Playbook templates
    getComponentPlaybook,
    getApiEndpointPlaybook,
    getFeaturePlaybook,
    getBugfixPlaybook,
    getRefactorPlaybook,

    // State
    playbooks,
    lastPlaybook,
  };
}

export default useDevinPlaybook;
