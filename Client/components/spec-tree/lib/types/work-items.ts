import { sowSlice } from '../../../../lib/store/sow-slice';
import { RootState } from '../../../../lib/store';

export interface App {
  id: string;
  name: string;
  globalInformation: string;
  documentId?: string;
  applactionInformation: string;
  createdAt: string;
}
export type WorkItemType = 'epics' | 'features' | 'userStories' | 'tasks';
export type ExtendedWorkItemType = WorkItemType | 'Global';
export type WorkItemTypeTypes =
  | EpicType
  | FeatureType
  | UserStoryType
  | TaskType;
export type ContextualQuestion = {
  id: string;
  question: string;
  answer?: string;
};

type BaseWorkItem = {
  id: string;
  contextualQuestions?: ContextualQuestion[];
  documentId?: string;
};

export interface TaskType extends BaseWorkItem {
  title: string;
  details: string;
  priority: number;
  notes: string;
  parentUserStoryId: string;
  dependentTaskIds: string[];
}

export interface ResTaskType extends TaskType {
  userStory: UserStoryType;
}

export interface UserStoryType extends BaseWorkItem {
  title: string;
  role: string;
  action: string;
  goal: string;
  points: string;
  acceptanceCriteria: [{ text: string }];
  notes: string;
  parentFeatureId: string;
  taskIds: string[];
  developmentOrder: number;
  dependentUserStoryIds?: string[];
  contextualQuestions?: ContextualQuestion[];
}

export interface ResUserStoryType extends UserStoryType {
  feature: FeatureType;
}

export interface FeatureType extends BaseWorkItem {
  title: string;
  description: string;
  details: string;
  dependencies?: string;
  acceptanceCriteria: [{ text: string }];
  parentEpicId: string;
  userStoryIds: string[];
  notes: string;
  priority: string;
  effort: string;
}
export interface ResFeatureType extends FeatureType {
  epic: EpicType;
}

export interface RiskMitigationType {
  resolve: [
    {
      text: string;
    }
  ];
  own: [
    {
      text: string;
    }
  ];
  accept: [
    {
      text: string;
    }
  ];
  mitigate: [
    {
      text: string;
    }
  ];
}
export interface EpicType extends BaseWorkItem {
  title: string;
  description: string;
  goal: string;
  successCriteria: string;
  dependencies: string;
  timeline: string;
  resources: string;
  risksAndMitigation: RiskMitigationType[];
  featureIds: string[];
  parentAppId: string;
  notes: string;
}

export interface ResEpicType extends EpicType {
  app: App;
}

export interface Sow {
  epics: Record<string, EpicType>;
  features: Record<string, FeatureType>;
  userStories: Record<string, UserStoryType>;
  tasks: Record<string, TaskType>;
  contextualQuestions?: ContextualQuestion[];
  globalInformation: string;
  id: string;
  chatApi: string;
  apps: Record<string, App>;
  selectedModel: string;
}
export interface SowState extends Sow {
  isLoading?: boolean;
  error?: string | null;
}

export type SowExampleState = {
  epics: EpicType[];
  features: FeatureType[];
  userStories: UserStoryType[];
  tasks: TaskType[];
  contextualQuestions?: ContextualQuestion[];
  globalInformation: string;
};

export interface UserStoryRequest {
  feature: FeatureType;
  state: RootState;
  context?: string;
}
export interface FeatureRequest {
  epic: EpicType;
  state: RootState;
  context?: string;
}

export interface FeatureResponse {
  epicId: string;
  features: GeneratedFeature[];
}
export interface EpicRequest {
  state: RootState;
}

export interface EpicResponse {
  epics: GeneratedEpic[];
}

export interface UserStoryResponse {
  featureId: string;
  userStories: GeneratedUserStory[];
}

export interface GeneratedEpic {
  id: string;
  title: string;
  description: string;
  goal: string;
  successCriteria: string;
  dependencies: string;
  timeline: string;
  resources: string;
  risksAndMitigation: RiskMitigationType[];
  notes: string;
  appId: string;
}

export interface GeneratedFeature {
  id: string;
  acceptanceCriteria: [{ text: string }];
  dependencies: string;
  description: string;
  details: string;
  notes: string;
  title: string;
  priority: string;
  effort: string;
  parentEpicId: string;
}

export interface GeneratedUserStory {
  id: string;
  title: string;
  role: string;
  action: string;
  goal: string;
  points: string;
  acceptanceCriteria: [{ text: string }];
  notes: string;
  developmentOrder: number;
  parentFeatureId: string;
}

export interface GeneratedTask {
  id: string;
  title: string;
  details: string;
  priority: number;
  notes: string;
  parentUserStoryId: string;
}

export interface TaskRequest {
  userStory: UserStoryType;
  state: RootState;
  context?: string;
}

export interface TaskResponse {
  tasks: GeneratedTask[];
  userStoryId: string;
}

export type AddTaskPayload = {
  epicName: string;
  featureName: string;
  userStoryName: string;
  task: TaskType;
};

export interface DeleteEpic {
  epicCapability: string;
}

