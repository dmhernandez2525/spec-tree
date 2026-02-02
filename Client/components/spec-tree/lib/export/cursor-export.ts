/**
 * Cursor Rules Export
 *
 * F2.1.1 - Cursor Rules Export
 *
 * Export project specifications as Cursor-compatible `.cursor/rules/` files.
 * This enables Cursor AI to understand project conventions, tech stack, and
 * patterns when generating code.
 */

import { RootState } from '@/lib/store';
import {
  selectEpicById,
  selectFeatureById,
} from '@/lib/store/sow-slice';
import {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
} from '../types/work-items';
import {
  CursorRulesConfig,
  TechStackInfo,
  CodeStyleInfo,
  ArchitectureInfo,
  FeatureContext,
  generateCursorRulesContent,
  DEFAULT_NEXTJS_TECH_STACK,
  DEFAULT_NEXTJS_CODE_STYLE,
  DEFAULT_NEXTJS_ARCHITECTURE,
} from '../templates/cursor-rules-template';
import { downloadFile } from '../utils/import-export';

export interface CursorExportOptions {
  /** Include tech stack information */
  includeTechStack?: boolean;
  /** Include code style rules */
  includeCodeStyle?: boolean;
  /** Include architecture patterns */
  includeArchitecture?: boolean;
  /** Custom tech stack override */
  customTechStack?: TechStackInfo;
  /** Custom code style override */
  customCodeStyle?: CodeStyleInfo;
  /** Custom architecture override */
  customArchitecture?: ArchitectureInfo;
}

const DEFAULT_OPTIONS: CursorExportOptions = {
  includeTechStack: true,
  includeCodeStyle: true,
  includeArchitecture: true,
};

/**
 * Export entire project as Cursor rules
 */
export function exportProjectToCursorRules(
  state: RootState,
  options: CursorExportOptions = DEFAULT_OPTIONS
): string {
  const sowState = state.sow;
  const projectName = getProjectName(state);
  const description = sowState.globalInformation || '';

  const config: CursorRulesConfig = {
    projectName,
    description,
  };

  // Add tech stack if enabled
  if (options.includeTechStack) {
    config.techStack = options.customTechStack || DEFAULT_NEXTJS_TECH_STACK;
  }

  // Add code style if enabled
  if (options.includeCodeStyle) {
    config.codeStyle = options.customCodeStyle || DEFAULT_NEXTJS_CODE_STYLE;
  }

  // Add architecture if enabled
  if (options.includeArchitecture) {
    config.architecture =
      options.customArchitecture || DEFAULT_NEXTJS_ARCHITECTURE;
  }

  return generateCursorRulesContent(config);
}

/**
 * Export a single feature as Cursor rules with full context
 */
export function exportFeatureToCursorRules(
  featureId: string,
  state: RootState,
  options: CursorExportOptions = DEFAULT_OPTIONS
): string {
  const sowState = state.sow;
  const feature = selectFeatureById(state, featureId);

  if (!feature) {
    throw new Error(`Feature with ID ${featureId} not found`);
  }

  const projectName = getProjectName(state);
  const description = sowState.globalInformation || '';

  // Get parent epic
  const epic = feature.parentEpicId
    ? selectEpicById(state, feature.parentEpicId)
    : undefined;

  // Get user stories for this feature
  const userStories = Object.values(sowState.userStories || {})
    .filter((story): story is UserStoryType =>
      Boolean(story) && story.parentFeatureId === featureId
    );

  // Get tasks for these user stories
  const storyIds = new Set(userStories.map((s) => s.id));
  const tasks = Object.values(sowState.tasks || {})
    .filter((task): task is TaskType =>
      Boolean(task) && storyIds.has(task.parentUserStoryId)
    );

  const featureContext: FeatureContext = {
    feature,
    epic: epic || undefined,
    userStories,
    tasks,
  };

  const config: CursorRulesConfig = {
    projectName,
    description,
    currentFeature: featureContext,
  };

  // Add tech stack if enabled
  if (options.includeTechStack) {
    config.techStack = options.customTechStack || DEFAULT_NEXTJS_TECH_STACK;
  }

  // Add code style if enabled
  if (options.includeCodeStyle) {
    config.codeStyle = options.customCodeStyle || DEFAULT_NEXTJS_CODE_STYLE;
  }

  // Add architecture if enabled
  if (options.includeArchitecture) {
    config.architecture =
      options.customArchitecture || DEFAULT_NEXTJS_ARCHITECTURE;
  }

  return generateCursorRulesContent(config);
}

