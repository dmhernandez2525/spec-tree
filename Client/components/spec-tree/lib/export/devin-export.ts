/**
 * Devin Export
 *
 * F2.2.1 - Devin Task Format Export
 *
 * Export task specifications optimized for Devin by Cognition.
 * Devin works best with atomic, 4-8 hour task specifications
 * with verifiable acceptance criteria.
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
  DevinTaskConfig,
  DevinTaskContext,
  DevinFile,
  DevinPlaybook,
  generateDevinTask,
  generateDevinTaskFromContext,
  generateBulkDevinTasks,
  generatePlaybook,
  DEFAULT_DEVIN_LABELS,
  DEFAULT_VERIFICATION_COMMANDS,
  DEFAULT_PLAYBOOKS,
} from '../templates/devin-template';
import { downloadFile } from '../utils/import-export';

export interface DevinExportOptions {
  /** Estimated hours per task (default: 4-6) */
  estimatedHours?: number;
  /** Include verification commands */
  includeVerification?: boolean;
  /** Include playbook reference */
  includePlaybook?: boolean;
  /** Custom labels to add */
  customLabels?: string[];
  /** Custom verification commands */
  customVerificationCommands?: string[];
  /** Include dependencies info */
  includeDependencies?: boolean;
}

const DEFAULT_OPTIONS: DevinExportOptions = {
  estimatedHours: 5,
  includeVerification: true,
  includePlaybook: false,
  includeDependencies: true,
};

/**
 * Export a single task as Devin format
 */
export function exportTaskAsDevin(
  taskId: string,
  state: RootState,
  options: DevinExportOptions = DEFAULT_OPTIONS
): string {
  const sowState = state.sow;
  const task = sowState.tasks?.[taskId];

  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  const context = buildDevinContext(task, state, options);
  return generateDevinTaskFromContext(context);
}

/**
 * Export all tasks in a user story as Devin format
 */
export function exportUserStoryTasksAsDevin(
  userStoryId: string,
  state: RootState,
  options: DevinExportOptions = DEFAULT_OPTIONS
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

  const contexts = tasks.map((task) => buildDevinContext(task, state, options));
  return generateBulkDevinTasks(contexts);
}

/**
 * Export all tasks in a feature as Devin format
 */
export function exportFeatureTasksAsDevin(
  featureId: string,
  state: RootState,
  options: DevinExportOptions = DEFAULT_OPTIONS
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

  const contexts = tasks.map((task) => buildDevinContext(task, state, options));
  return generateBulkDevinTasks(contexts);
}

/**
 * Export all tasks in an epic as Devin format
 */
export function exportEpicTasksAsDevin(
  epicId: string,
  state: RootState,
  options: DevinExportOptions = DEFAULT_OPTIONS
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

  const contexts = tasks.map((task) => buildDevinContext(task, state, options));
  return generateBulkDevinTasks(contexts);
}

/**
 * Export all tasks in the project as Devin format
 */
export function exportAllTasksAsDevin(
  state: RootState,
  options: DevinExportOptions = DEFAULT_OPTIONS
): string {
  const sowState = state.sow;

  const tasks = Object.values(sowState.tasks || {}).filter(Boolean) as TaskType[];

  if (tasks.length === 0) {
    throw new Error('No tasks found in the project');
  }

  const contexts = tasks.map((task) => buildDevinContext(task, state, options));
  return generateBulkDevinTasks(contexts);
}

/**
 * Build Devin context for a task
 */
function buildDevinContext(
  task: TaskType,
  state: RootState,
  options: DevinExportOptions
): DevinTaskContext {
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

  // Determine verification commands:
  // - If custom commands provided, use them
  // - If includeVerification is not explicitly false, use defaults
  let verificationCommands: string[] | undefined;
  if (options.customVerificationCommands) {
    verificationCommands = options.customVerificationCommands;
  } else if (options.includeVerification !== false) {
    verificationCommands = DEFAULT_VERIFICATION_COMMANDS.all;
  }

  return {
    task,
    userStory: userStory || undefined,
    feature: feature || undefined,
    epic: epic || undefined,
    estimatedHours: options.estimatedHours,
    verificationCommands,
  };
}

/**
 * Download Devin tasks as markdown file
 */
export function downloadDevinTasks(
  content: string,
  filename: string = 'devin-tasks.md'
): void {
  downloadFile(content, filename, 'text/markdown');
}

/**
 * Copy Devin tasks to clipboard
 */
export async function copyDevinTasksToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate Linear-compatible Devin task
 * Includes metadata for Linear import
 */
