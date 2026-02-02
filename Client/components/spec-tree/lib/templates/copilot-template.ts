/**
 * GitHub Copilot Template
 *
 * F2.1.5 - GitHub Copilot Export
 *
 * Templates for generating Copilot-compatible files:
 * - copilot-instructions.md for project-level instructions
 * - WRAP format for individual issues
 */

import {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
} from '../types/work-items';

export interface CopilotInstructionsConfig {
  projectName: string;
  description: string;
  techStack?: TechStackInfo;
  conventions?: ConventionInfo;
  patterns?: PatternInfo;
  testRequirements?: TestRequirements;
}

export interface TechStackInfo {
  framework?: string;
  language?: string;
  styling?: string;
  stateManagement?: string;
  testing?: string;
  database?: string;
  additionalTools?: string[];
}

export interface ConventionInfo {
  naming?: NamingConventions;
  fileStructure?: string[];
  codePatterns?: string[];
}

export interface NamingConventions {
  components?: string;
  hooks?: string;
  types?: string;
  files?: string;
  variables?: string;
  functions?: string;
}

export interface PatternInfo {
  componentPattern?: string;
  apiPattern?: string;
  statePattern?: string;
  testPattern?: string;
  referenceFiles?: Record<string, string>;
}

export interface TestRequirements {
  framework?: string;
  coverageThreshold?: number;
  patterns?: string[];
}

/**
 * WRAP format context for a task
 * What, Requirements, Actual files, Patterns
 */
export interface WRAPContext {
  task: TaskType;
  userStory?: UserStoryType;
  feature?: FeatureType;
  epic?: EpicType;
  affectedFiles?: string[];
  referencePatterns?: string[];
}

/**
 * Generate copilot-instructions.md content
 */
export function generateCopilotInstructions(
  config: CopilotInstructionsConfig
): string {
  const sections: string[] = [];

  // Header
  sections.push(`# ${config.projectName}`);
  sections.push('');

  if (config.description) {
    sections.push(config.description);
    sections.push('');
  }

  // Tech Stack
  if (config.techStack) {
    sections.push(generateTechStackSection(config.techStack));
  }

  // Conventions
  if (config.conventions) {
    sections.push(generateConventionsSection(config.conventions));
  }

  // Patterns
  if (config.patterns) {
    sections.push(generatePatternsSection(config.patterns));
  }

  // Test Requirements
  if (config.testRequirements) {
    sections.push(generateTestRequirementsSection(config.testRequirements));
  }

  return sections.join('\n');
}

/**
 * Generate tech stack section
 */
