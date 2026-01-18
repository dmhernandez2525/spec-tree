import { describe, it, expect } from 'vitest';
import { formatDBData } from './format-data';

describe('formatDBData', () => {
  it('returns empty sow structure when data is empty', () => {
    const result = formatDBData({
      data: {},
      chatApi: null,
      id: 'test-app-id',
    });

    expect(result.sow).toEqual({
      chatApi: '',
      id: 'test-app-id',
      apps: {},
      epics: {},
      features: {},
      userStories: {},
      tasks: {},
      contextualQuestions: [],
      globalInformation: '',
      selectedModel: 'gpt-3.5-turbo-16k',
    });
  });

  it('sets chatApi when provided', () => {
    const result = formatDBData({
      data: {},
      chatApi: 'gpt-4',
      id: 'test-id',
    });

    expect(result.sow.chatApi).toBe('gpt-4');
  });

  it('transforms contextual questions correctly', () => {
    const result = formatDBData({
      data: {
        contextualQuestions: [
          { documentId: 'q1', question: 'Question 1?', answer: 'Answer 1' },
          { documentId: 'q2', question: 'Question 2?', answer: 'Answer 2' },
        ],
      },
      chatApi: null,
      id: 'test-id',
    });

    expect(result.sow.contextualQuestions).toEqual([
      { id: 'q1', question: 'Question 1?', answer: 'Answer 1' },
      { id: 'q2', question: 'Question 2?', answer: 'Answer 2' },
    ]);
  });

  it('sets globalInformation when provided', () => {
    const result = formatDBData({
      data: {
        globalInformation: 'This is global info',
      },
      chatApi: null,
      id: 'test-id',
    });

    expect(result.sow.globalInformation).toBe('This is global info');
  });

  it('formats epics correctly', () => {
    const result = formatDBData({
      data: {
        epics: [
          {
            documentId: 'epic-1',
            title: 'Epic 1',
            description: 'Epic 1 description',
            goal: 'Goal 1',
            successCriteria: 'Success criteria',
            dependencies: 'Dependencies',
            timeline: 'Q1 2024',
            resources: 'Dev team',
            risksAndMitigation: [{ risk: 'Risk 1', mitigation: 'Mitigation 1' }],
            notes: 'Epic notes',
            features: [],
            contextualQuestions: [],
          },
        ],
      },
      chatApi: null,
      id: 'app-123',
    });

    expect(result.sow.epics['epic-1']).toEqual({
      id: 'epic-1',
      documentId: 'epic-1',
      title: 'Epic 1',
      description: 'Epic 1 description',
      goal: 'Goal 1',
      successCriteria: 'Success criteria',
      dependencies: 'Dependencies',
      timeline: 'Q1 2024',
      resources: 'Dev team',
      risksAndMitigation: [{ risk: 'Risk 1', mitigation: 'Mitigation 1' }],
      featureIds: [],
      parentAppId: 'app-123',
      notes: 'Epic notes',
      contextualQuestions: [],
    });
  });

  it('extracts featureIds from epic features', () => {
    const result = formatDBData({
      data: {
        epics: [
          {
            documentId: 'epic-1',
            title: 'Epic 1',
            description: '',
            goal: '',
            successCriteria: '',
            dependencies: '',
            timeline: '',
            resources: '',
            notes: '',
            features: [
              { documentId: 'feature-1', title: 'F1', description: '', userStories: [] },
              { documentId: 'feature-2', title: 'F2', description: '', userStories: [] },
            ],
          },
        ],
      },
      chatApi: null,
      id: 'app-123',
    });

    expect(result.sow.epics['epic-1'].featureIds).toEqual(['feature-1', 'feature-2']);
  });

  it('formats features correctly', () => {
    const result = formatDBData({
      data: {
        epics: [
          {
            documentId: 'epic-1',
            title: 'Epic 1',
            description: '',
            goal: '',
            successCriteria: '',
            dependencies: '',
            timeline: '',
            resources: '',
            notes: '',
            features: [
              {
                documentId: 'feature-1',
                title: 'Feature 1',
                description: 'Feature description',
                details: 'Feature details',
                dependencies: 'Feature deps',
                acceptanceCriteria: [{ text: 'AC 1' }, { text: 'AC 2' }],
                priority: 'high',
                effort: 'medium',
                notes: 'Feature notes',
                userStories: [],
                contextualQuestions: [],
              },
            ],
          },
        ],
      },
      chatApi: null,
      id: 'app-123',
    });

    expect(result.sow.features['feature-1']).toEqual({
      id: 'feature-1',
      documentId: 'feature-1',
      title: 'Feature 1',
      description: 'Feature description',
      details: 'Feature details',
      dependencies: 'Feature deps',
      acceptanceCriteria: [{ text: 'AC 1' }, { text: 'AC 2' }],
      parentEpicId: 'epic-1',
      userStoryIds: [],
      priority: 'high',
      effort: 'medium',
      notes: 'Feature notes',
      contextualQuestions: [],
    });
  });

  it('uses default values for optional feature fields', () => {
    const result = formatDBData({
      data: {
        epics: [
          {
            documentId: 'epic-1',
            title: 'Epic 1',
            description: '',
            goal: '',
            successCriteria: '',
            dependencies: '',
            timeline: '',
            resources: '',
            notes: '',
            features: [
              {
                documentId: 'feature-1',
                title: 'Feature 1',
                description: '',
                userStories: [],
              },
            ],
          },
        ],
      },
      chatApi: null,
      id: 'app-123',
    });

    expect(result.sow.features['feature-1'].dependencies).toBe('');
    expect(result.sow.features['feature-1'].acceptanceCriteria).toEqual([{ text: '' }]);
  });

  it('formats user stories correctly', () => {
    const result = formatDBData({
      data: {
        epics: [
          {
            documentId: 'epic-1',
            title: 'Epic 1',
            description: '',
            goal: '',
            successCriteria: '',
            dependencies: '',
            timeline: '',
            resources: '',
            notes: '',
            features: [
              {
                documentId: 'feature-1',
                title: 'Feature 1',
                description: '',
                userStories: [
                  {
                    documentId: 'story-1',
                    title: 'Story 1',
                    role: 'User',
                    action: 'do something',
                    goal: 'achieve goal',
                    points: 5,
                    acceptanceCriteria: [{ text: 'AC' }],
                    notes: 'Story notes',
                    developmentOrder: 1,
                    tasks: [],
                    contextualQuestions: [],
                  },
                ],
              },
            ],
          },
        ],
      },
      chatApi: null,
      id: 'app-123',
    });

    expect(result.sow.userStories['story-1']).toEqual({
      id: 'story-1',
      documentId: 'story-1',
      title: 'Story 1',
      role: 'User',
      action: 'do something',
      goal: 'achieve goal',
      points: 5,
      acceptanceCriteria: [{ text: 'AC' }],
      notes: 'Story notes',
      parentFeatureId: 'feature-1',
      taskIds: [],
      developmentOrder: 1,
      dependentUserStoryIds: [],
      contextualQuestions: [],
    });
  });

  it('formats tasks correctly', () => {
    const result = formatDBData({
      data: {
        epics: [
          {
            documentId: 'epic-1',
            title: 'Epic',
            description: '',
            goal: '',
            successCriteria: '',
            dependencies: '',
            timeline: '',
            resources: '',
            notes: '',
            features: [
              {
                documentId: 'feature-1',
                title: 'Feature',
                description: '',
                userStories: [
                  {
                    documentId: 'story-1',
                    title: 'Story',
                    role: '',
                    action: '',
                    goal: '',
                    points: 0,
                    tasks: [
                      {
                        documentId: 'task-1',
                        title: 'Task 1',
                        details: 'Task details',
                        priority: 'high',
                        notes: 'Task notes',
                        contextualQuestions: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      chatApi: null,
      id: 'app-123',
    });

    expect(result.sow.tasks['task-1']).toEqual({
      id: 'task-1',
      documentId: 'task-1',
      title: 'Task 1',
      details: 'Task details',
      priority: 'high',
      notes: 'Task notes',
      parentUserStoryId: 'story-1',
      dependentTaskIds: [],
      contextualQuestions: [],
    });
  });

  it('extracts taskIds from user story tasks', () => {
    const result = formatDBData({
      data: {
        epics: [
          {
            documentId: 'epic-1',
            title: 'Epic',
            description: '',
            goal: '',
            successCriteria: '',
            dependencies: '',
            timeline: '',
            resources: '',
            notes: '',
            features: [
              {
                documentId: 'feature-1',
                title: 'Feature',
                description: '',
                userStories: [
                  {
                    documentId: 'story-1',
                    title: 'Story',
                    role: '',
                    action: '',
                    goal: '',
                    points: 0,
                    tasks: [
                      { documentId: 'task-1', title: 'Task 1' },
                      { documentId: 'task-2', title: 'Task 2' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      chatApi: null,
      id: 'app-123',
    });

    expect(result.sow.userStories['story-1'].taskIds).toEqual(['task-1', 'task-2']);
  });

  it('handles risksAndMitigation being undefined', () => {
    const result = formatDBData({
      data: {
        epics: [
          {
            documentId: 'epic-1',
            title: 'Epic',
            description: '',
            goal: '',
            successCriteria: '',
            dependencies: '',
            timeline: '',
            resources: '',
            notes: '',
            risksAndMitigation: undefined,
            features: [],
          },
        ],
      },
      chatApi: null,
      id: 'app-123',
    });

    expect(result.sow.epics['epic-1'].risksAndMitigation).toEqual([]);
  });

  it('transforms nested contextual questions', () => {
    const result = formatDBData({
      data: {
        epics: [
          {
            documentId: 'epic-1',
            title: 'Epic',
            description: '',
            goal: '',
            successCriteria: '',
            dependencies: '',
            timeline: '',
            resources: '',
            notes: '',
            contextualQuestions: [
              { documentId: 'eq-1', question: 'Epic Q?', answer: 'Epic A' },
            ],
            features: [
              {
                documentId: 'feature-1',
                title: 'Feature',
                description: '',
                contextualQuestions: [
                  { documentId: 'fq-1', question: 'Feature Q?', answer: 'Feature A' },
                ],
                userStories: [
                  {
                    documentId: 'story-1',
                    title: 'Story',
                    role: '',
                    action: '',
                    goal: '',
                    points: 0,
                    contextualQuestions: [
                      { documentId: 'sq-1', question: 'Story Q?', answer: 'Story A' },
                    ],
                    tasks: [
                      {
                        documentId: 'task-1',
                        title: 'Task',
                        contextualQuestions: [
                          { documentId: 'tq-1', question: 'Task Q?', answer: 'Task A' },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      chatApi: null,
      id: 'app-123',
    });

    expect(result.sow.epics['epic-1'].contextualQuestions).toEqual([
      { id: 'eq-1', question: 'Epic Q?', answer: 'Epic A' },
    ]);
    expect(result.sow.features['feature-1'].contextualQuestions).toEqual([
      { id: 'fq-1', question: 'Feature Q?', answer: 'Feature A' },
    ]);
    expect(result.sow.userStories['story-1'].contextualQuestions).toEqual([
      { id: 'sq-1', question: 'Story Q?', answer: 'Story A' },
    ]);
    expect(result.sow.tasks['task-1'].contextualQuestions).toEqual([
      { id: 'tq-1', question: 'Task Q?', answer: 'Task A' },
    ]);
  });
});