export function generateLinearDevinTask(
  taskId: string,
  state: RootState,
  options: DevinExportOptions = DEFAULT_OPTIONS
): string {
  const sowState = state.sow;
  const task = sowState.tasks?.[taskId];

  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  const context = buildDevinContext(task, state, options);
  const devinContent = generateDevinTaskFromContext(context);

  // Add Linear metadata header
  const lines: string[] = [];
  lines.push('---');
  lines.push(`title: "${task.title}"`);
  lines.push(`labels: ["devin", "${inferTaskType(task)}"]`);
  lines.push(`priority: ${task.priority || 2}`);
  lines.push('---');
  lines.push('');
  lines.push(devinContent);

  return lines.join('\n');
}

/**
 * Get Devin export statistics
 */
export function getDevinExportStatistics(state: RootState): {
  totalTasks: number;
  tasksByType: Record<string, number>;
  tasksWithAcceptanceCriteria: number;
  averageTasksPerStory: number;
} {
  const sowState = state.sow;

  const tasks = Object.values(sowState.tasks || {}).filter(Boolean) as TaskType[];
  const userStories = Object.values(sowState.userStories || {}).filter(Boolean) as UserStoryType[];

  // Count tasks by type
  const tasksByType: Record<string, number> = {};
  for (const task of tasks) {
    const type = inferTaskType(task);
    tasksByType[type] = (tasksByType[type] || 0) + 1;
  }

  // Count tasks with acceptance criteria (from parent user story)
  let tasksWithAcceptanceCriteria = 0;
  for (const task of tasks) {
    const story = userStories.find((s) => s.id === task.parentUserStoryId);
    if (story?.acceptanceCriteria && story.acceptanceCriteria.length > 0) {
      tasksWithAcceptanceCriteria++;
    }
  }

  // Calculate average tasks per story
  const storiesWithTasks = new Set(tasks.map((t) => t.parentUserStoryId)).size;
  const averageTasksPerStory = storiesWithTasks > 0 ? tasks.length / storiesWithTasks : 0;

  return {
    totalTasks: tasks.length,
    tasksByType,
    tasksWithAcceptanceCriteria,
    averageTasksPerStory: Math.round(averageTasksPerStory * 10) / 10,
  };
}

/**
 * Infer task type from content
 */
function inferTaskType(task: TaskType): string {
  const title = task.title.toLowerCase();
  const details = task.details?.toLowerCase() || '';
  const combined = `${title} ${details}`;

  if (combined.includes('test') || combined.includes('spec')) {
    return 'testing';
  }
  if (combined.includes('api') || combined.includes('endpoint') || combined.includes('backend')) {
    return 'backend';
  }
  if (combined.includes('database') || combined.includes('migration')) {
    return 'database';
  }
  if (combined.includes('component') || combined.includes('ui') || combined.includes('frontend')) {
    return 'frontend';
  }
  if (combined.includes('refactor') || combined.includes('cleanup')) {
    return 'refactoring';
  }
  if (combined.includes('fix') || combined.includes('bug')) {
    return 'bugfix';
  }
  if (combined.includes('doc')) {
    return 'documentation';
  }

  return 'feature';
}

/**
 * Get playbook for a task type
 */
export function getPlaybookForTask(task: TaskType): DevinPlaybook | undefined {
  const type = inferTaskType(task);

  switch (type) {
    case 'frontend':
      return DEFAULT_PLAYBOOKS.find((p) => p.taskType === 'frontend');
    case 'backend':
      return DEFAULT_PLAYBOOKS.find((p) => p.taskType === 'backend');
    case 'bugfix':
      return DEFAULT_PLAYBOOKS.find((p) => p.taskType === 'bugfix');
    default:
      return undefined;
  }
}

/**
 * Export a playbook as markdown
 */
export function exportPlaybook(taskType: string): string | null {
  const playbook = DEFAULT_PLAYBOOKS.find((p) => p.taskType === taskType);
  if (!playbook) {
    return null;
  }
  return generatePlaybook(playbook);
}

/**
 * Get project name from state
 */
export function getProjectName(state: RootState): string {
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

// Re-export types and utilities
export type {
  DevinTaskConfig,
  DevinTaskContext,
  DevinFile,
  DevinPlaybook,
};

export {
  DEFAULT_DEVIN_LABELS,
  DEFAULT_VERIFICATION_COMMANDS,
  DEFAULT_PLAYBOOKS,
  generateDevinTask,
  generatePlaybook,
};
