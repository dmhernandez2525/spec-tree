import { describe, it, expect, vi, beforeEach } from 'vitest';
import sowReducer, {
  updateSelectedModel,
  setSow,
  addEpics,
  addFeature,
  addUserStory,
  addTask,
  deleteEpic,
  deleteFeature,
  deleteUserStory,
  deleteTask,
  updateTaskField,
} from './sow-slice';
import type { SowState } from '../../components/spec-tree/lib/types/work-items';
import { TaskFields } from '../../components/spec-tree/lib/types/work-items';

// Mock the dependencies
vi.mock('../../components/spec-tree/lib/api/openai', () => ({
  generateAdditionalFeatures: vi.fn(),
  generateAdditionalEpics: vi.fn(),
  generateUserStories: vi.fn(),
  generateTasks: vi.fn(),
}));

vi.mock('../../components/spec-tree/lib/api/strapi-service', () => ({
  strapiService: {
    fetchAllAppData: vi.fn(),
    createEpic: vi.fn(),
    createFeature: vi.fn(),
    createUserStory: vi.fn(),
    createTask: vi.fn(),
  },
}));

vi.mock('../utils/strapi-transformers', () => ({
  transformStrapiDataToSow: vi.fn(),
}));

describe('sow-slice', () => {
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

  describe('updateSelectedModel', () => {
    it('updates the selected model', () => {
      const newState = sowReducer(initialState, updateSelectedModel('gpt-4o'));
      expect(newState.selectedModel).toBe('gpt-4o');
    });
  });

  describe('setSow', () => {
    it('updates sow state with provided values', () => {
      const payload = {
        sow: {
          id: 'test-app-id',
          chatApi: 'ActiveState',
          globalInformation: 'Test global info',
        },
      };
      const newState = sowReducer(initialState, setSow(payload));
      expect(newState.id).toBe('test-app-id');
      expect(newState.chatApi).toBe('ActiveState');
      expect(newState.globalInformation).toBe('Test global info');
    });

    it('does nothing when payload is empty', () => {
      const newState = sowReducer(initialState, setSow({ sow: undefined }));
      expect(newState).toEqual(initialState);
    });

    it('updates epics when provided', () => {
      const payload = {
        sow: {
          epics: {
            'epic-1': {
              id: 'epic-1',
              title: 'Test Epic',
              description: '',
              goal: '',
              successCriteria: [],
              dependencies: [],
              timeline: '',
              resources: [],
              risksAndMitigation: [],
              notes: '',
              featureIds: [],
              contextualQuestions: [],
              documentId: 'epic-1',
            },
          },
        },
      };
      const newState = sowReducer(initialState, setSow(payload as any));
      expect(newState.epics['epic-1']).toBeDefined();
      expect(newState.epics['epic-1'].title).toBe('Test Epic');
    });
  });

  describe('addEpics', () => {
    it('adds an epic to state', () => {
      const epic = {
        id: 'epic-1',
        title: 'New Epic',
        description: 'Epic description',
        goal: 'Epic goal',
        successCriteria: [],
        dependencies: [],
        timeline: '',
        resources: [],
        risksAndMitigation: [],
        notes: '',
        featureIds: [],
        contextualQuestions: [],
        documentId: 'epic-1',
      };
      const newState = sowReducer(initialState, addEpics(epic));
      expect(newState.epics['epic-1']).toEqual(epic);
    });

    it('does nothing for invalid epic', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const newState = sowReducer(initialState, addEpics({} as any));
      expect(Object.keys(newState.epics)).toHaveLength(0);
      consoleSpy.mockRestore();
    });
  });

  describe('addFeature', () => {
    it('adds a feature and updates parent epic', () => {
      const stateWithEpic: SowState = {
        ...initialState,
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Epic',
            description: '',
            goal: '',
            successCriteria: [],
            dependencies: [],
            timeline: '',
            resources: [],
            risksAndMitigation: [],
            notes: '',
            featureIds: [],
            contextualQuestions: [],
            documentId: 'epic-1',
          },
        },
      };

      const feature = {
        id: 'feature-1',
        title: 'New Feature',
        description: '',
        status: 'Not Started' as const,
        priority: 1,
        notes: '',
        userStoryIds: [],
        parentEpicId: 'epic-1',
        acceptanceCriteria: [],
        contextualQuestions: [],
        documentId: 'feature-1',
      };

      const newState = sowReducer(stateWithEpic, addFeature(feature));
      expect(newState.features['feature-1']).toEqual(feature);
      expect(newState.epics['epic-1'].featureIds).toContain('feature-1');
    });
  });

  describe('addUserStory', () => {
    it('adds a user story and updates parent feature', () => {
      const stateWithFeature: SowState = {
        ...initialState,
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature',
            description: '',
            status: 'Not Started',
            priority: 1,
            notes: '',
            userStoryIds: [],
            parentEpicId: 'epic-1',
            acceptanceCriteria: [],
            contextualQuestions: [],
            documentId: 'feature-1',
          },
        },
      };

      const userStory = {
        id: 'story-1',
        title: 'New User Story',
        description: '',
        storyPoints: 3,
        priority: 1,
        notes: '',
        taskIds: [],
        parentFeatureId: 'feature-1',
        acceptanceCriteria: [],
        contextualQuestions: [],
        documentId: 'story-1',
      };

      const newState = sowReducer(stateWithFeature, addUserStory(userStory));
      expect(newState.userStories['story-1']).toEqual(userStory);
      expect(newState.features['feature-1'].userStoryIds).toContain('story-1');
    });
  });

  describe('addTask', () => {
    it('adds a task and updates parent user story', () => {
      const stateWithStory: SowState = {
        ...initialState,
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Story',
            description: '',
            storyPoints: 3,
            priority: 1,
            notes: '',
            taskIds: [],
            parentFeatureId: 'feature-1',
            acceptanceCriteria: [],
            contextualQuestions: [],
            documentId: 'story-1',
          },
        },
      };

      const task = {
        id: 'task-1',
        title: 'New Task',
        details: 'Task details',
        priority: 1,
        notes: '',
        parentUserStoryId: 'story-1',
        contextualQuestions: [],
        documentId: 'task-1',
      };

      const newState = sowReducer(stateWithStory, addTask(task));
      expect(newState.tasks['task-1']).toEqual(task);
      expect(newState.userStories['story-1'].taskIds).toContain('task-1');
    });
  });

  describe('deleteEpic', () => {
    it('removes an epic from state', () => {
      const stateWithEpic: SowState = {
        ...initialState,
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Epic',
            description: '',
            goal: '',
            successCriteria: [],
            dependencies: [],
            timeline: '',
            resources: [],
            risksAndMitigation: [],
            notes: '',
            featureIds: [],
            contextualQuestions: [],
            documentId: 'epic-1',
          },
        },
      };

      const newState = sowReducer(stateWithEpic, deleteEpic('epic-1'));
      expect(newState.epics['epic-1']).toBeUndefined();
    });
  });

  describe('deleteFeature', () => {
    it('removes a feature and updates parent epic', () => {
      const stateWithFeature: SowState = {
        ...initialState,
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Epic',
            description: '',
            goal: '',
            successCriteria: [],
            dependencies: [],
            timeline: '',
            resources: [],
            risksAndMitigation: [],
            notes: '',
            featureIds: ['feature-1'],
            contextualQuestions: [],
            documentId: 'epic-1',
          },
        },
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature',
            description: '',
            status: 'Not Started',
            priority: 1,
            notes: '',
            userStoryIds: [],
            parentEpicId: 'epic-1',
            acceptanceCriteria: [],
            contextualQuestions: [],
            documentId: 'feature-1',
          },
        },
      };

      const newState = sowReducer(stateWithFeature, deleteFeature('feature-1'));
      expect(newState.features['feature-1']).toBeUndefined();
      expect(newState.epics['epic-1'].featureIds).not.toContain('feature-1');
    });
  });

  describe('updateTaskField', () => {
    it('updates task title', () => {
      const stateWithTask: SowState = {
        ...initialState,
        tasks: {
          'task-1': {
            id: 'task-1',
            title: 'Old Title',
            details: '',
            priority: 1,
            notes: '',
            parentUserStoryId: 'story-1',
            contextualQuestions: [],
            documentId: 'task-1',
          },
        },
      };

      const newState = sowReducer(
        stateWithTask,
        updateTaskField({
          taskId: 'task-1',
          field: TaskFields.Title,
          newValue: 'New Title',
        })
      );
      expect(newState.tasks['task-1'].title).toBe('New Title');
    });

    it('updates task priority', () => {
      const stateWithTask: SowState = {
        ...initialState,
        tasks: {
          'task-1': {
            id: 'task-1',
            title: 'Task',
            details: '',
            priority: 1,
            notes: '',
            parentUserStoryId: 'story-1',
            contextualQuestions: [],
            documentId: 'task-1',
          },
        },
      };

      const newState = sowReducer(
        stateWithTask,
        updateTaskField({
          taskId: 'task-1',
          field: TaskFields.Priority,
          newValue: '5',
        })
      );
      expect(newState.tasks['task-1'].priority).toBe(5);
    });
  });
});
