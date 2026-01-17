import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  App,
  EpicType,
  ResEpicType,
  FeatureType,
  ResFeatureType,
  UserStoryType,
  ResUserStoryType,
  TaskType,
  ResTaskType,
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
  actionStr: string;
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
  priority: number;
  notes?: string;
  userStory: string;
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

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      const strapiError = error.response.data as StrapiError;
      console.error('Strapi API Error:', strapiError.error.message);
      throw new Error(strapiError.error.message);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }

  // Apps
  async fetchApps(): Promise<App[]> {
    return this.fetch<App[]>('/apps');
  }

  async fetchAppById(documentId: string): Promise<App> {
    return this.fetch<App>(`/apps/${documentId}`, {
      populate: {
        contextualQuestions: true,
        epics: {
          populate: {
            contextualQuestions: true,
            risksAndMitigation: {
              populate: {
                own: true,
                accept: true,
                mitigate: true,
                resolve: true,
              },
            },
            features: {
              populate: {
                acceptanceCriteria: true,
                contextualQuestions: true,
                userStories: {
                  populate: {
                    acceptanceCriteria: true,
                    contextualQuestions: true,
                    tasks: {
                      populate: {
                        contextualQuestions: true,
                      },
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

  async createApp(data: Partial<App>): Promise<App> {
    try {
      const response = await this.instance.post('/apps', { data });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Epics
  async fetchEpics(appId: string): Promise<ResEpicType[]> {
    return this.fetch<ResEpicType[]>('/epics', {
      filters: {
        app: {
          documentId: appId,
        },
      },
      populate: {
        app: {
          fields: ['documentId'],
        },
      },
    });
  }

  async createEpic(data: CreateEpicRequest): Promise<ResEpicType> {
    try {
      const { app: appId, ...epicData } = data;

      const response = await this.instance.post(
        '/epics',
        {
          data: {
            ...epicData,
            app: {
              connect: [appId],
            },
          },
        },
        {
          params: {
            populate: {
              app: {
                fields: ['documentId'],
              },
            },
          },
        }
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateEpic(
    documentId: string,
    data: Partial<EpicType>
  ): Promise<ResEpicType> {
    try {
      const response = await this.instance.put(
        `/epics/${documentId}`,
        {
          data,
        },
        {
          params: {
            populate: {
              app: {
                fields: ['documentId'],
              },
            },
          },
        }
      );
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
  async fetchFeatures(epicId: string): Promise<ResFeatureType[]> {
    return this.fetch<ResFeatureType[]>('/features', {
      filters: {
        epic: {
          documentId: epicId,
        },
      },
      populate: {
        epic: {
          fields: ['documentId'],
        },
      },
    });
  }

  async createFeature(data: CreateFeatureRequest): Promise<ResFeatureType> {
    try {
      const { epic: epicId, ...featureData } = data;

      const response = await this.instance.post(
        '/features',
        {
          data: {
            ...featureData,
            epic: {
              connect: [epicId],
            },
          },
        },
        {
          params: {
            populate: {
              epic: {
                fields: ['documentId'],
              },
            },
          },
        }
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateFeature(
    documentId: string,
    data: Partial<FeatureType>
  ): Promise<ResFeatureType> {
    try {
      const response = await this.instance.put(
        `/features/${documentId}`,
        {
          data,
        },
        {
          params: {
            populate: {
              epic: {
                fields: ['documentId'],
              },
            },
          },
        }
      );
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
  async fetchUserStories(featureId: string): Promise<ResUserStoryType[]> {
    return this.fetch<ResUserStoryType[]>('/user-stories', {
      filters: {
        feature: {
          documentId: featureId,
        },
      },
      populate: {
        feature: {
          fields: ['documentId'],
        },
      },
    });
  }

  async createUserStory(
    data: CreateUserStoryRequest
  ): Promise<ResUserStoryType> {
    try {
      const { feature: featureId, ...storyData } = data;

      const response = await this.instance.post(
        '/user-stories',
        {
          data: {
            ...storyData,
            feature: {
              connect: [featureId],
            },
          },
        },
        {
          params: {
            populate: {
              feature: {
                fields: ['documentId'],
              },
            },
          },
        }
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUserStory(
    documentId: string,
    data: Partial<UserStoryType>
  ): Promise<ResUserStoryType> {
    try {
      const response = await this.instance.put(
        `/user-stories/${documentId}`,
        {
          data,
        },
        {
          params: {
            populate: {
              feature: {
                fields: ['documentId'],
              },
            },
          },
        }
      );
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
  async fetchTasks(userStoryId: string): Promise<ResTaskType[]> {
    return this.fetch<ResTaskType[]>('/tasks', {
      filters: {
        userStory: {
          documentId: userStoryId,
        },
      },
      populate: {
        userStory: {
          fields: ['documentId'],
        },
      },
    });
  }

  async createTask(data: CreateTaskRequest): Promise<ResTaskType> {
    try {
      const { userStory: userStoryId, ...taskData } = data;

      const response = await this.instance.post(
        '/tasks',
        {
          data: {
            ...taskData,
            userStory: {
              connect: [userStoryId],
            },
          },
        },
        {
          params: {
            populate: {
              userStory: {
                fields: ['documentId'],
              },
            },
          },
        }
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateTask(
    documentId: string,
    data: Partial<TaskType>
  ): Promise<ResTaskType> {
    try {
      const response = await this.instance.put(
        `/tasks/${documentId}`,
        {
          data,
        },
        {
          params: {
            populate: {
              userStory: {
                fields: ['documentId'],
              },
            },
          },
        }
      );
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

  // Fetch all data for an app
  async fetchAllAppData(documentId: string): Promise<any> {
    return this.fetchAppById(documentId);
  }
}

export const strapiService = new StrapiService();