export interface DeleteFeature {
  epicName: string;
  featureName: string;
}

export interface DeleteUserStory {
  epicName: string;
  featureName: string;
  userStoryName: string;
}

export enum UserStoryFields {
  Title = 'title',
  Role = 'role',
  Action = 'action',
  Points = 'points',
  AcceptanceCriteria = 'acceptanceCriteria',
  Notes = 'notes',
  Goal = 'goal',
  DevelopmentOrder = 'developmentOrder',
  DependentUserStoryIds = 'dependentUserStoryIds',
}

export interface UpdateUserStoryField {
  epicName: string;
  featureName: string;
  userStoryName: string;
  field: UserStoryFields;
  newValue: string;
  index?: number;
}

export enum FeatureFields {
  Title = 'title',
  Description = 'description',
  Details = 'details',
  AcceptanceCriteria = 'acceptanceCriteria',
  Notes = 'notes',
}

export interface UpdateFeatureField {
  epicName: string;
  featureName: string;
  field: FeatureFields;
  newValue: string;
  index?: number;
}

export interface AddAC {
  epicName: string;
  featureName: string;
  field: FeatureFields;
}

export enum EpicFields {
  Title = 'title',
  Description = 'description',
  Goal = 'goal',
  SuccessCriteria = 'successCriteria',
  Dependencies = 'dependencies',
  Timeline = 'timeline',
  Resources = 'resources',
  Notes = 'notes',
}

export interface UpdateEpicField {
  epicName: string;
  field: EpicFields;
  newValue: string;
}

export interface DeleteTask {
  epicName: string;
  featureName: string;
  userStoryName: string;
  taskName: string;
}

export enum TaskFields {
  Title = 'title',
  Details = 'details',
  Priority = 'priority',
  Notes = 'notes',
}

export interface UpdateTaskField {
  epicName: string;
  featureName: string;
  userStoryName: string;
  taskName: string;
  field: TaskFields;
  newValue: string;
}

export interface ErrorResponse {
  errorMessage: string;
}

export interface DeleteTaskPayload {
  epicName: string;
  featureName: string;
  userStoryName: string;
  taskName: string;
}

export interface UpdateTaskFieldPayload {
  taskId: string;
  field: TaskFields;
  newValue: string;
}

export interface AddFeaturePayload {
  description: string;
  title: string;
  epicName: string;
  notes: string;
  acceptanceCriteria: [{ text: string }];
  details: string;
}

export interface AddEpicsPayload {
  title: string;
  description: string;
  goal: string;
  successCriteria: string;
  dependencies: string;
  timeline: string;
  resources: string;
  notes: string;
}

export interface AddUserStoryPayload {
  epicName: string;
  featureName: string;
  title: string;
  goal: string;
  developmentOrder: number;
  description: string;
  role: string;
  actionStr: string;
  acceptanceCriteria: [{ text: string }];
  notes: string;
  points: string;
}

export interface DeleteEpicPayload {
  epicCapability: string;
}

export interface DeleteFeaturePayload {
  epicName: string;
  featureName: string;
}

export interface DeleteUserStoryPayload {
  epicName: string;
  featureName: string;
  userStoryName: string;
}

export interface UpdateUserStoryFieldPayload {
  userStoryId: string;
  field: UserStoryFields;
  newValue: string | string[];
  arrayIndex?: number;
  isArrayItem?: boolean;
}

export interface UpdateFeatureFieldPayload {
  featureId: string;
  field: FeatureFields;
  newValue: string | string[];
  arrayIndex?: number;
  isArrayItem?: boolean;
}

export interface AddACPayload {
  epicName: string;
  featureName: string;
  field: FeatureFields;
}

export interface UpdateEpicFieldPayload {
  epicName: string;
  field: EpicFields;
  newValue: string;
}

// Redux Action Type Definitions
export type SetSowPayload = EpicType[];

export interface SetSowAction {
  type: typeof sowSlice.actions.setSow.type;
  payload: SetSowPayload;
}

export interface AddTaskAction {
  type: typeof sowSlice.actions.addTask.type;
  payload: AddTaskPayload;
}

export interface DeleteTaskAction {
  type: typeof sowSlice.actions.deleteTask.type;
  payload: DeleteTaskPayload;
}

export interface AddFeatureAction {
  type: typeof sowSlice.actions.addFeature.type;
  payload: AddFeaturePayload;
}

export interface AddEpicsAction {
  type: typeof sowSlice.actions.addEpics.type;
  payload: AddEpicsPayload;
}

export interface AddUserStoryAction {
  type: typeof sowSlice.actions.addUserStory.type;
  payload: AddUserStoryPayload;
}

export interface DeleteEpicAction {
  type: typeof sowSlice.actions.deleteEpic.type;
  payload: DeleteEpicPayload;
}

export interface DeleteFeatureAction {
  type: typeof sowSlice.actions.deleteFeature.type;
  payload: DeleteFeaturePayload;
}

export interface DeleteUserStoryAction {
  type: typeof sowSlice.actions.deleteUserStory.type;
  payload: DeleteUserStoryPayload;
}
