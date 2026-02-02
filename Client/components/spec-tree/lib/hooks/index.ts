/**
 * Spec Tree Hooks
 *
 * Central export for all custom hooks.
 */

export {
  useCollapsibleTree,
  collectAllNodeIds,
  getNodeAncestors,
  default as useCollapsibleTreeDefault,
} from './useCollapsibleTree';
export type {
  TreeNodeType,
  TreeNodeId,
  CollapseState,
  UseCollapsibleTreeOptions,
  UseCollapsibleTreeReturn,
} from './useCollapsibleTree';

export { useStreamingCompletion, parseSSEChunk, simulateStream } from './useStreamingCompletion';
export type {
  StreamingStatus,
  StreamingOptions,
  StreamingState,
  StreamingActions,
  UseStreamingCompletionReturn,
} from './useStreamingCompletion';

export {
  useModelSelection,
  getRecommendedModelsForTask,
  getTaskTypeDescription,
  getTaskTypeDisplayName,
  DEFAULT_MODEL_PREFERENCES,
} from './useModelSelection';
export type {
  TaskType,
  ModelPreferences,
  UseModelSelectionReturn,
} from './useModelSelection';

export { useAcceptanceCriteria } from './use-acceptance-criteria';

export {
  useBreadcrumb,
  buildBreadcrumbPath,
  getAncestorIds,
} from './useBreadcrumb';
export type {
  WorkItemType,
  WorkItemInfo,
  BreadcrumbItem,
  WorkItemData,
  UseBreadcrumbOptions,
  UseBreadcrumbReturn,
} from './useBreadcrumb';

export {
  useKeyboardShortcuts,
  formatKey,
  getShortcutDisplayString,
  matchesShortcut,
  DEFAULT_SHORTCUTS,
} from './useKeyboardShortcuts';
export type {
  ModifierKey,
  KeyboardShortcut,
  ShortcutRegistration,
  UseKeyboardShortcutsOptions,
  UseKeyboardShortcutsReturn,
} from './useKeyboardShortcuts';
