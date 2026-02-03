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

export { default as useCollaborationPresence } from './useCollaborationPresence';
export { default as useActivityLogger } from './useActivityLogger';

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

export {
  useV0ComponentBreakdown,
  formatContainerClasses,
  formatTypographyClasses,
  formatBreakdownAsMarkdown,
  getCommonStates,
  getCommonResponsive,
  getButtonPreset,
  getCardPreset,
  getInputPreset,
  getModalPreset,
} from './useV0ComponentBreakdown';
export type {
  VisualSpec,
  ContainerSpec,
  TypographySpec,
  StateSpec,
  ResponsiveSpec,
  InteractionSpec,
  AccessibilitySpec,
  AnimationSpec,
  PropSpec,
  ChildComponentSpec,
  ComponentBreakdown,
  BreakdownOptions,
  UseV0ComponentBreakdownOptions,
  UseV0ComponentBreakdownReturn,
} from './useV0ComponentBreakdown';

export {
  useDevinPlaybook,
  formatUserStory,
  formatAcceptanceCriteria,
  formatFileSpecs,
  formatVerificationCommands,
  formatTaskSpecAsMarkdown,
  generateBranchName,
  getComponentPlaybook as getDevinComponentPlaybook,
  getApiEndpointPlaybook,
  getFeaturePlaybook,
  getBugfixPlaybook,
  getRefactorPlaybook,
  getDefaultVerificationCommands,
} from './useDevinPlaybook';
export type {
  TaskScope,
  TaskLabel,
  DependencyStatus,
  TaskDependency,
  UserStory,
  AcceptanceCriterion,
  FileSpec,
  InterfaceSpec,
  PatternReference,
  TechnicalDetails,
  PlaybookReference,
  VerificationCommand,
  ResourceLink,
  TaskMetadata,
  DevinTaskSpec,
  PlaybookOptions,
  UseDevinPlaybookOptions,
  UseDevinPlaybookReturn,
} from './useDevinPlaybook';

export {
  useCSVExport,
  escapeCSVValue,
  getWorkItemTypeDisplayName as getCSVWorkItemTypeDisplayName,
  formatUserStoryDescription,
  getDefaultColumns as getCSVDefaultColumns,
  getMinimalColumns as getCSVMinimalColumns,
  getDetailedColumns as getCSVDetailedColumns,
  generateCSVContent,
} from './useCSVExport';
export type {
  ExportableWorkItemType,
  ExportableWorkItem,
  CSVColumn,
  CSVExportOptions,
  CSVExportResult,
  UseCSVExportOptions,
  UseCSVExportReturn,
} from './useCSVExport';

export {
  useMarkdownExport,
  getWorkItemTypeDisplayName as getMarkdownWorkItemTypeDisplayName,
  getWorkItemTypeEmoji,
  getHeadingPrefix,
  formatUserStoryDescription as formatMarkdownUserStoryDescription,
  getStyleDescription,
  getAvailableStyles,
  formatWorkItemAsMarkdown,
  buildItemTree,
  generateMarkdownContent,
} from './useMarkdownExport';
export type {
  ExportableWorkItemType as MarkdownExportableWorkItemType,
  ExportableWorkItem as MarkdownExportableWorkItem,
  MarkdownStyle,
  MarkdownExportOptions,
  MarkdownExportResult,
  UseMarkdownExportOptions,
  UseMarkdownExportReturn,
} from './useMarkdownExport';

export {
  useDragDropReorder,
  getValidParentTypes,
  canBeChildOf,
  getItemTypeDisplayName as getDraggableItemTypeDisplayName,
  isAncestorOf,
  getSiblings,
  getChildren,
  calculateNewOrder,
  getDropIndicatorPosition,
} from './useDragDropReorder';
export type {
  DraggableItemType,
  DraggableItem,
  DropPosition,
  DragState,
  ReorderResult,
  MoveValidation,
  UseDragDropReorderOptions,
  UseDragDropReorderReturn,
} from './useDragDropReorder';
