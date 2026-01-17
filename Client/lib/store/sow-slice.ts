import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  Slice,
} from '@reduxjs/toolkit';
import {
  generateAdditionalFeatures,
  generateAdditionalEpics,
  generateUserStories,
  generateTasks,
} from '../../components/spec-tree/lib/api/openai';
import { strapiService } from '../../components/spec-tree/lib/api/strapi-service';
import {
  UserStoryType,
  FeatureType,
  EpicType,
  ContextualQuestion,
  UserStoryRequest,
  UserStoryResponse,
  FeatureResponse,
  FeatureRequest,
  EpicResponse,
  EpicRequest,
  GeneratedEpic,
  GeneratedFeature,
  GeneratedUserStory,
  GeneratedTask,
  TaskRequest,
  TaskResponse,
  SowState,
  UpdateTaskFieldPayload,
  UpdateUserStoryFieldPayload,
  UpdateFeatureFieldPayload,
  AddACPayload,
  UpdateEpicFieldPayload,
  TaskType,
  UserStoryFields,
  TaskFields,
  WorkItemType,
} from '../../components/spec-tree/lib/types/work-items';
import { RootState } from './index';
import { transformStrapiDataToSow } from '../utils/strapi-transformers';
import { getAxiosErrorMessage } from '../../types/strapi';

import generateId from '../../components/spec-tree/lib/utils/generate-id';

/**
 * Payload type for setSow action
 */
interface SetSowPayload {
  sow?: Partial<SowState>;
}

const initialState: SowState = {
  epics: {},
  features: {},
  userStories: {},
  tasks: {},
  contextualQuestions: [],
  globalInformation: '',
  selectedModel: 'gpt-3.5-turbo-16k',
  chatApi: 'StartState',
  id: '',
  apps: {},
  isLoading: false,
  error: null,
};

// Strapi data fetching thunk with proper type transformations
export const fetchStrapiData = createAsyncThunk(
  'sow/fetchStrapiData',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const data = await strapiService.fetchAllAppData(documentId);
      const transformedData = transformStrapiDataToSow(documentId, data);
      return { sow: transformedData };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch data'
      );
    }
  }
);

export const requestAdditionalEpics = createAsyncThunk<
  EpicResponse,
  EpicRequest,
  {}
>('sow/requestAdditionalEpics', async ({ state }, { rejectWithValue }) => {
  const appId = state?.sow?.id;
  try {
    const response = await generateAdditionalEpics({
      chatApi: state?.sow?.chatApi,

      state,
      selectedModel: state.sow.selectedModel,
    });

    const parseGpt3: GeneratedEpic[] = response.data.choices[0].message.content
      .split('####')
      .map((value: string) => {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      })
      .filter((item): item is GeneratedEpic => item !== null);

    const newData: GeneratedEpic[] = await Promise.all(
      parseGpt3.map(async (epic: GeneratedEpic) => {
        // Use Strapi service instead of direct API call
        const res = await strapiService.createEpic({
          title: epic.title,
          description: epic.description,
          goal: epic.goal,
          successCriteria: epic.successCriteria,
          dependencies: epic.dependencies,
          timeline: epic.timeline,
          resources: epic.resources,
          app: appId,
          risksAndMitigation: epic.risksAndMitigation,
        });
        return {
          appId: res.app.documentId,
          id: res.documentId,
          title: res.title,
          description: res.description,
          goal: res.goal,
          successCriteria: res.successCriteria,
          dependencies: res.dependencies,
          timeline: res.timeline,
          resources: res.resources,
          risksAndMitigation: res.risksAndMitigation,
          notes: res.notes,
        };
      })
    );

    return { epics: newData };
  } catch (error) {
    return rejectWithValue({ message: getAxiosErrorMessage(error) });
  }
});
export const requestAdditionalFeatures = createAsyncThunk<
  FeatureResponse,
  FeatureRequest,
  {}
