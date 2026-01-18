import { describe, it, expect, vi } from 'vitest';
import sowReducer, {
  updateSelectedModel,
  setSow,
  addEpics,
  addFeature,
  addUserStory,
  addTask,
  addFeatures,
  addUserStories,
  addTasks,
  deleteEpic,
  deleteFeature,
  deleteUserStory,
  deleteTask,
  updateTaskField,
  updateUserStoryField,
  updateFeatureField,
  updateEpicField,
  replaceEpic,
  replaceFeature,
  replaceUserStory,
  replaceTask,
  addContextualQuestionToWorkItem,
  addContextualQuestionsToWorkItem,
  removeContextualQuestionFromWorkItem,
  replaceContextualQuestionFromWorkItem,
  addGlobalContextualQuestion,
  addGlobalContextualQuestions,
  removeGlobalContextualQuestion,
  replaceGlobalContextualQuestions,
  updateGlobalInformation,
  reorderEpics,
  reorderFeatures,
  reorderUserStories,
  reorderTasks,
  moveFeatureToEpic,
  moveUserStoryToFeature,
  moveTaskToUserStory,
  selectEpicById,
  selectFeatureById,
  selectUserStoryById,
  selectTaskById,
  selectAllEpics,
  selectAllFeatures,
  selectAllUserStories,
  selectAllTasks,
  selectGlobalContextualQuestions,
  selectGlobalInformation,
  selectChatApi,
  selectSelectedModel,
} from './sow-slice';
import type { SowState } from '../../components/spec-tree/lib/types/work-items';
import { TaskFields, UserStoryFields } from '../../components/spec-tree/lib/types/work-items';

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

  describe('updateUserStoryField', () => {
    it('updates acceptance criteria by index', () => {
      const stateWithStory: SowState = {
        ...initialState,
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Story',
            role: 'user',
            action: 'do something',
            goal: 'achieve',
            points: '5',
            notes: '',
            taskIds: [],
            parentFeatureId: 'feature-1',
            acceptanceCriteria: [{ text: 'Original AC' }],
            contextualQuestions: [],
            documentId: 'story-1',
          },
        },
      };

      const newState = sowReducer(
        stateWithStory,
        updateUserStoryField({
          userStoryId: 'story-1',
          field: UserStoryFields.AcceptanceCriteria,
          newValue: 'Updated AC',
          arrayIndex: 0,
        })
      );
      expect(newState.userStories['story-1'].acceptanceCriteria[0].text).toBe('Updated AC');
    });
  });

  describe('updateFeatureField', () => {
    it('updates feature title', () => {
      const stateWithFeature: SowState = {
        ...initialState,
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Old Title',
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

      const newState = sowReducer(
        stateWithFeature,
        updateFeatureField({
          featureId: 'feature-1',
          field: 'title',
          newValue: 'New Title',
        })
      );
      expect(newState.features['feature-1'].title).toBe('New Title');
    });
  });

  describe('updateEpicField', () => {
    it('updates epic title', () => {
      const stateWithEpic: SowState = {
        ...initialState,
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Old Title',
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

      const newState = sowReducer(
        stateWithEpic,
        updateEpicField({
          epicName: 'epic-1',
          field: 'title',
          newValue: 'New Title',
        })
      );
      expect(newState.epics['epic-1'].title).toBe('New Title');
    });
  });

  describe('replace operations', () => {
    it('replaceEpic replaces an existing epic', () => {
      const stateWithEpic: SowState = {
        ...initialState,
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Old Title',
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

      const newEpic = {
        id: 'epic-1',
        title: 'New Title',
        description: 'New Desc',
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
      };

      const newState = sowReducer(stateWithEpic, replaceEpic({ epic: newEpic }));
      expect(newState.epics['epic-1'].title).toBe('New Title');
    });

    it('replaceFeature replaces an existing feature', () => {
      const stateWithFeature: SowState = {
        ...initialState,
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Old Title',
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

      const newFeature = {
        id: 'feature-1',
        title: 'New Title',
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

      const newState = sowReducer(stateWithFeature, replaceFeature({ feature: newFeature }));
      expect(newState.features['feature-1'].title).toBe('New Title');
    });
  });

  describe('contextual questions', () => {
    it('addGlobalContextualQuestion adds to global', () => {
      const question = { id: 'q-1', question: 'Q?', answer: '' };
      const newState = sowReducer(initialState, addGlobalContextualQuestion(question));
      expect(newState.contextualQuestions).toHaveLength(1);
    });

    it('addGlobalContextualQuestions adds multiple', () => {
      const questions = [
        { id: 'q-1', question: 'Q1?', answer: '' },
        { id: 'q-2', question: 'Q2?', answer: '' },
      ];
      const newState = sowReducer(initialState, addGlobalContextualQuestions(questions));
      expect(newState.contextualQuestions).toHaveLength(2);
    });

    it('removeGlobalContextualQuestion removes from global', () => {
      const stateWithQuestions: SowState = {
        ...initialState,
        contextualQuestions: [{ id: 'q-1', question: 'Q?', answer: '' }],
      };
      const newState = sowReducer(stateWithQuestions, removeGlobalContextualQuestion('q-1'));
      expect(newState.contextualQuestions).toHaveLength(0);
    });

    it('replaceGlobalContextualQuestions updates answer', () => {
      const stateWithQuestions: SowState = {
        ...initialState,
        contextualQuestions: [{ id: 'q-1', question: 'Q?', answer: '' }],
      };
      const newState = sowReducer(
        stateWithQuestions,
        replaceGlobalContextualQuestions({ value: 'New Answer', index: 0 })
      );
      expect(newState.contextualQuestions[0].answer).toBe('New Answer');
    });

    it('addContextualQuestionToWorkItem adds to epic', () => {
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
      const question = { id: 'q-1', question: 'Q?', answer: '' };
      const newState = sowReducer(
        stateWithEpic,
        addContextualQuestionToWorkItem({
          workItemId: 'epic-1',
          question,
          workItemType: 'epics',
        })
      );
      expect(newState.epics['epic-1'].contextualQuestions).toHaveLength(1);
    });
  });

  describe('updateGlobalInformation', () => {
    it('updates global information', () => {
      const newState = sowReducer(initialState, updateGlobalInformation('New Info'));
      expect(newState.globalInformation).toBe('New Info');
    });
  });

  describe('reorder operations', () => {
    it('reorderEpics reorders epics', () => {
      const stateWithEpics: SowState = {
        ...initialState,
        epics: {
          'epic-1': { id: 'epic-1', title: 'First', featureIds: [], contextualQuestions: [], documentId: 'epic-1' } as any,
          'epic-2': { id: 'epic-2', title: 'Second', featureIds: [], contextualQuestions: [], documentId: 'epic-2' } as any,
        },
      };

      const newState = sowReducer(
        stateWithEpics,
        reorderEpics({ sourceIndex: 0, destinationIndex: 1 })
      );

      const epicIds = Object.keys(newState.epics);
      expect(epicIds).toEqual(['epic-2', 'epic-1']);
    });

    it('reorderFeatures reorders features within epic', () => {
      const stateWithData: SowState = {
        ...initialState,
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Epic',
            featureIds: ['f-1', 'f-2', 'f-3'],
            contextualQuestions: [],
            documentId: 'epic-1',
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithData,
        reorderFeatures({ epicId: 'epic-1', sourceIndex: 0, destinationIndex: 2 })
      );

      expect(newState.epics['epic-1'].featureIds).toEqual(['f-2', 'f-3', 'f-1']);
    });

    it('reorderUserStories reorders stories within feature', () => {
      const stateWithData: SowState = {
        ...initialState,
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature',
            userStoryIds: ['s-1', 's-2', 's-3'],
            parentEpicId: 'epic-1',
            contextualQuestions: [],
            acceptanceCriteria: [],
            documentId: 'feature-1',
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithData,
        reorderUserStories({ featureId: 'feature-1', sourceIndex: 0, destinationIndex: 2 })
      );

      expect(newState.features['feature-1'].userStoryIds).toEqual(['s-2', 's-3', 's-1']);
    });

    it('reorderTasks reorders tasks within user story', () => {
      const stateWithData: SowState = {
        ...initialState,
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Story',
            taskIds: ['t-1', 't-2', 't-3'],
            parentFeatureId: 'feature-1',
            contextualQuestions: [],
            acceptanceCriteria: [],
            documentId: 'story-1',
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithData,
        reorderTasks({ userStoryId: 'story-1', sourceIndex: 0, destinationIndex: 2 })
      );

      expect(newState.userStories['story-1'].taskIds).toEqual(['t-2', 't-3', 't-1']);
    });
  });

  describe('move operations', () => {
    it('moveFeatureToEpic moves feature between epics', () => {
      const stateWithData: SowState = {
        ...initialState,
        epics: {
          'epic-1': { id: 'epic-1', title: 'Epic 1', featureIds: ['feature-1'], contextualQuestions: [], documentId: 'epic-1' } as any,
          'epic-2': { id: 'epic-2', title: 'Epic 2', featureIds: [], contextualQuestions: [], documentId: 'epic-2' } as any,
        },
        features: {
          'feature-1': { id: 'feature-1', title: 'Feature', parentEpicId: 'epic-1', userStoryIds: [], contextualQuestions: [], acceptanceCriteria: [], documentId: 'feature-1' } as any,
        },
      };

      const newState = sowReducer(
        stateWithData,
        moveFeatureToEpic({
          featureId: 'feature-1',
          sourceEpicId: 'epic-1',
          destinationEpicId: 'epic-2',
          destinationIndex: 0,
        })
      );

      expect(newState.epics['epic-1'].featureIds).not.toContain('feature-1');
      expect(newState.epics['epic-2'].featureIds).toContain('feature-1');
      expect(newState.features['feature-1'].parentEpicId).toBe('epic-2');
    });

    it('moveUserStoryToFeature moves story between features', () => {
      const stateWithData: SowState = {
        ...initialState,
        features: {
          'feature-1': { id: 'feature-1', title: 'F1', userStoryIds: ['story-1'], parentEpicId: 'epic-1', contextualQuestions: [], acceptanceCriteria: [], documentId: 'feature-1' } as any,
          'feature-2': { id: 'feature-2', title: 'F2', userStoryIds: [], parentEpicId: 'epic-1', contextualQuestions: [], acceptanceCriteria: [], documentId: 'feature-2' } as any,
        },
        userStories: {
          'story-1': { id: 'story-1', title: 'Story', parentFeatureId: 'feature-1', taskIds: [], contextualQuestions: [], acceptanceCriteria: [], documentId: 'story-1' } as any,
        },
      };

      const newState = sowReducer(
        stateWithData,
        moveUserStoryToFeature({
          userStoryId: 'story-1',
          sourceFeatureId: 'feature-1',
          destinationFeatureId: 'feature-2',
          destinationIndex: 0,
        })
      );

      expect(newState.features['feature-1'].userStoryIds).not.toContain('story-1');
      expect(newState.features['feature-2'].userStoryIds).toContain('story-1');
      expect(newState.userStories['story-1'].parentFeatureId).toBe('feature-2');
    });

    it('moveTaskToUserStory moves task between user stories', () => {
      const stateWithData: SowState = {
        ...initialState,
        userStories: {
          'story-1': { id: 'story-1', title: 'S1', taskIds: ['task-1'], parentFeatureId: 'feature-1', contextualQuestions: [], acceptanceCriteria: [], documentId: 'story-1' } as any,
          'story-2': { id: 'story-2', title: 'S2', taskIds: [], parentFeatureId: 'feature-1', contextualQuestions: [], acceptanceCriteria: [], documentId: 'story-2' } as any,
        },
        tasks: {
          'task-1': { id: 'task-1', title: 'Task', parentUserStoryId: 'story-1', contextualQuestions: [], documentId: 'task-1' } as any,
        },
      };

      const newState = sowReducer(
        stateWithData,
        moveTaskToUserStory({
          taskId: 'task-1',
          sourceUserStoryId: 'story-1',
          destinationUserStoryId: 'story-2',
          destinationIndex: 0,
        })
      );

      expect(newState.userStories['story-1'].taskIds).not.toContain('task-1');
      expect(newState.userStories['story-2'].taskIds).toContain('task-1');
      expect(newState.tasks['task-1'].parentUserStoryId).toBe('story-2');
    });
  });

  describe('batch add operations', () => {
    it('addFeatures adds feature and updates epic', () => {
      const stateWithEpic: SowState = {
        ...initialState,
        epics: {
          'epic-1': { id: 'epic-1', title: 'Epic', featureIds: [], contextualQuestions: [], documentId: 'epic-1' } as any,
        },
      };

      const feature = {
        id: 'feature-1',
        title: 'Feature',
        description: '',
        parentEpicId: 'epic-1',
        userStoryIds: [],
        acceptanceCriteria: [],
        contextualQuestions: [],
        documentId: 'feature-1',
      } as any;

      const newState = sowReducer(stateWithEpic, addFeatures(feature));
      expect(newState.features['feature-1']).toBeDefined();
      expect(newState.epics['epic-1'].featureIds).toContain('feature-1');
    });

    it('addUserStories adds user story and updates feature', () => {
      const stateWithFeature: SowState = {
        ...initialState,
        features: {
          'feature-1': { id: 'feature-1', title: 'F', userStoryIds: [], parentEpicId: 'epic-1', acceptanceCriteria: [], contextualQuestions: [], documentId: 'feature-1' } as any,
        },
      };

      const userStory = {
        id: 'story-1',
        title: 'Story',
        parentFeatureId: 'feature-1',
        taskIds: [],
        acceptanceCriteria: [],
        contextualQuestions: [],
        documentId: 'story-1',
      } as any;

      const newState = sowReducer(stateWithFeature, addUserStories(userStory));
      expect(newState.userStories['story-1']).toBeDefined();
      expect(newState.features['feature-1'].userStoryIds).toContain('story-1');
    });

    it('addTasks adds task and updates user story', () => {
      const stateWithStory: SowState = {
        ...initialState,
        userStories: {
          'story-1': { id: 'story-1', title: 'S', taskIds: [], parentFeatureId: 'feature-1', acceptanceCriteria: [], contextualQuestions: [], documentId: 'story-1' } as any,
        },
      };

      const task = {
        id: 'task-1',
        title: 'Task',
        parentUserStoryId: 'story-1',
        contextualQuestions: [],
        documentId: 'task-1',
      } as any;

      const newState = sowReducer(stateWithStory, addTasks(task));
      expect(newState.tasks['task-1']).toBeDefined();
      expect(newState.userStories['story-1'].taskIds).toContain('task-1');
    });
  });

  describe('selectors', () => {
    const stateWithData = {
      sow: {
        ...initialState,
        epics: { 'epic-1': { id: 'epic-1', title: 'Test Epic' } },
        features: { 'feature-1': { id: 'feature-1', title: 'Test Feature' } },
        userStories: { 'story-1': { id: 'story-1', title: 'Test Story' } },
        tasks: { 'task-1': { id: 'task-1', title: 'Test Task' } },
        contextualQuestions: [{ id: 'q-1', question: 'Q?', answer: '' }],
        globalInformation: 'Test Info',
        chatApi: 'TestApi',
        selectedModel: 'gpt-4',
      },
    } as any;

    it('selectEpicById returns epic by id', () => {
      const epic = selectEpicById(stateWithData, 'epic-1');
      expect(epic?.title).toBe('Test Epic');
    });

    it('selectFeatureById returns feature by id', () => {
      const feature = selectFeatureById(stateWithData, 'feature-1');
      expect(feature?.title).toBe('Test Feature');
    });

    it('selectUserStoryById returns user story by id', () => {
      const story = selectUserStoryById(stateWithData, 'story-1');
      expect(story?.title).toBe('Test Story');
    });

    it('selectTaskById returns task by id', () => {
      const task = selectTaskById(stateWithData, 'task-1');
      expect(task?.title).toBe('Test Task');
    });

    it('selectAllEpics returns all epics', () => {
      const epics = selectAllEpics(stateWithData);
      expect(epics).toHaveLength(1);
    });

    it('selectAllFeatures returns all features', () => {
      const features = selectAllFeatures(stateWithData);
      expect(features).toHaveLength(1);
    });

    it('selectAllUserStories returns all user stories', () => {
      const stories = selectAllUserStories(stateWithData);
      expect(stories).toHaveLength(1);
    });

    it('selectAllTasks returns all tasks', () => {
      const tasks = selectAllTasks(stateWithData);
      expect(tasks).toHaveLength(1);
    });

    it('selectGlobalContextualQuestions returns global questions', () => {
      const questions = selectGlobalContextualQuestions(stateWithData);
      expect(questions).toHaveLength(1);
    });

    it('selectGlobalInformation returns global info', () => {
      const info = selectGlobalInformation(stateWithData);
      expect(info).toBe('Test Info');
    });

    it('selectChatApi returns chat API', () => {
      const api = selectChatApi(stateWithData);
      expect(api).toBe('TestApi');
    });

    it('selectSelectedModel returns selected model', () => {
      const model = selectSelectedModel(stateWithData);
      expect(model).toBe('gpt-4');
    });

    it('selectSelectedModel returns default when not set', () => {
      const emptyState = { sow: { ...initialState, selectedModel: undefined } } as any;
      const model = selectSelectedModel(emptyState);
      expect(model).toBe('gpt-3.5-turbo-16k');
    });
  });

  describe('deleteUserStory', () => {
    it('removes user story and updates parent feature', () => {
      const stateWithData: SowState = {
        ...initialState,
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature',
            description: '',
            status: 'Not Started',
            priority: 1,
            notes: '',
            userStoryIds: ['story-1', 'story-2'],
            parentEpicId: 'epic-1',
            acceptanceCriteria: [],
            contextualQuestions: [],
            documentId: 'feature-1',
          },
        },
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Story 1',
            parentFeatureId: 'feature-1',
            taskIds: [],
            acceptanceCriteria: [],
            contextualQuestions: [],
          } as any,
          'story-2': {
            id: 'story-2',
            title: 'Story 2',
            parentFeatureId: 'feature-1',
            taskIds: [],
            acceptanceCriteria: [],
            contextualQuestions: [],
          } as any,
        },
      };

      const newState = sowReducer(stateWithData, deleteUserStory('story-1'));
      expect(newState.userStories['story-1']).toBeUndefined();
      expect(newState.features['feature-1'].userStoryIds).toEqual(['story-2']);
    });
  });

  describe('deleteTask', () => {
    it('removes task and updates parent user story', () => {
      const stateWithData: SowState = {
        ...initialState,
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Story',
            parentFeatureId: 'feature-1',
            taskIds: ['task-1', 'task-2'],
            acceptanceCriteria: [],
            contextualQuestions: [],
          } as any,
        },
        tasks: {
          'task-1': {
            id: 'task-1',
            title: 'Task 1',
            parentUserStoryId: 'story-1',
            contextualQuestions: [],
          } as any,
          'task-2': {
            id: 'task-2',
            title: 'Task 2',
            parentUserStoryId: 'story-1',
            contextualQuestions: [],
          } as any,
        },
      };

      const newState = sowReducer(stateWithData, deleteTask('task-1'));
      expect(newState.tasks['task-1']).toBeUndefined();
      expect(newState.userStories['story-1'].taskIds).toEqual(['task-2']);
    });
  });

  describe('replaceUserStory', () => {
    it('replaces an existing user story', () => {
      const stateWithStory: SowState = {
        ...initialState,
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Old Title',
            parentFeatureId: 'feature-1',
            taskIds: [],
            acceptanceCriteria: [],
            contextualQuestions: [],
          } as any,
        },
      };

      const newUserStory = {
        id: 'story-1',
        title: 'New Title',
        description: 'New Description',
        parentFeatureId: 'feature-1',
        taskIds: ['task-1'],
        acceptanceCriteria: [{ text: 'AC1' }],
        contextualQuestions: [],
      } as any;

      const newState = sowReducer(stateWithStory, replaceUserStory({ userStory: newUserStory }));
      expect(newState.userStories['story-1'].title).toBe('New Title');
      expect(newState.userStories['story-1'].taskIds).toContain('task-1');
    });
  });

  describe('replaceTask', () => {
    it('replaces an existing task', () => {
      const stateWithTask: SowState = {
        ...initialState,
        tasks: {
          'task-1': {
            id: 'task-1',
            title: 'Old Title',
            details: '',
            priority: 1,
            parentUserStoryId: 'story-1',
            contextualQuestions: [],
          } as any,
        },
      };

      const newTask = {
        id: 'task-1',
        title: 'New Title',
        details: 'New Details',
        priority: 3,
        parentUserStoryId: 'story-1',
        contextualQuestions: [],
      } as any;

      const newState = sowReducer(stateWithTask, replaceTask({ task: newTask }));
      expect(newState.tasks['task-1'].title).toBe('New Title');
      expect(newState.tasks['task-1'].priority).toBe(3);
    });
  });

  describe('updateTaskField additional cases', () => {
    it('updates task details', () => {
      const stateWithTask: SowState = {
        ...initialState,
        tasks: {
          'task-1': {
            id: 'task-1',
            title: 'Task',
            details: 'Old details',
            priority: 1,
            notes: '',
            parentUserStoryId: 'story-1',
            contextualQuestions: [],
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithTask,
        updateTaskField({
          taskId: 'task-1',
          field: TaskFields.Details,
          newValue: 'New details',
        })
      );
      expect(newState.tasks['task-1'].details).toBe('New details');
    });

    it('updates task notes', () => {
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
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithTask,
        updateTaskField({
          taskId: 'task-1',
          field: TaskFields.Notes,
          newValue: 'New notes',
        })
      );
      expect(newState.tasks['task-1'].notes).toBe('New notes');
    });

    it('does nothing for non-existent task', () => {
      const newState = sowReducer(
        initialState,
        updateTaskField({
          taskId: 'nonexistent',
          field: TaskFields.Title,
          newValue: 'Test',
        })
      );
      expect(newState).toEqual(initialState);
    });
  });

  describe('updateUserStoryField additional cases', () => {
    it('adds new acceptance criteria with isArrayItem', () => {
      const stateWithStory: SowState = {
        ...initialState,
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Story',
            role: 'user',
            action: 'do',
            goal: 'achieve',
            points: '5',
            notes: '',
            taskIds: [],
            parentFeatureId: 'feature-1',
            acceptanceCriteria: [{ text: 'AC1' }],
            contextualQuestions: [],
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithStory,
        updateUserStoryField({
          userStoryId: 'story-1',
          field: UserStoryFields.AcceptanceCriteria,
          newValue: 'AC2',
          isArrayItem: true,
        })
      );
      expect(newState.userStories['story-1'].acceptanceCriteria).toHaveLength(2);
      expect(newState.userStories['story-1'].acceptanceCriteria[1].text).toBe('AC2');
    });

    it('replaces entire acceptance criteria array', () => {
      const stateWithStory: SowState = {
        ...initialState,
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Story',
            role: 'user',
            action: 'do',
            goal: 'achieve',
            points: '5',
            notes: '',
            taskIds: [],
            parentFeatureId: 'feature-1',
            acceptanceCriteria: [{ text: 'AC1' }, { text: 'AC2' }],
            contextualQuestions: [],
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithStory,
        updateUserStoryField({
          userStoryId: 'story-1',
          field: UserStoryFields.AcceptanceCriteria,
          newValue: ['NewAC1', 'NewAC2', 'NewAC3'],
        })
      );
      expect(newState.userStories['story-1'].acceptanceCriteria).toHaveLength(3);
    });

    it('does nothing for non-existent user story', () => {
      const newState = sowReducer(
        initialState,
        updateUserStoryField({
          userStoryId: 'nonexistent',
          field: UserStoryFields.AcceptanceCriteria,
          newValue: 'Test',
          arrayIndex: 0,
        })
      );
      expect(newState).toEqual(initialState);
    });
  });

  describe('updateFeatureField additional cases', () => {
    it('updates feature description', () => {
      const stateWithFeature: SowState = {
        ...initialState,
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature',
            description: 'Old desc',
            status: 'Not Started',
            priority: 1,
            notes: '',
            userStoryIds: [],
            parentEpicId: 'epic-1',
            acceptanceCriteria: [],
            contextualQuestions: [],
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithFeature,
        updateFeatureField({
          featureId: 'feature-1',
          field: 'description',
          newValue: 'New desc',
        })
      );
      expect(newState.features['feature-1'].description).toBe('New desc');
    });

    it('adds acceptance criteria by index', () => {
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
            acceptanceCriteria: [{ text: 'AC1' }],
            contextualQuestions: [],
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithFeature,
        updateFeatureField({
          featureId: 'feature-1',
          field: 'acceptanceCriteria',
          newValue: 'Updated AC1',
          arrayIndex: 0,
        })
      );
      expect(newState.features['feature-1'].acceptanceCriteria[0].text).toBe('Updated AC1');
    });

    it('adds new acceptance criteria with isArrayItem', () => {
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
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithFeature,
        updateFeatureField({
          featureId: 'feature-1',
          field: 'acceptanceCriteria',
          newValue: 'New AC',
          isArrayItem: true,
        })
      );
      expect(newState.features['feature-1'].acceptanceCriteria).toHaveLength(1);
      expect(newState.features['feature-1'].acceptanceCriteria[0].text).toBe('New AC');
    });

    it('replaces entire acceptance criteria array', () => {
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
            acceptanceCriteria: [{ text: 'Old AC' }],
            contextualQuestions: [],
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithFeature,
        updateFeatureField({
          featureId: 'feature-1',
          field: 'acceptanceCriteria',
          newValue: ['AC1', 'AC2'],
        })
      );
      expect(newState.features['feature-1'].acceptanceCriteria).toHaveLength(2);
    });

    it('does nothing for non-existent feature', () => {
      const newState = sowReducer(
        initialState,
        updateFeatureField({
          featureId: 'nonexistent',
          field: 'title',
          newValue: 'Test',
        })
      );
      expect(newState).toEqual(initialState);
    });
  });

  describe('updateEpicField additional cases', () => {
    it('does nothing for non-existent epic', () => {
      const newState = sowReducer(
        initialState,
        updateEpicField({
          epicName: 'nonexistent',
          field: 'title',
          newValue: 'Test',
        })
      );
      expect(newState).toEqual(initialState);
    });

    it('updates epic description', () => {
      const stateWithEpic: SowState = {
        ...initialState,
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Epic',
            description: 'Old desc',
            goal: '',
            successCriteria: [],
            dependencies: [],
            timeline: '',
            resources: [],
            risksAndMitigation: [],
            notes: '',
            featureIds: [],
            contextualQuestions: [],
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithEpic,
        updateEpicField({
          epicName: 'epic-1',
          field: 'description',
          newValue: 'New desc',
        })
      );
      expect(newState.epics['epic-1'].description).toBe('New desc');
    });
  });

  describe('contextual questions additional cases', () => {
    it('addContextualQuestionsToWorkItem adds multiple questions', () => {
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
          } as any,
        },
      };
      const questions = [
        { id: 'q-1', question: 'Q1?', answer: '' },
        { id: 'q-2', question: 'Q2?', answer: '' },
      ];
      const newState = sowReducer(
        stateWithEpic,
        addContextualQuestionsToWorkItem({
          workItemId: 'epic-1',
          questions,
          workItemType: 'epics',
        })
      );
      expect(newState.epics['epic-1'].contextualQuestions).toHaveLength(2);
    });

    it('removeContextualQuestionFromWorkItem removes question', () => {
      const stateWithQuestions: SowState = {
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
            contextualQuestions: [{ id: 'q-1', question: 'Q1?', answer: '' }],
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithQuestions,
        removeContextualQuestionFromWorkItem({
          workItemId: 'epic-1',
          questionId: 'q-1',
          workItemType: 'epics',
        })
      );
      expect(newState.epics['epic-1'].contextualQuestions).toHaveLength(0);
    });

    it('replaceContextualQuestionFromWorkItem updates answer', () => {
      const stateWithQuestions: SowState = {
        ...initialState,
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature',
            description: '',
            parentEpicId: 'epic-1',
            userStoryIds: [],
            acceptanceCriteria: [],
            contextualQuestions: [{ id: 'q-1', question: 'Q1?', answer: '' }],
          } as any,
        },
      };

      const newState = sowReducer(
        stateWithQuestions,
        replaceContextualQuestionFromWorkItem({
          workItemId: 'feature-1',
          questionId: 'q-1',
          workItemType: 'features',
          value: 'Answer 1',
          index: 0,
        })
      );
      expect(newState.features['feature-1'].contextualQuestions[0].answer).toBe('Answer 1');
    });
  });

  describe('fetchStrapiData async thunk', () => {
    it('handles pending state', () => {
      const action = { type: 'sow/fetchStrapiData/pending' };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(true);
    });

    it('handles fulfilled state', () => {
      const mockSowData = {
        id: 'test-app',
        epics: { 'epic-1': { id: 'epic-1', title: 'Epic 1' } },
        features: {},
        userStories: {},
        tasks: {},
        contextualQuestions: [],
        globalInformation: 'Test info',
      };
      const action = {
        type: 'sow/fetchStrapiData/fulfilled',
        payload: { sow: mockSowData },
      };
      const newState = sowReducer(initialState, action);
      expect(newState.id).toBe('test-app');
      expect(newState.epics['epic-1']).toBeDefined();
    });

    it('handles rejected state', () => {
      const action = {
        type: 'sow/fetchStrapiData/rejected',
        error: { message: 'Failed to fetch data' },
      };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Failed to fetch data');
    });
  });

  describe('requestAdditionalEpics async thunk', () => {
    it('handles pending state', () => {
      const action = { type: 'sow/requestAdditionalEpics/pending' };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(true);
    });

    it('handles fulfilled state with epics', () => {
      const mockEpics = [
        {
          id: 'epic-new',
          appId: 'app-1',
          title: 'New Epic',
          description: 'Description',
          goal: 'Goal',
          successCriteria: 'Criteria',
          dependencies: [],
          timeline: '2 weeks',
          resources: [],
          risksAndMitigation: [],
          notes: '',
        },
      ];
      const action = {
        type: 'sow/requestAdditionalEpics/fulfilled',
        payload: { epics: mockEpics },
      };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.epics['epic-new']).toBeDefined();
      expect(newState.epics['epic-new'].title).toBe('New Epic');
    });

    it('handles fulfilled state with empty epics array', () => {
      const action = {
        type: 'sow/requestAdditionalEpics/fulfilled',
        payload: { epics: [] },
      };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      expect(Object.keys(newState.epics)).toHaveLength(0);
    });

    it('handles rejected state', () => {
      const action = {
        type: 'sow/requestAdditionalEpics/rejected',
        error: { message: 'API Error' },
      };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('API Error');
    });
  });

  describe('requestAdditionalFeatures async thunk', () => {
    it('handles pending state', () => {
      const action = { type: 'sow/requestAdditionalFeatures/pending' };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(true);
    });

    it('handles fulfilled state with features', () => {
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
          } as any,
        },
      };

      const mockFeatures = [
        {
          id: 'feature-new',
          title: 'New Feature',
          description: 'Description',
          details: 'Details',
          dependencies: '',
          acceptanceCriteria: [],
          parentEpicId: 'epic-1',
          notes: '',
          priority: '1',
          effort: '3',
        },
      ];
      const action = {
        type: 'sow/requestAdditionalFeatures/fulfilled',
        payload: { features: mockFeatures, epicId: 'epic-1' },
      };
      const newState = sowReducer(stateWithEpic, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.features['feature-new']).toBeDefined();
      expect(newState.epics['epic-1'].featureIds).toContain('feature-new');
    });

    it('handles fulfilled state when epic not found', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockFeatures = [
        { id: 'feature-new', title: 'New Feature', parentEpicId: 'nonexistent' },
      ];
      const action = {
        type: 'sow/requestAdditionalFeatures/fulfilled',
        payload: { features: mockFeatures, epicId: 'nonexistent' },
      };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      consoleSpy.mockRestore();
    });

    it('handles rejected state', () => {
      const action = {
        type: 'sow/requestAdditionalFeatures/rejected',
        error: { message: 'Failed to generate features' },
      };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Failed to generate features');
    });
  });

  describe('requestUserStories async thunk', () => {
    it('handles pending state', () => {
      const action = { type: 'sow/requestUserStories/pending' };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(true);
    });

    it('handles fulfilled state with user stories', () => {
      const stateWithFeature: SowState = {
        ...initialState,
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature',
            description: '',
            parentEpicId: 'epic-1',
            userStoryIds: [],
            acceptanceCriteria: [],
            contextualQuestions: [],
          } as any,
        },
      };

      const mockUserStories = [
        {
          id: 'story-new',
          title: 'New Story',
          role: 'user',
          action: 'do something',
          goal: 'achieve goal',
          points: '5',
          acceptanceCriteria: [],
          notes: '',
          parentFeatureId: 'feature-1',
          developmentOrder: 1,
        },
      ];
      const action = {
        type: 'sow/requestUserStories/fulfilled',
        payload: { userStories: mockUserStories, featureId: 'feature-1' },
      };
      const newState = sowReducer(stateWithFeature, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.userStories['story-new']).toBeDefined();
      expect(newState.features['feature-1'].userStoryIds).toContain('story-new');
    });

    it('handles fulfilled state when feature not found', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockUserStories = [
        { id: 'story-new', title: 'New Story', parentFeatureId: 'nonexistent' },
      ];
      const action = {
        type: 'sow/requestUserStories/fulfilled',
        payload: { userStories: mockUserStories, featureId: 'nonexistent' },
      };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      consoleSpy.mockRestore();
    });

    it('handles rejected state', () => {
      const action = {
        type: 'sow/requestUserStories/rejected',
        error: { message: 'Failed to generate user stories' },
      };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Failed to generate user stories');
    });
  });

  describe('requestTasks async thunk', () => {
    it('handles pending state', () => {
      const action = { type: 'sow/requestTasks/pending' };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(true);
    });

    it('handles fulfilled state with tasks', () => {
      const stateWithStory: SowState = {
        ...initialState,
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Story',
            parentFeatureId: 'feature-1',
            taskIds: [],
            acceptanceCriteria: [],
            contextualQuestions: [],
          } as any,
        },
      };

      const mockTasks = [
        {
          id: 'task-new',
          title: 'New Task',
          details: 'Details',
          priority: 1,
          notes: '',
          parentUserStoryId: 'story-1',
        },
      ];
      const action = {
        type: 'sow/requestTasks/fulfilled',
        payload: { tasks: mockTasks, userStoryId: 'story-1' },
      };
      const newState = sowReducer(stateWithStory, action);
      expect(newState.isLoading).toBe(false);
      // Tasks get new IDs generated, so we check the count
      expect(Object.keys(newState.tasks).length).toBeGreaterThan(0);
      expect(newState.userStories['story-1'].taskIds.length).toBeGreaterThan(0);
    });

    it('handles fulfilled state when user story not found', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockTasks = [
        { id: 'task-new', title: 'New Task', parentUserStoryId: 'nonexistent' },
      ];
      const action = {
        type: 'sow/requestTasks/fulfilled',
        payload: { tasks: mockTasks, userStoryId: 'nonexistent' },
      };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      consoleSpy.mockRestore();
    });

    it('handles rejected state', () => {
      const action = {
        type: 'sow/requestTasks/rejected',
        error: { message: 'Failed to generate tasks' },
      };
      const newState = sowReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Failed to generate tasks');
    });
  });

  describe('edge cases', () => {
    it('reorderFeatures does nothing for non-existent epic', () => {
      const newState = sowReducer(
        initialState,
        reorderFeatures({ epicId: 'nonexistent', sourceIndex: 0, destinationIndex: 1 })
      );
      expect(newState).toEqual(initialState);
    });

    it('reorderUserStories does nothing for non-existent feature', () => {
      const newState = sowReducer(
        initialState,
        reorderUserStories({ featureId: 'nonexistent', sourceIndex: 0, destinationIndex: 1 })
      );
      expect(newState).toEqual(initialState);
    });

    it('reorderTasks does nothing for non-existent user story', () => {
      const newState = sowReducer(
        initialState,
        reorderTasks({ userStoryId: 'nonexistent', sourceIndex: 0, destinationIndex: 1 })
      );
      expect(newState).toEqual(initialState);
    });

    it('addFeatures does not add duplicate featureId to epic', () => {
      const stateWithData: SowState = {
        ...initialState,
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Epic',
            featureIds: ['feature-1'],
            contextualQuestions: [],
          } as any,
        },
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature',
            parentEpicId: 'epic-1',
            userStoryIds: [],
            acceptanceCriteria: [],
            contextualQuestions: [],
          } as any,
        },
      };

      const feature = {
        id: 'feature-1',
        title: 'Updated Feature',
        parentEpicId: 'epic-1',
        userStoryIds: [],
        acceptanceCriteria: [],
        contextualQuestions: [],
      } as any;

      const newState = sowReducer(stateWithData, addFeatures(feature));
      expect(newState.epics['epic-1'].featureIds).toHaveLength(1);
    });

    it('addUserStories does not add duplicate userStoryId to feature', () => {
      const stateWithData: SowState = {
        ...initialState,
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature',
            userStoryIds: ['story-1'],
            parentEpicId: 'epic-1',
            acceptanceCriteria: [],
            contextualQuestions: [],
          } as any,
        },
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Story',
            parentFeatureId: 'feature-1',
            taskIds: [],
            acceptanceCriteria: [],
            contextualQuestions: [],
          } as any,
        },
      };

      const userStory = {
        id: 'story-1',
        title: 'Updated Story',
        parentFeatureId: 'feature-1',
        taskIds: [],
        acceptanceCriteria: [],
        contextualQuestions: [],
      } as any;

      const newState = sowReducer(stateWithData, addUserStories(userStory));
      expect(newState.features['feature-1'].userStoryIds).toHaveLength(1);
    });

    it('addTasks does not add duplicate taskId to user story', () => {
      const stateWithData: SowState = {
        ...initialState,
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Story',
            taskIds: ['task-1'],
            parentFeatureId: 'feature-1',
            acceptanceCriteria: [],
            contextualQuestions: [],
          } as any,
        },
        tasks: {
          'task-1': {
            id: 'task-1',
            title: 'Task',
            parentUserStoryId: 'story-1',
            contextualQuestions: [],
          } as any,
        },
      };

      const task = {
        id: 'task-1',
        title: 'Updated Task',
        parentUserStoryId: 'story-1',
        contextualQuestions: [],
      } as any;

      const newState = sowReducer(stateWithData, addTasks(task));
      expect(newState.userStories['story-1'].taskIds).toHaveLength(1);
    });
  });
});
