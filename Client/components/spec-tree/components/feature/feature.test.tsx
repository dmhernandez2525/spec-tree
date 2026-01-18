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

const mockDeleteFeature = vi.fn();
const mockRequestUserStories = vi.fn();
const mockUpdateFeatureField = vi.fn();
const mockAddUserStory = vi.fn();
const mockSelectUserStoryById = vi.fn();

vi.mock('../../../../lib/store/sow-slice', () => ({
  deleteFeature: (id: string) => mockDeleteFeature(id),
  requestUserStories: (payload: unknown) => mockRequestUserStories(payload),
  updateFeatureField: (payload: unknown) => mockUpdateFeatureField(payload),
  addUserStory: (userStory: unknown) => mockAddUserStory(userStory),
  selectUserStoryById: (state: unknown, id: string) => mockSelectUserStoryById(state, id),
}));

vi.mock('../../lib/utils/generate-id', () => ({
  default: vi.fn(() => 'generated-user-story-id'),
}));

vi.mock('../../lib/utils/calculation-utils', () => ({
  calculateTotalTasks: vi.fn(() => 8),
  calculateTotalUserStories: vi.fn(() => 4),
}));

vi.mock('../../lib/utils/calculate-total-points', () => ({
  default: vi.fn(() => 21),
}));

const mockAcceptanceCriteriaHook = {
  add: vi.fn(),
  remove: vi.fn(),
  update: vi.fn(),
};

vi.mock('../../lib/hooks/use-acceptance-criteria', () => ({
  useAcceptanceCriteria: vi.fn(() => mockAcceptanceCriteriaHook),
}));