>(
  'sow/requestAdditionalFeatures',
  async ({ epic, state, context }, { rejectWithValue }) => {
    try {
      const response = await generateAdditionalFeatures({
        chatApi: state?.sow?.chatApi,
        epic,
        state,
        context,
        selectedModel: state.sow.selectedModel,
      });

      const parseGpt3: GeneratedFeature[] =
        response.data.choices[0].message.content
          .split('####')
          .map((value: string) => {
            try {
              return JSON.parse(value);
            } catch {
              return null;
            }
          })
          .filter((item): item is GeneratedFeature => item !== null);

      const newFeatures: GeneratedFeature[] = await Promise.all(
        parseGpt3.map(async (feature: GeneratedFeature) => {
          // Use Strapi service for creation
          const res = await strapiService.createFeature({
            title: feature.title,
            description: feature.description,
            details: feature.details,
            notes: feature.notes,
            acceptanceCriteria: feature.acceptanceCriteria,
            epic: epic.documentId,
          });
          return {
            id: res.documentId || '',
            title: res.title || '',
            description: res.description || '',
            acceptanceCriteria: res.acceptanceCriteria || [],
            priority: String(res.priority || ''),
            effort: String(res.effort || ''),
            dependencies: res.dependencies || '',
            parentEpicId: res.epic.documentId,
            details: res.details || '',
            notes: res.notes || '',
          };
        })
      );

      return { features: newFeatures, epicId: epic.id };
    } catch (error) {
      return rejectWithValue({ message: getAxiosErrorMessage(error) });
    }
  }
);
export const requestUserStories = createAsyncThunk<
  UserStoryResponse,
  UserStoryRequest,
  {}
