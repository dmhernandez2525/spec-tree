/**
 * Demo Mode Utilities
 *
 * Provides environment-based demo mode detection, session creation,
 * and Redux-compatible preloaded state for the SpecTree demo experience.
 */

import {
  DEMO_USERS,
  DEMO_EPICS,
  DEMO_FEATURES,
  DEMO_USER_STORIES,
  DEMO_TASKS,
  type DemoUser,
} from './demo-data';
import type {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
  SowState,
} from '@/components/spec-tree/lib/types/work-items';

// ============================================================================
// Constants
// ============================================================================

export const DEMO_ROLES = ['admin', 'editor', 'viewer'] as const;
export type DemoRole = (typeof DEMO_ROLES)[number];

// ============================================================================
// Interfaces
// ============================================================================

export interface DemoSession {
  userId: string;
  role: string;
  user: DemoUser;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check whether demo mode is enabled via the NEXT_PUBLIC_DEMO_MODE
 * environment variable. Returns true only when the value is exactly 'true'.
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

/**
 * Create a demo session for the given role.
 * Looks up the matching user from DEMO_USERS and returns a DemoSession
 * containing the user ID, role, and full user object.
 *
 * Throws if the provided role does not match any demo user.
 */
export function createDemoSession(role: DemoRole): DemoSession {
  const user = DEMO_USERS.find((u) => u.role === role);
  if (!user) {
    throw new Error(`No demo user found for role: ${role}`);
  }

  return {
    userId: user.id,
    role: user.role,
    user,
  };
}

/**
 * Build a full Redux-compatible preloaded state for the sow slice,
 * populated with demo data. Epics, features, user stories, and tasks
 * are indexed by their IDs for direct lookup.
 */
export function getDemoStateForRole(_role: DemoRole): { sow: SowState } {
  // Build Record maps from the demo arrays
  const epics: Record<string, EpicType> = {};
  for (const epic of DEMO_EPICS) {
    epics[epic.id] = epic;
  }

  const features: Record<string, FeatureType> = {};
  for (const feature of DEMO_FEATURES) {
    features[feature.id] = feature;
  }

  const userStories: Record<string, UserStoryType> = {};
  for (const story of DEMO_USER_STORIES) {
    userStories[story.id] = story;
  }

  const tasks: Record<string, TaskType> = {};
  for (const task of DEMO_TASKS) {
    tasks[task.id] = task;
  }

  const sowState: SowState = {
    epics,
    features,
    userStories,
    tasks,
    contextualQuestions: [],
    globalInformation:
      'TaskFlow is a collaborative project management application for agile teams.',
    selectedModel: 'gpt-4',
    chatApi: 'demo',
    id: 'demo-app-taskflow',
    apps: {},
    isLoading: false,
    error: null,
  };

  return { sow: sowState };
}
