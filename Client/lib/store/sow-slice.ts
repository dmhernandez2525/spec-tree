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
  WorkItemType,
} from '../../components/spec-tree/lib/types/work-items';
import { RootState } from './store/index';
import generateId from '../../components/spec-tree/lib/utils/generate-id';

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
};

// New Strapi data fetching thunk
export const fetchStrapiData = createAsyncThunk(
  'sow/fetchStrapiData',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const data = await strapiService.fetchAllAppData(documentId);
      return {
        sow: {
          id: documentId,
          epics: data.epics.reduce((acc: any, epic: any) => {
            acc[epic.documentId] = {
              id: epic.documentId,
              title: epic.title,
              description: epic.description,
              goal: epic.goal,
              successCriteria: epic.successCriteria,
              dependencies: epic.dependencies,
              timeline: epic.timeline,
              resources: epic.resources,
              risksAndMitigation: epic.risksAndMitigation || [],
              featureIds: epic.features?.map((f: any) => f.documentId) || [],
              notes: epic.notes,
              contextualQuestions: epic.contextualQuestions || [],
            };
            return acc;
          }, {}),
          features: data.epics.reduce((acc: any, epic: any) => {
            epic.features?.forEach((feature: any) => {
              acc[feature.documentId] = {
                id: feature.documentId,
                title: feature.title,
                description: feature.description,
                details: feature.details,
                dependencies: feature.dependencies || '',
                acceptanceCriteria: feature.acceptanceCriteria,
                parentEpicId: epic.documentId,
                userStoryIds:
                  feature.userStories?.map((us: any) => us.documentId) || [],
                notes: feature.notes,
                contextualQuestions: feature.contextualQuestions || [],
              };
            });
            return acc;
          }, {}),
          userStories: data.epics.reduce((acc: any, epic: any) => {
            epic.features?.forEach((feature: any) => {
              feature.userStories?.forEach((story: any) => {
                acc[story.documentId] = {
                  id: story.documentId,
                  title: story.title,
                  role: story.role,
                  action: story.action,
                  goal: story.goal,
                  points: story.points,
                  acceptanceCriteria: story.acceptanceCriteria,
                  notes: story.notes,
                  parentFeatureId: feature.documentId,
                  taskIds: story.tasks?.map((t: any) => t.documentId) || [],
                  developmentOrder: story.developmentOrder || 0,
                  contextualQuestions: story.contextualQuestions || [],
                };
              });
            });
            return acc;
          }, {}),
          tasks: data.epics.reduce((acc: any, epic: any) => {
            epic.features?.forEach((feature: any) => {
              feature.userStories?.forEach((story: any) => {
                story.tasks?.forEach((task: any) => {
                  acc[task.documentId] = {
                    id: task.documentId,
                    title: task.title,
                    details: task.details,
                    priority: task.priority,
                    notes: task.notes,
                    parentUserStoryId: story.documentId,
                    developmentOrder: task.developmentOrder || 0,
                    contextualQuestions: task.contextualQuestions || [],
                  };
                });
              });
            });
            return acc;
          }, {}),
          contextualQuestions: data.contextualQuestions || [],
          globalInformation: data.globalInformation || '',
        },
      };
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

    let parseGpt3: GeneratedEpic[] = response.data.choices[0].message.content
      .split('####')
      .map((value: string) => {
        try {
          return JSON.parse(value);
        } catch (error) {
          console.log(error);
          return null;
        }
      })
      .filter((item: any): item is GeneratedEpic => item !== null);

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
          app: res.app,
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
  } catch (err: any) {
    return rejectWithValue(err.response.data);
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

      let parseGpt3: GeneratedFeature[] =
        response.data.choices[0].message.content
          .split('####')
          .map((value: string) => {
            try {
              return JSON.parse(value);
            } catch (error) {
              console.log(error);
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
            epic: epic.id,
          });
          return {
            id: res.documentId,
            title: res.title,
            description: res.description,
            acceptanceCriteria: res.acceptanceCriteria,
            priority: res.priority,
            effort: res.effort,
            dependencies: res.dependencies,
            epic: res.epic,
          };
        })
      );
      return { features: newFeatures, epicId: epic.id };
    } catch (err: any) {
      return rejectWithValue(err.response.data);
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

      let parseGpt3: GeneratedUserStory[] =
        response.data.choices[0].message.content
          .split('####')
          .map((value: string) => {
            try {
              return JSON.parse(value);
            } catch (error) {
              console.log(error);
              return null;
            }
          })
          .filter((item): item is GeneratedUserStory => item !== null);

      // Use Strapi service to create user stories
      const userStories = await Promise.all(
        parseGpt3.map(async (story) => {
          return await strapiService.createUserStory({
            title: story.title,
            role: story.role,
            action: story.action,
            goal: story.goal,
            points: story.points,
            acceptanceCriteria: story.acceptanceCriteria,
            feature: feature.id,
            notes: story.notes,
            developmentOrder: 0,
          });
        })
      );

      return { userStories: parseGpt3, featureId: feature.id };
    } catch (err: any) {
      return rejectWithValue(err.response.data);
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
        context,
        selectedModel: state.sow.selectedModel,
      });

      let parseGpt3: GeneratedTask[] = response.data.choices[0].message.content
        .split('####')
        .map((value: string) => {
          try {
            return JSON.parse(value);
          } catch (error) {
            console.log(error);
            return null;
          }
        })
        .filter((item): item is GeneratedTask => item !== null);

      // Use Strapi service to create tasks
      const tasks = await Promise.all(
        parseGpt3.map(async (task) => {
          return await strapiService.createTask({
            title: task.title,
            details: task.details,
            priority: task.priority,
            notes: task.notes,
            userStory: userStory.id,
            developmentOrder: 0,
          });
        })
      );

      return {
        userStoryId: userStory.id,
        tasks: parseGpt3,
      };
    } catch (err: any) {
      return rejectWithValue({ errorMessage: err.response.data.message });
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
    setSow: (state, action: PayloadAction<any>) => {
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
      } = action?.payload?.sow;

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
      const draft = { ...state.epics };
      draft[epic.id] = epic;
      state.epics = draft;
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
    addAC: (state, action: PayloadAction<AddACPayload>) => {},
    updateTaskField: (state, action: PayloadAction<UpdateTaskFieldPayload>) => {
      const { taskId, field, newValue } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        task[field] = newValue;
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
            userStory.acceptanceCriteria[arrayIndex] = newValue as string;
          } else if (isArrayItem) {
            userStory.acceptanceCriteria.push(newValue as string);
          } else {
            userStory.acceptanceCriteria = newValue as string[];
          }
        } else {
          if (Array.isArray(newValue)) {
            userStory.acceptanceCriteria = newValue;
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
            feature.acceptanceCriteria[arrayIndex] = newValue as string;
          } else if (isArrayItem) {
            // Add a new item to the end of the acceptanceCriteria array
            feature.acceptanceCriteria.push(newValue as string);
          } else {
            // used for deletion
            feature.acceptanceCriteria = newValue as string[];
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
      const { workItemId, questionId, workItemType, value, index } =
        action.payload;

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStrapiData.fulfilled, (state, action) => {
        if (action.payload.sow) {
          Object.assign(state, action.payload.sow);
        }
      })
      .addCase(requestAdditionalFeatures.fulfilled, (state, action) => {
        const { features, epicId } = action.payload;

        const epic = state.epics[epicId];
        if (epic) {
          features.forEach((newFeature: GeneratedFeature) => {
            const newFeatureId = generateId();
            const reformattedFeature: FeatureType = {
              id: newFeatureId,
              title: newFeature.title,
              description: newFeature.description,
              details: newFeature.details,
              dependencies: newFeature.dependencies,
              acceptanceCriteria: newFeature.acceptanceCriteria,
              parentEpicId: epic.id,
              userStoryIds: [],
              notes: newFeature.notes,
            };

            state.epics[epicId].featureIds.push(newFeatureId);
            state.features[newFeatureId] = reformattedFeature;
          });
        }
      })
      .addCase(requestAdditionalEpics.fulfilled, (state, action) => {
        const { epics } = action.payload;

        epics?.forEach((newEpic: GeneratedEpic) => {
          const epicId = generateId();
          const epic: EpicType = {
            id: epicId,
            title: newEpic.title,
            description: newEpic.description,
            goal: newEpic.goal,
            successCriteria: newEpic.successCriteria,
            dependencies: newEpic.dependencies,
            timeline: newEpic.timeline,
            resources: newEpic.resources,
            risksAndMitigation: newEpic?.risksAndMitigation || [],
            featureIds: [],
            notes: newEpic.notes,
          };
          state.epics[epicId] = epic;
        });
      })

      .addCase(requestUserStories.fulfilled, (state, action) => {
        const { featureId, userStories } = action.payload;

        const feature = state.features[featureId];

        if (feature) {
          userStories.forEach((newUserStory) => {
            const userStoryId = generateId();

            const userStory: UserStoryType = {
              id: userStoryId,
              title: newUserStory.title,
              role: newUserStory.role,
              action: newUserStory.action,
              goal: newUserStory.goal,
              points: newUserStory.points,
              acceptanceCriteria: newUserStory.acceptanceCriteria,
              notes: newUserStory.notes,
              parentFeatureId: feature.id,
              taskIds: [],
              developmentOrder: 0,
              dependentUserStoryIds: [],
            };

            state.userStories[userStoryId] = userStory;
            feature.userStoryIds.push(userStoryId);
          });
        }
      })
      .addCase(requestTasks.fulfilled, (state, action) => {
        const { userStoryId, tasks } = action.payload;

        // Find the user story by its title within the feature
        const userStory = state.userStories[userStoryId];
        if (userStory) {
          tasks.forEach((newTask) => {
            const taskId = generateId();
            const task: TaskType = {
              id: taskId,
              title: newTask.title,
              details: newTask.details,
              priority: newTask.priority,
              notes: newTask.notes,
              parentUserStoryId: userStory.id,
              developmentOrder: 0,
              dependentTaskIds: [],
            };

            // Add the task to the user story
            state.tasks[taskId] = task;
            userStory.taskIds.push(taskId);
          });
        }
      });
  },
});

export const {
  setSow,
  addEpics,
  addFeature,
  addUserStory,
  addTask,
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

export default sowSlice.reducer;
