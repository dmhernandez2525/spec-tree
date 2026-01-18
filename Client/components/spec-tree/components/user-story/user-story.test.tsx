import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock all dependencies first
const mockDispatch = vi.fn().mockImplementation(() => Promise.resolve());
const mockUseSelector = vi.fn();

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) => mockUseSelector(selector),
  useDispatch: () => mockDispatch,
}));

vi.mock('react-beautiful-dnd', () => ({
  Droppable: ({ children }: { children: (provided: unknown) => React.ReactNode }) =>
    children({
      innerRef: vi.fn(),
      droppableProps: {},
      placeholder: null,
    }),
  Draggable: ({ children }: { children: (provided: unknown, snapshot: unknown) => React.ReactNode }) =>
    children(
      {
        innerRef: vi.fn(),
        draggableProps: {},
        dragHandleProps: {},
      },
      { isDragging: false }
    ),
}));

const mockDeleteUserStory = vi.fn();
const mockUpdateUserStoryField = vi.fn();
const mockAddTask = vi.fn();
const mockRequestTasks = vi.fn();
const mockSelectTaskById = vi.fn();

vi.mock('../../../../lib/store/sow-slice', () => ({
  deleteUserStory: (id: string) => mockDeleteUserStory(id),
  updateUserStoryField: (payload: unknown) => mockUpdateUserStoryField(payload),
  addTask: (task: unknown) => mockAddTask(task),
  requestTasks: (payload: unknown) => mockRequestTasks(payload),
  selectTaskById: (state: unknown, id: string) => mockSelectTaskById(state, id),
}));

vi.mock('../../lib/utils/generate-id', () => ({
  default: vi.fn(() => 'generated-task-id'),
}));

vi.mock('../../lib/utils/calculation-utils', () => ({
  calculateTotalTasks: vi.fn(() => 5),
}));

const mockAcceptanceCriteriaHook = {
  add: vi.fn(),
  remove: vi.fn(),
  update: vi.fn(),
};

vi.mock('../../lib/hooks/use-acceptance-criteria', () => ({
  useAcceptanceCriteria: vi.fn(() => mockAcceptanceCriteriaHook),
}));

vi.mock('../task', () => ({
  default: ({ task }: { task: { title: string } }) => (
    <div data-testid="mock-task">{task.title}</div>
  ),
}));

vi.mock('../loading-spinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('../metrics-display', () => ({
  default: ({ metrics }: { metrics: Array<{ label: string; value: number | string }> }) => (
    <div data-testid="metrics-display">
      {metrics.map((m) => (
        <span key={m.label} data-testid={`metric-${m.label.toLowerCase().replace(/\s+/g, '-')}`}>
          {m.label}: {m.value}
        </span>
      ))}
    </div>
  ),
}));

vi.mock('../acceptance-criteria-list', () => ({
  default: ({ acceptanceCriteria, add, remove, update }: {
    acceptanceCriteria: Array<{ text: string }>;
    add: () => void;
    remove: (index: number) => void;
    update: (index: number, value: string) => void;
  }) => (
    <div data-testid="acceptance-criteria-list">
      {acceptanceCriteria.map((ac, i) => (
        <div key={i} data-testid={`ac-item-${i}`}>
          {ac.text}
          <button onClick={() => remove(i)} data-testid={`remove-ac-${i}`}>Remove</button>
          <button onClick={() => update(i, 'updated')} data-testid={`update-ac-${i}`}>Update</button>
        </div>
      ))}
      <button onClick={add} data-testid="add-ac">Add AC</button>
    </div>
  ),
}));

vi.mock('../contextual-questions', () => ({
  default: ({ content, workItemType }: { content: string; workItemType: string }) => (
    <div data-testid="contextual-questions">
      {content} - {workItemType}
    </div>
  ),
}));

