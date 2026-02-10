/**
 * Tests for StrapiService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { strapiService } from './strapi-service';

// Mock axios
vi.mock('axios', async () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: vi.fn((error) => error?.isAxiosError === true),
    },
    __mockInstance: mockAxiosInstance,
  };
});

// Get the mock instance for use in tests
const getMockInstance = () => {
  return (axios.create as any)();
};

describe('StrapiService', () => {
  describe('service exports', () => {
    it('exports strapiService instance', () => {
      expect(strapiService).toBeDefined();
    });

    it('has fetchApps method', () => {
      expect(typeof strapiService.fetchApps).toBe('function');
    });

    it('has fetchVersionSnapshots method', () => {
      expect(typeof strapiService.fetchVersionSnapshots).toBe('function');
    });

    it('has createVersionSnapshot method', () => {
      expect(typeof strapiService.createVersionSnapshot).toBe('function');
    });

    it('has fetchAppById method', () => {
      expect(typeof strapiService.fetchAppById).toBe('function');
    });

    it('has createApp method', () => {
      expect(typeof strapiService.createApp).toBe('function');
    });

    it('has fetchEpics method', () => {
      expect(typeof strapiService.fetchEpics).toBe('function');
    });

    it('has createEpic method', () => {
      expect(typeof strapiService.createEpic).toBe('function');
    });

    it('has updateEpic method', () => {
      expect(typeof strapiService.updateEpic).toBe('function');
    });

    it('has deleteEpic method', () => {
      expect(typeof strapiService.deleteEpic).toBe('function');
    });

    it('has fetchFeatures method', () => {
      expect(typeof strapiService.fetchFeatures).toBe('function');
    });

    it('has createFeature method', () => {
      expect(typeof strapiService.createFeature).toBe('function');
    });

    it('has updateFeature method', () => {
      expect(typeof strapiService.updateFeature).toBe('function');
    });

    it('has deleteFeature method', () => {
      expect(typeof strapiService.deleteFeature).toBe('function');
    });

    it('has fetchUserStories method', () => {
      expect(typeof strapiService.fetchUserStories).toBe('function');
    });

    it('has createUserStory method', () => {
      expect(typeof strapiService.createUserStory).toBe('function');
    });

    it('has updateUserStory method', () => {
      expect(typeof strapiService.updateUserStory).toBe('function');
    });

    it('has deleteUserStory method', () => {
      expect(typeof strapiService.deleteUserStory).toBe('function');
    });

    it('has fetchTasks method', () => {
      expect(typeof strapiService.fetchTasks).toBe('function');
    });

    it('has createTask method', () => {
      expect(typeof strapiService.createTask).toBe('function');
    });

    it('has updateTask method', () => {
      expect(typeof strapiService.updateTask).toBe('function');
    });

    it('has deleteTask method', () => {
      expect(typeof strapiService.deleteTask).toBe('function');
    });

    it('has fetchCommentsForTarget method', () => {
      expect(typeof strapiService.fetchCommentsForTarget).toBe('function');
    });

    it('has createComment method', () => {
      expect(typeof strapiService.createComment).toBe('function');
    });

    it('has updateComment method', () => {
      expect(typeof strapiService.updateComment).toBe('function');
    });

    it('has deleteComment method', () => {
      expect(typeof strapiService.deleteComment).toBe('function');
    });

    it('has fetchAllAppData method', () => {
      expect(typeof strapiService.fetchAllAppData).toBe('function');
    });

    it('has updateEpicPosition method', () => {
      expect(typeof strapiService.updateEpicPosition).toBe('function');
    });

    it('has updateFeaturePosition method', () => {
      expect(typeof strapiService.updateFeaturePosition).toBe('function');
    });

    it('has updateUserStoryPosition method', () => {
      expect(typeof strapiService.updateUserStoryPosition).toBe('function');
    });

    it('has updateTaskPosition method', () => {
      expect(typeof strapiService.updateTaskPosition).toBe('function');
    });

    it('has batchUpdatePositions method', () => {
      expect(typeof strapiService.batchUpdatePositions).toBe('function');
    });
  });

  describe('API configuration', () => {
    it('service instance is configured properly', () => {
      // The strapiService is a singleton that configures axios internally
      // We verify it exports expected methods rather than internal config
      expect(strapiService).toBeDefined();
      expect(typeof strapiService.fetchApps).toBe('function');
      expect(typeof strapiService.createApp).toBe('function');
    });
  });

  describe('Apps API', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('fetchApps calls correct endpoint', async () => {
      const mockInstance = getMockInstance();
      mockInstance.get.mockResolvedValueOnce({
        data: { data: [{ id: 1, name: 'Test App' }] },
      });

      // Create a new service to use our mock
      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.fetchApps();

      expect(mockInstance.get).toHaveBeenCalledWith(
        '/apps',
        expect.any(Object)
      );
    });

    it('fetchAppById calls correct endpoint with documentId', async () => {
      const mockInstance = getMockInstance();
      mockInstance.get.mockResolvedValueOnce({
        data: { data: { id: 1, name: 'Test App', documentId: 'doc-123' } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.fetchAppById('doc-123');

      expect(mockInstance.get).toHaveBeenCalledWith(
        '/apps/doc-123',
        expect.objectContaining({
          params: expect.objectContaining({
            populate: expect.any(Object),
          }),
        })
      );
    });

    it('createApp posts data to correct endpoint', async () => {
      const mockInstance = getMockInstance();
      mockInstance.post.mockResolvedValueOnce({
        data: { data: { id: 1, name: 'New App' } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.createApp({ name: 'New App' });

      expect(mockInstance.post).toHaveBeenCalledWith(
        '/apps',
        expect.objectContaining({
          data: { name: 'New App' },
        })
      );
    });
  });

  describe('Epics API', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('fetchEpics calls endpoint with app filter', async () => {
      const mockInstance = getMockInstance();
      mockInstance.get.mockResolvedValueOnce({
        data: { data: [{ id: 1, title: 'Epic 1' }] },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.fetchEpics('app-123');

      expect(mockInstance.get).toHaveBeenCalledWith(
        '/epics',
        expect.objectContaining({
          params: expect.objectContaining({
            filters: expect.objectContaining({
              app: { documentId: 'app-123' },
            }),
          }),
        })
      );
    });

    it('createEpic posts data with connected app', async () => {
      const mockInstance = getMockInstance();
      mockInstance.post.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'epic-1', title: 'New Epic' } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      const epicData = {
        title: 'New Epic',
        description: 'Epic description',
        goal: 'Epic goal',
        successCriteria: 'Success criteria',
        dependencies: '',
        timeline: 'Q1 2024',
        resources: 'Dev team',
        app: 'app-123',
        risksAndMitigation: [],
      };

      await service.createEpic(epicData);

      expect(mockInstance.post).toHaveBeenCalledWith(
        '/epics',
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Epic',
            app: { connect: ['app-123'] },
          }),
        }),
        expect.any(Object)
      );
    });

    it('updateEpic puts data to correct endpoint', async () => {
      const mockInstance = getMockInstance();
      mockInstance.put.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'epic-1', title: 'Updated Epic' } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.updateEpic('epic-1', { title: 'Updated Epic' });

      expect(mockInstance.put).toHaveBeenCalledWith(
        '/epics/epic-1',
        expect.objectContaining({
          data: { title: 'Updated Epic' },
        }),
        expect.any(Object)
      );
    });

    it('deleteEpic calls delete on correct endpoint', async () => {
      const mockInstance = getMockInstance();
      mockInstance.delete.mockResolvedValueOnce({ data: { success: true } });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.deleteEpic('epic-1');

      expect(mockInstance.delete).toHaveBeenCalledWith('/epics/epic-1');
    });
  });

  describe('Features API', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('fetchFeatures calls endpoint with epic filter', async () => {
      const mockInstance = getMockInstance();
      mockInstance.get.mockResolvedValueOnce({
        data: { data: [{ id: 1, title: 'Feature 1' }] },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.fetchFeatures('epic-123');

      expect(mockInstance.get).toHaveBeenCalledWith(
        '/features',
        expect.objectContaining({
          params: expect.objectContaining({
            filters: expect.objectContaining({
              epic: { documentId: 'epic-123' },
            }),
          }),
        })
      );
    });

    it('createFeature posts data with connected epic', async () => {
      const mockInstance = getMockInstance();
      mockInstance.post.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'feature-1', title: 'New Feature' } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      const featureData = {
        title: 'New Feature',
        description: 'Feature description',
        details: 'Feature details',
        acceptanceCriteria: [{ text: 'AC 1' }],
        epic: 'epic-123',
      };

      await service.createFeature(featureData);

      expect(mockInstance.post).toHaveBeenCalledWith(
        '/features',
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Feature',
            epic: { connect: ['epic-123'] },
          }),
        }),
        expect.any(Object)
      );
    });

    it('updateFeature puts data to correct endpoint', async () => {
      const mockInstance = getMockInstance();
      mockInstance.put.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'feature-1', title: 'Updated Feature' } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.updateFeature('feature-1', { title: 'Updated Feature' });

      expect(mockInstance.put).toHaveBeenCalledWith(
        '/features/feature-1',
        expect.objectContaining({
          data: { title: 'Updated Feature' },
        }),
        expect.any(Object)
      );
    });

    it('deleteFeature calls delete on correct endpoint', async () => {
      const mockInstance = getMockInstance();
      mockInstance.delete.mockResolvedValueOnce({ data: { success: true } });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.deleteFeature('feature-1');

      expect(mockInstance.delete).toHaveBeenCalledWith('/features/feature-1');
    });
  });

  describe('User Stories API', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('fetchUserStories calls endpoint with feature filter', async () => {
      const mockInstance = getMockInstance();
      mockInstance.get.mockResolvedValueOnce({
        data: { data: [{ id: 1, title: 'Story 1' }] },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.fetchUserStories('feature-123');

      expect(mockInstance.get).toHaveBeenCalledWith(
        '/user-stories',
        expect.objectContaining({
          params: expect.objectContaining({
            filters: expect.objectContaining({
              feature: { documentId: 'feature-123' },
            }),
          }),
        })
      );
    });

    it('createUserStory posts data with connected feature', async () => {
      const mockInstance = getMockInstance();
      mockInstance.post.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'story-1', title: 'New Story' } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      const storyData = {
        title: 'New Story',
        role: 'User',
        actionStr: 'do something',
        goal: 'achieve goal',
        points: '5',
        acceptanceCriteria: [{ text: 'AC 1' }],
        feature: 'feature-123',
        developmentOrder: 1,
      };

      await service.createUserStory(storyData);

      expect(mockInstance.post).toHaveBeenCalledWith(
        '/user-stories',
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Story',
            feature: { connect: ['feature-123'] },
          }),
        }),
        expect.any(Object)
      );
    });

    it('updateUserStory puts data to correct endpoint', async () => {
      const mockInstance = getMockInstance();
      mockInstance.put.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'story-1', title: 'Updated Story' } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.updateUserStory('story-1', { title: 'Updated Story' });

      expect(mockInstance.put).toHaveBeenCalledWith(
        '/user-stories/story-1',
        expect.objectContaining({
          data: { title: 'Updated Story' },
        }),
        expect.any(Object)
      );
    });

    it('deleteUserStory calls delete on correct endpoint', async () => {
      const mockInstance = getMockInstance();
      mockInstance.delete.mockResolvedValueOnce({ data: { success: true } });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.deleteUserStory('story-1');

      expect(mockInstance.delete).toHaveBeenCalledWith('/user-stories/story-1');
    });
  });

  describe('Tasks API', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('fetchTasks calls endpoint with user story filter', async () => {
      const mockInstance = getMockInstance();
      mockInstance.get.mockResolvedValueOnce({
        data: { data: [{ id: 1, title: 'Task 1' }] },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.fetchTasks('story-123');

      expect(mockInstance.get).toHaveBeenCalledWith(
        '/tasks',
        expect.objectContaining({
          params: expect.objectContaining({
            filters: expect.objectContaining({
              userStory: { documentId: 'story-123' },
            }),
          }),
        })
      );
    });

    it('createTask posts data with connected user story', async () => {
      const mockInstance = getMockInstance();
      mockInstance.post.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'task-1', title: 'New Task' } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      const taskData = {
        title: 'New Task',
        details: 'Task details',
        priority: 1,
        userStory: 'story-123',
      };

      await service.createTask(taskData);

      expect(mockInstance.post).toHaveBeenCalledWith(
        '/tasks',
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Task',
            userStory: { connect: ['story-123'] },
          }),
        }),
        expect.any(Object)
      );
    });

    it('updateTask puts data to correct endpoint', async () => {
      const mockInstance = getMockInstance();
      mockInstance.put.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'task-1', title: 'Updated Task' } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      // originalDocument is intentionally unused - we just need to call the function
      await service.updateTask('task-1', { title: 'Updated Task' });

      expect(mockInstance.put).toHaveBeenCalledWith(
        '/tasks/task-1',
        expect.objectContaining({
          data: { title: 'Updated Task' },
        }),
        expect.any(Object)
      );
    });

    it('deleteTask calls delete on correct endpoint', async () => {
      const mockInstance = getMockInstance();
      mockInstance.delete.mockResolvedValueOnce({ data: { success: true } });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.deleteTask('task-1');

      expect(mockInstance.delete).toHaveBeenCalledWith('/tasks/task-1');
    });
  });

  describe('Comments API', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('fetchCommentsForTarget calls endpoint with target filter', async () => {
      const mockInstance = getMockInstance();
      mockInstance.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 1,
              documentId: 'comment-1',
              body: 'Hello',
              status: 'open',
              mentions: [],
              authorId: 'user-1',
              authorName: 'Test User',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.fetchCommentsForTarget('feature', 'feature-123');

      expect(mockInstance.get).toHaveBeenCalledWith(
        '/comments',
        expect.objectContaining({
          params: expect.objectContaining({
            filters: expect.objectContaining({
              feature: { documentId: 'feature-123' },
            }),
            populate: expect.any(Object),
          }),
        })
      );
    });

    it('createComment posts data with target relation', async () => {
      const mockInstance = getMockInstance();
      mockInstance.post.mockResolvedValueOnce({
        data: {
          data: {
            id: 1,
            documentId: 'comment-1',
            body: 'New comment',
            status: 'open',
            mentions: ['user-2'],
            authorId: 'user-1',
            authorName: 'Test User',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.createComment({
        targetType: 'task',
        targetId: 'task-123',
        parentId: 'comment-parent',
        body: 'New comment',
        mentions: ['user-2'],
        authorId: 'user-1',
        authorName: 'Test User',
        status: 'open',
      });

      expect(mockInstance.post).toHaveBeenCalledWith(
        '/comments',
        expect.objectContaining({
          data: expect.objectContaining({
            body: 'New comment',
            task: { connect: ['task-123'] },
            parent: { connect: ['comment-parent'] },
          }),
        }),
        expect.any(Object)
      );
    });

    it('updateComment puts data to correct endpoint', async () => {
      const mockInstance = getMockInstance();
      mockInstance.put.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'comment-1', status: 'resolved' } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.updateComment('comment-1', {
        status: 'resolved',
        resolvedAt: '2026-01-02T00:00:00.000Z',
        resolvedBy: 'user-1',
      });

      expect(mockInstance.put).toHaveBeenCalledWith('/comments/comment-1', {
        data: {
          status: 'resolved',
          resolvedAt: '2026-01-02T00:00:00.000Z',
          resolvedBy: 'user-1',
        },
      });
    });

    it('deleteComment calls delete on correct endpoint', async () => {
      const mockInstance = getMockInstance();
      mockInstance.delete.mockResolvedValueOnce({ data: { success: true } });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.deleteComment('comment-1');

      expect(mockInstance.delete).toHaveBeenCalledWith('/comments/comment-1');
    });

    it('fetchCommentNotificationsForUser calls endpoint with user filter', async () => {
      const mockInstance = getMockInstance();
      mockInstance.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 1,
              documentId: 'notif-1',
              channel: 'in_app',
              status: 'unread',
              createdAt: '2026-01-01T00:00:00.000Z',
              comment: { documentId: 'comment-1' },
              user: { documentId: 'user-1' },
            },
          ],
        },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.fetchCommentNotificationsForUser('user-1');

      expect(mockInstance.get).toHaveBeenCalledWith(
        '/comment-notifications',
        expect.objectContaining({
          params: expect.objectContaining({
            filters: expect.objectContaining({
              user: { documentId: 'user-1' },
            }),
          }),
        })
      );
    });

    it('markCommentNotificationsRead updates unread in-app notifications', async () => {
      const mockInstance = getMockInstance();
      mockInstance.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 1,
              documentId: 'notif-1',
              channel: 'in_app',
              status: 'unread',
              createdAt: '2026-01-01T00:00:00.000Z',
              comment: { documentId: 'comment-1' },
              user: { documentId: 'user-1' },
            },
          ],
        },
      });
      mockInstance.put.mockResolvedValueOnce({ data: { success: true } });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.markCommentNotificationsRead('user-1');

      expect(mockInstance.put).toHaveBeenCalledWith('/comment-notifications/notif-1', {
        data: { status: 'read' },
      });
    });
  });

  describe('Position Updates', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('updateEpicPosition updates position', async () => {
      const mockInstance = getMockInstance();
      mockInstance.put.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'epic-1', position: 2 } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.updateEpicPosition('epic-1', 2);

      expect(mockInstance.put).toHaveBeenCalledWith(
        '/epics/epic-1',
        expect.objectContaining({
          data: expect.objectContaining({ position: 2 }),
        }),
        expect.any(Object)
      );
    });

    it('updateFeaturePosition updates position and optionally parent', async () => {
      const mockInstance = getMockInstance();
      mockInstance.put.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'feature-1', position: 3 } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.updateFeaturePosition('feature-1', 3, 'epic-new');

      expect(mockInstance.put).toHaveBeenCalledWith(
        '/features/feature-1',
        expect.objectContaining({
          data: expect.objectContaining({
            position: 3,
            epic: { connect: ['epic-new'] },
          }),
        }),
        expect.any(Object)
      );
    });

    it('updateUserStoryPosition updates position and optionally parent', async () => {
      const mockInstance = getMockInstance();
      mockInstance.put.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'story-1', position: 1 } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.updateUserStoryPosition('story-1', 1, 'feature-new');

      expect(mockInstance.put).toHaveBeenCalledWith(
        '/user-stories/story-1',
        expect.objectContaining({
          data: expect.objectContaining({
            position: 1,
            feature: { connect: ['feature-new'] },
          }),
        }),
        expect.any(Object)
      );
    });

    it('updateTaskPosition updates position and optionally parent', async () => {
      const mockInstance = getMockInstance();
      mockInstance.put.mockResolvedValueOnce({
        data: { data: { id: 1, documentId: 'task-1', position: 0 } },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.updateTaskPosition('task-1', 0, 'story-new');

      expect(mockInstance.put).toHaveBeenCalledWith(
        '/tasks/task-1',
        expect.objectContaining({
          data: expect.objectContaining({
            position: 0,
            userStory: { connect: ['story-new'] },
          }),
        }),
        expect.any(Object)
      );
    });
  });

  describe('Batch Operations', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('batchUpdatePositions updates multiple items', async () => {
      const mockInstance = getMockInstance();
      mockInstance.put.mockResolvedValue({ data: { success: true } });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      const items = [
        { documentId: 'epic-1', position: 0 },
        { documentId: 'epic-2', position: 1 },
        { documentId: 'epic-3', position: 2 },
      ];

      await service.batchUpdatePositions('epics', items);

      expect(mockInstance.put).toHaveBeenCalledTimes(3);
      expect(mockInstance.put).toHaveBeenCalledWith(
        '/epics/epic-1',
        expect.objectContaining({
          data: { position: 0 },
        })
      );
      expect(mockInstance.put).toHaveBeenCalledWith(
        '/epics/epic-2',
        expect.objectContaining({
          data: { position: 1 },
        })
      );
      expect(mockInstance.put).toHaveBeenCalledWith(
        '/epics/epic-3',
        expect.objectContaining({
          data: { position: 2 },
        })
      );
    });

    it('batchUpdatePositions works for different item types', async () => {
      const mockInstance = getMockInstance();
      mockInstance.put.mockResolvedValue({ data: { success: true } });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.batchUpdatePositions('features', [{ documentId: 'f-1', position: 0 }]);
      expect(mockInstance.put).toHaveBeenCalledWith('/features/f-1', expect.any(Object));

      vi.clearAllMocks();
      await service.batchUpdatePositions('user-stories', [{ documentId: 's-1', position: 0 }]);
      expect(mockInstance.put).toHaveBeenCalledWith('/user-stories/s-1', expect.any(Object));

      vi.clearAllMocks();
      await service.batchUpdatePositions('tasks', [{ documentId: 't-1', position: 0 }]);
      expect(mockInstance.put).toHaveBeenCalledWith('/tasks/t-1', expect.any(Object));
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('handles Strapi API errors', async () => {
      const mockInstance = getMockInstance();
      const strapiError = {
        isAxiosError: true,
        response: {
          data: {
            error: {
              status: 400,
              name: 'BadRequest',
              message: 'Invalid data',
              details: {},
            },
          },
        },
      };
      mockInstance.get.mockRejectedValueOnce(strapiError);
      (axios.isAxiosError as any).mockReturnValueOnce(true);

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.fetchApps()).rejects.toThrow('Invalid data');

      consoleSpy.mockRestore();
    });

    it('handles generic errors', async () => {
      const mockInstance = getMockInstance();
      mockInstance.get.mockRejectedValueOnce(new Error('Network error'));

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await expect(service.fetchApps()).rejects.toThrow('Network error');
    });

    it('handles unknown errors', async () => {
      const mockInstance = getMockInstance();
      mockInstance.get.mockRejectedValueOnce('Unknown error string');

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await expect(service.fetchApps()).rejects.toThrow('An unknown error occurred');
    });
  });

  describe('fetchAllAppData', () => {
    it('delegates to fetchAppById', async () => {
      const mockInstance = getMockInstance();
      const mockAppData = {
        documentId: 'app-123',
        epics: [],
        globalInformation: 'Test app',
      };
      mockInstance.get.mockResolvedValueOnce({
        data: { data: mockAppData },
      });

      vi.resetModules();
      const { strapiService: service } = await import('./strapi-service');

      await service.fetchAllAppData('app-123');

      expect(mockInstance.get).toHaveBeenCalledWith(
        '/apps/app-123',
        expect.any(Object)
      );
    });
  });
});