function generateTechStackSection(techStack: TechStackInfo): string {
  const lines: string[] = ['## Tech Stack', ''];

  if (techStack.framework) {
    lines.push(`- **Framework:** ${techStack.framework}`);
  }
  if (techStack.language) {
    lines.push(`- **Language:** ${techStack.language}`);
  }
  if (techStack.styling) {
    lines.push(`- **Styling:** ${techStack.styling}`);
  }
  if (techStack.stateManagement) {
    lines.push(`- **State Management:** ${techStack.stateManagement}`);
  }
  if (techStack.testing) {
    lines.push(`- **Testing:** ${techStack.testing}`);
  }
  if (techStack.database) {
    lines.push(`- **Database:** ${techStack.database}`);
  }
  if (techStack.additionalTools && techStack.additionalTools.length > 0) {
    lines.push(`- **Additional:** ${techStack.additionalTools.join(', ')}`);
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate conventions section
 */
function generateConventionsSection(conventions: ConventionInfo): string {
  const lines: string[] = ['## Coding Conventions', ''];

  if (conventions.naming) {
    lines.push('### Naming Conventions');
    lines.push('');
    const naming = conventions.naming;
    if (naming.components) {
      lines.push(`- **Components:** ${naming.components}`);
    }
    if (naming.hooks) {
      lines.push(`- **Hooks:** ${naming.hooks}`);
    }
    if (naming.types) {
      lines.push(`- **Types:** ${naming.types}`);
    }
    if (naming.files) {
      lines.push(`- **Files:** ${naming.files}`);
    }
    if (naming.variables) {
      lines.push(`- **Variables:** ${naming.variables}`);
    }
    if (naming.functions) {
      lines.push(`- **Functions:** ${naming.functions}`);
    }
    lines.push('');
  }

  if (conventions.fileStructure && conventions.fileStructure.length > 0) {
    lines.push('### File Structure');
    lines.push('');
    for (const structure of conventions.fileStructure) {
      lines.push(`- ${structure}`);
    }
    lines.push('');
  }

  if (conventions.codePatterns && conventions.codePatterns.length > 0) {
    lines.push('### Code Patterns');
    lines.push('');
    for (const pattern of conventions.codePatterns) {
      lines.push(`- ${pattern}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate patterns section
 */
function generatePatternsSection(patterns: PatternInfo): string {
  const lines: string[] = ['## Architecture Patterns', ''];

  if (patterns.componentPattern) {
    lines.push(`- **Component Pattern:** ${patterns.componentPattern}`);
  }
  if (patterns.apiPattern) {
    lines.push(`- **API Pattern:** ${patterns.apiPattern}`);
  }
  if (patterns.statePattern) {
    lines.push(`- **State Pattern:** ${patterns.statePattern}`);
  }
  if (patterns.testPattern) {
    lines.push(`- **Test Pattern:** ${patterns.testPattern}`);
  }

  if (patterns.referenceFiles && Object.keys(patterns.referenceFiles).length > 0) {
    lines.push('');
    lines.push('### Reference Files');
    lines.push('');
    for (const [purpose, path] of Object.entries(patterns.referenceFiles)) {
      lines.push(`- **${purpose}:** \`${path}\``);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate test requirements section
 */
function generateTestRequirementsSection(requirements: TestRequirements): string {
  const lines: string[] = ['## Testing Requirements', ''];

  if (requirements.framework) {
    lines.push(`- **Framework:** ${requirements.framework}`);
  }
  if (requirements.coverageThreshold) {
    lines.push(`- **Coverage Threshold:** ${requirements.coverageThreshold}%`);
  }
  if (requirements.patterns && requirements.patterns.length > 0) {
    lines.push('- **Patterns:**');
    for (const pattern of requirements.patterns) {
      lines.push(`  - ${pattern}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate WRAP format for a task
 * WRAP = What, Requirements, Actual files, Patterns
 */
export function generateWRAPFormat(context: WRAPContext): string {
  const { task, userStory, feature, epic, affectedFiles, referencePatterns } = context;
  const sections: string[] = [];

  // Title
  sections.push(`## ${task.title}`);
  sections.push('');

  // What section
  sections.push('## What');
  sections.push('');
  if (task.details) {
    sections.push(task.details);
  } else {
    sections.push(task.title);
  }
  sections.push('');

  // Context from hierarchy
  if (userStory || feature || epic) {
    sections.push('### Context');
    sections.push('');
    if (epic) {
      sections.push(`**Epic:** ${epic.title}`);
    }
    if (feature) {
      sections.push(`**Feature:** ${feature.title}`);
    }
    if (userStory) {
      sections.push(
        `**User Story:** As a ${userStory.role}, I want to ${userStory.action} so that ${userStory.goal}`
      );
    }
    sections.push('');
  }

  // Requirements section
  sections.push('## Requirements');
  sections.push('');

  // Use user story acceptance criteria if available
  if (userStory?.acceptanceCriteria && userStory.acceptanceCriteria.length > 0) {
    for (const criterion of userStory.acceptanceCriteria) {
      if (criterion.text) {
        sections.push(`- [ ] ${criterion.text}`);
      }
    }
  } else if (feature?.acceptanceCriteria && feature.acceptanceCriteria.length > 0) {
    for (const criterion of feature.acceptanceCriteria) {
      if (criterion.text) {
        sections.push(`- [ ] ${criterion.text}`);
      }
    }
  } else {
    // Generate basic requirements from task
    sections.push(`- [ ] Implement ${task.title}`);
    if (task.notes) {
      sections.push(`- [ ] Note: ${task.notes}`);
    }
  }
  sections.push('');

  // Actual files section
  sections.push('## Actual files');
  sections.push('');
  if (affectedFiles && affectedFiles.length > 0) {
    for (const file of affectedFiles) {
      sections.push(`- \`${file}\``);
    }
  } else {
    sections.push('*Files to be determined during implementation*');
  }
  sections.push('');

  // Patterns section
  sections.push('## Patterns');
  sections.push('');
  if (referencePatterns && referencePatterns.length > 0) {
    for (const pattern of referencePatterns) {
      sections.push(pattern);
    }
  } else {
    sections.push('*Follow existing patterns in the codebase*');
  }
  sections.push('');

  // Priority
  if (task.priority) {
    sections.push(`**Priority:** ${task.priority}`);
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Generate bulk WRAP issues for multiple tasks
 */
export function generateBulkWRAPIssues(contexts: WRAPContext[]): string {
  const issues = contexts.map((context, index) => {
    const wrapContent = generateWRAPFormat(context);
    return `---\n\n# Issue ${index + 1}\n\n${wrapContent}`;
  });

  return issues.join('\n');
}

/**
 * Default tech stack for Next.js projects
 */
export const DEFAULT_COPILOT_TECH_STACK: TechStackInfo = {
  framework: 'Next.js 14 (App Router)',
  language: 'TypeScript (strict mode)',
  styling: 'Tailwind CSS',
  stateManagement: 'Zustand + TanStack Query',
  testing: 'Vitest + React Testing Library',
  additionalTools: ['Radix UI', 'shadcn/ui', 'date-fns'],
};

/**
 * Default conventions for Next.js projects
 */
export const DEFAULT_COPILOT_CONVENTIONS: ConventionInfo = {
  naming: {
    components: 'PascalCase (e.g., UserProfile.tsx)',
    hooks: 'camelCase with "use" prefix (e.g., useAuth.ts)',
    types: 'PascalCase with Type/Interface (e.g., UserType)',
    files: 'kebab-case for utilities, PascalCase for components',
    variables: 'camelCase',
    functions: 'camelCase',
  },
  fileStructure: [
    'components/ - Reusable UI components',
    'app/ - Next.js App Router pages and layouts',
    'lib/ - Utilities, hooks, and store',
    'types/ - TypeScript type definitions',
  ],
  codePatterns: [
    'Use cn() utility for conditional Tailwind classes',
    'Prefer named exports over default exports',
    'Use interface for object types, type for unions',
    'Always include proper TypeScript types',
  ],
};

/**
 * Default patterns for Next.js projects
 */
export const DEFAULT_COPILOT_PATTERNS: PatternInfo = {
  componentPattern: 'Follow patterns in components/ui/',
  apiPattern: 'Follow patterns in app/api/',
  statePattern: 'Use Zustand stores in lib/store/',
  testPattern: 'Co-locate tests with components (*.test.tsx)',
  referenceFiles: {
    'UI Component': 'components/ui/button.tsx',
    'Custom Hook': 'lib/hooks/use-auth.ts',
    'Store': 'lib/store/sow-slice.ts',
  },
};

/**
 * Default test requirements
 */
export const DEFAULT_TEST_REQUIREMENTS: TestRequirements = {
  framework: 'Vitest + React Testing Library',
  coverageThreshold: 80,
  patterns: [
    'Test component rendering',
    'Test user interactions',
    'Test error states',
    'Mock external dependencies',
  ],
};