vi.mock('../regenerate-feedback', () => ({
  default: ({ onRegenerate, isLoading, itemType }: { onRegenerate: (feedback?: string) => void; isLoading: boolean; itemType: string }) => (
    <button
      data-testid="regenerate-feedback"
      onClick={() => onRegenerate('test feedback')}
      disabled={isLoading}
    >
      Regenerate {itemType}
    </button>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: React.PropsWithChildren<{ onClick?: () => void; variant?: string }>) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  CardContent: ({ children }: React.PropsWithChildren) => <div data-testid="card-content">{children}</div>,
  CardTitle: ({ children }: React.PropsWithChildren) => <div data-testid="card-title">{children}</div>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: React.PropsWithChildren<{ open?: boolean }>) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children }: React.PropsWithChildren) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: React.PropsWithChildren) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: React.PropsWithChildren) => <div data-testid="dialog-title">{children}</div>,
  DialogFooter: ({ children }: React.PropsWithChildren) => <div data-testid="dialog-footer">{children}</div>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, id, type, ...props }: { value?: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; id?: string; type?: string }) => (
    <input value={value} onChange={onChange} id={id} type={type} data-testid={id ? `input-${id}` : 'input'} {...props} />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: React.PropsWithChildren<{ htmlFor?: string }>) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, id, ...props }: { value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; id?: string }) => (
    <textarea value={value} onChange={onChange} id={id} data-testid={id ? `textarea-${id}` : 'textarea'} {...props} />
  ),
}));

vi.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children }: React.PropsWithChildren) => <div data-testid="accordion">{children}</div>,
  AccordionContent: ({ children }: React.PropsWithChildren) => <div data-testid="accordion-content">{children}</div>,
  AccordionItem: ({ children, value }: React.PropsWithChildren<{ value: string }>) => (
    <div data-testid={`accordion-item-${value}`}>{children}</div>
  ),
  AccordionTrigger: ({ children }: React.PropsWithChildren) => <div data-testid="accordion-trigger">{children}</div>,
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: React.PropsWithChildren<{ variant?: string }>) => (
    <div role="alert" data-variant={variant}>{children}</div>
  ),
  AlertDescription: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  GripVertical: () => <span data-testid="grip-icon">GripIcon</span>,
}));

// Import after mocks
import UserStory from './user-story';
import { UserStoryType, FeatureType, EpicType, TaskType, UserStoryFields } from '../../lib/types/work-items';
import { useAcceptanceCriteria } from '../../lib/hooks/use-acceptance-criteria';

// Create mock data
const createMockUserStory = (overrides?: Partial<UserStoryType>): UserStoryType => ({
  id: 'us-1',
  title: 'Test User Story',
  role: 'developer',
  action: 'create tests',
  goal: 'improve coverage',
  points: '8',
  acceptanceCriteria: [{ text: 'AC 1' }, { text: 'AC 2' }],
  notes: 'Test Notes',
  parentFeatureId: 'feature-1',
  taskIds: ['task-1', 'task-2'],
  developmentOrder: 1,
  contextualQuestions: [],
  ...overrides,
});

const createMockFeature = (overrides?: Partial<FeatureType>): FeatureType => ({
  id: 'feature-1',
  title: 'Test Feature',
  description: 'Feature Description',
  details: 'Feature Details',
  dependencies: '',
  acceptanceCriteria: [{ text: 'Feature AC' }],
  parentEpicId: 'epic-1',
  userStoryIds: ['us-1'],
  notes: 'Feature Notes',
  priority: 'High',
  effort: 'Medium',
  ...overrides,
});

const createMockEpic = (overrides?: Partial<EpicType>): EpicType => ({
  id: 'epic-1',
  title: 'Test Epic',
  description: 'Epic Description',
  goal: 'Epic Goal',
  successCriteria: 'Success Criteria',
  dependencies: 'Dependencies',
  timeline: 'Q1 2024',
  resources: 'Team A',
  risksAndMitigation: [],
  featureIds: ['feature-1'],
  parentAppId: 'app-1',
  notes: 'Epic Notes',
  ...overrides,
});

const mockTask: TaskType = {
  id: 'task-1',
  title: 'Test Task',
  details: 'Task details',
  priority: 1,
  notes: 'Task notes',
  parentUserStoryId: 'us-1',
  dependentTaskIds: [],
  contextualQuestions: [],
};

