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

export {
  useWorkItemSearch,
  searchWorkItems,
  highlightMatch,
  DEFAULT_SEARCH_FILTERS,
} from './useWorkItemSearch';
export type {
  SearchableWorkItemType,
  SearchResultItem,
  SearchFilters,
  WorkItemIndex,
  UseWorkItemSearchOptions,
  UseWorkItemSearchReturn,
} from './useWorkItemSearch';

export {
  useMoveWorkItem,
  validateMove,
  getParentTypeLabel,
  getItemTypeLabel,
  PARENT_TYPE_MAP,
} from './useMoveWorkItem';
export type {
  MovableWorkItemType,
  ParentType,
  MoveableItem,
  PotentialParent,
  MoveResult,
  MoveWorkItemData,
  UseMoveWorkItemOptions,
  UseMoveWorkItemReturn,
} from './useMoveWorkItem';

export {
  useWorkItemTemplate,
  getTemplateTypeDisplayName,
  BUILT_IN_TEMPLATES,
} from './useWorkItemTemplate';
export type {
  TemplateWorkItemType,
  WorkItemTemplate,
  EpicTemplateContent,
  FeatureTemplateContent,
  UserStoryTemplateContent,
  TaskTemplateContent,
  TemplateContent,
  TemplateStore,
  UseWorkItemTemplateOptions,
  UseWorkItemTemplateReturn,
} from './useWorkItemTemplate';

export {
  useCostTracking,
  getProviderFromModel,
  MODEL_PRICING,
} from './useCostTracking';
export type {
  AIProvider,
  ModelPricing,
  UsageRecord,
  ProviderTokenUsage,
  ProviderUsage,
  ModelUsage,
  DailyUsage,
  MonthlyTrend,
  PeriodUsage,
  UsageData,
  UseCostTrackingOptions,
  UseCostTrackingReturn,
} from './useCostTracking';

export {
  useGenerationHistory,
  getWorkItemTypeDisplayName as getGenerationWorkItemTypeDisplayName,
} from './useGenerationHistory';
export type {
  GenerationWorkItemType,
  GenerationStatus,
  GenerationProvider,
  GenerationRecord,
  WorkItemHistory,
  GenerationHistoryStore,
  UseGenerationHistoryOptions,
  UseGenerationHistoryReturn,
  GenerationStatistics,
} from './useGenerationHistory';

export {
  useTokenUsage,
  formatTokenCount,
  getAlertColor,
  MODEL_TOKEN_LIMITS,
} from './useTokenUsage';
export type {
  TokenEstimationMethod,
  TokenAlertLevel,
  TokenAlert,
  TokenUsageRecord,
  TokenBudget,
  TokenUsageSummary,
  ModelTokenLimits,
  UseTokenUsageOptions,
  UseTokenUsageReturn,
} from './useTokenUsage';

export {
  useRegenerationFeedback,
  getFeedbackTypeDisplayName,
  getFeedbackTypePrompt,
  buildRegenerationPrompt,
  FEEDBACK_OPTIONS,
} from './useRegenerationFeedback';
export type {
  FeedbackType,
  FeedbackWorkItemType,
  SatisfactionRating,
  FeedbackRecord,
  FeedbackStatistics,
  FeedbackSuggestion,
  FeedbackStore,
  UseRegenerationFeedbackOptions,
  UseRegenerationFeedbackReturn,
} from './useRegenerationFeedback';

export {
  useBatchGeneration,
  getBatchItemStatusDisplayName,
  getBatchStatusDisplayName,
  createBatchItems,
} from './useBatchGeneration';
export type {
  BatchWorkItemType,
  BatchItemStatus,
  BatchStatus,
  BatchItem,
  BatchProgress,
  BatchStatistics,
  BatchGenerator,
  UseBatchGenerationOptions,
  UseBatchGenerationReturn,
} from './useBatchGeneration';

export {
  useCursorRulesImport,
  parseFrontmatter,
  extractTechStack,
  extractConventions,
  extractForbiddenPatterns,
  extractFileStructure,
  extractPatterns,
  formatTechStack,
  validateMDCContent,
} from './useCursorRulesImport';
export type {
  CursorRuleFrontmatter,
  ParsedTechStack,
  ParsedConvention,
  ParsedForbiddenPattern,
  ParsedFileStructure,
  ParsedPattern,
  ParsedCursorRule,
  CursorRulesImportResult,
  UseCursorRulesImportOptions,
  UseCursorRulesImportReturn,
} from './useCursorRulesImport';

export {
  useConventionsExport,
  formatFrontmatter as formatMDCFrontmatter,
  formatTechStack as formatExportTechStack,
  formatNamingConventions,
  formatCodePatterns,
  formatForbiddenPatterns as formatExportForbiddenPatterns,
  formatDirectoryStructure,
  generateCombinedMDC,
  generateSeparateFiles,
  sanitizeFilename,
} from './useConventionsExport';
export type {
  TechStackItem,
  NamingConvention,
  CodePattern,
  ForbiddenPattern,
  DirectoryEntry,
  ProjectContext,
  MDCFrontmatter,
  ExportOptions,
  GeneratedMDCFile,
  ExportResult,
  UseConventionsExportOptions,
  UseConventionsExportReturn,
} from './useConventionsExport';