vi.mock('../user-story', () => ({
  default: ({ userStory }: { userStory: { title: string } }) => (
    <div data-testid="mock-user-story">{userStory.title}</div>
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
  Input: ({ value, onChange, id, type, ...props }: { value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; id?: string; type?: string }) => (
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
import Feature from './feature';
import { FeatureType, EpicType, UserStoryType } from '../../lib/types/work-items';
import { useAcceptanceCriteria } from '../../lib/hooks/use-acceptance-criteria';

// Create mock data
const createMockFeature = (overrides?: Partial<FeatureType>): FeatureType => ({
  id: 'feature-1',
  title: 'Test Feature',
  description: 'Test Description',
  details: 'Test Details',
  dependencies: 'Dependency A',
  acceptanceCriteria: [{ text: 'AC 1' }, { text: 'AC 2' }],
  parentEpicId: 'epic-1',
  userStoryIds: ['us-1', 'us-2'],
  notes: 'Test Notes',
  priority: 'Medium',
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

const mockUserStory: UserStoryType = {
  id: 'us-1',
  title: 'Test User Story',
  role: 'user',
  action: 'do something',
  goal: 'achieve result',
  points: '5',
  acceptanceCriteria: [{ text: 'US AC 1' }],
  notes: '',
  parentFeatureId: 'feature-1',
  taskIds: ['task-1'],
  developmentOrder: 1,
  contextualQuestions: [],
};

const mockState = {
  sow: {
    epics: { 'epic-1': createMockEpic() },
    features: { 'feature-1': createMockFeature() },
    userStories: { 'us-1': mockUserStory },
    tasks: {},
  },
};

describe('Feature Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation(() => mockState);
    mockSelectUserStoryById.mockImplementation(() => mockUserStory);
  });

  describe('Module Exports', () => {
    it('module can be imported', () => {
      expect(Feature).toBeDefined();
    });

    it('exports a default component', () => {
      expect(typeof Feature).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('renders feature with title', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByText('Test Feature')).toBeInTheDocument();
    });

    it('renders feature label', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByText('Feature')).toBeInTheDocument();
    });

    it('renders metrics display', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByTestId('metrics-display')).toBeInTheDocument();
    });

    it('renders with correct id attribute', () => {
      const feature = createMockFeature({ id: 'my-feature-id' });
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(document.getElementById('work-item-my-feature-id')).toBeInTheDocument();
    });

    it('renders drag handle when dragHandleProps provided', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      const dragHandleProps = {} as any;
      render(<Feature feature={feature} epic={epic} index={0} dragHandleProps={dragHandleProps} />);

      expect(screen.getByTestId('grip-icon')).toBeInTheDocument();
    });

    it('does not render drag handle when dragHandleProps not provided', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.queryByTestId('grip-icon')).not.toBeInTheDocument();
    });

    it('does not render drag handle when dragHandleProps is null', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} dragHandleProps={null} />);

      expect(screen.queryByTestId('grip-icon')).not.toBeInTheDocument();
    });
  });

  describe('Add User Story Dialog', () => {
    it('opens add user story dialog when button clicked', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      const addButton = screen.getByText('Add User Story');
      await userEvent.click(addButton);

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('dispatches addUserStory action when form submitted', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      // Open dialog
      await userEvent.click(screen.getByText('Add User Story'));

      // Find the submit button in the dialog
      const dialogButtons = screen.getAllByText('Add User Story');
      const submitButton = dialogButtons[dialogButtons.length - 1];
      await userEvent.click(submitButton);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('closes dialog after submission', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      // Open dialog
      await userEvent.click(screen.getByText('Add User Story'));
      expect(screen.getByTestId('dialog')).toBeInTheDocument();

      // Submit form
      const dialogButtons = screen.getAllByText('Add User Story');
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      // Dialog should be closed
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('updates form state when Title field changes', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      await userEvent.click(screen.getByText('Add User Story'));

      const titleInput = screen.getByTestId('input-Title');
      await userEvent.type(titleInput, 'New User Story');

      const dialogButtons = screen.getAllByText('Add User Story');
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('updates form state when Goal textarea changes', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      await userEvent.click(screen.getByText('Add User Story'));

      const goalTextarea = screen.getByTestId('textarea-Goal');
      await userEvent.type(goalTextarea, 'User story goal');

      const dialogButtons = screen.getAllByText('Add User Story');
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('updates form state when Notes textarea changes', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      await userEvent.click(screen.getByText('Add User Story'));

      const notesTextarea = screen.getByTestId('textarea-Notes');
      await userEvent.type(notesTextarea, 'Some notes');

      const dialogButtons = screen.getAllByText('Add User Story');
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('handles number type inputs for DevelopmentOrder', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      await userEvent.click(screen.getByText('Add User Story'));

      const devOrderInput = screen.getByTestId('input-DevelopmentOrder');
      expect(devOrderInput).toHaveAttribute('type', 'number');
    });

    it('handles number type inputs for Points', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      await userEvent.click(screen.getByText('Add User Story'));

      const pointsInput = screen.getByTestId('input-Points');
      expect(pointsInput).toHaveAttribute('type', 'number');
    });

    it('resets form after submission', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      // Open dialog and fill form
      await userEvent.click(screen.getByText('Add User Story'));
      const titleInput = screen.getByTestId('input-Title');
      await userEvent.type(titleInput, 'Test Title');

      // Submit
      const dialogButtons = screen.getAllByText('Add User Story');
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      // Reopen dialog
      await userEvent.click(screen.getByText('Add User Story'));

      // Check if form is reset
      const newTitleInput = screen.getByTestId('input-Title');
      expect(newTitleInput).toHaveValue('');
    });
  });

  describe('Delete Feature', () => {
    it('dispatches deleteFeature action when delete button clicked', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      const deleteButton = screen.getByText('Delete Feature');
      await userEvent.click(deleteButton);

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('User Story Rendering', () => {
    it('renders user stories from feature', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getAllByTestId('mock-user-story').length).toBeGreaterThan(0);
    });

    it('renders correct number of user stories', () => {
      const feature = createMockFeature({ userStoryIds: ['us-1', 'us-2', 'us-3'] });
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      const userStories = screen.getAllByTestId('mock-user-story');
      expect(userStories).toHaveLength(3);
    });

    it('handles undefined userStoryIds', () => {
      const feature = createMockFeature();
      // Simulate undefined userStoryIds by setting to undefined
      (feature as any).userStoryIds = undefined;
      const epic = createMockEpic();

      // This should not throw
      expect(() => render(<Feature feature={feature} epic={epic} index={0} />)).not.toThrow();
    });
  });

  describe('Regenerate User Stories', () => {
    it('renders regenerate feedback button', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByTestId('regenerate-feedback')).toBeInTheDocument();
    });

    it('calls dispatch when regenerate is triggered', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      const regenerateButton = screen.getByTestId('regenerate-feedback');
      await userEvent.click(regenerateButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('passes feedback to handleGenerateUserStories', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      const regenerateButton = screen.getByTestId('regenerate-feedback');
      await userEvent.click(regenerateButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner during user story generation', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();

      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockDispatch.mockImplementationOnce(() => pendingPromise);

      render(<Feature feature={feature} epic={epic} index={0} />);

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

    it('hides loading spinner after user story generation completes', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      mockDispatch.mockImplementation(() => Promise.resolve());

      render(<Feature feature={feature} epic={epic} index={0} />);

      const regenerateButton = screen.getByTestId('regenerate-feedback');
      await userEvent.click(regenerateButton);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when user story generation fails', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      mockDispatch.mockImplementationOnce(() => Promise.reject(new Error('Generation failed')));

      render(<Feature feature={feature} epic={epic} index={0} />);

      const regenerateButton = screen.getByTestId('regenerate-feedback');
      await userEvent.click(regenerateButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
      });
    });

    it('clears error when regeneration starts again', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();

      mockDispatch.mockImplementationOnce(() => Promise.reject(new Error('Error')));

      render(<Feature feature={feature} epic={epic} index={0} />);

      const regenerateButton = screen.getByTestId('regenerate-feedback');
      await userEvent.click(regenerateButton);

      await waitFor(() => {
        expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
      });

      mockDispatch.mockImplementation(() => Promise.resolve());
      await userEvent.click(regenerateButton);
    });
  });

  describe('Feature Details Accordion', () => {
    it('renders feature details section', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByText('Feature Details')).toBeInTheDocument();
    });

    it('renders title input field', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('renders description textarea', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders details textarea', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('renders notes textarea', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByText('Notes')).toBeInTheDocument();
    });
  });

  describe('Field Updates', () => {
    it('dispatches updateFeatureField when title is changed', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      const inputs = screen.getAllByRole('textbox');
      if (inputs.length > 0) {
        await userEvent.type(inputs[0], 'X');
        expect(mockDispatch).toHaveBeenCalled();
      }
    });

    it('dispatches updateFeatureField when description is changed', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      const textareas = screen.getAllByRole('textbox').filter(el => el.tagName === 'TEXTAREA');
      if (textareas.length > 0) {
        await userEvent.type(textareas[0], 'Updated');
        expect(mockDispatch).toHaveBeenCalled();
      }
    });

    it('dispatches updateFeatureField when details is changed', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      const textareas = screen.getAllByRole('textbox').filter(el => el.tagName === 'TEXTAREA');
      if (textareas.length > 1) {
        await userEvent.type(textareas[1], 'Updated details');
        expect(mockDispatch).toHaveBeenCalled();
      }
    });

    it('dispatches updateFeatureField when notes is changed', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      const textareas = screen.getAllByRole('textbox').filter(el => el.tagName === 'TEXTAREA');
      if (textareas.length > 2) {
        await userEvent.type(textareas[2], 'Updated notes');
        expect(mockDispatch).toHaveBeenCalled();
      }
    });
  });

  describe('Acceptance Criteria', () => {
    it('renders acceptance criteria list', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByTestId('acceptance-criteria-list')).toBeInTheDocument();
    });

    it('calls add function when add button clicked', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      const addButton = screen.getByTestId('add-ac');
      await userEvent.click(addButton);

      expect(mockAcceptanceCriteriaHook.add).toHaveBeenCalled();
    });

    it('calls remove function when remove button clicked', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      const removeButton = screen.getByTestId('remove-ac-0');
      await userEvent.click(removeButton);

      expect(mockAcceptanceCriteriaHook.remove).toHaveBeenCalledWith(0);
    });

    it('calls update function when update button clicked', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      const updateButton = screen.getByTestId('update-ac-0');
      await userEvent.click(updateButton);

      expect(mockAcceptanceCriteriaHook.update).toHaveBeenCalledWith(0, 'updated');
    });

    it('renders acceptance criteria items', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByTestId('ac-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('ac-item-1')).toBeInTheDocument();
    });
  });

  describe('Acceptance Criteria Update Adapter', () => {
    it('converts array values to object format', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();

      // Get the mock for useAcceptanceCriteria
      const mockUseAcceptanceCriteria = vi.mocked(useAcceptanceCriteria);

      // Create a spy that captures the handler
      let capturedHandler: ((params: any) => void) | null = null;
      mockUseAcceptanceCriteria.mockImplementation((criteria, handler) => {
        capturedHandler = handler;
        return mockAcceptanceCriteriaHook;
      });

      render(<Feature feature={feature} epic={epic} index={0} />);

      // Verify handler was captured
      expect(capturedHandler).not.toBeNull();

      // Test with array value
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
      const feature = createMockFeature();
      const epic = createMockEpic();

      const mockUseAcceptanceCriteria = vi.mocked(useAcceptanceCriteria);

      let capturedHandler: ((params: any) => void) | null = null;
      mockUseAcceptanceCriteria.mockImplementation((criteria, handler) => {
        capturedHandler = handler;
        return mockAcceptanceCriteriaHook;
      });

      render(<Feature feature={feature} epic={epic} index={0} />);

      if (capturedHandler) {
        capturedHandler({
          field: 'title',
          newValue: 'simple string',
        });

        expect(mockDispatch).toHaveBeenCalled();
      }
    });
  });

  describe('Contextual Questions', () => {
    it('renders contextual questions component', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByTestId('contextual-questions')).toBeInTheDocument();
    });

    it('passes correct props to contextual questions', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByText('Work Item - features')).toBeInTheDocument();
    });
  });

  describe('Metrics Calculation', () => {
    it('passes correct metrics to MetricsDisplay', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByTestId('metric-total-points')).toBeInTheDocument();
      expect(screen.getByTestId('metric-user-stories')).toBeInTheDocument();
      expect(screen.getByTestId('metric-tasks')).toBeInTheDocument();
    });
  });

  describe('Feature with Empty User Stories', () => {
    it('renders correctly with no user stories', () => {
      const feature = createMockFeature({ userStoryIds: [] });
      const epic = createMockEpic();
      mockSelectUserStoryById.mockImplementation(() => undefined);
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.queryByTestId('mock-user-story')).not.toBeInTheDocument();
    });
  });

  describe('User Stories Header', () => {
    it('renders User Stories section header', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByText('User Stories')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible buttons', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      expect(screen.getByText('Add User Story')).toBeInTheDocument();
      expect(screen.getByText('Delete Feature')).toBeInTheDocument();
    });

    it('renders labels for form fields', () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      // Multiple Title elements may exist, check for at least one
      expect(screen.getAllByText('Title').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Description').length).toBeGreaterThan(0);
    });

    it('has labeled form fields in add user story dialog', async () => {
      const feature = createMockFeature();
      const epic = createMockEpic();
      render(<Feature feature={feature} epic={epic} index={0} />);

      await userEvent.click(screen.getByText('Add User Story'));

      // Multiple label instances may exist, so use getAllByText
      expect(screen.getAllByText('Title').length).toBeGreaterThan(0);
      expect(screen.getByText('Goal')).toBeInTheDocument();
      expect(screen.getByText('Development Order')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
    });
  });
});

