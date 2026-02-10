/**
 * Strapi API Response Types
 * Comprehensive type definitions for all Strapi data structures
 */

import type {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
  RiskMitigationType,
  ContextualQuestion,
} from '@/components/spec-tree/lib/types/work-items';

/**
 * Base Strapi document fields present on all content types
 */
export interface StrapiDocument {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

/**
 * Strapi relation reference (when not populated)
 */
export interface StrapiRelationRef {
  id: number;
  documentId: string;
}

/**
 * Acceptance criteria item structure
 */
export interface AcceptanceCriteriaItem {
  text: string;
}

/**
 * Contextual question from Strapi API (with documentId)
 * Note: This differs from ContextualQuestion in work-items.ts which uses id
 */
export interface StrapiContextualQuestion {
  documentId: string;
  question: string;
  answer?: string;
}

/**
 * Raw Task data from Strapi API
 */
export interface StrapiTask extends StrapiDocument {
  title: string;
  details: string;
  priority: number;
  notes: string;
  contextualQuestions?: StrapiContextualQuestion[];
  userStory?: StrapiRelationRef | StrapiUserStory;
}

/**
 * Raw User Story data from Strapi API
 */
export interface StrapiUserStory extends StrapiDocument {
  title: string;
  role: string;
  action: string;
  goal: string;
  points: string;
  acceptanceCriteria: AcceptanceCriteriaItem[];
  notes: string;
  developmentOrder: number;
  contextualQuestions?: StrapiContextualQuestion[];
  tasks?: StrapiTask[];
  feature?: StrapiRelationRef | StrapiFeature;
}

/**
 * Raw Feature data from Strapi API
 */
export interface StrapiFeature extends StrapiDocument {
  title: string;
  description: string;
  details: string;
  dependencies?: string;
  acceptanceCriteria: AcceptanceCriteriaItem[];
  notes: string;
  priority?: string;
  effort?: string;
  contextualQuestions?: StrapiContextualQuestion[];
  userStories?: StrapiUserStory[];
  epic?: StrapiRelationRef | StrapiEpic;
}

/**
 * Raw Epic data from Strapi API
 */
export interface StrapiEpic extends StrapiDocument {
  title: string;
  description: string;
  goal: string;
  successCriteria: string;
  dependencies: string;
  timeline: string;
  resources: string;
  risksAndMitigation: RiskMitigationType[];
  notes: string;
  contextualQuestions?: StrapiContextualQuestion[];
  features?: StrapiFeature[];
  app?: StrapiRelationRef | StrapiApp;
}

/**
 * Raw App data from Strapi API
 */
export interface StrapiApp extends StrapiDocument {
  name: string;
  globalInformation: string;
  applicationInformation: string;
  contextualQuestions?: StrapiContextualQuestion[];
  epics?: StrapiEpic[];
}

/**
 * Raw Comment data from Strapi API
 */
export interface StrapiComment extends StrapiDocument {
  body: string;
  status: 'open' | 'resolved';
  mentions?: string[];
  authorId: string;
  authorName: string;
  authorEmail?: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  parent?: StrapiRelationRef | StrapiComment;
  replies?: StrapiComment[];
  app?: StrapiRelationRef | StrapiApp;
  epic?: StrapiRelationRef | StrapiEpic;
  feature?: StrapiRelationRef | StrapiFeature;
  userStory?: StrapiRelationRef | StrapiUserStory;
  task?: StrapiRelationRef | StrapiTask;
}

/**
 * Raw Comment Notification data from Strapi API
 */
export interface StrapiCommentNotification extends StrapiDocument {
  channel: 'in_app' | 'email';
  status: 'unread' | 'read' | 'queued' | 'sent' | 'failed';
  sentAt?: string | null;
  comment?: StrapiRelationRef | StrapiComment;
  user?: StrapiRelationRef;
}

/**
 * Raw Version Snapshot data from Strapi API
 */
export interface StrapiVersionSnapshot extends StrapiDocument {
  name: string;
  description?: string | null;
  snapshot: unknown;
  createdById?: string | null;
  createdByName?: string | null;
  app?: StrapiRelationRef | StrapiApp;
}

/**
 * Full app data response (deeply populated)
 */
export interface StrapiAppDataResponse {
  epics: StrapiEpic[];
  contextualQuestions?: StrapiContextualQuestion[];
  globalInformation: string;
}

/**
 * Transformed SOW data ready for Redux store
 */
export interface TransformedSowData {
  id: string;
  epics: Record<string, EpicType>;
  features: Record<string, FeatureType>;
  userStories: Record<string, UserStoryType>;
  tasks: Record<string, TaskType>;
  contextualQuestions: ContextualQuestion[];
  globalInformation: string;
}

/**
 * Strapi API error response
 */
export interface StrapiApiError {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Strapi API success response wrapper
 */
export interface StrapiApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Create Epic request payload
 */
export interface CreateEpicPayload {
  title: string;
  description: string;
  goal: string;
  successCriteria: string;
  dependencies: string;
  timeline: string;
  resources: string;
  app: string;
  risksAndMitigation?: RiskMitigationType[];
}

/**
 * Create Feature request payload
 */
export interface CreateFeaturePayload {
  title: string;
  description: string;
  details: string;
  notes: string;
  acceptanceCriteria: AcceptanceCriteriaItem[];
  epic: string;
}

/**
 * Create User Story request payload
 */
export interface CreateUserStoryPayload {
  title: string;
  role: string;
  actionStr: string;
  goal: string;
  points: string;
  acceptanceCriteria: AcceptanceCriteriaItem[];
  feature: string;
  notes: string;
  developmentOrder: number;
}

/**
 * Create Task request payload
 */
export interface CreateTaskPayload {
  title: string;
  details: string;
  priority: number;
  notes: string;
  userStory: string;
}

/**
 * Created Epic response from Strapi
 */
export interface CreatedEpicResponse extends StrapiDocument {
  title: string;
  description: string;
  goal: string;
  successCriteria: string;
  dependencies: string;
  timeline: string;
  resources: string;
  risksAndMitigation: RiskMitigationType[];
  notes: string;
  app: StrapiRelationRef;
}

/**
 * Created Feature response from Strapi
 */
export interface CreatedFeatureResponse extends StrapiDocument {
  title: string;
  description: string;
  details: string;
  notes: string;
  acceptanceCriteria: AcceptanceCriteriaItem[];
  priority?: string;
  effort?: string;
  dependencies?: string;
  epic: StrapiRelationRef;
}

/**
 * Created User Story response from Strapi
 */
export interface CreatedUserStoryResponse extends StrapiDocument {
  title: string;
  role: string;
  action: string;
  goal: string;
  points: string;
  acceptanceCriteria: AcceptanceCriteriaItem[];
  notes: string;
  developmentOrder: number;
  contextualQuestions?: StrapiContextualQuestion[];
  feature: StrapiRelationRef;
}

/**
 * Created Task response from Strapi
 */
export interface CreatedTaskResponse extends StrapiDocument {
  title: string;
  details: string;
  priority: number;
  notes: string;
  contextualQuestions?: StrapiContextualQuestion[];
  userStory: StrapiRelationRef;
}

/**
 * Generic API error for async thunks
 */
export interface AsyncThunkError {
  message: string;
  status?: number;
  details?: unknown;
}

/**
 * Type guard to check if error is an AsyncThunkError
 */
export function isAsyncThunkError(error: unknown): error is AsyncThunkError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as AsyncThunkError).message === 'string'
  );
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (isAsyncThunkError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Type for axios-like error responses
 */
export interface AxiosLikeError {
  response?: {
    data?: {
      message?: string;
      error?: {
        message?: string;
      };
    };
    status?: number;
  };
  message?: string;
}

/**
 * Type guard for axios-like errors
 */
export function isAxiosLikeError(error: unknown): error is AxiosLikeError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'message' in error)
  );
}

/**
 * Extract message from axios-like error
 */
export function getAxiosErrorMessage(error: unknown): string {
  if (isAxiosLikeError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.message ||
      'Request failed'
    );
  }
  return getErrorMessage(error);
}