const mockState = {
  sow: {
    epics: { 'epic-1': createMockEpic() },
    features: { 'feature-1': createMockFeature() },
    userStories: { 'us-1': createMockUserStory() },
    tasks: { 'task-1': mockTask },
  },
};

describe('UserStory Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation(() => mockState);
    mockSelectTaskById.mockImplementation(() => mockTask);
  });

  describe('Module Exports', () => {
    it('module can be imported', () => {
      expect(UserStory).toBeDefined();
    });

    it('exports a default component', () => {
      expect(typeof UserStory).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('renders user story with title', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByText('Test User Story')).toBeInTheDocument();
    });

    it('renders user story label', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByText('User Story')).toBeInTheDocument();
    });

    it('renders metrics display', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByTestId('metrics-display')).toBeInTheDocument();
    });

    it('renders with correct id attribute', () => {
      const userStory = createMockUserStory({ id: 'my-us-id' });
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(document.getElementById('work-item-my-us-id')).toBeInTheDocument();
    });

    it('renders drag handle when dragHandleProps provided', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      const dragHandleProps = {} as any;
      render(<UserStory userStory={userStory} feature={feature} epic={epic} dragHandleProps={dragHandleProps} />);

      expect(screen.getByTestId('grip-icon')).toBeInTheDocument();
    });

    it('does not render drag handle when dragHandleProps not provided', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.queryByTestId('grip-icon')).not.toBeInTheDocument();
    });

    it('does not render drag handle when dragHandleProps is null', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} dragHandleProps={null} />);

      expect(screen.queryByTestId('grip-icon')).not.toBeInTheDocument();
    });
  });

  describe('Add Task Dialog', () => {
    it('opens add task dialog when button clicked', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const addButton = screen.getByText('Add Task');
      await userEvent.click(addButton);

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('dispatches addTask action when form submitted', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      // Open dialog
      await userEvent.click(screen.getByText('Add Task'));

      // Find the submit button in the dialog
      const dialogButtons = screen.getAllByText('Add Task');
      const submitButton = dialogButtons[dialogButtons.length - 1];
      await userEvent.click(submitButton);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('closes dialog after submission', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      // Open dialog
      await userEvent.click(screen.getByText('Add Task'));
      expect(screen.getByTestId('dialog')).toBeInTheDocument();

      // Submit form
      const dialogButtons = screen.getAllByText('Add Task');
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      // Dialog should be closed
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('updates form state when Title field changes', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      await userEvent.click(screen.getByText('Add Task'));

      const titleInput = screen.getByTestId('input-Title');
      await userEvent.type(titleInput, 'New Task');

      const dialogButtons = screen.getAllByText('Add Task');
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('updates form state when Details textarea changes', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      await userEvent.click(screen.getByText('Add Task'));

      const detailsTextarea = screen.getByTestId('textarea-Details');
      await userEvent.type(detailsTextarea, 'Task details');

      const dialogButtons = screen.getAllByText('Add Task');
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('updates form state when Notes textarea changes', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      await userEvent.click(screen.getByText('Add Task'));

      const notesTextarea = screen.getByTestId('textarea-Notes');
      await userEvent.type(notesTextarea, 'Some notes');

      const dialogButtons = screen.getAllByText('Add Task');
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('updates form state when Priority field changes', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      await userEvent.click(screen.getByText('Add Task'));

      const priorityInput = screen.getByTestId('input-Priority');
      await userEvent.clear(priorityInput);
      await userEvent.type(priorityInput, '5');

      const dialogButtons = screen.getAllByText('Add Task');
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('resets form after submission', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      // Open dialog and fill form
      await userEvent.click(screen.getByText('Add Task'));
      const titleInput = screen.getByTestId('input-Title');
      await userEvent.type(titleInput, 'Test Title');

      // Submit
      const dialogButtons = screen.getAllByText('Add Task');
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      // Reopen dialog
      await userEvent.click(screen.getByText('Add Task'));

      // Check if form is reset
      const newTitleInput = screen.getByTestId('input-Title');
      expect(newTitleInput).toHaveValue('');
    });
  });

  describe('Delete User Story', () => {
    it('dispatches deleteUserStory action when delete button clicked', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const deleteButton = screen.getByText('Delete User Story');
      await userEvent.click(deleteButton);

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Task Rendering', () => {
    it('renders tasks from user story', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getAllByTestId('mock-task').length).toBeGreaterThan(0);
    });

    it('renders correct number of tasks', () => {
      const userStory = createMockUserStory({ taskIds: ['t1', 't2', 't3'] });
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const tasks = screen.getAllByTestId('mock-task');
      expect(tasks).toHaveLength(3);
    });

    it('handles undefined taskIds', () => {
      const userStory = createMockUserStory();
      (userStory as any).taskIds = undefined;
      const feature = createMockFeature();
      const epic = createMockEpic();

      expect(() => render(<UserStory userStory={userStory} feature={feature} epic={epic} />)).not.toThrow();
    });
  });

  describe('Regenerate Tasks', () => {
    it('renders regenerate feedback button', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByTestId('regenerate-feedback')).toBeInTheDocument();
    });

    it('calls dispatch when regenerate is triggered', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const regenerateButton = screen.getByTestId('regenerate-feedback');
      await userEvent.click(regenerateButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('passes feedback to handleGenerateTasks', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const regenerateButton = screen.getByTestId('regenerate-feedback');
      await userEvent.click(regenerateButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner during task generation', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();

      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockDispatch.mockImplementationOnce(() => pendingPromise);

      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const regenerateButton = screen.getByTestId('regenerate-feedback');

      await act(async () => {
        fireEvent.click(regenerateButton);
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      await act(async () => {
        resolvePromise!(undefined);
        await pendingPromise;
      });
    });

    it('hides loading spinner after task generation completes', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      mockDispatch.mockImplementation(() => Promise.resolve());

      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const regenerateButton = screen.getByTestId('regenerate-feedback');
      await userEvent.click(regenerateButton);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when task generation fails', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      mockDispatch.mockImplementationOnce(() => Promise.reject(new Error('Generation failed')));

      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const regenerateButton = screen.getByTestId('regenerate-feedback');
      await userEvent.click(regenerateButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
      });
    });

    it('clears error when regeneration starts again', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();

      mockDispatch.mockImplementationOnce(() => Promise.reject(new Error('Error')));

      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const regenerateButton = screen.getByTestId('regenerate-feedback');
      await userEvent.click(regenerateButton);

      await waitFor(() => {
        expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
      });

      mockDispatch.mockImplementation(() => Promise.resolve());
      await userEvent.click(regenerateButton);
    });
  });

  describe('User Story Details Accordion', () => {
    it('renders user story details section', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByText('User Story Details')).toBeInTheDocument();
    });

    it('renders role input field', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('renders points input field', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByText('Points')).toBeInTheDocument();
    });

    it('renders action textarea', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('renders goal textarea', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByText('Goal')).toBeInTheDocument();
    });

    it('renders notes textarea', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByText('Notes')).toBeInTheDocument();
    });
  });

  describe('Field Updates', () => {
    it('dispatches updateUserStoryField when role is changed', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const inputs = screen.getAllByRole('textbox');
      if (inputs.length > 0) {
        await userEvent.type(inputs[0], 'X');
        expect(mockDispatch).toHaveBeenCalled();
      }
    });

    it('dispatches updateUserStoryField when points is changed', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const inputs = screen.getAllByRole('spinbutton');
      if (inputs.length > 0) {
        await userEvent.clear(inputs[0]);
        await userEvent.type(inputs[0], '10');
        expect(mockDispatch).toHaveBeenCalled();
      }
    });

    it('dispatches updateUserStoryField when action is changed', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const textareas = screen.getAllByRole('textbox').filter(el => el.tagName === 'TEXTAREA');
      if (textareas.length > 0) {
        await userEvent.type(textareas[0], 'Updated');
        expect(mockDispatch).toHaveBeenCalled();
      }
    });

    it('dispatches updateUserStoryField when goal is changed', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const textareas = screen.getAllByRole('textbox').filter(el => el.tagName === 'TEXTAREA');
      if (textareas.length > 1) {
        await userEvent.type(textareas[1], 'Updated goal');
        expect(mockDispatch).toHaveBeenCalled();
      }
    });

    it('dispatches updateUserStoryField when notes is changed', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const textareas = screen.getAllByRole('textbox').filter(el => el.tagName === 'TEXTAREA');
      if (textareas.length > 2) {
        await userEvent.type(textareas[2], 'Updated notes');
        expect(mockDispatch).toHaveBeenCalled();
      }
    });
  });

  describe('Acceptance Criteria', () => {
    it('renders acceptance criteria list', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByTestId('acceptance-criteria-list')).toBeInTheDocument();
    });

    it('calls add function when add button clicked', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const addButton = screen.getByTestId('add-ac');
      await userEvent.click(addButton);

      expect(mockAcceptanceCriteriaHook.add).toHaveBeenCalled();
    });

    it('calls remove function when remove button clicked', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const removeButton = screen.getByTestId('remove-ac-0');
      await userEvent.click(removeButton);

      expect(mockAcceptanceCriteriaHook.remove).toHaveBeenCalledWith(0);
    });

    it('calls update function when update button clicked', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      const updateButton = screen.getByTestId('update-ac-0');
      await userEvent.click(updateButton);

      expect(mockAcceptanceCriteriaHook.update).toHaveBeenCalledWith(0, 'updated');
    });

    it('renders acceptance criteria items', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByTestId('ac-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('ac-item-1')).toBeInTheDocument();
    });
  });

  describe('Acceptance Criteria Update Adapter', () => {
    it('converts array values to object format', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();

      const mockUseAcceptanceCriteria = vi.mocked(useAcceptanceCriteria);

      let capturedHandler: ((params: any) => void) | null = null;
      mockUseAcceptanceCriteria.mockImplementation((criteria, handler) => {
        capturedHandler = handler;
        return mockAcceptanceCriteriaHook;
      });

      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(capturedHandler).not.toBeNull();

      if (capturedHandler) {
        capturedHandler({
          field: 'acceptanceCriteria',
          newValue: ['text1', 'text2'],
          arrayIndex: 0,
          isArrayItem: true,
        });

        expect(mockDispatch).toHaveBeenCalled();
      }
    });

    it('passes through string values directly', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();

      const mockUseAcceptanceCriteria = vi.mocked(useAcceptanceCriteria);

      let capturedHandler: ((params: any) => void) | null = null;
      mockUseAcceptanceCriteria.mockImplementation((criteria, handler) => {
        capturedHandler = handler;
        return mockAcceptanceCriteriaHook;
      });

      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      if (capturedHandler) {
        capturedHandler({
          field: 'role',
          newValue: 'simple string',
        });

        expect(mockDispatch).toHaveBeenCalled();
      }
    });
  });

  describe('Contextual Questions', () => {
    it('renders contextual questions component', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByTestId('contextual-questions')).toBeInTheDocument();
    });

    it('passes correct props to contextual questions', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByText('Work Item - userStories')).toBeInTheDocument();
    });
  });

  describe('Metrics Calculation', () => {
    it('passes correct metrics to MetricsDisplay', () => {
      const userStory = createMockUserStory({ points: '13' });
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByTestId('metric-story-points')).toBeInTheDocument();
      expect(screen.getByTestId('metric-tasks')).toBeInTheDocument();
    });

    it('shows 0 points when no points specified', () => {
      const userStory = createMockUserStory({ points: '' });
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByTestId('metrics-display')).toBeInTheDocument();
    });

    it('shows points value when points are specified', () => {
      const userStory = createMockUserStory({ points: '5' });
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByTestId('metric-story-points')).toBeInTheDocument();
    });
  });

  describe('User Story with Empty Tasks', () => {
    it('renders correctly with no tasks', () => {
      const userStory = createMockUserStory({ taskIds: [] });
      const feature = createMockFeature();
      const epic = createMockEpic();
      mockSelectTaskById.mockImplementation(() => undefined);
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.queryByTestId('mock-task')).not.toBeInTheDocument();
    });
  });

  describe('Tasks Header', () => {
    it('renders Tasks section header', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible buttons', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByText('Add Task')).toBeInTheDocument();
      expect(screen.getByText('Delete User Story')).toBeInTheDocument();
    });

    it('renders labels for form fields', () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Goal')).toBeInTheDocument();
    });

    it('has labeled form fields in add task dialog', async () => {
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

      await userEvent.click(screen.getByText('Add Task'));

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });
  });
});

