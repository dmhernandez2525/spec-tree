import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  App,
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
  RiskMitigationType,
} from '../types/work-items';

// Base Strapi response types
interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details: unknown;
  };
}

// Request types
interface CreateEpicRequest {
  title: string;
  description: string;
  goal: string;
  successCriteria: string;
  dependencies: string;
  timeline: string;
  resources: string;
  app: string;
  risksAndMitigation: RiskMitigationType[];
  notes?: string;
}

interface CreateFeatureRequest {
  title: string;
  description: string;
  details: string;
  dependencies?: string;
  acceptanceCriteria: Array<{ text: string }>;
  epic: string;
  notes?: string;
}

interface CreateUserStoryRequest {
  title: string;
  role: string;
  action: string;
  goal: string;
  points: string;
  acceptanceCriteria: Array<{ text: string }>;
  feature: string;
  notes?: string;
  developmentOrder: number;
}

interface CreateTaskRequest {
  title: string;
  details: string;
  priority: string;
  notes?: string;
  userStory: string;
  developmentOrder: number;
}

class StrapiService {
  private instance: AxiosInstance;
  private readonly baseURL: string;
  private readonly token: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    this.token = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

    this.instance = axios.create({
      baseURL: `${this.baseURL}/api`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  private async fetch<T>(endpoint: string, params = {}): Promise<T> {
    try {
      const response: AxiosResponse<StrapiResponse<T>> =
        await this.instance.get(endpoint, { params });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any): never {
    if (error.response?.data?.error) {
      const strapiError = error.response.data as StrapiError;
      console.error('Strapi API Error:', strapiError.error.message);
      throw new Error(strapiError.error.message);
    }
    throw error;
  }

  // Apps
  async fetchApps(): Promise<App[]> {
    return this.fetch<App[]>('/apps');
  }

  async fetchAppById(documentId: string): Promise<App> {
    return this.fetch<App>(`/apps/${documentId}`);
  }

  async createApp(data: Partial<App>): Promise<App> {
    try {
      const response = await this.instance.post('/apps', { data });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Epics
  async fetchEpics(appId: string): Promise<EpicType[]> {
    return this.fetch<EpicType[]>('/epics', {
      filters: {
        app: {
          documentId: appId,
        },
      },
      populate: '*',
    });
  }

  async createEpic(data: CreateEpicRequest): Promise<EpicType> {
    try {
      const response = await this.instance.post('/epics', { data });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateEpic(
    documentId: string,
    data: Partial<EpicType>
  ): Promise<EpicType> {
    try {
      const response = await this.instance.put(`/epics/${documentId}`, {
        data,
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteEpic(documentId: string): Promise<void> {
    try {
      await this.instance.delete(`/epics/${documentId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Features
  async fetchFeatures(epicId: string): Promise<FeatureType[]> {
    return this.fetch<FeatureType[]>('/features', {
      filters: {
        epic: {
          documentId: epicId,
        },
      },
      populate: '*',
    });
  }

  async createFeature(data: CreateFeatureRequest): Promise<FeatureType> {
    try {
      const response = await this.instance.post('/features', { data });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateFeature(
    documentId: string,
    data: Partial<FeatureType>
  ): Promise<FeatureType> {
    try {
      const response = await this.instance.put(`/features/${documentId}`, {
        data,
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteFeature(documentId: string): Promise<void> {
    try {
      await this.instance.delete(`/features/${documentId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // User Stories
  async fetchUserStories(featureId: string): Promise<UserStoryType[]> {
    return this.fetch<UserStoryType[]>('/user-stories', {
      filters: {
        feature: {
          documentId: featureId,
        },
      },
      populate: '*',
    });
  }

  async createUserStory(data: CreateUserStoryRequest): Promise<UserStoryType> {
    try {
      const response = await this.instance.post('/user-stories', { data });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUserStory(
    documentId: string,
    data: Partial<UserStoryType>
  ): Promise<UserStoryType> {
    try {
      const response = await this.instance.put(`/user-stories/${documentId}`, {
        data,
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteUserStory(documentId: string): Promise<void> {
    try {
      await this.instance.delete(`/user-stories/${documentId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Tasks
  async fetchTasks(userStoryId: string): Promise<TaskType[]> {
    return this.fetch<TaskType[]>('/tasks', {
      filters: {
        userStory: {
          documentId: userStoryId,
        },
      },
      populate: '*',
    });
  }

  async createTask(data: CreateTaskRequest): Promise<TaskType> {
    try {
      const response = await this.instance.post('/tasks', { data });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateTask(
    documentId: string,
    data: Partial<TaskType>
  ): Promise<TaskType> {
    try {
      const response = await this.instance.put(`/tasks/${documentId}`, {
        data,
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteTask(documentId: string): Promise<void> {
    try {
      await this.instance.delete(`/tasks/${documentId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Settings & Configuration
  async getSettings(): Promise<any> {
    return this.fetch<any>('/settings');
  }

  async getConfig(): Promise<any> {
    return this.fetch<any>('/config');
  }

  // Fetch all data for an app
  async fetchAllAppData(documentId: string): Promise<any> {
    return this.fetch<any>(`/apps/${documentId}`, {
      populate: {
        epics: {
          populate: {
            features: {
              populate: {
                userStories: {
                  populate: {
                    tasks: {
                      populate: '*',
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}

export const strapiService = new StrapiService();
