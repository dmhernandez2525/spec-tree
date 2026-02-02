/**
 * Devin Task Template
 *
 * F2.2.1 - Devin Task Format Export
 *
 * Templates for generating Devin-compatible task specifications.
 * Devin by Cognition works best with atomic, 4-8 hour task specifications
 * with verifiable acceptance criteria and clear verification commands.
 */

import {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
} from '../types/work-items';

export interface DevinTaskConfig {
  title: string;
  scope: string;
  labels: string[];
  context: DevinContext;
  acceptanceCriteria: string[];
  technicalDetails: DevinTechnicalDetails;
  verificationCommands: string[];
  references?: DevinReference[];
}

export interface DevinContext {
  epic?: string;
  feature?: string;
  userStory?: string;
  dependencies?: string[];
  blockedBy?: string[];
}

export interface DevinTechnicalDetails {
  files: DevinFile[];
  dependencies?: string[];
  patterns?: string[];
  interfaces?: string[];
}

export interface DevinFile {
  path: string;
  description: string;
  action: 'create' | 'modify' | 'delete';
}

export interface DevinReference {
  type: 'design' | 'documentation' | 'similar' | 'api';
  description: string;
  link?: string;
}

/**
 * Context for generating Devin task from work items
 */
export interface DevinTaskContext {
  task: TaskType;
  userStory?: UserStoryType;
  feature?: FeatureType;
  epic?: EpicType;
  affectedFiles?: DevinFile[];
  verificationCommands?: string[];
  estimatedHours?: number;
}

/**
 * Playbook configuration for recurring task types
 */
export interface DevinPlaybook {
  name: string;
  description: string;
  taskType: string;
  steps: DevinPlaybookStep[];
  defaultLabels: string[];
  defaultVerificationCommands: string[];
}

export interface DevinPlaybookStep {
  order: number;
  action: string;
  details?: string;
}

/**
 * Default labels for different task types
 */
export const DEFAULT_DEVIN_LABELS: Record<string, string[]> = {
  frontend: ['devin', 'frontend', 'component'],
  backend: ['devin', 'backend', 'api'],
  database: ['devin', 'backend', 'database'],
  testing: ['devin', 'testing'],
  documentation: ['devin', 'docs'],
  refactoring: ['devin', 'refactor'],
  bugfix: ['devin', 'bugfix'],
  feature: ['devin', 'feature'],
};

/**
 * Default verification commands
 */
export const DEFAULT_VERIFICATION_COMMANDS = {
  typescript: [
    'npm run lint',
    'npm run type-check',
    'npm run build',
  ],
  test: [
    'npm test -- --testPathPattern=<component>',
    'npm run test:coverage',
  ],
  all: [
    'npm run lint',
    'npm run type-check',
    'npm test -- --run',
    'npm run build',
  ],
};

/**
 * Generate Devin task specification
 */
export function generateDevinTask(config: DevinTaskConfig): string {
  const sections: string[] = [];

  // Title
  sections.push(`## Task: ${config.title}`);
  sections.push('');

  // Scope
  sections.push(`**Scope**: ${config.scope}`);
  if (config.labels.length > 0) {
    sections.push(`**Labels**: ${config.labels.join(', ')}`);
  }
  sections.push('');

  // Context
  sections.push(generateContextSection(config.context));

  // Acceptance Criteria
  sections.push(generateAcceptanceCriteriaSection(config.acceptanceCriteria));

  // Technical Details
  sections.push(generateTechnicalDetailsSection(config.technicalDetails));

  // Verification Commands
  sections.push(generateVerificationSection(config.verificationCommands));

  // References
  if (config.references && config.references.length > 0) {
    sections.push(generateReferencesSection(config.references));
  }

  return sections.join('\n');
}

/**
 * Generate context section
 */
