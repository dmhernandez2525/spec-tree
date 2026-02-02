/**
 * GitHub Copilot Export
 *
 * F2.1.5 - GitHub Copilot Export
 *
 * Export specifications in GitHub Copilot-compatible formats:
 * - copilot-instructions.md for project-level instructions
 * - WRAP format for individual issues (What, Requirements, Actual files, Patterns)
 */

import { RootState } from '@/lib/store';
import {
  selectEpicById,
  selectFeatureById,
  selectUserStoryById,
} from '@/lib/store/sow-slice';
import {
  FeatureType,
  UserStoryType,
  TaskType,
} from '../types/work-items';
import {
  CopilotInstructionsConfig,
  TechStackInfo,
  ConventionInfo,
  PatternInfo,
  TestRequirements,
  WRAPContext,
  generateCopilotInstructions,
  generateWRAPFormat,
  generateBulkWRAPIssues,
  DEFAULT_COPILOT_TECH_STACK,
  DEFAULT_COPILOT_CONVENTIONS,
  DEFAULT_COPILOT_PATTERNS,
  DEFAULT_TEST_REQUIREMENTS,
} from '../templates/copilot-template';
import { downloadFile } from '../utils/import-export';

export interface CopilotExportOptions {
  /** Include tech stack information */
  includeTechStack?: boolean;
  /** Include coding conventions */
  includeConventions?: boolean;
  /** Include architecture patterns */
  includePatterns?: boolean;
  /** Include test requirements */
  includeTestRequirements?: boolean;
  /** Custom tech stack override */
  customTechStack?: TechStackInfo;
  /** Custom conventions override */
  customConventions?: ConventionInfo;
  /** Custom patterns override */
  customPatterns?: PatternInfo;
  /** Custom test requirements override */
  customTestRequirements?: TestRequirements;
}

const DEFAULT_OPTIONS: CopilotExportOptions = {
  includeTechStack: true,
  includeConventions: true,
  includePatterns: true,
  includeTestRequirements: true,
};

/**
 * Export project as copilot-instructions.md
 */
export function exportCopilotInstructions(
  state: RootState,
  options: CopilotExportOptions = DEFAULT_OPTIONS
): string {
  const sowState = state.sow;
  const projectName = getProjectName(state);
  const description = sowState.globalInformation || '';

  const config: CopilotInstructionsConfig = {
    projectName,
    description,
  };

  if (options.includeTechStack) {
    config.techStack = options.customTechStack || DEFAULT_COPILOT_TECH_STACK;
  }

  if (options.includeConventions) {
    config.conventions = options.customConventions || DEFAULT_COPILOT_CONVENTIONS;
  }

  if (options.includePatterns) {
    config.patterns = options.customPatterns || DEFAULT_COPILOT_PATTERNS;
  }

  if (options.includeTestRequirements) {
    config.testRequirements =
      options.customTestRequirements || DEFAULT_TEST_REQUIREMENTS;
  }

  return generateCopilotInstructions(config);
}

/**
 * Export a single task as WRAP format
 */
export function exportTaskAsWRAP(
  taskId: string,
  state: RootState,
  affectedFiles?: string[],
  referencePatterns?: string[]
): string {
  const sowState = state.sow;
  const task = sowState.tasks?.[taskId];

  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  const context = buildWRAPContext(task, state, affectedFiles, referencePatterns);
  return generateWRAPFormat(context);
}

/**
 * Export a user story's tasks as WRAP issues
 */
export function exportUserStoryTasksAsWRAP(
  userStoryId: string,
  state: RootState
): string {
  const sowState = state.sow;
  const userStory = selectUserStoryById(state, userStoryId);

  if (!userStory) {
    throw new Error(`User story with ID ${userStoryId} not found`);
  }

  const tasks = Object.values(sowState.tasks || {})
    .filter((task): task is TaskType =>
      Boolean(task) && task.parentUserStoryId === userStoryId
    );

  if (tasks.length === 0) {
    throw new Error(`No tasks found for user story ${userStoryId}`);
  }

  const contexts = tasks.map((task) => buildWRAPContext(task, state));
  return generateBulkWRAPIssues(contexts);
}

/**
 * Export a feature's tasks as WRAP issues
 */
export function exportFeatureTasksAsWRAP(
  featureId: string,
  state: RootState
): string {
  const sowState = state.sow;
  const feature = selectFeatureById(state, featureId);

  if (!feature) {
    throw new Error(`Feature with ID ${featureId} not found`);
  }

  // Get all user stories for this feature
  const userStories = Object.values(sowState.userStories || {})
    .filter((story): story is UserStoryType =>
      Boolean(story) && story.parentFeatureId === featureId
    );

  // Get all tasks for these user stories
  const storyIds = new Set(userStories.map((s) => s.id));
  const tasks = Object.values(sowState.tasks || {})
    .filter((task): task is TaskType =>
      Boolean(task) && storyIds.has(task.parentUserStoryId)
    );

  if (tasks.length === 0) {
    throw new Error(`No tasks found for feature ${featureId}`);
  }

  const contexts = tasks.map((task) => buildWRAPContext(task, state));
  return generateBulkWRAPIssues(contexts);
}

