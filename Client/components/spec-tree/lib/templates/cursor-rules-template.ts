/**
 * Cursor Rules Template
 *
 * F2.1.1 - Cursor Rules Export
 *
 * Templates for generating Cursor-compatible .cursor/rules/ files
 * using MDC (Markdown Component) format.
 */

import {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
} from '../types/work-items';

export interface CursorRulesConfig {
  projectName: string;
  description: string;
  techStack?: TechStackInfo;
  codeStyle?: CodeStyleInfo;
  architecture?: ArchitectureInfo;
  currentFeature?: FeatureContext;
}

export interface TechStackInfo {
  framework?: string;
  language?: string;
  styling?: string;
  stateManagement?: string;
  testing?: string;
  additionalTools?: string[];
}

export interface CodeStyleInfo {
  componentNaming?: string;
  hookNaming?: string;
  typeNaming?: string;
  fileNaming?: string;
  importOrdering?: string[];
  additionalRules?: string[];
}

export interface ArchitectureInfo {
  componentPattern?: string;
  apiPattern?: string;
  hooksPattern?: string;
  storePattern?: string;
  additionalPatterns?: Record<string, string>;
}

export interface FeatureContext {
  feature: FeatureType;
  epic?: EpicType;
  userStories?: UserStoryType[];
  tasks?: TaskType[];
  comments?: string[];
}

/**
 * Generate the frontmatter for Cursor rules file
 */
export function generateFrontmatter(config: CursorRulesConfig): string {
  return `---
title: ${config.projectName} Rules
description: Spec Tree generated rules for ${config.projectName}
---`;
}

/**
 * Generate tech stack section
 */
