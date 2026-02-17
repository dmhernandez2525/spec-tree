/**
 * Demo Mode Module
 *
 * This module provides a complete demo experience for SpecTree,
 * allowing visitors to explore the full functionality without authentication.
 */

// Demo Context and Provider
export { DemoProvider, useDemoContext, useIsDemo } from './demo-context';

// Demo Data
export {
  demoApps,
  ecommerceEpics,
  ecommerceFeatures,
  ecommerceUserStories,
  ecommerceTasks,
  getEcommerceDemoState,
  calculateDemoMetrics,
  DEMO_USERS,
  DEMO_ORGANIZATION,
  DEMO_WORKSPACE,
  DEMO_EPICS,
  DEMO_FEATURES,
  DEMO_USER_STORIES,
  DEMO_TASKS,
} from './demo-data';

// Demo Mode Utilities
export {
  isDemoMode,
  createDemoSession,
  getDemoStateForRole,
  DEMO_ROLES,
} from './demo-mode';
export type { DemoSession, DemoRole } from './demo-mode';
export type { DemoUser, DemoOrganization, DemoWorkspace } from './demo-data';
