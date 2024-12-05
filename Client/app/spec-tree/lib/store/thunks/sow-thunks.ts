import { createAsyncThunk } from '@reduxjs/toolkit';
import { strapiService } from '../../api/strapi-service';
import {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
  App,
  RiskMitigationType,
} from '../../types/work-items';
import { RootState } from '../index';

interface ThunkConfig {
  state: RootState;
  rejectValue: string;
}

// App Thunks
export const fetchAppData = createAsyncThunk<App, string, ThunkConfig>(
  'sow/fetchAppData',
  async (documentId, { rejectWithValue }) => {
    try {
      const app = await strapiService.fetchAppById(documentId);
      return app;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch app'
      );
    }
  }
);

// Epic Thunks
export const fetchEpics = createAsyncThunk<EpicType[], string, ThunkConfig>(
  'sow/fetchEpics',
  async (appId, { rejectWithValue }) => {
    try {
      const epics = await strapiService.fetchEpics(appId);
      return epics;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch epics'
      );
    }
  }
);

interface CreateEpicPayload {
  title: string;
  description: string;
  goal: string;
  successCriteria: string;
  dependencies: string;
  timeline: string;
  resources: string;
  appId: string;
  risksAndMitigation: RiskMitigationType[];
  notes?: string;
}

export const createEpic = createAsyncThunk<
  EpicType,
  CreateEpicPayload,
  ThunkConfig
>('sow/createEpic', async (epicData, { rejectWithValue }) => {
  try {
    const epic = await strapiService.createEpic({
      ...epicData,
      app: epicData.appId,
    });
    return epic;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to create epic'
    );
  }
});

// Feature Thunks
export const fetchFeatures = createAsyncThunk<
  FeatureType[],
  string,
  ThunkConfig
>('sow/fetchFeatures', async (epicId, { rejectWithValue }) => {
  try {
    const features = await strapiService.fetchFeatures(epicId);
    return features;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch features'
    );
  }
});

interface CreateFeaturePayload {
  title: string;
  description: string;
  details: string;
  dependencies?: string;
  acceptanceCriteria: Array<{ text: string }>;
  epicId: string;
  notes?: string;
}

export const createFeature = createAsyncThunk<
  FeatureType,
  CreateFeaturePayload,
  ThunkConfig
>('sow/createFeature', async (featureData, { rejectWithValue }) => {
  try {
    const feature = await strapiService.createFeature({
      ...featureData,
      epic: featureData.epicId,
    });
    return feature;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to create feature'
    );
  }
});

// User Story Thunks
export const fetchUserStories = createAsyncThunk<
  UserStoryType[],
  string,
  ThunkConfig
>('sow/fetchUserStories', async (featureId, { rejectWithValue }) => {
  try {
    const userStories = await strapiService.fetchUserStories(featureId);
    return userStories;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch user stories'
    );
  }
});

interface CreateUserStoryPayload {
  title: string;
  role: string;
  action: string;
  goal: string;
  points: string;
  acceptanceCriteria: Array<{ text: string }>;
  featureId: string;
  notes?: string;
  developmentOrder: number;
}

export const createUserStory = createAsyncThunk<
  UserStoryType,
  CreateUserStoryPayload,
  ThunkConfig
>('sow/createUserStory', async (userStoryData, { rejectWithValue }) => {
  try {
    const userStory = await strapiService.createUserStory({
      ...userStoryData,
      feature: userStoryData.featureId,
    });
    return userStory;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to create user story'
    );
  }
});

// Task Thunks
export const fetchTasks = createAsyncThunk<TaskType[], string, ThunkConfig>(
  'sow/fetchTasks',
  async (userStoryId, { rejectWithValue }) => {
    try {
      const tasks = await strapiService.fetchTasks(userStoryId);
      return tasks;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch tasks'
      );
    }
  }
);

interface CreateTaskPayload {
  title: string;
  details: string;
  priority: string;
  notes?: string;
  userStoryId: string;
  developmentOrder: number;
}

export const createTask = createAsyncThunk<
  TaskType,
  CreateTaskPayload,
  ThunkConfig
>('sow/createTask', async (taskData, { rejectWithValue }) => {
  try {
    const task = await strapiService.createTask({
      ...taskData,
      userStory: taskData.userStoryId,
    });
    return task;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to create task'
    );
  }
});