/**
 * Export an epic and all its features as Cursor rules
 */
export function exportEpicToCursorRules(
  epicId: string,
  state: RootState,
  options: CursorExportOptions = DEFAULT_OPTIONS
): string {
  const sowState = state.sow;
  const epic = selectEpicById(state, epicId);

  if (!epic) {
    throw new Error(`Epic with ID ${epicId} not found`);
  }

  const projectName = getProjectName(state);
  const description = sowState.globalInformation || '';

  // Get all features for this epic
  const features = Object.values(sowState.features || {})
    .filter((f): f is FeatureType =>
      Boolean(f) && f.parentEpicId === epicId
    );

  // Build multiple feature contexts
  const featureContexts: FeatureContext[] = features.map((feature) => {
    const userStories = Object.values(sowState.userStories || {})
      .filter((story): story is UserStoryType =>
        Boolean(story) && story.parentFeatureId === feature.id
      );

    const storyIds = new Set(userStories.map((s) => s.id));
    const tasks = Object.values(sowState.tasks || {})
      .filter((task): task is TaskType =>
        Boolean(task) && storyIds.has(task.parentUserStoryId)
      );

    return {
      feature,
      epic,
      userStories,
      tasks,
    };
  });

  // For epic export, we create a combined view
  const combinedDescription = [
    description,
    '',
    `## Epic: ${epic.title}`,
    '',
    epic.description || '',
    '',
    epic.goal ? `**Goal:** ${epic.goal}` : '',
    epic.successCriteria ? `**Success Criteria:** ${epic.successCriteria}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const config: CursorRulesConfig = {
    projectName,
    description: combinedDescription,
  };

  // Add tech stack if enabled
  if (options.includeTechStack) {
    config.techStack = options.customTechStack || DEFAULT_NEXTJS_TECH_STACK;
  }

  // Add code style if enabled
  if (options.includeCodeStyle) {
    config.codeStyle = options.customCodeStyle || DEFAULT_NEXTJS_CODE_STYLE;
  }

  // Add architecture if enabled
  if (options.includeArchitecture) {
    config.architecture =
      options.customArchitecture || DEFAULT_NEXTJS_ARCHITECTURE;
  }

  // Add first feature as current context (could be improved to include all)
  if (featureContexts.length > 0) {
    config.currentFeature = featureContexts[0];
  }

  return generateCursorRulesContent(config);
}

/**
 * Download Cursor rules as a file
 */
export function downloadCursorRules(
  content: string,
  filename: string = 'project.mdc'
): void {
  downloadFile(content, filename, 'text/markdown');
}

/**
 * Copy Cursor rules to clipboard
 */
export async function copyCursorRulesToClipboard(
  content: string
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Get project name from state
 */
function getProjectName(state: RootState): string {
  const sowState = state.sow;

  // Try to get app name from apps
  const apps = sowState.apps || {};
  const appKeys = Object.keys(apps);
  if (appKeys.length > 0) {
    const firstApp = apps[appKeys[0]];
    if (firstApp?.name) {
      return firstApp.name;
    }
  }

  // Fallback to generic name
  return 'Spec Tree Project';
}

/**
 * Get export statistics for a project
 */
export function getExportStatistics(state: RootState): {
  totalEpics: number;
  totalFeatures: number;
  totalUserStories: number;
  totalTasks: number;
  totalAcceptanceCriteria: number;
} {
  const sowState = state.sow;

  const epics = Object.values(sowState.epics || {}).filter(Boolean) as EpicType[];
  const features = Object.values(sowState.features || {}).filter(Boolean) as FeatureType[];
  const userStories = Object.values(sowState.userStories || {}).filter(Boolean) as UserStoryType[];
  const tasks = Object.values(sowState.tasks || {}).filter(Boolean) as TaskType[];

  let totalAcceptanceCriteria = 0;

  for (const feature of features) {
    totalAcceptanceCriteria += feature.acceptanceCriteria?.length || 0;
  }

  for (const story of userStories) {
    totalAcceptanceCriteria += story.acceptanceCriteria?.length || 0;
  }

  return {
    totalEpics: epics.length,
    totalFeatures: features.length,
    totalUserStories: userStories.length,
    totalTasks: tasks.length,
    totalAcceptanceCriteria,
  };
}
