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
import type {
  Comment,
  CommentStatus,
  CommentTargetType,
  CommentNotification,
  NotificationChannel,
  NotificationStatus,
} from '@/types/comments';
import type { StrapiApp, StrapiComment, StrapiCommentNotification } from '@/types/strapi';

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

interface CreateCommentRequest {
  targetType: CommentTargetType;
  targetId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  body: string;
  mentions: string[];
  status: CommentStatus;
}

interface UpdateCommentRequest {
  body?: string;
  mentions?: string[];
  status?: CommentStatus;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
}

const COMMENT_TARGET_FIELD: Record<CommentTargetType, 'app' | 'epic' | 'feature' | 'userStory' | 'task'> = {
  app: 'app',
  epic: 'epic',
  feature: 'feature',
  userStory: 'userStory',
  task: 'task',
};

const NOTIFICATION_CHANNEL_MAP: Record<'in_app' | 'email', NotificationChannel> = {
  in_app: 'in-app',
  email: 'email',
};

const NOTIFICATION_STATUS_MAP: Record<
  'unread' | 'read' | 'queued' | 'sent' | 'failed',
  NotificationStatus
> = {
  unread: 'unread',
  read: 'read',
  queued: 'queued',
  sent: 'sent',
  failed: 'failed',
};

const resolveDocumentId = (relation?: { documentId: string } | null): string | undefined =>
  relation?.documentId;

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

  private mapStrapiComment(
    comment: StrapiComment,
    targetType: CommentTargetType,
    targetId: string
  ): Comment {
    const mentions = Array.isArray(comment.mentions) ? comment.mentions : [];
    return {
      id: comment.documentId,
      targetType,
      targetId,
      parentId: resolveDocumentId(comment.parent) || null,
      authorId: comment.authorId || 'unknown',
      authorName: comment.authorName || 'Unknown',
      authorEmail: comment.authorEmail || undefined,
      body: comment.body || '',
      mentions,
      status: comment.status || 'open',
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      resolvedAt: comment.resolvedAt || null,
      resolvedBy: comment.resolvedBy || null,
    };
  }

  private mapStrapiNotification(
    notification: StrapiCommentNotification
  ): CommentNotification {
    const channel = NOTIFICATION_CHANNEL_MAP[notification.channel];
    const status = NOTIFICATION_STATUS_MAP[notification.status];
    const commentId =
      'comment' in notification && notification.comment
        ? (notification.comment as { documentId?: string }).documentId || ''
        : '';
    const userId =
      'user' in notification && notification.user
        ? (notification.user as { documentId?: string }).documentId || ''
        : '';

    return {
      id: notification.documentId,
      commentId,
      userId,
      channel,
      status,
      createdAt: notification.createdAt,
    };
  }

  // Apps
  async fetchApps(): Promise<App[]> {
    return this.fetch<App[]>('/apps');
  }

  async fetchAppById(documentId: string): Promise<StrapiApp> {
    return this.fetch<StrapiApp>(`/apps/${documentId}`, {
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

  // Comments
  async fetchCommentsForTarget(
    targetType: CommentTargetType,
    targetId: string
  ): Promise<Comment[]> {
    const targetField = COMMENT_TARGET_FIELD[targetType];
    const data = await this.fetch<StrapiComment[]>('/comments', {
      filters: {
        [targetField]: {
          documentId: targetId,
        },
      },
      populate: {
        parent: {
          fields: ['documentId'],
        },
      },
      sort: ['createdAt:asc'],
    });

    return data.map((comment) => this.mapStrapiComment(comment, targetType, targetId));
  }

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const { targetType, targetId, parentId, ...commentData } = data;
    const targetField = COMMENT_TARGET_FIELD[targetType];
    const payload: Record<string, unknown> = {
      ...commentData,
      [targetField]: {
        connect: [targetId],
      },
    };

    if (parentId) {
      payload.parent = { connect: [parentId] };
    }

    try {
      const response = await this.instance.post(
        '/comments',
        {
          data: payload,
        },
        {
          params: {
            populate: {
              parent: {
                fields: ['documentId'],
              },
            },
          },
        }
      );
      return this.mapStrapiComment(response.data.data, targetType, targetId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateComment(documentId: string, data: UpdateCommentRequest): Promise<void> {
    try {
      await this.instance.put(`/comments/${documentId}`, {
        data,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteComment(documentId: string): Promise<void> {
    try {
      await this.instance.delete(`/comments/${documentId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async fetchCommentNotificationsForUser(userId: string): Promise<CommentNotification[]> {
    const numericId = Number(userId);
    const userFilter = Number.isNaN(numericId)
      ? { user: { documentId: userId } }
      : {
          $or: [{ user: { documentId: userId } }, { user: { id: numericId } }],
        };

    const data = await this.fetch<StrapiCommentNotification[]>('/comment-notifications', {
      filters: userFilter,
      populate: {
        comment: { fields: ['documentId'] },
        user: { fields: ['documentId'] },
      },
      sort: ['createdAt:desc'],
    });

    return data.map((notification) => this.mapStrapiNotification(notification));
  }

  async markCommentNotificationsRead(userId: string): Promise<void> {
    const notifications = await this.fetchCommentNotificationsForUser(userId);
    const unread = notifications.filter(
      (notification) => notification.channel === 'in-app' && notification.status === 'unread'
    );
    if (unread.length === 0) return;

    try {
      await Promise.all(
        unread.map((notification) =>
          this.instance.put(`/comment-notifications/${notification.id}`, {
            data: { status: 'read' },
          })
        )
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  // Settings & Configuration

  // Fetch all data for an app (deeply populated)
  async fetchAllAppData(documentId: string): Promise<StrapiApp> {
    return this.fetchAppById(documentId);
  }

  // Reorder operations - update position field
  async updateEpicPosition(
    documentId: string,
    position: number
  ): Promise<ResEpicType> {
    return this.updateEpic(documentId, { position } as Partial<EpicType>);
  }

  async updateFeaturePosition(
    documentId: string,
    position: number,
    epicId?: string
  ): Promise<ResFeatureType> {
    const data: Record<string, unknown> = { position };
    if (epicId) {
      data.epic = { connect: [epicId] };
    }
    try {
      const response = await this.instance.put(
        `/features/${documentId}`,
        { data },
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

  async updateUserStoryPosition(
    documentId: string,
    position: number,
    featureId?: string
  ): Promise<ResUserStoryType> {
    const data: Record<string, unknown> = { position };
    if (featureId) {
      data.feature = { connect: [featureId] };
    }
    try {
      const response = await this.instance.put(
        `/user-stories/${documentId}`,
        { data },
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

  async updateTaskPosition(
    documentId: string,
    position: number,
    userStoryId?: string
  ): Promise<ResTaskType> {
    const data: Record<string, unknown> = { position };
    if (userStoryId) {
      data.userStory = { connect: [userStoryId] };
    }
    try {
      const response = await this.instance.put(
        `/tasks/${documentId}`,
        { data },
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

  // Batch reorder - update positions for multiple items of the same type
  async batchUpdatePositions(
    itemType: 'epics' | 'features' | 'user-stories' | 'tasks',
    items: Array<{ documentId: string; position: number }>
  ): Promise<void> {
    try {
      await Promise.all(
        items.map((item) =>
          this.instance.put(`/${itemType}/${item.documentId}`, {
            data: { position: item.position },
          })
        )
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const strapiService = new StrapiService();