/**
 * Export all tasks in an epic as WRAP issues
 */
export function exportEpicTasksAsWRAP(
  epicId: string,
  state: RootState
): string {
  const sowState = state.sow;
  const epic = selectEpicById(state, epicId);

  if (!epic) {
    throw new Error(`Epic with ID ${epicId} not found`);
  }

  // Get all features for this epic
  const features = Object.values(sowState.features || {})
    .filter((f): f is FeatureType =>
      Boolean(f) && f.parentEpicId === epicId
    );

  // Get all user stories for these features
  const featureIds = new Set(features.map((f) => f.id));
  const userStories = Object.values(sowState.userStories || {})
    .filter((story): story is UserStoryType =>
      Boolean(story) && featureIds.has(story.parentFeatureId)
    );

  // Get all tasks for these user stories
  const storyIds = new Set(userStories.map((s) => s.id));
  const tasks = Object.values(sowState.tasks || {})
    .filter((task): task is TaskType =>
      Boolean(task) && storyIds.has(task.parentUserStoryId)
    );

  if (tasks.length === 0) {
    throw new Error(`No tasks found for epic ${epicId}`);
  }

  const contexts = tasks.map((task) => buildWRAPContext(task, state));
  return generateBulkWRAPIssues(contexts);
}

/**
 * Build WRAP context for a task
 */
function buildWRAPContext(
  task: TaskType,
  state: RootState,
  affectedFiles?: string[],
  referencePatterns?: string[]
): WRAPContext {
  // Get parent user story
  const userStory = task.parentUserStoryId
    ? selectUserStoryById(state, task.parentUserStoryId)
    : undefined;

  // Get parent feature
  const feature = userStory?.parentFeatureId
    ? selectFeatureById(state, userStory.parentFeatureId)
    : undefined;

  // Get parent epic
  const epic = feature?.parentEpicId
    ? selectEpicById(state, feature.parentEpicId)
    : undefined;

  return {
    task,
    userStory: userStory || undefined,
    feature: feature || undefined,
    epic: epic || undefined,
    affectedFiles,
    referencePatterns,
  };
}

/**
 * Download copilot-instructions.md
 */
export function downloadCopilotInstructions(content: string): void {
  downloadFile(content, 'copilot-instructions.md', 'text/markdown');
}

/**
 * Download WRAP issues
 */
export function downloadWRAPIssues(
  content: string,
  filename: string = 'github-issues.md'
): void {
  downloadFile(content, filename, 'text/markdown');
}

/**
 * Copy content to clipboard
 */
export async function copyCopilotToClipboard(content: string): Promise<boolean> {
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

  const apps = sowState.apps || {};
  const appKeys = Object.keys(apps);
  if (appKeys.length > 0) {
    const firstApp = apps[appKeys[0]];
    if (firstApp?.name) {
      return firstApp.name;
    }
  }

  return 'Spec Tree Project';
}

/**
 * Get statistics for WRAP export
 */
export function getWRAPStatistics(state: RootState): {
  totalTasks: number;
  tasksWithStories: number;
  tasksWithFeatures: number;
  tasksWithEpics: number;
} {
  const sowState = state.sow;

  const tasks = Object.values(sowState.tasks || {}).filter(Boolean) as TaskType[];
  const storyIds = new Set(
    Object.values(sowState.userStories || {})
      .filter(Boolean)
      .map((s) => (s as UserStoryType).id)
  );
  const featureIds = new Set(
    Object.values(sowState.features || {})
      .filter(Boolean)
      .map((f) => (f as FeatureType).id)
  );

  let tasksWithStories = 0;
  let tasksWithFeatures = 0;
  let tasksWithEpics = 0;

  for (const task of tasks) {
    if (storyIds.has(task.parentUserStoryId)) {
      tasksWithStories++;
      const story = sowState.userStories?.[task.parentUserStoryId];
      if (story && featureIds.has(story.parentFeatureId)) {
        tasksWithFeatures++;
        const feature = sowState.features?.[story.parentFeatureId];
        if (feature?.parentEpicId && sowState.epics?.[feature.parentEpicId]) {
          tasksWithEpics++;
        }
      }
    }
  }

  return {
    totalTasks: tasks.length,
    tasksWithStories,
    tasksWithFeatures,
    tasksWithEpics,
  };
}
