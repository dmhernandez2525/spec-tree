/**
 * v0 UI Export
 *
 * F2.1.8 - v0 UI Spec Export
 *
 * Export UI specifications optimized for v0 by Vercel.
 * v0 excels at generating React/Next.js/Tailwind UI components.
 */

import { RootState } from '@/lib/store';
import {
  selectEpicById,
  selectFeatureById,
} from '@/lib/store/sow-slice';
import {
  FeatureType,
  UserStoryType,
  TaskType,
} from '../types/work-items';
import {
  V0UISpecConfig,
  V0FeatureContext,
  VisualSpecifications,
  ComponentState,
  ResponsiveBehavior,
  Interaction,
  AccessibilityRequirements,
  DesignTokens,
  generateV0UISpec,
  generateV0SpecFromFeature,
  generateBulkV0Specs,
  DEFAULT_VISUAL_SPECS,
  DEFAULT_COMPONENT_STATES,
  DEFAULT_RESPONSIVE_BEHAVIOR,
  DEFAULT_ACCESSIBILITY,
} from '../templates/v0-ui-template';
import { downloadFile } from '../utils/import-export';

export interface V0ExportOptions {
  /** Include visual specifications */
  includeVisualSpecs?: boolean;
  /** Include component states */
  includeStates?: boolean;
  /** Include responsive behavior */
  includeResponsive?: boolean;
  /** Include interactions */
  includeInteractions?: boolean;
  /** Include accessibility requirements */
  includeAccessibility?: boolean;
  /** Include design tokens */
  includeDesignTokens?: boolean;
  /** Custom visual specifications */
  customVisualSpecs?: VisualSpecifications;
  /** Custom component states */
  customStates?: ComponentState[];
  /** Custom responsive behavior */
  customResponsive?: ResponsiveBehavior;
  /** Custom accessibility requirements */
  customAccessibility?: AccessibilityRequirements;
  /** Custom design tokens */
  customDesignTokens?: DesignTokens;
}

const DEFAULT_OPTIONS: V0ExportOptions = {
  includeVisualSpecs: true,
  includeStates: true,
  includeResponsive: true,
  includeInteractions: true,
  includeAccessibility: true,
  includeDesignTokens: false,
};

/**
 * Validate that an ID is provided and non-empty
 * @param id - The ID to validate
 * @param type - The type of ID (for error message)
 * @throws Error if ID is empty or whitespace
 */
function validateId(id: string, type: string): void {
  if (!id || id.trim() === '') {
    throw new Error(`${type} ID is required and cannot be empty`);
  }
}

/**
 * Build a V0FeatureContext for a given feature
 * @param feature - The feature to build context for
 * @param sowState - The SOW state containing user stories and tasks
 * @param designTokens - Optional custom design tokens
 * @returns V0FeatureContext for the feature
 */
function buildFeatureContext(
  feature: FeatureType,
  sowState: RootState['sow'],
  designTokens?: DesignTokens
): V0FeatureContext {
  // Get related user stories
  const userStories = Object.values(sowState.userStories || {})
    .filter((story): story is UserStoryType =>
      Boolean(story) && story.parentFeatureId === feature.id
    );

  // Get related tasks (tasks belonging to stories of this feature)
  const storyIds = new Set(userStories.map((s) => s.id));
  const tasks = Object.values(sowState.tasks || {})
    .filter((task): task is TaskType =>
      Boolean(task) && storyIds.has(task.parentUserStoryId)
    );

  return {
    feature,
    userStories,
    tasks,
    designTokens,
  };
}

/**
 * Export a single feature as v0 UI spec
 * @param featureId - The ID of the feature to export
 * @param state - The Redux state
 * @param options - Export options
 * @returns Generated v0 UI specification
 * @throws Error if featureId is empty or feature not found
 */
export function exportFeatureAsV0Spec(
  featureId: string,
  state: RootState,
  options: V0ExportOptions = DEFAULT_OPTIONS
): string {
  validateId(featureId, 'Feature');

  const feature = selectFeatureById(state, featureId);

  if (!feature) {
    throw new Error(`Feature with ID ${featureId} not found`);
  }

  const context = buildFeatureContext(feature, state.sow, options.customDesignTokens);

  return generateV0SpecFromFeature(context);
}

/**
 * Export a custom component UI spec
 */
export function exportCustomV0Spec(
  config: V0UISpecConfig,
  options: V0ExportOptions = DEFAULT_OPTIONS
): string {
  const fullConfig: V0UISpecConfig = {
    ...config,
    visualSpecs: options.includeVisualSpecs
      ? options.customVisualSpecs || config.visualSpecs || DEFAULT_VISUAL_SPECS
      : undefined,
    states: options.includeStates
      ? options.customStates || config.states || DEFAULT_COMPONENT_STATES
      : undefined,
    responsiveBehavior: options.includeResponsive
      ? options.customResponsive || config.responsiveBehavior || DEFAULT_RESPONSIVE_BEHAVIOR
      : undefined,
    accessibility: options.includeAccessibility
      ? options.customAccessibility || config.accessibility || DEFAULT_ACCESSIBILITY
      : undefined,
    designTokens: options.includeDesignTokens
      ? options.customDesignTokens || config.designTokens
      : undefined,
  };

  return generateV0UISpec(fullConfig);
}