export function generateTechStackSection(techStack?: TechStackInfo): string {
  if (!techStack) return '';

  const lines: string[] = ['## Tech Stack', ''];

  if (techStack.framework) {
    lines.push(`- Framework: ${techStack.framework}`);
  }
  if (techStack.language) {
    lines.push(`- Language: ${techStack.language}`);
  }
  if (techStack.styling) {
    lines.push(`- Styling: ${techStack.styling}`);
  }
  if (techStack.stateManagement) {
    lines.push(`- State: ${techStack.stateManagement}`);
  }
  if (techStack.testing) {
    lines.push(`- Testing: ${techStack.testing}`);
  }
  if (techStack.additionalTools && techStack.additionalTools.length > 0) {
    for (const tool of techStack.additionalTools) {
      lines.push(`- ${tool}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate code style section
 */
export function generateCodeStyleSection(codeStyle?: CodeStyleInfo): string {
  if (!codeStyle) return '';

  const lines: string[] = ['## Code Style', ''];

  if (codeStyle.componentNaming) {
    lines.push(`- Components: ${codeStyle.componentNaming}`);
  }
  if (codeStyle.hookNaming) {
    lines.push(`- Hooks: ${codeStyle.hookNaming}`);
  }
  if (codeStyle.typeNaming) {
    lines.push(`- Types: ${codeStyle.typeNaming}`);
  }
  if (codeStyle.fileNaming) {
    lines.push(`- Files: ${codeStyle.fileNaming}`);
  }
  if (codeStyle.importOrdering && codeStyle.importOrdering.length > 0) {
    lines.push('- Import ordering:');
    for (const order of codeStyle.importOrdering) {
      lines.push(`  1. ${order}`);
    }
  }
  if (codeStyle.additionalRules && codeStyle.additionalRules.length > 0) {
    for (const rule of codeStyle.additionalRules) {
      lines.push(`- ${rule}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate architecture section
 */
export function generateArchitectureSection(
  architecture?: ArchitectureInfo
): string {
  if (!architecture) return '';

  const lines: string[] = ['## Architecture', ''];

  if (architecture.componentPattern) {
    lines.push(`- Components: ${architecture.componentPattern}`);
  }
  if (architecture.apiPattern) {
    lines.push(`- API routes: ${architecture.apiPattern}`);
  }
  if (architecture.hooksPattern) {
    lines.push(`- Hooks: ${architecture.hooksPattern}`);
  }
  if (architecture.storePattern) {
    lines.push(`- State: ${architecture.storePattern}`);
  }
  if (architecture.additionalPatterns) {
    for (const [key, value] of Object.entries(architecture.additionalPatterns)) {
      lines.push(`- ${key}: ${value}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate acceptance criteria as checklist
 */
export function generateAcceptanceCriteria(
  criteria: Array<{ text: string }>
): string {
  if (!criteria || criteria.length === 0) return '';

  const lines: string[] = ['### Acceptance Criteria', ''];

  for (const criterion of criteria) {
    if (criterion.text) {
      lines.push(`- [ ] ${criterion.text}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate user story section
 */
export function generateUserStorySection(story: UserStoryType): string {
  const lines: string[] = [];

  lines.push(`#### ${story.title}`);
  lines.push('');

  if (story.role || story.action || story.goal) {
    lines.push(
      `As a **${story.role || 'user'}**, I want to **${story.action || ''}** so that **${story.goal || ''}**.`
    );
    lines.push('');
  }

  if (story.points) {
    lines.push(`**Estimated Effort:** ${story.points} points`);
    lines.push('');
  }

  if (story.acceptanceCriteria && story.acceptanceCriteria.length > 0) {
    lines.push(generateAcceptanceCriteria(story.acceptanceCriteria));
  }

  return lines.join('\n');
}

/**
 * Generate task section
 */
export function generateTaskSection(task: TaskType): string {
  const lines: string[] = [];

  lines.push(`- [ ] **${task.title}**`);
  if (task.details) {
    lines.push(`  - ${task.details}`);
  }
  if (task.priority) {
    lines.push(`  - Priority: ${task.priority}`);
  }

  return lines.join('\n');
}

/**
 * Generate feature context section
 */
export function generateFeatureContextSection(
  context?: FeatureContext
): string {
  if (!context || !context.feature) return '';

  const lines: string[] = ['## Current Feature Context', ''];

  const { feature, epic, userStories, tasks } = context;

  lines.push(`### Feature: ${feature.title}`);
  lines.push('');

  if (feature.description) {
    lines.push(feature.description);
    lines.push('');
  }

  if (feature.details) {
    lines.push(`**Details:** ${feature.details}`);
    lines.push('');
  }

  if (epic) {
    lines.push(`**Epic:** ${epic.title}`);
    if (epic.goal) {
      lines.push(`**Epic Goal:** ${epic.goal}`);
    }
    lines.push('');
  }

  if (feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0) {
    lines.push(generateAcceptanceCriteria(feature.acceptanceCriteria));
  }

  if (userStories && userStories.length > 0) {
    lines.push('### User Stories');
    lines.push('');
    for (const story of userStories) {
      lines.push(generateUserStorySection(story));
    }
  }

  if (tasks && tasks.length > 0) {
    lines.push('### Tasks');
    lines.push('');
    for (const task of tasks) {
      lines.push(generateTaskSection(task));
    }
    lines.push('');
  }

  if (context.comments && context.comments.length > 0) {
    lines.push('### Comments');
    lines.push('');
    lines.push(...context.comments);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate complete Cursor rules file content
 */
export function generateCursorRulesContent(config: CursorRulesConfig): string {
  const sections: string[] = [];

  // Frontmatter
  sections.push(generateFrontmatter(config));
  sections.push('');

  // Project header
  sections.push(`# Project: ${config.projectName}`);
  sections.push('');

  if (config.description) {
    sections.push(config.description);
    sections.push('');
  }

  // Tech stack
  const techSection = generateTechStackSection(config.techStack);
  if (techSection) {
    sections.push(techSection);
  }

  // Code style
  const styleSection = generateCodeStyleSection(config.codeStyle);
  if (styleSection) {
    sections.push(styleSection);
  }

  // Architecture
  const archSection = generateArchitectureSection(config.architecture);
  if (archSection) {
    sections.push(archSection);
  }

  // Current feature context
  const featureSection = generateFeatureContextSection(config.currentFeature);
  if (featureSection) {
    sections.push(featureSection);
  }

  return sections.join('\n');
}

/**
 * Default tech stack for Next.js projects
 */
export const DEFAULT_NEXTJS_TECH_STACK: TechStackInfo = {
  framework: 'Next.js 14 (App Router)',
  language: 'TypeScript (strict mode)',
  styling: 'Tailwind CSS',
  stateManagement: 'Zustand + TanStack Query',
  testing: 'Vitest + React Testing Library',
  additionalTools: ['Radix UI', 'shadcn/ui components'],
};

/**
 * Default code style for Next.js projects
 */
export const DEFAULT_NEXTJS_CODE_STYLE: CodeStyleInfo = {
  componentNaming: 'PascalCase (e.g., UserProfile.tsx)',
  hookNaming: 'camelCase with "use" prefix (e.g., useAuth.ts)',
  typeNaming: 'PascalCase with Type/Interface suffix (e.g., UserType)',
  fileNaming: 'kebab-case for utilities, PascalCase for components',
  importOrdering: [
    'React and Next.js imports',
    'Third-party libraries',
    'Internal components',
    'Internal utilities and hooks',
    'Types',
    'Styles',
  ],
  additionalRules: [
    'Use `cn()` utility for conditional Tailwind classes',
    'Prefer named exports over default exports',
    'Use interface for object types, type for unions/intersections',
  ],
};

/**
 * Default architecture for Next.js projects
 */
export const DEFAULT_NEXTJS_ARCHITECTURE: ArchitectureInfo = {
  componentPattern: 'src/components/ or components/',
  apiPattern: 'src/app/api/ or app/api/',
  hooksPattern: 'src/hooks/ or lib/hooks/',
  storePattern: 'src/lib/store/ or lib/store/',
  additionalPatterns: {
    Utilities: 'src/lib/ or lib/',
    Types: 'src/types/ or lib/types/',
  },
};
