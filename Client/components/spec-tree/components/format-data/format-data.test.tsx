import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act, waitFor } from '@testing-library/react';
import FormatData, { formatDBData } from './format-data';

// Mock react-redux
const mockDispatch = vi.fn();
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

// Mock sow-slice
vi.mock('../../../../lib/store/sow-slice', () => ({
  setSow: vi.fn((data) => ({ type: 'sow/setSow', payload: data })),
}));

// Mock strapi service
const mockFetchAppById = vi.fn();
vi.mock('../../lib/api/strapi-service', () => ({
  strapiService: {
    fetchAppById: (id: string) => mockFetchAppById(id),
  },
}));

// Mock Alert component
vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: any) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: any) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

// Mock Loader2 icon
vi.mock('lucide-react', () => ({
  Loader2: ({ className }: any) => (
    <span data-testid="loader" className={className}>
      Loading...
    </span>
  ),
}));

describe('FormatData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => {
      cleanup();
    });
  });

  describe('Exports', () => {
    it('exports FormatData as default export', () => {
      expect(FormatData).toBeDefined();
      expect(typeof FormatData).toBe('function');
    });

    it('exports formatDBData as named export', () => {
      expect(formatDBData).toBeDefined();
      expect(typeof formatDBData).toBe('function');
    });

    it('can be imported', () => {
      // FormatData and formatDBData are imported at the top of the file
      expect(FormatData).toBeDefined();
      expect(formatDBData).toBeDefined();
    });
  });

  describe('Component Rendering', () => {
    it('renders nothing when selectedApp is null', async () => {
      const { container } = render(
        <FormatData selectedApp={null} chatApi={null} />
      );
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('does not fetch data when selectedApp is null', async () => {
      render(<FormatData selectedApp={null} chatApi={null} />);
      await waitFor(() => {
        expect(mockFetchAppById).not.toHaveBeenCalled();
      });
    });

    it('shows loading spinner when fetching data', async () => {
      mockFetchAppById.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      await act(async () => {
        render(<FormatData selectedApp="app-123" chatApi="test-api" />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('loader')).toBeInTheDocument();
      });
    });

    it('shows error alert when fetch fails', async () => {
      mockFetchAppById.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        render(<FormatData selectedApp="app-123" chatApi="test-api" />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
        expect(screen.getByTestId('alert')).toHaveAttribute(
          'data-variant',
          'destructive'
        );
        expect(screen.getByText('Failed to fetch and format data')).toBeInTheDocument();
      });
    });

    it('dispatches setSow with formatted data on success', async () => {
      const mockData = {
        epics: [],
        contextualQuestions: [],
        globalInformation: 'Test info',
      };
      mockFetchAppById.mockResolvedValue(mockData);

      await act(async () => {
        render(<FormatData selectedApp="app-123" chatApi="test-api" />);
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('calls fetchAppById with correct id', async () => {
      mockFetchAppById.mockResolvedValue({});

      await act(async () => {
        render(<FormatData selectedApp="app-123" chatApi="test-api" />);
      });

      await waitFor(() => {
        expect(mockFetchAppById).toHaveBeenCalledWith('app-123');
      });
    });

    it('returns null after successful load', async () => {
      mockFetchAppById.mockResolvedValue({});

      const { container } = render(
        <FormatData selectedApp="app-123" chatApi="test-api" />
      );

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe('Effect Dependencies', () => {
    it('refetches when selectedApp changes', async () => {
      mockFetchAppById.mockResolvedValue({});

      const { rerender } = render(
        <FormatData selectedApp="app-1" chatApi="api" />
      );

      await waitFor(() => {
        expect(mockFetchAppById).toHaveBeenCalledWith('app-1');
      });

      mockFetchAppById.mockClear();

      await act(async () => {
        rerender(<FormatData selectedApp="app-2" chatApi="api" />);
      });

      await waitFor(() => {
        expect(mockFetchAppById).toHaveBeenCalledWith('app-2');
      });
    });
  });
});

describe('formatDBData', () => {
  describe('Basic Structure', () => {
    it('returns sow object with correct structure', () => {
      const result = formatDBData({
        data: {},
        chatApi: 'test-api',
        id: 'test-id',
      });

      expect(result).toHaveProperty('sow');
      expect(result.sow).toHaveProperty('chatApi');
      expect(result.sow).toHaveProperty('id');
      expect(result.sow).toHaveProperty('apps');
      expect(result.sow).toHaveProperty('epics');
      expect(result.sow).toHaveProperty('features');
      expect(result.sow).toHaveProperty('userStories');
      expect(result.sow).toHaveProperty('tasks');
      expect(result.sow).toHaveProperty('contextualQuestions');
      expect(result.sow).toHaveProperty('globalInformation');
      expect(result.sow).toHaveProperty('selectedModel');
    });

    it('sets chatApi from parameter', () => {
      const result = formatDBData({
        data: {},
        chatApi: 'my-api',
        id: 'test-id',
      });

      expect(result.sow.chatApi).toBe('my-api');
    });

    it('sets id from parameter', () => {
      const result = formatDBData({
        data: {},
        chatApi: 'api',
        id: 'unique-id',
      });

      expect(result.sow.id).toBe('unique-id');
    });

    it('sets chatApi to empty string when null', () => {
      const result = formatDBData({
        data: {},
        chatApi: null,
        id: 'test-id',
      });

      expect(result.sow.chatApi).toBe('');
    });

    it('sets default selected model', () => {
      const result = formatDBData({
        data: {},
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.selectedModel).toBe('gpt-3.5-turbo-16k');
    });
  });

  describe('Contextual Questions', () => {
    it('transforms contextual questions correctly', () => {
      const result = formatDBData({
        data: {
          contextualQuestions: [
            { documentId: 'q1', question: 'What?', answer: 'This' },
            { documentId: 'q2', question: 'Why?', answer: 'Because' },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.contextualQuestions).toHaveLength(2);
      expect(result.sow.contextualQuestions[0]).toEqual({
        id: 'q1',
        question: 'What?',
        answer: 'This',
      });
      expect(result.sow.contextualQuestions[1]).toEqual({
        id: 'q2',
        question: 'Why?',
        answer: 'Because',
      });
    });

    it('returns empty array when no contextual questions', () => {
      const result = formatDBData({
        data: {},
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.contextualQuestions).toEqual([]);
    });

    it('returns empty array when contextualQuestions is undefined', () => {
      const result = formatDBData({
        data: { contextualQuestions: undefined },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.contextualQuestions).toEqual([]);
    });
  });

  describe('Global Information', () => {
    it('sets globalInformation from data', () => {
      const result = formatDBData({
        data: { globalInformation: 'This is global info' },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.globalInformation).toBe('This is global info');
    });

    it('sets globalInformation to empty string when undefined', () => {
      const result = formatDBData({
        data: {},
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.globalInformation).toBe('');
    });
  });

  describe('Epics Transformation', () => {
    it('transforms epics correctly', () => {
      const result = formatDBData({
        data: {
          epics: [
            {
              documentId: 'epic-1',
              title: 'Epic 1',
              description: 'Description 1',
              goal: 'Goal 1',
              successCriteria: 'Success 1',
              dependencies: 'Dep 1',
              timeline: 'Timeline 1',
              resources: 'Resources 1',
              risksAndMitigation: [{ risk: 'Risk 1', mitigation: 'Mit 1' }],
              features: [],
              notes: 'Notes 1',
              contextualQuestions: [],
            },
          ],
        },
        chatApi: 'api',
        id: 'parent-id',
      });

      expect(result.sow.epics['epic-1']).toBeDefined();
      expect(result.sow.epics['epic-1'].id).toBe('epic-1');
      expect(result.sow.epics['epic-1'].documentId).toBe('epic-1');
      expect(result.sow.epics['epic-1'].title).toBe('Epic 1');
      expect(result.sow.epics['epic-1'].description).toBe('Description 1');
      expect(result.sow.epics['epic-1'].goal).toBe('Goal 1');
      expect(result.sow.epics['epic-1'].successCriteria).toBe('Success 1');
      expect(result.sow.epics['epic-1'].dependencies).toBe('Dep 1');
      expect(result.sow.epics['epic-1'].timeline).toBe('Timeline 1');
      expect(result.sow.epics['epic-1'].resources).toBe('Resources 1');
      expect(result.sow.epics['epic-1'].parentAppId).toBe('parent-id');
      expect(result.sow.epics['epic-1'].notes).toBe('Notes 1');
      expect(result.sow.epics['epic-1'].featureIds).toEqual([]);
    });

    it('handles risksAndMitigation correctly', () => {
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
              risksAndMitigation: [
                { risk: 'Risk A', mitigation: 'Mit A' },
                { risk: 'Risk B', mitigation: 'Mit B' },
              ],
              features: [],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.epics['epic-1'].risksAndMitigation).toHaveLength(2);
    });

    it('sets risksAndMitigation to empty array when undefined', () => {
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
              features: [],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.epics['epic-1'].risksAndMitigation).toEqual([]);
    });

    it('extracts featureIds from features array', () => {
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
              features: [
                { documentId: 'feat-1', title: 'Feature 1' },
                { documentId: 'feat-2', title: 'Feature 2' },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.epics['epic-1'].featureIds).toEqual(['feat-1', 'feat-2']);
    });

    it('returns empty epics object when no epics', () => {
      const result = formatDBData({
        data: {},
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.epics).toEqual({});
    });
  });

  describe('Features Transformation', () => {
    it('transforms features correctly', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature 1',
                  description: 'Feat desc',
                  details: 'Details here',
                  dependencies: 'Feat deps',
                  acceptanceCriteria: [{ text: 'AC 1' }],
                  userStories: [],
                  priority: 'high',
                  effort: 'large',
                  notes: 'Feat notes',
                  contextualQuestions: [],
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.features['feat-1']).toBeDefined();
      expect(result.sow.features['feat-1'].id).toBe('feat-1');
      expect(result.sow.features['feat-1'].documentId).toBe('feat-1');
      expect(result.sow.features['feat-1'].title).toBe('Feature 1');
      expect(result.sow.features['feat-1'].description).toBe('Feat desc');
      expect(result.sow.features['feat-1'].details).toBe('Details here');
      expect(result.sow.features['feat-1'].parentEpicId).toBe('epic-1');
      expect(result.sow.features['feat-1'].notes).toBe('Feat notes');
    });

    it('sets default acceptanceCriteria when undefined', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  userStories: [],
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.features['feat-1'].acceptanceCriteria).toEqual([{ text: '' }]);
    });

    it('extracts userStoryIds from userStories array', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  userStories: [
                    { documentId: 'us-1', title: 'Story 1' },
                    { documentId: 'us-2', title: 'Story 2' },
                  ],
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.features['feat-1'].userStoryIds).toEqual(['us-1', 'us-2']);
    });
  });

  describe('User Stories Transformation', () => {
    it('transforms user stories correctly', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  userStories: [
                    {
                      documentId: 'us-1',
                      title: 'User Story 1',
                      role: 'User',
                      action: 'Do something',
                      goal: 'Achieve goal',
                      points: 5,
                      acceptanceCriteria: [{ text: 'AC 1' }],
                      tasks: [],
                      notes: 'Story notes',
                      developmentOrder: 1,
                      contextualQuestions: [],
                    },
                  ],
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.userStories['us-1']).toBeDefined();
      expect(result.sow.userStories['us-1'].id).toBe('us-1');
      expect(result.sow.userStories['us-1'].documentId).toBe('us-1');
      expect(result.sow.userStories['us-1'].title).toBe('User Story 1');
      expect(result.sow.userStories['us-1'].role).toBe('User');
      expect(result.sow.userStories['us-1'].action).toBe('Do something');
      expect(result.sow.userStories['us-1'].goal).toBe('Achieve goal');
      expect(result.sow.userStories['us-1'].points).toBe(5);
      expect(result.sow.userStories['us-1'].parentFeatureId).toBe('feat-1');
      expect(result.sow.userStories['us-1'].notes).toBe('Story notes');
      expect(result.sow.userStories['us-1'].developmentOrder).toBe(1);
    });

    it('sets default developmentOrder to 0 when undefined', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  userStories: [
                    {
                      documentId: 'us-1',
                      title: 'Story',
                      role: '',
                      action: '',
                      goal: '',
                      points: 0,
                      tasks: [],
                      notes: '',
                    },
                  ],
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.userStories['us-1'].developmentOrder).toBe(0);
    });

    it('sets dependentUserStoryIds to empty array', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  userStories: [
                    {
                      documentId: 'us-1',
                      title: 'Story',
                      role: '',
                      action: '',
                      goal: '',
                      points: 0,
                      tasks: [],
                      notes: '',
                    },
                  ],
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.userStories['us-1'].dependentUserStoryIds).toEqual([]);
    });

    it('extracts taskIds from tasks array', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  userStories: [
                    {
                      documentId: 'us-1',
                      title: 'Story',
                      role: '',
                      action: '',
                      goal: '',
                      points: 0,
                      tasks: [
                        { documentId: 'task-1', title: 'Task 1' },
                        { documentId: 'task-2', title: 'Task 2' },
                      ],
                      notes: '',
                    },
                  ],
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.userStories['us-1'].taskIds).toEqual(['task-1', 'task-2']);
    });
  });

  describe('Tasks Transformation', () => {
    it('transforms tasks correctly', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  userStories: [
                    {
                      documentId: 'us-1',
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
                          priority: 2,
                          notes: 'Task notes',
                          contextualQuestions: [],
                        },
                      ],
                      notes: '',
                    },
                  ],
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.tasks['task-1']).toBeDefined();
      expect(result.sow.tasks['task-1'].id).toBe('task-1');
      expect(result.sow.tasks['task-1'].documentId).toBe('task-1');
      expect(result.sow.tasks['task-1'].title).toBe('Task 1');
      expect(result.sow.tasks['task-1'].details).toBe('Task details');
      expect(result.sow.tasks['task-1'].priority).toBe(2);
      expect(result.sow.tasks['task-1'].parentUserStoryId).toBe('us-1');
      expect(result.sow.tasks['task-1'].notes).toBe('Task notes');
    });

    it('sets dependentTaskIds to empty array', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  userStories: [
                    {
                      documentId: 'us-1',
                      title: 'Story',
                      role: '',
                      action: '',
                      goal: '',
                      points: 0,
                      tasks: [
                        {
                          documentId: 'task-1',
                          title: 'Task',
                          details: '',
                          priority: 0,
                          notes: '',
                        },
                      ],
                      notes: '',
                    },
                  ],
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.tasks['task-1'].dependentTaskIds).toEqual([]);
    });
  });

  describe('Nested Data Handling', () => {
    it('handles multiple epics with features, stories, and tasks', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature 1',
                  description: '',
                  details: '',
                  userStories: [
                    {
                      documentId: 'us-1',
                      title: 'Story 1',
                      role: '',
                      action: '',
                      goal: '',
                      points: 0,
                      tasks: [{ documentId: 'task-1', title: 'Task 1', details: '', priority: 0, notes: '' }],
                      notes: '',
                    },
                  ],
                  notes: '',
                },
              ],
              notes: '',
            },
            {
              documentId: 'epic-2',
              title: 'Epic 2',
              description: '',
              goal: '',
              successCriteria: '',
              dependencies: '',
              timeline: '',
              resources: '',
              features: [
                {
                  documentId: 'feat-2',
                  title: 'Feature 2',
                  description: '',
                  details: '',
                  userStories: [
                    {
                      documentId: 'us-2',
                      title: 'Story 2',
                      role: '',
                      action: '',
                      goal: '',
                      points: 0,
                      tasks: [{ documentId: 'task-2', title: 'Task 2', details: '', priority: 0, notes: '' }],
                      notes: '',
                    },
                  ],
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(Object.keys(result.sow.epics)).toHaveLength(2);
      expect(Object.keys(result.sow.features)).toHaveLength(2);
      expect(Object.keys(result.sow.userStories)).toHaveLength(2);
      expect(Object.keys(result.sow.tasks)).toHaveLength(2);
    });

    it('handles empty nested arrays', () => {
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
              features: [],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(Object.keys(result.sow.epics)).toHaveLength(1);
      expect(Object.keys(result.sow.features)).toHaveLength(0);
      expect(Object.keys(result.sow.userStories)).toHaveLength(0);
      expect(Object.keys(result.sow.tasks)).toHaveLength(0);
    });

    it('handles features without userStories', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.features['feat-1'].userStoryIds).toEqual([]);
    });

    it('handles userStories without tasks', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  userStories: [
                    {
                      documentId: 'us-1',
                      title: 'Story',
                      role: '',
                      action: '',
                      goal: '',
                      points: 0,
                      notes: '',
                    },
                  ],
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.userStories['us-1'].taskIds).toEqual([]);
    });
  });

  describe('Contextual Questions on Work Items', () => {
    it('transforms contextualQuestions on epics', () => {
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
              features: [],
              notes: '',
              contextualQuestions: [
                { documentId: 'cq-1', question: 'Q1?', answer: 'A1' },
              ],
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.epics['epic-1'].contextualQuestions).toHaveLength(1);
      expect(result.sow.epics['epic-1'].contextualQuestions[0].id).toBe('cq-1');
    });

    it('transforms contextualQuestions on features', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  userStories: [],
                  notes: '',
                  contextualQuestions: [
                    { documentId: 'cq-2', question: 'Q2?', answer: 'A2' },
                  ],
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.features['feat-1'].contextualQuestions).toHaveLength(1);
      expect(result.sow.features['feat-1'].contextualQuestions[0].id).toBe('cq-2');
    });

    it('transforms contextualQuestions on user stories', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  userStories: [
                    {
                      documentId: 'us-1',
                      title: 'Story',
                      role: '',
                      action: '',
                      goal: '',
                      points: 0,
                      tasks: [],
                      notes: '',
                      contextualQuestions: [
                        { documentId: 'cq-3', question: 'Q3?', answer: 'A3' },
                      ],
                    },
                  ],
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.userStories['us-1'].contextualQuestions).toHaveLength(1);
      expect(result.sow.userStories['us-1'].contextualQuestions[0].id).toBe('cq-3');
    });

    it('transforms contextualQuestions on tasks', () => {
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
              features: [
                {
                  documentId: 'feat-1',
                  title: 'Feature',
                  description: '',
                  details: '',
                  userStories: [
                    {
                      documentId: 'us-1',
                      title: 'Story',
                      role: '',
                      action: '',
                      goal: '',
                      points: 0,
                      tasks: [
                        {
                          documentId: 'task-1',
                          title: 'Task',
                          details: '',
                          priority: 0,
                          notes: '',
                          contextualQuestions: [
                            { documentId: 'cq-4', question: 'Q4?', answer: 'A4' },
                          ],
                        },
                      ],
                      notes: '',
                    },
                  ],
                  notes: '',
                },
              ],
              notes: '',
            },
          ],
        },
        chatApi: 'api',
        id: 'id',
      });

      expect(result.sow.tasks['task-1'].contextualQuestions).toHaveLength(1);
      expect(result.sow.tasks['task-1'].contextualQuestions[0].id).toBe('cq-4');
    });
  });
});