>(
  'sow/requestUserStories',
  async ({ feature, state, context }, { rejectWithValue }) => {
    try {
      const response = await generateUserStories({
        chatApi: state?.sow?.chatApi,
        feature,
        state,
        context,
        selectedModel: state.sow.selectedModel,
      });

      const parseGpt3: GeneratedUserStory[] =
        response.data.choices[0].message.content
          .split('####')
          .map((value: string) => {
            try {
              return JSON.parse(value);
            } catch {
              return null;
            }
          })
          .filter((item): item is GeneratedUserStory => item !== null);

      // Use Strapi service to create user stories
      const userStoriesRaw = await Promise.all(
        parseGpt3.map(async (story): Promise<GeneratedUserStory | null> => {
          try {
            const res = await strapiService.createUserStory({
              title: story.title,
              role: story.role,
              actionStr: story.action,
              goal: story.goal,
              points: story.points,
              acceptanceCriteria: story.acceptanceCriteria,
              feature: feature.documentId,
              notes: story.notes,
              developmentOrder: 0,
            });

            return {
              id: res.documentId,
              title: res.title || '',
              role: res.role || '',
              action: res.action || '',
              goal: res.goal || '',
              points: String(res.points || ''),
              acceptanceCriteria: res.acceptanceCriteria || [],
              notes: res.notes || '',
              parentFeatureId: res.feature.documentId,
              developmentOrder: res.developmentOrder || 0,
            };
          } catch {
            return null;
          }
        })
      );

      const userStories = userStoriesRaw.filter(
        (story): story is GeneratedUserStory => story !== null
      );

      return { userStories, featureId: feature.id };
    } catch (error) {
      return rejectWithValue({ message: getAxiosErrorMessage(error) });
    }
  }
);
export const requestTasks = createAsyncThunk<TaskResponse, TaskRequest, {}>(
  'sow/requestTasks',
  async ({ userStory, state, context }, { rejectWithValue }) => {
    try {
      const response = await generateTasks({
        chatApi: state?.sow?.chatApi,
        userStory,
        state,
        selectedModel: state.sow.selectedModel,
        context,
      });

      const parseGpt3: GeneratedTask[] =
        response.data.choices[0].message.content
          .split('####')
          .map((value: string) => {
            try {
              return JSON.parse(value);
            } catch {
              return null;
            }
          })
          .filter((item): item is GeneratedTask => item !== null);
      // Use Strapi service to create tasks
      const tasks = await Promise.all(
        parseGpt3.map(async (task) => {
          try {
            const res = await strapiService.createTask({
              title: task.title,
              details: task.details,
              priority: task.priority,
              notes: task.notes,
              userStory: userStory.documentId,
            });

            return {
              id: res.documentId,
              title: res.title || '',
              details: res.details || '',
              priority: res.priority || 0,
              notes: res.notes || '',
              parentUserStoryId: res.userStory.documentId,
              contextualQuestions: res.contextualQuestions || [],
            };
          } catch {
            return null;
          }
        })
      );

      return {
        userStoryId: userStory.id,
        tasks: tasks,
      };
    } catch (error) {
      return rejectWithValue({ message: getAxiosErrorMessage(error) });
    }
  }
);
export const sowSlice: Slice<SowState> = createSlice({
  name: 'sow',
  initialState,
  reducers: {
    updateSelectedModel: (state, action: PayloadAction<string>) => {
      state.selectedModel = action.payload;
    },
    setSow: (state, action: PayloadAction<SetSowPayload>) => {
      if (!action?.payload?.sow) {
        return;
      }
      const {
        chatApi,
        epics,
        features,
        userStories,
        tasks,
        contextualQuestions,
        globalInformation,
        id,
      } = action.payload.sow;

      if (chatApi) {
        state.chatApi = chatApi;
      }
      if (id) {
        state.id = id;
      }
      if (epics) {
        state.epics = epics;
      }
      if (features) {
        state.features = features;
      }
      if (userStories) {
        state.userStories = userStories;
      }
      if (tasks) {
        state.tasks = tasks;
      }
      if (contextualQuestions) {
        state.contextualQuestions = contextualQuestions;
      }
      if (globalInformation) {
        state.globalInformation = globalInformation;
      }
    },
    addEpics: (state, action: PayloadAction<EpicType>) => {
      const epic = action.payload;
      if (!epic || !epic.id) {
        console.warn('Attempted to add invalid epic:', epic);
        return;
      }

      // Create a new epics object
      const newEpics = {
        ...state.epics,
        [epic.id]: { ...epic },
      };

      // Replace the entire epics state
      state.epics = newEpics;
    },
    addFeature: (state, action: PayloadAction<FeatureType>) => {
      const feature = action.payload;
      // Create new features object
      state.features = {
        ...state.features,
        [feature.id]: feature,
      };

      // Create new epics object with updated epic
      const epic = state.epics[feature.parentEpicId];
      state.epics = {
        ...state.epics,
        [feature.parentEpicId]: {
          ...epic,
          featureIds: [...epic.featureIds, feature.id],
        },
      };
    },
    addUserStory: (state, action: PayloadAction<UserStoryType>) => {
      const userStory = action.payload;
      // Create new userStories object
      state.userStories = {
        ...state.userStories,
        [userStory.id]: userStory,
      };

      // Create new features object with updated feature
      const feature = state.features[userStory.parentFeatureId];
      state.features = {
        ...state.features,
        [userStory.parentFeatureId]: {
          ...feature,
          userStoryIds: [...feature.userStoryIds, userStory.id],
        },
      };
    },

    addTask: (state, action: PayloadAction<TaskType>) => {
      const task = action.payload;
      // Create new tasks object
      state.tasks = {
        ...state.tasks,
        [task.id]: task,
      };

      // Create new userStories object with updated userStory
      const userStory = state.userStories[task.parentUserStoryId];
      state.userStories = {
        ...state.userStories,
        [task.parentUserStoryId]: {
          ...userStory,
          taskIds: [...userStory.taskIds, task.id],
        },
      };
    },
    deleteEpic: (state, action: PayloadAction<string>) => {
      const epicId = action.payload;
      delete state.epics[epicId];
    },
    deleteFeature: (state, action: PayloadAction<string>) => {
      const featureId = action.payload;
      const feature = state.features[featureId];
      delete state.features[featureId];
      const epic = state.epics[feature.parentEpicId];
      epic.featureIds = epic.featureIds.filter((id) => id !== featureId);
    },
    deleteUserStory: (state, action: PayloadAction<string>) => {
      const userStoryId = action.payload;
      const userStory = state.userStories[userStoryId];
      delete state.userStories[userStoryId];

      const feature = state.features[userStory.parentFeatureId];
      feature.userStoryIds = feature.userStoryIds.filter(
        (id) => id !== userStoryId
      );
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      const taskId = action.payload;
      const task = state.tasks[taskId];
      delete state.tasks[taskId];
      const userStory = state.userStories[task.parentUserStoryId];
      userStory.taskIds = userStory.taskIds.filter((id) => id !== taskId);
    },
    addAC: (state, action: PayloadAction<AddACPayload>) => {
      const { epicName, featureName, field } = action.payload;
      const workItem = state[field][featureName];
      if (workItem) {
        workItem.acceptanceCriteria.push(epicName);
      }
    },
    updateTaskField: (state, action: PayloadAction<UpdateTaskFieldPayload>) => {
      const { taskId, field, newValue } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        switch (field) {
          case TaskFields.Title:
            task.title = newValue;
            break;
          case TaskFields.Details:
            task.details = newValue;
            break;
          case TaskFields.Priority:
            task.priority = parseInt(newValue, 10) || 0;
            break;
          case TaskFields.Notes:
            task.notes = newValue;
            break;
        }
      }
    },
    updateUserStoryField: (
      state,
      action: PayloadAction<UpdateUserStoryFieldPayload>
    ) => {
      const { userStoryId, field, newValue, arrayIndex, isArrayItem } =
        action.payload;
      const userStory = state.userStories[userStoryId];
      if (userStory) {
        if (field === UserStoryFields.AcceptanceCriteria) {
          if (typeof arrayIndex === 'number') {
            userStory.acceptanceCriteria[arrayIndex] = {
              text: newValue as string,
            };
          } else if (isArrayItem) {
            userStory.acceptanceCriteria.push({ text: newValue as string });
          } else {
            // For deletion or full replacement - convert string[] to Array<{ text: string }>
            if (Array.isArray(newValue)) {
              userStory.acceptanceCriteria = newValue.map((text) => ({ text }));
            }
          }
        } else {
          if (Array.isArray(newValue)) {
            userStory.acceptanceCriteria = newValue.map((text) => ({ text }));
          }
        }
      }
    },
    updateFeatureField: (
      state,
      action: PayloadAction<UpdateFeatureFieldPayload>
    ) => {
      const { featureId, field, newValue, arrayIndex, isArrayItem } =
        action.payload;
      const feature = state.features[featureId];
      if (feature) {
        if (field === 'acceptanceCriteria') {
          if (typeof arrayIndex === 'number') {
            // Update an existing item in the acceptanceCriteria array
            feature.acceptanceCriteria[arrayIndex] = {
              text: newValue as string,
            };
          } else if (isArrayItem) {
            // Add a new item to the end of the acceptanceCriteria array
            feature.acceptanceCriteria.push({ text: newValue as string });
          } else {
            // For deletion or full replacement - convert string[] to Array<{ text: string }>
            if (Array.isArray(newValue)) {
              feature.acceptanceCriteria = newValue.map((text) => ({ text }));
            }
          }
        } else {
          // Handle other fields
          feature[field] = newValue as string;
        }
      }
    },
    updateEpicField: (state, action: PayloadAction<UpdateEpicFieldPayload>) => {
      const { epicName, field, newValue } = action.payload;
      const epic = state.epics[epicName];
      if (epic) {
        epic[field] = newValue;
      }
    },
    replaceEpic: (state, action: PayloadAction<{ epic: EpicType }>) => {
      const { epic } = action.payload;
      state.epics[epic.id] = epic;
    },
    replaceFeature: (
      state,
      action: PayloadAction<{ feature: FeatureType }>
    ) => {
      const { feature } = action.payload;
      state.features[feature.id] = feature;
    },
    replaceUserStory: (
      state,
      action: PayloadAction<{ userStory: UserStoryType }>
    ) => {
      const { userStory } = action.payload;
      state.userStories[userStory.id] = userStory;
    },
    replaceTask: (state, action: PayloadAction<{ task: TaskType }>) => {
      const { task } = action.payload;
      state.tasks[task.id] = task;
    },
    addContextualQuestionsToWorkItem: (
      state,
      action: PayloadAction<{
        workItemId: string;
        questions: ContextualQuestion[];
        workItemType: string;
      }>
    ) => {
      const { workItemId, questions, workItemType } = action.payload;
      const workItem = state?.[workItemType as WorkItemType]?.[workItemId];
      if (workItem) {
        workItem.contextualQuestions = workItem?.contextualQuestions || [];
        workItem.contextualQuestions =
          workItem?.contextualQuestions?.concat(questions);
      }
    },
    addContextualQuestionToWorkItem: (
      state,
      action: PayloadAction<{
        workItemId: string;
        question: ContextualQuestion;
        workItemType: string;
      }>
    ) => {
      const { workItemId, question, workItemType } = action.payload;
      const workItem = state[workItemType as WorkItemType][workItemId];
      if (workItem) {
        workItem.contextualQuestions = workItem.contextualQuestions || [];
        workItem.contextualQuestions.push(question);
      }
    },
    removeContextualQuestionFromWorkItem: (
      state,
      action: PayloadAction<{
        workItemId: string;
        questionId: string;
        workItemType: string;
      }>
    ) => {
      const { workItemId, questionId, workItemType } = action.payload;
      const workItem = state[workItemType as WorkItemType][workItemId];
      if (workItem && workItem.contextualQuestions) {
        workItem.contextualQuestions = workItem.contextualQuestions.filter(
          (q) => q.id !== questionId
        );
      }
    },
    replaceContextualQuestionFromWorkItem: (
      state,
      action: PayloadAction<{
        workItemId: string;
        questionId: string;
        workItemType: string;
        value: string;
        index: number;
      }>
    ) => {
      const { workItemId, workItemType, value, index } = action.payload;

      const oldState =
        state[workItemType as WorkItemType][workItemId].contextualQuestions;
      if (oldState && oldState[index]) {
        oldState[index].answer = value;
      }
      state[workItemType as WorkItemType][workItemId].contextualQuestions =
        oldState;
    },
    addGlobalContextualQuestion: (
      state,
      action: PayloadAction<ContextualQuestion>
    ) => {
      state.contextualQuestions = state.contextualQuestions || [];
      state.contextualQuestions.push(action.payload);
    },
    addGlobalContextualQuestions: (
      state,
      action: PayloadAction<ContextualQuestion[]>
    ) => {
      state.contextualQuestions = state.contextualQuestions || [];
      state.contextualQuestions = state.contextualQuestions.concat(
        action.payload
      );
    },
    removeGlobalContextualQuestion: (state, action: PayloadAction<string>) => {
      state.contextualQuestions = state.contextualQuestions || [];
      state.contextualQuestions = state.contextualQuestions.filter(
        (q: ContextualQuestion) => {
          return q.id !== action.payload;
        }
      );
    },
    replaceGlobalContextualQuestions: (
      state,
      action: PayloadAction<{
        value: string;
        index: number;
      }>
    ) => {
      const { value, index } = action?.payload;
      const oldState = state?.contextualQuestions;
      if (oldState && oldState[index]) {
        oldState[index].answer = value;
      }
      state.contextualQuestions = oldState;
    },
    updateGlobalInformation: (state, action: PayloadAction<string>) => {
      state.globalInformation = action.payload;
    },
    // Batch add actions for import functionality
    addFeatures: (state, action: PayloadAction<FeatureType>) => {
      const feature = action.payload;
      state.features = {
        ...state.features,
        [feature.id]: feature,
      };
      // Add to parent epic's featureIds if not already there
      if (feature.parentEpicId && state.epics[feature.parentEpicId]) {
        const epic = state.epics[feature.parentEpicId];
        if (!epic.featureIds.includes(feature.id)) {
          epic.featureIds = [...epic.featureIds, feature.id];
        }
      }
    },
    addUserStories: (state, action: PayloadAction<UserStoryType>) => {
      const userStory = action.payload;
      state.userStories = {
        ...state.userStories,
        [userStory.id]: userStory,
      };
      // Add to parent feature's userStoryIds if not already there
      if (userStory.parentFeatureId && state.features[userStory.parentFeatureId]) {
        const feature = state.features[userStory.parentFeatureId];
        if (!feature.userStoryIds.includes(userStory.id)) {
          feature.userStoryIds = [...feature.userStoryIds, userStory.id];
        }
      }
    },
    addTasks: (state, action: PayloadAction<TaskType>) => {
      const task = action.payload;
      state.tasks = {
        ...state.tasks,
        [task.id]: task,
      };
      // Add to parent user story's taskIds if not already there
      if (task.parentUserStoryId && state.userStories[task.parentUserStoryId]) {
        const userStory = state.userStories[task.parentUserStoryId];
        if (!userStory.taskIds.includes(task.id)) {
          userStory.taskIds = [...userStory.taskIds, task.id];
        }
      }
    },
    // Reordering actions for drag-and-drop
    reorderEpics: (
      state,
      action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>
    ) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const epicIds = Object.keys(state.epics);
      const [removed] = epicIds.splice(sourceIndex, 1);
      epicIds.splice(destinationIndex, 0, removed);

      // Rebuild epics object in new order
      const newEpics: typeof state.epics = {};
      epicIds.forEach((id) => {
        newEpics[id] = state.epics[id];
      });
      state.epics = newEpics;
    },
    reorderFeatures: (
      state,
      action: PayloadAction<{
        epicId: string;
        sourceIndex: number;
        destinationIndex: number;
      }>
    ) => {
      const { epicId, sourceIndex, destinationIndex } = action.payload;
      const epic = state.epics[epicId];
      if (!epic) return;

      const featureIds = [...epic.featureIds];
      const [removed] = featureIds.splice(sourceIndex, 1);
      featureIds.splice(destinationIndex, 0, removed);
      epic.featureIds = featureIds;
    },
    reorderUserStories: (
      state,
      action: PayloadAction<{
        featureId: string;
        sourceIndex: number;
        destinationIndex: number;
      }>
    ) => {
      const { featureId, sourceIndex, destinationIndex } = action.payload;
      const feature = state.features[featureId];
      if (!feature) return;

      const userStoryIds = [...feature.userStoryIds];
      const [removed] = userStoryIds.splice(sourceIndex, 1);
      userStoryIds.splice(destinationIndex, 0, removed);
      feature.userStoryIds = userStoryIds;
    },
    reorderTasks: (
      state,
      action: PayloadAction<{
        userStoryId: string;
        sourceIndex: number;
        destinationIndex: number;
      }>
    ) => {
      const { userStoryId, sourceIndex, destinationIndex } = action.payload;
      const userStory = state.userStories[userStoryId];
      if (!userStory) return;

      const taskIds = [...userStory.taskIds];
      const [removed] = taskIds.splice(sourceIndex, 1);
      taskIds.splice(destinationIndex, 0, removed);
      userStory.taskIds = taskIds;
    },
    moveFeatureToEpic: (
      state,
      action: PayloadAction<{
        featureId: string;
        sourceEpicId: string;
        destinationEpicId: string;
        destinationIndex: number;
      }>
    ) => {
      const { featureId, sourceEpicId, destinationEpicId, destinationIndex } =
        action.payload;

      // Remove from source epic
      const sourceEpic = state.epics[sourceEpicId];
      if (sourceEpic) {
        sourceEpic.featureIds = sourceEpic.featureIds.filter(
          (id) => id !== featureId
        );
      }

      // Add to destination epic
      const destEpic = state.epics[destinationEpicId];
      if (destEpic) {
        const newFeatureIds = [...destEpic.featureIds];
        newFeatureIds.splice(destinationIndex, 0, featureId);
        destEpic.featureIds = newFeatureIds;
      }

      // Update feature's parent
      const feature = state.features[featureId];
      if (feature) {
        feature.parentEpicId = destinationEpicId;
      }
    },
    moveUserStoryToFeature: (
      state,
      action: PayloadAction<{
        userStoryId: string;
        sourceFeatureId: string;
        destinationFeatureId: string;
        destinationIndex: number;
      }>
    ) => {
      const {
        userStoryId,
        sourceFeatureId,
        destinationFeatureId,
        destinationIndex,
      } = action.payload;

      // Remove from source feature
      const sourceFeature = state.features[sourceFeatureId];
      if (sourceFeature) {
        sourceFeature.userStoryIds = sourceFeature.userStoryIds.filter(
          (id) => id !== userStoryId
        );
      }

      // Add to destination feature
      const destFeature = state.features[destinationFeatureId];
      if (destFeature) {
        const newUserStoryIds = [...destFeature.userStoryIds];
        newUserStoryIds.splice(destinationIndex, 0, userStoryId);
        destFeature.userStoryIds = newUserStoryIds;
      }

      // Update user story's parent
      const userStory = state.userStories[userStoryId];
      if (userStory) {
        userStory.parentFeatureId = destinationFeatureId;
      }
    },
    moveTaskToUserStory: (
      state,
      action: PayloadAction<{
        taskId: string;
        sourceUserStoryId: string;
        destinationUserStoryId: string;
        destinationIndex: number;
      }>
    ) => {
      const {
        taskId,
        sourceUserStoryId,
        destinationUserStoryId,
        destinationIndex,
      } = action.payload;

      // Remove from source user story
      const sourceUserStory = state.userStories[sourceUserStoryId];
      if (sourceUserStory) {
        sourceUserStory.taskIds = sourceUserStory.taskIds.filter(
          (id) => id !== taskId
        );
      }

      // Add to destination user story
      const destUserStory = state.userStories[destinationUserStoryId];
      if (destUserStory) {
        const newTaskIds = [...destUserStory.taskIds];
        newTaskIds.splice(destinationIndex, 0, taskId);
        destUserStory.taskIds = newTaskIds;
      }

      // Update task's parent
      const task = state.tasks[taskId];
      if (task) {
        task.parentUserStoryId = destinationUserStoryId;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStrapiData.fulfilled, (state, action) => {
        if (action.payload.sow) {
          Object.assign(state, action.payload.sow);
        }
      })
      .addCase(fetchStrapiData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStrapiData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(requestAdditionalFeatures.fulfilled, (state, action) => {
        state.isLoading = false;
        const { features, epicId } = action.payload;

        const epic = state.epics[epicId];
        if (!epic) {
          console.warn('Cannot add features: Epic not found:', epicId);
          return;
        }

        // Create new features object
        const newFeatures = { ...state.features };
        // Create new epic to modify
        const newEpic = { ...epic, featureIds: [...epic.featureIds] };

        features.forEach((newFeature: GeneratedFeature) => {
          const newFeatureId = newFeature.id;
          if (!newFeatureId) {
            console.warn('Received feature without ID:', newFeature);
            return;
          }

          const reformattedFeature: FeatureType = {
            id: newFeatureId,
            title: newFeature.title,
            description: newFeature.description,
            details: newFeature.details,
            dependencies: newFeature.dependencies || '',
            acceptanceCriteria: newFeature.acceptanceCriteria,
            parentEpicId: newFeature.parentEpicId,
            userStoryIds: [],
            notes: newFeature.notes,
            contextualQuestions: [],
            priority: newFeature.priority,
            effort: newFeature.effort,
          };

          newEpic.featureIds.push(newFeatureId);
          newFeatures[newFeatureId] = reformattedFeature;
        });

        // Update state with new objects
        state.features = newFeatures;
        state.epics = {
          ...state.epics,
          [epicId]: newEpic,
        };
      })
      .addCase(requestAdditionalFeatures.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestAdditionalFeatures.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(requestAdditionalEpics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestAdditionalEpics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(
        requestAdditionalEpics.fulfilled,
        (state, action: PayloadAction<{ epics: GeneratedEpic[] }>) => {
          state.isLoading = false;
          const { epics } = action.payload;
          if (!epics?.length) {
            return;
          }
          const newEpics = { ...state.epics };

          epics.forEach((newEpic: GeneratedEpic) => {
            try {
              const epicId = newEpic?.id;

              if (!epicId) {
                console.warn('Received epic without ID:', newEpic);
                return;
              }

              const epic: EpicType = {
                parentAppId: newEpic.appId,
                id: newEpic.id,
                title: newEpic.title || '',
                description: newEpic.description || '',
                goal: newEpic.goal || '',
                successCriteria: newEpic.successCriteria || '',
                dependencies: newEpic.dependencies,
                timeline: newEpic.timeline || '',
                resources: newEpic.resources,
                risksAndMitigation: newEpic?.risksAndMitigation || [],
                featureIds: [],
                notes: newEpic.notes || '',
                contextualQuestions: [],
              };
              newEpics[epicId] = epic;
            } catch {
              // Failed to add epic
            }
          });
          state.epics = newEpics;
        }
      )
      .addCase(requestUserStories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestUserStories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(requestUserStories.fulfilled, (state, action) => {
        state.isLoading = false;
        const { featureId, userStories } = action.payload;

        const feature = state.features[featureId];
        if (!feature) {
          console.warn(
            'Cannot add user stories: Feature not found:',
            featureId
          );
          return;
        }

        // Create new user stories object
        const newUserStories = { ...state.userStories };
        // Create new feature to modify
        const newFeature = {
          ...feature,
          userStoryIds: [...feature.userStoryIds],
        };

        userStories.forEach((newUserStory) => {
          const userStoryId = newUserStory.id;
          if (!userStoryId) {
            console.warn('Received user story without ID:', newUserStory);
            return;
          }

          const userStory: UserStoryType = {
            id: userStoryId,
            title: newUserStory.title,
            role: newUserStory.role,
            action: newUserStory.action,
            goal: newUserStory.goal,
            points: newUserStory.points,
            acceptanceCriteria: newUserStory.acceptanceCriteria,
            notes: newUserStory.notes,
            parentFeatureId: featureId,
            taskIds: [],
            developmentOrder: newUserStory.developmentOrder || 0,
            dependentUserStoryIds: [],
            contextualQuestions: [],
          };

          newUserStories[userStoryId] = userStory;
          newFeature.userStoryIds.push(userStoryId);
        });

        // Update state with new objects
        state.userStories = newUserStories;
        state.features = {
          ...state.features,
          [featureId]: newFeature,
        };
      })

      .addCase(requestTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Request Tasks
      .addCase(requestTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        const { userStoryId, tasks } = action.payload;

        const userStory = state.userStories[userStoryId];
        if (!userStory) {
          console.warn('Cannot add tasks: User story not found:', userStoryId);
          return;
        }

        // Create new tasks object
        const newTasks = { ...state.tasks };
        // Create new user story to modify
        const newUserStory = { ...userStory, taskIds: [...userStory.taskIds] };

        tasks.forEach((newTask) => {
          const taskId = generateId();
          if (!taskId) {
            console.warn('Failed to generate task ID for:', newTask);
            return;
          }

          const task: TaskType = {
            id: taskId,
            title: newTask.title,
            details: newTask.details,
            priority: newTask.priority || 0,
            notes: newTask.notes,
            parentUserStoryId: userStoryId,
            dependentTaskIds: [],
            contextualQuestions: [],
          };

          newTasks[taskId] = task;
          newUserStory.taskIds.push(taskId);
        });

        // Update state with new objects
        state.tasks = newTasks;
        state.userStories = {
          ...state.userStories,
          [userStoryId]: newUserStory,
        };
      });
  },
});

export const {
  setSow,
  addEpics,
  addFeature,
  addUserStory,
  addTask,
  addFeatures,
  addUserStories,
  addTasks,
  addGlobalContextualQuestion,
  addGlobalContextualQuestions,
  deleteFeature,
  deleteUserStory,
  updateUserStoryField,
  updateFeatureField,
  updateEpicField,
  deleteEpic,
  deleteTask,
  updateTaskField,
  addContextualQuestionToWorkItem,
  addContextualQuestionsToWorkItem,
  removeContextualQuestionFromWorkItem,
  replaceContextualQuestionFromWorkItem,
  removeGlobalContextualQuestion,
  replaceEpic,
  replaceFeature,
  replaceUserStory,
  replaceTask,
  replaceGlobalContextualQuestions,
  updateGlobalInformation,
  updateSelectedModel,
  reorderEpics,
  reorderFeatures,
  reorderUserStories,
  reorderTasks,
  moveFeatureToEpic,
  moveUserStoryToFeature,
  moveTaskToUserStory,
} = sowSlice.actions;

// Selectors
export const selectEpicById = (state: RootState, id: string) =>
  state?.sow?.epics?.[id];
export const selectFeatureById = (state: RootState, id: string) =>
  state?.sow?.features?.[id];
export const selectUserStoryById = (state: RootState, id: string) =>
  state?.sow?.userStories?.[id];
export const selectTaskById = (state: RootState, id: string) =>
  state?.sow?.tasks?.[id];
export const selectAllEpics = (state: RootState) =>
  Object.values(state?.sow?.epics);
export const selectAllFeatures = (state: RootState) =>
  Object.values(state?.sow?.features);
export const selectAllUserStories = (state: RootState) =>
  Object.values(state?.sow?.userStories);
export const selectAllTasks = (state: RootState) =>
  Object.values(state?.sow?.tasks);
export const selectGlobalContextualQuestions = (state: RootState) =>
  state?.sow?.contextualQuestions;

export const selectGlobalInformation = (state: RootState) =>
  state?.sow?.globalInformation;
export const selectChatApi = (state: RootState) => state?.sow?.chatApi;
export const selectSelectedModel = (state: RootState) =>
  state?.sow?.selectedModel || 'gpt-3.5-turbo-16k';

export default sowSlice.reducer;