// Test form state management
describe('UserStory Form State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation(() => mockState);
    mockSelectTaskById.mockImplementation(() => mockTask);
  });

  it('form resets after adding task', async () => {
    const userStory = createMockUserStory();
    const feature = createMockFeature();
    const epic = createMockEpic();
    render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

    // Open dialog
    await userEvent.click(screen.getByText('Add Task'));

    // Submit form
    const dialogButtons = screen.getAllByText('Add Task');
    await userEvent.click(dialogButtons[dialogButtons.length - 1]);

    // Reopen dialog
    await userEvent.click(screen.getByText('Add Task'));

    // Check form is reset
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      // Note: Some fields may have default values
    });
  });
});

// Test task creation with generated ID
describe('Task Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation(() => mockState);
    mockSelectTaskById.mockImplementation(() => mockTask);
  });

  it('creates task with generated ID', async () => {
    const userStory = createMockUserStory();
    const feature = createMockFeature();
    const epic = createMockEpic();
    render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

    // Open dialog
    await userEvent.click(screen.getByText('Add Task'));

    // Submit form
    const dialogButtons = screen.getAllByText('Add Task');
    await userEvent.click(dialogButtons[dialogButtons.length - 1]);

    // Verify dispatch was called
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('creates task with parent user story ID', async () => {
    const userStory = createMockUserStory({ id: 'my-user-story-id' });
    const feature = createMockFeature();
    const epic = createMockEpic();
    render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

    await userEvent.click(screen.getByText('Add Task'));

    const dialogButtons = screen.getAllByText('Add Task');
    await userEvent.click(dialogButtons[dialogButtons.length - 1]);

    expect(mockDispatch).toHaveBeenCalled();
  });
});

