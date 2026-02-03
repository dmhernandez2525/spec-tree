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
} from './demo-data';