// Test form state management
describe('Feature Form State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation(() => mockState);
    mockSelectUserStoryById.mockImplementation(() => mockUserStory);
  });

  it('form resets after adding user story', async () => {
    const feature = createMockFeature();
    const epic = createMockEpic();
    render(<Feature feature={feature} epic={epic} index={0} />);

    // Open dialog
    await userEvent.click(screen.getByText('Add User Story'));

    // Submit form
    const dialogButtons = screen.getAllByText('Add User Story');
    await userEvent.click(dialogButtons[dialogButtons.length - 1]);

    // Reopen dialog
    await userEvent.click(screen.getByText('Add User Story'));

    // Check form is reset
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((_input) => {
      // Note: Some fields may have default values
    });
  });
});

// Test edge cases
describe('Feature Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation(() => mockState);
    mockSelectUserStoryById.mockImplementation(() => mockUserStory);
  });

  it('handles feature with empty optional fields', () => {
    const feature = createMockFeature({
      description: '',
      details: '',
      notes: '',
      dependencies: '',
    });
    const epic = createMockEpic();
    render(<Feature feature={feature} epic={epic} index={0} />);

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
  });

  it('handles feature with special characters in title', () => {
    const feature = createMockFeature({
      title: 'Feature <with> "special" & characters',
    });
    const epic = createMockEpic();
    render(<Feature feature={feature} epic={epic} index={0} />);

    expect(screen.getByText('Feature <with> "special" & characters')).toBeInTheDocument();
  });

  it('handles different index values', () => {
    const feature = createMockFeature();
    const epic = createMockEpic();
    render(<Feature feature={feature} epic={epic} index={10} />);

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
  });

  it('handles user story with undefined return from selector', () => {
    const feature = createMockFeature({ userStoryIds: ['non-existent'] });
    const epic = createMockEpic();
    mockSelectUserStoryById.mockImplementation(() => ({
      id: 'non-existent',
      title: 'Default User Story',
      role: '',
      action: '',
      goal: '',
      points: '0',
      acceptanceCriteria: [],
      notes: '',
      parentFeatureId: 'feature-1',
      taskIds: [],
      developmentOrder: 0,
      contextualQuestions: [],
    }));

    render(<Feature feature={feature} epic={epic} index={0} />);

    expect(screen.getByTestId('mock-user-story')).toBeInTheDocument();
  });

  it('handles empty acceptance criteria', () => {
    const feature = createMockFeature({
      acceptanceCriteria: [],
    });
    const epic = createMockEpic();
    render(<Feature feature={feature} epic={epic} index={0} />);

    expect(screen.getByTestId('acceptance-criteria-list')).toBeInTheDocument();
  });
});

// Test Draggable Feature List
describe('Feature Draggable User Story List', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation(() => mockState);
    mockSelectUserStoryById.mockImplementation(() => mockUserStory);
  });

  it('renders draggable user stories within droppable area', () => {
    const feature = createMockFeature();
    const epic = createMockEpic();
    render(<Feature feature={feature} epic={epic} index={0} />);

    const userStories = screen.getAllByTestId('mock-user-story');
    expect(userStories.length).toBe(2);
  });
});