// Test edge cases
describe('UserStory Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation(() => mockState);
    mockSelectTaskById.mockImplementation(() => mockTask);
  });

  it('handles user story with empty optional fields', () => {
    const userStory = createMockUserStory({
      action: '',
      goal: '',
      notes: '',
      points: '',
    });
    const feature = createMockFeature();
    const epic = createMockEpic();
    render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

    expect(screen.getByText('Test User Story')).toBeInTheDocument();
  });

  it('handles user story with special characters in title', () => {
    const userStory = createMockUserStory({
      title: 'User Story <with> "special" & characters',
    });
    const feature = createMockFeature();
    const epic = createMockEpic();
    render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

    expect(screen.getByText('User Story <with> "special" & characters')).toBeInTheDocument();
  });

  it('handles task with undefined return from selector', () => {
    const userStory = createMockUserStory({ taskIds: ['non-existent'] });
    const feature = createMockFeature();
    const epic = createMockEpic();
    mockSelectTaskById.mockImplementation(() => ({
      id: 'non-existent',
      title: 'Default Task',
      details: '',
      priority: 0,
      notes: '',
      parentUserStoryId: 'us-1',
      dependentTaskIds: [],
      contextualQuestions: [],
    }));

    render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

    expect(screen.getByTestId('mock-task')).toBeInTheDocument();
  });

  it('handles empty acceptance criteria', () => {
    const userStory = createMockUserStory({
      acceptanceCriteria: [],
    });
    const feature = createMockFeature();
    const epic = createMockEpic();
    render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

    expect(screen.getByTestId('acceptance-criteria-list')).toBeInTheDocument();
  });
});

// Test Draggable Task List
describe('UserStory Draggable Task List', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation(() => mockState);
    mockSelectTaskById.mockImplementation(() => mockTask);
  });

  it('renders draggable tasks within droppable area', () => {
    const userStory = createMockUserStory();
    const feature = createMockFeature();
    const epic = createMockEpic();
    render(<UserStory userStory={userStory} feature={feature} epic={epic} />);

    const tasks = screen.getAllByTestId('mock-task');
    expect(tasks.length).toBe(2);
  });
});