/**
 * Export all features in an epic as v0 UI specs
 * @param epicId - The ID of the epic to export
 * @param state - The Redux state
 * @param options - Export options
 * @returns Generated v0 UI specifications for all features in the epic
 * @throws Error if epicId is empty, epic not found, or no features found
 */
export function exportEpicFeaturesAsV0Specs(
  epicId: string,
  state: RootState,
  options: V0ExportOptions = DEFAULT_OPTIONS
): string {
  validateId(epicId, 'Epic');

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

  if (features.length === 0) {
    throw new Error(`No features found for epic ${epicId}`);
  }

  // Build contexts for all features using helper function
  const contexts: V0FeatureContext[] = features.map((feature) =>
    buildFeatureContext(feature, sowState, options.customDesignTokens)
  );

  return generateBulkV0Specs(contexts);
}

/**
 * Export all features in the project as v0 UI specs
 * @param state - The Redux state
 * @param options - Export options
 * @returns Generated v0 UI specifications for all features
 * @throws Error if no features found in the project
 */
export function exportAllFeaturesAsV0Specs(
  state: RootState,
  options: V0ExportOptions = DEFAULT_OPTIONS
): string {
  const sowState = state.sow;

  const features = Object.values(sowState.features || {})
    .filter(Boolean) as FeatureType[];

  if (features.length === 0) {
    throw new Error('No features found in the project');
  }

  // Build contexts for all features using helper function
  const contexts: V0FeatureContext[] = features.map((feature) =>
    buildFeatureContext(feature, sowState, options.customDesignTokens)
  );

  return generateBulkV0Specs(contexts);
}

/**
 * Download v0 UI spec as markdown file
 */
export function downloadV0Spec(
  content: string,
  filename: string = 'v0-ui-spec.md'
): void {
  downloadFile(content, filename, 'text/markdown');
}

/**
 * Copy v0 UI spec to clipboard
 */
export async function copyV0SpecToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Get v0 export statistics
 * Optimized to use Map lookups for O(n) time complexity instead of O(n*m)
 * @param state - The Redux state
 * @returns Statistics about features, stories, and tasks
 */
export function getV0ExportStatistics(state: RootState): {
  totalFeatures: number;
  featuresWithStories: number;
  featuresWithTasks: number;
  totalUserStories: number;
  totalTasks: number;
} {
  const sowState = state.sow;

  const features = Object.values(sowState.features || {}).filter(Boolean) as FeatureType[];
  const userStories = Object.values(sowState.userStories || {}).filter(Boolean) as UserStoryType[];
  const tasks = Object.values(sowState.tasks || {}).filter(Boolean) as TaskType[];

  // Build lookup maps for O(1) access
  // Map: featureId -> Set of storyIds
  const featureToStoryIds = new Map<string, Set<string>>();
  for (const story of userStories) {
    const featureId = story.parentFeatureId;
    if (!featureToStoryIds.has(featureId)) {
      featureToStoryIds.set(featureId, new Set());
    }
    featureToStoryIds.get(featureId)!.add(story.id);
  }

  // Set of storyIds that have tasks
  const storiesWithTasks = new Set<string>();
  for (const task of tasks) {
    storiesWithTasks.add(task.parentUserStoryId);
  }

  // Calculate statistics
  let featuresWithStories = 0;
  let featuresWithTasks = 0;

  for (const feature of features) {
    const storyIds = featureToStoryIds.get(feature.id);
    if (storyIds && storyIds.size > 0) {
      featuresWithStories++;

      // Check if any story has tasks using Array.from for compatibility
      const storyIdArray = Array.from(storyIds);
      const hasTasksForFeature = storyIdArray.some((storyId) => storiesWithTasks.has(storyId));
      if (hasTasksForFeature) {
        featuresWithTasks++;
      }
    }
  }

  return {
    totalFeatures: features.length,
    featuresWithStories,
    featuresWithTasks,
    totalUserStories: userStories.length,
    totalTasks: tasks.length,
  };
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

/**
 * Generate a simple prompt for v0 from a feature
 * @param featureId - The ID of the feature
 * @param state - The Redux state
 * @returns A prompt string suitable for v0
 * @throws Error if featureId is empty or feature not found
 */
export function generateV0Prompt(
  featureId: string,
  state: RootState
): string {
  validateId(featureId, 'Feature');

  const feature = selectFeatureById(state, featureId);

  if (!feature) {
    throw new Error(`Feature with ID ${featureId} not found`);
  }

  const lines: string[] = [];

  lines.push(`Create a ${feature.title} component using React, TypeScript, and Tailwind CSS.`);
  lines.push('');

  if (feature.description) {
    lines.push(`Description: ${feature.description}`);
    lines.push('');
  }

  if (feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0) {
    lines.push('Requirements:');
    for (const criterion of feature.acceptanceCriteria) {
      if (criterion.text) {
        lines.push(`- ${criterion.text}`);
      }
    }
    lines.push('');
  }

  lines.push('Use shadcn/ui components where applicable.');
  lines.push('Make it responsive and accessible.');

  return lines.join('\n');
}

// Re-export types for convenience
export type {
  V0UISpecConfig,
  V0FeatureContext,
  VisualSpecifications,
  ComponentState,
  ResponsiveBehavior,
  Interaction,
  AccessibilityRequirements,
  DesignTokens,
};

export {
  DEFAULT_VISUAL_SPECS,
  DEFAULT_COMPONENT_STATES,
  DEFAULT_RESPONSIVE_BEHAVIOR,
  DEFAULT_ACCESSIBILITY,
};