function generateContextSection(context: DevinContext): string {
  const lines: string[] = ['### Context', ''];

  if (context.epic) {
    lines.push(`**Epic:** ${context.epic}`);
  }
  if (context.feature) {
    lines.push(`**Feature:** ${context.feature}`);
  }
  if (context.userStory) {
    lines.push(`**User Story:** ${context.userStory}`);
  }
  if (context.dependencies && context.dependencies.length > 0) {
    lines.push(`**Depends on:** ${context.dependencies.join(', ')}`);
  }
  if (context.blockedBy && context.blockedBy.length > 0) {
    lines.push(`**Blocked by:** ${context.blockedBy.join(', ')}`);
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate acceptance criteria section
 */
function generateAcceptanceCriteriaSection(criteria: string[]): string {
  const lines: string[] = ['### Acceptance Criteria', ''];

  for (const criterion of criteria) {
    lines.push(`- [ ] ${criterion}`);
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate technical details section
 */
function generateTechnicalDetailsSection(details: DevinTechnicalDetails): string {
  const lines: string[] = ['### Technical Details', ''];

  // Files
  if (details.files.length > 0) {
    lines.push('**Files:**');
    for (const file of details.files) {
      const actionLabel = file.action === 'create' ? '(new)' : file.action === 'modify' ? '(modify)' : '(delete)';
      lines.push(`- \`${file.path}\` ${actionLabel} - ${file.description}`);
    }
    lines.push('');
  }

  // Dependencies
  if (details.dependencies && details.dependencies.length > 0) {
    lines.push('**Dependencies:**');
    for (const dep of details.dependencies) {
      lines.push(`- ${dep}`);
    }
    lines.push('');
  }

  // Patterns to follow
  if (details.patterns && details.patterns.length > 0) {
    lines.push('**Patterns:**');
    for (const pattern of details.patterns) {
      lines.push(`- ${pattern}`);
    }
    lines.push('');
  }

  // Interfaces
  if (details.interfaces && details.interfaces.length > 0) {
    lines.push('**Interface:**');
    lines.push('```typescript');
    for (const iface of details.interfaces) {
      lines.push(iface);
    }
    lines.push('```');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate verification commands section
 */
function generateVerificationSection(commands: string[]): string {
  const lines: string[] = ['### Verification Commands', '', '```bash'];

  for (const command of commands) {
    lines.push(command);
  }

  lines.push('```');
  lines.push('');
  return lines.join('\n');
}

/**
 * Generate references section
 */
function generateReferencesSection(references: DevinReference[]): string {
  const lines: string[] = ['### Reference', ''];

  for (const ref of references) {
    if (ref.link) {
      lines.push(`- **${capitalizeFirst(ref.type)}:** [${ref.description}](${ref.link})`);
    } else {
      lines.push(`- **${capitalizeFirst(ref.type)}:** ${ref.description}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate Devin task from task context
 */
export function generateDevinTaskFromContext(context: DevinTaskContext): string {
  const { task, userStory, feature, epic, affectedFiles, verificationCommands, estimatedHours } = context;

  // Build acceptance criteria from user story or task
  const acceptanceCriteria: string[] = [];
  if (userStory?.acceptanceCriteria && userStory.acceptanceCriteria.length > 0) {
    for (const criterion of userStory.acceptanceCriteria) {
      if (criterion.text) {
        acceptanceCriteria.push(criterion.text);
      }
    }
  } else {
    acceptanceCriteria.push(`Implement ${task.title}`);
    if (task.details) {
      acceptanceCriteria.push(task.details);
    }
  }

  // Add test requirement
  acceptanceCriteria.push('Tests pass with no regressions');

  // Determine labels based on task content
  const labels = inferLabelsFromTask(task, feature);

  // Build technical details
  const technicalDetails: DevinTechnicalDetails = {
    files: affectedFiles || [],
    patterns: feature?.dependencies ? [feature.dependencies] : undefined,
  };

  // Build references
  const references: DevinReference[] = [];
  if (feature?.notes) {
    references.push({
      type: 'documentation',
      description: feature.notes,
    });
  }

  const config: DevinTaskConfig = {
    title: task.title,
    scope: estimatedHours ? `${estimatedHours} hours estimated work` : '4-6 hours estimated work',
    labels,
    context: {
      epic: epic?.title,
      feature: feature?.title,
      userStory: userStory
        ? `As a ${userStory.role}, I want to ${userStory.action} so that ${userStory.goal}`
        : undefined,
      dependencies: task.dependentTaskIds?.length > 0 ? task.dependentTaskIds : undefined,
    },
    acceptanceCriteria,
    technicalDetails,
    verificationCommands: verificationCommands || DEFAULT_VERIFICATION_COMMANDS.all,
    references: references.length > 0 ? references : undefined,
  };

  return generateDevinTask(config);
}

/**
 * Generate bulk Devin tasks
 */
export function generateBulkDevinTasks(contexts: DevinTaskContext[]): string {
  const tasks = contexts.map((context, index) => {
    const taskContent = generateDevinTaskFromContext(context);
    return `---\n\n# Task ${index + 1}\n\n${taskContent}`;
  });

  return tasks.join('\n');
}

/**
 * Infer task labels based on content
 */
function inferLabelsFromTask(task: TaskType, _feature?: FeatureType): string[] {
  const title = task.title.toLowerCase();
  const details = task.details?.toLowerCase() || '';
  const combined = `${title} ${details}`;

  if (combined.includes('test') || combined.includes('spec')) {
    return DEFAULT_DEVIN_LABELS.testing;
  }
  if (combined.includes('api') || combined.includes('endpoint') || combined.includes('backend')) {
    return DEFAULT_DEVIN_LABELS.backend;
  }
  if (combined.includes('database') || combined.includes('migration') || combined.includes('schema')) {
    return DEFAULT_DEVIN_LABELS.database;
  }
  if (combined.includes('component') || combined.includes('ui') || combined.includes('frontend')) {
    return DEFAULT_DEVIN_LABELS.frontend;
  }
  if (combined.includes('refactor') || combined.includes('cleanup') || combined.includes('improve')) {
    return DEFAULT_DEVIN_LABELS.refactoring;
  }
  if (combined.includes('fix') || combined.includes('bug') || combined.includes('issue')) {
    return DEFAULT_DEVIN_LABELS.bugfix;
  }
  if (combined.includes('doc') || combined.includes('readme')) {
    return DEFAULT_DEVIN_LABELS.documentation;
  }

  return DEFAULT_DEVIN_LABELS.feature;
}

/**
 * Generate a playbook from common task patterns
 */
export function generatePlaybook(playbook: DevinPlaybook): string {
  const lines: string[] = [];

  lines.push(`# Playbook: ${playbook.name}`);
  lines.push('');
  lines.push(playbook.description);
  lines.push('');
  lines.push(`**Task Type:** ${playbook.taskType}`);
  lines.push(`**Default Labels:** ${playbook.defaultLabels.join(', ')}`);
  lines.push('');

  lines.push('## Steps');
  lines.push('');
  for (const step of playbook.steps) {
    lines.push(`${step.order}. ${step.action}`);
    if (step.details) {
      lines.push(`   - ${step.details}`);
    }
  }
  lines.push('');

  lines.push('## Verification');
  lines.push('');
  lines.push('```bash');
  for (const cmd of playbook.defaultVerificationCommands) {
    lines.push(cmd);
  }
  lines.push('```');

  return lines.join('\n');
}

/**
 * Default playbooks for common task types
 */
export const DEFAULT_PLAYBOOKS: DevinPlaybook[] = [
  {
    name: 'New React Component',
    description: 'Create a new React component with TypeScript and tests',
    taskType: 'frontend',
    steps: [
      { order: 1, action: 'Create component file', details: 'Use functional component with TypeScript' },
      { order: 2, action: 'Add props interface', details: 'Define all required and optional props' },
      { order: 3, action: 'Implement component logic' },
      { order: 4, action: 'Add Tailwind styling' },
      { order: 5, action: 'Create test file', details: 'Test rendering, props, and interactions' },
      { order: 6, action: 'Export from index file' },
    ],
    defaultLabels: ['devin', 'frontend', 'component'],
    defaultVerificationCommands: DEFAULT_VERIFICATION_COMMANDS.all,
  },
  {
    name: 'API Endpoint',
    description: 'Create a new API endpoint with validation and error handling',
    taskType: 'backend',
    steps: [
      { order: 1, action: 'Define route handler' },
      { order: 2, action: 'Add input validation', details: 'Use Zod or similar' },
      { order: 3, action: 'Implement business logic' },
      { order: 4, action: 'Add error handling' },
      { order: 5, action: 'Create integration tests' },
      { order: 6, action: 'Update API documentation' },
    ],
    defaultLabels: ['devin', 'backend', 'api'],
    defaultVerificationCommands: DEFAULT_VERIFICATION_COMMANDS.all,
  },
  {
    name: 'Bug Fix',
    description: 'Fix a reported bug with regression tests',
    taskType: 'bugfix',
    steps: [
      { order: 1, action: 'Reproduce the bug' },
      { order: 2, action: 'Write failing test that captures the bug' },
      { order: 3, action: 'Identify root cause' },
      { order: 4, action: 'Implement fix' },
      { order: 5, action: 'Verify test passes' },
      { order: 6, action: 'Check for related issues' },
    ],
    defaultLabels: ['devin', 'bugfix'],
    defaultVerificationCommands: DEFAULT_VERIFICATION_COMMANDS.all,
  },
];

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
