import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock all dependencies first
const mockDispatch = vi.fn();
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(() => mockDispatch),
}));

const mockDeleteTask = vi.fn();
const mockUpdateTaskField = vi.fn();

vi.mock('../../../../lib/store/sow-slice', () => ({
  deleteTask: (id: string) => mockDeleteTask(id),
  updateTaskField: (payload: unknown) => mockUpdateTaskField(payload),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, ...props }: React.PropsWithChildren<{ onClick?: () => void; variant?: string; size?: string }>) => (
    <button onClick={onClick} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  CardTitle: ({ children }: React.PropsWithChildren) => <div data-testid="card-title">{children}</div>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: React.PropsWithChildren<{ open?: boolean }>) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: React.PropsWithChildren) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: React.PropsWithChildren) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: React.PropsWithChildren) => <div data-testid="dialog-title">{children}</div>,
  DialogFooter: ({ children }: React.PropsWithChildren) => <div data-testid="dialog-footer">{children}</div>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, id, type, ...props }: { value?: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; id?: string; type?: string }) => (
    <input value={value || ''} onChange={onChange} id={id} type={type} data-testid={id ? `input-${id}` : 'input'} {...props} />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: React.PropsWithChildren<{ htmlFor?: string }>) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, id, ...props }: { value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; id?: string }) => (
    <textarea value={value || ''} onChange={onChange} id={id} data-testid={id ? `textarea-${id}` : 'textarea'} {...props} />
  ),
}));

vi.mock('@/components/ui/accordion', () => ({
  AccordionContent: ({ children }: React.PropsWithChildren) => <div data-testid="accordion-content">{children}</div>,
  AccordionTrigger: ({ children }: React.PropsWithChildren) => <div data-testid="accordion-trigger">{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: React.PropsWithChildren<{ variant?: string }>) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  ),
}));

vi.mock('lucide-react', () => ({
  GripVertical: () => <span data-testid="grip-icon">GripIcon</span>,
}));

// Import after mocks
import Task from './task';
import { TaskType, TaskFields } from '../../lib/types/work-items';

// Create mock data
const createMockTask = (overrides?: Partial<TaskType>): TaskType => ({
  id: 'task-1',
  title: 'Test Task',
  details: 'Test Details',
  priority: 1,
  notes: 'Test Notes',
  parentUserStoryId: 'us-1',
  dependentTaskIds: [],
  contextualQuestions: [],
  ...overrides,
});

describe('Task Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Module Exports', () => {
    it('module can be imported', () => {
      expect(Task).toBeDefined();
    });

    it('exports a default component', () => {
      expect(typeof Task).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('renders task with title', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('renders task with priority badge', () => {
      const task = createMockTask({ priority: 1 });
      render(<Task task={task} />);

      expect(screen.getByText(/Priority: 1/)).toBeInTheDocument();
    });

    it('renders task details', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      expect(screen.getByText('Test Details')).toBeInTheDocument();
    });

    it('renders task notes', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      expect(screen.getByText('Test Notes')).toBeInTheDocument();
    });

    it('renders task without notes when notes is empty', () => {
      const task = createMockTask({ notes: '' });
      render(<Task task={task} />);

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      // The notes section should not be rendered due to conditional rendering
    });

    it('renders with correct id attribute', () => {
      const task = createMockTask({ id: 'my-task-id' });
      render(<Task task={task} />);

      expect(document.getElementById('work-item-my-task-id')).toBeInTheDocument();
    });

    it('renders drag handle when dragHandleProps provided', () => {
      const task = createMockTask();
      const dragHandleProps = {} as any;
      render(<Task task={task} dragHandleProps={dragHandleProps} />);

      expect(screen.getByTestId('grip-icon')).toBeInTheDocument();
    });

    it('does not render drag handle when dragHandleProps not provided', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      expect(screen.queryByTestId('grip-icon')).not.toBeInTheDocument();
    });

    it('does not render drag handle when dragHandleProps is null', () => {
      const task = createMockTask();
      render(<Task task={task} dragHandleProps={null} />);

      expect(screen.queryByTestId('grip-icon')).not.toBeInTheDocument();
    });

    it('does not render drag handle when dragHandleProps is undefined', () => {
      const task = createMockTask();
      render(<Task task={task} dragHandleProps={undefined} />);

      expect(screen.queryByTestId('grip-icon')).not.toBeInTheDocument();
    });

    it('renders Task label', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      expect(screen.getByText('Task')).toBeInTheDocument();
    });
  });

  describe('Priority Display', () => {
    it('displays priority 1', () => {
      const task = createMockTask({ priority: 1 });
      render(<Task task={task} />);

      expect(screen.getByText(/Priority: 1/)).toBeInTheDocument();
    });

    it('displays priority 5', () => {
      const task = createMockTask({ priority: 5 });
      render(<Task task={task} />);

      expect(screen.getByText(/Priority: 5/)).toBeInTheDocument();
    });

    it('displays priority 10', () => {
      const task = createMockTask({ priority: 10 });
      render(<Task task={task} />);

      expect(screen.getByText(/Priority: 10/)).toBeInTheDocument();
    });

    it('displays priority 0', () => {
      const task = createMockTask({ priority: 0 });
      render(<Task task={task} />);

      expect(screen.getByText(/Priority: 0/)).toBeInTheDocument();
    });
  });

  describe('Edit Dialog', () => {
    it('opens edit dialog when edit button clicked', async () => {
      const task = createMockTask();
      render(<Task task={task} />);

      const editButton = screen.getByText('Edit');
      await userEvent.click(editButton);

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });

    it('displays task title in edit dialog', async () => {
      const task = createMockTask({ title: 'My Task Title' });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const titleInput = screen.getByTestId('input-title');
      expect(titleInput).toHaveValue('My Task Title');
    });

    it('displays task details in edit dialog', async () => {
      const task = createMockTask({ details: 'My Task Details' });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const detailsTextarea = screen.getByTestId('textarea-details');
      expect(detailsTextarea).toHaveValue('My Task Details');
    });

    it('displays task priority in edit dialog as string', async () => {
      const task = createMockTask({ priority: 5 });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const priorityInput = screen.getByTestId('input-priority');
      // Priority is displayed as string from task object
      expect(priorityInput).toHaveValue('5');
    });

    it('displays task notes in edit dialog', async () => {
      const task = createMockTask({ notes: 'My Notes' });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const notesTextarea = screen.getByTestId('textarea-notes');
      expect(notesTextarea).toHaveValue('My Notes');
    });

    it('renders labels in edit dialog', async () => {
      const task = createMockTask();
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      // Check that dialog has labels rendered
      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });

  describe('Field Updates in Edit Dialog', () => {
    it('dispatches updateTaskField when title is changed', async () => {
      const task = createMockTask({ title: 'Original Title' });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const titleInput = screen.getByTestId('input-title');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      expect(mockUpdateTaskField).toHaveBeenCalledWith({
        taskId: 'task-1',
        field: TaskFields.Title,
        newValue: 'New Title',
      });
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('dispatches updateTaskField when details is changed', async () => {
      const task = createMockTask({ details: 'Original Details' });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const detailsTextarea = screen.getByTestId('textarea-details');
      fireEvent.change(detailsTextarea, { target: { value: 'New Details' } });

      expect(mockUpdateTaskField).toHaveBeenCalledWith({
        taskId: 'task-1',
        field: TaskFields.Details,
        newValue: 'New Details',
      });
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('dispatches updateTaskField when priority is changed', async () => {
      const task = createMockTask({ priority: 1 });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const priorityInput = screen.getByTestId('input-priority');
      fireEvent.change(priorityInput, { target: { value: '5' } });

      expect(mockUpdateTaskField).toHaveBeenCalledWith({
        taskId: 'task-1',
        field: TaskFields.Priority,
        newValue: '5',
      });
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('dispatches updateTaskField when notes is changed', async () => {
      const task = createMockTask({ notes: 'Original Notes' });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const notesTextarea = screen.getByTestId('textarea-notes');
      fireEvent.change(notesTextarea, { target: { value: 'New Notes' } });

      expect(mockUpdateTaskField).toHaveBeenCalledWith({
        taskId: 'task-1',
        field: TaskFields.Notes,
        newValue: 'New Notes',
      });
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Delete Task', () => {
    it('dispatches deleteTask action when delete button clicked', async () => {
      const task = createMockTask({ id: 'task-to-delete' });
      render(<Task task={task} />);

      const deleteButton = screen.getByText('Delete');
      await userEvent.click(deleteButton);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('calls deleteTask with correct task id', async () => {
      const task = createMockTask({ id: 'my-task-id' });
      render(<Task task={task} />);

      const deleteButton = screen.getByText('Delete');
      await userEvent.click(deleteButton);

      expect(mockDeleteTask).toHaveBeenCalledWith('my-task-id');
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Action Buttons', () => {
    it('renders edit button', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('renders delete button', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('edit button has outline variant', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      const editButton = screen.getByText('Edit');
      expect(editButton).toHaveAttribute('data-variant', 'outline');
    });

    it('delete button has destructive variant', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      const deleteButton = screen.getByText('Delete');
      expect(deleteButton).toHaveAttribute('data-variant', 'destructive');
    });
  });

  describe('Edge Cases', () => {
    it('handles task with empty title', () => {
      const task = createMockTask({ title: '' });
      render(<Task task={task} />);

      // Should render without crashing
      expect(screen.getByTestId('card-title')).toBeInTheDocument();
    });

    it('handles task with empty details', () => {
      const task = createMockTask({ details: '' });
      render(<Task task={task} />);

      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('handles task with empty notes', () => {
      const task = createMockTask({ notes: '' });
      render(<Task task={task} />);

      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('handles task with special characters in title', () => {
      const task = createMockTask({ title: 'Task <with> "special" & characters' });
      render(<Task task={task} />);

      expect(screen.getByText('Task <with> "special" & characters')).toBeInTheDocument();
    });

    it('handles task with special characters in details', () => {
      const task = createMockTask({ details: 'Details <with> "special" & characters' });
      render(<Task task={task} />);

      expect(screen.getByText('Details <with> "special" & characters')).toBeInTheDocument();
    });

    it('handles task with special characters in notes', () => {
      const task = createMockTask({ notes: 'Notes <with> "special" & characters' });
      render(<Task task={task} />);

      expect(screen.getByText('Notes <with> "special" & characters')).toBeInTheDocument();
    });

    it('handles task with very long title', () => {
      const longTitle = 'A'.repeat(500);
      const task = createMockTask({ title: longTitle });
      render(<Task task={task} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles task with very long details', () => {
      const longDetails = 'B'.repeat(1000);
      const task = createMockTask({ details: longDetails });
      render(<Task task={task} />);

      expect(screen.getByText(longDetails)).toBeInTheDocument();
    });

    it('handles task with zero priority', () => {
      const task = createMockTask({ priority: 0 });
      render(<Task task={task} />);

      expect(screen.getByText(/Priority: 0/)).toBeInTheDocument();
    });

    it('handles task with negative priority', () => {
      const task = createMockTask({ priority: -1 });
      render(<Task task={task} />);

      expect(screen.getByText(/Priority: -1/)).toBeInTheDocument();
    });

    it('handles task with large priority value', () => {
      const task = createMockTask({ priority: 9999 });
      render(<Task task={task} />);

      expect(screen.getByText(/Priority: 9999/)).toBeInTheDocument();
    });
  });

  describe('Edit Dialog State Management', () => {
    it('initializes edit form with task values', async () => {
      const task = createMockTask({
        title: 'Initial Title',
        details: 'Initial Details',
        priority: 3,
        notes: 'Initial Notes',
      });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      expect(screen.getByTestId('input-title')).toHaveValue('Initial Title');
      expect(screen.getByTestId('textarea-details')).toHaveValue('Initial Details');
      expect(screen.getByTestId('input-priority')).toHaveValue('3');
      expect(screen.getByTestId('textarea-notes')).toHaveValue('Initial Notes');
    });

    it('auto-saves changes when input changes', async () => {
      const task = createMockTask({ title: 'Original' });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const titleInput = screen.getByTestId('input-title');
      fireEvent.change(titleInput, { target: { value: 'Modified' } });

      // The component auto-saves on change
      expect(mockUpdateTaskField).toHaveBeenCalled();
    });
  });

  describe('Input Field Types', () => {
    it('title field is an input element', async () => {
      const task = createMockTask();
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const titleInput = screen.getByTestId('input-title');
      expect(titleInput.tagName).toBe('INPUT');
    });

    it('details field is a textarea element', async () => {
      const task = createMockTask();
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const detailsTextarea = screen.getByTestId('textarea-details');
      expect(detailsTextarea.tagName).toBe('TEXTAREA');
    });

    it('priority field is a text input', async () => {
      const task = createMockTask();
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const priorityInput = screen.getByTestId('input-priority');
      expect(priorityInput).toHaveAttribute('type', 'text');
    });

    it('notes field is a textarea element', async () => {
      const task = createMockTask();
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      const notesTextarea = screen.getByTestId('textarea-notes');
      expect(notesTextarea.tagName).toBe('TEXTAREA');
    });
  });

  describe('Accessibility', () => {
    it('has accessible edit button', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('has accessible delete button', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('has labeled form fields in edit dialog', async () => {
      const task = createMockTask();
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));

      // Labels are dynamically generated from field names
      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });

  describe('Drag Handle with Different Props', () => {
    it('renders drag handle with empty object props', () => {
      const task = createMockTask();
      render(<Task task={task} dragHandleProps={{} as any} />);

      expect(screen.getByTestId('grip-icon')).toBeInTheDocument();
    });

    it('renders drag handle with custom props', () => {
      const task = createMockTask();
      const customProps = { 'data-custom': 'value' };
      render(<Task task={task} dragHandleProps={customProps as any} />);

      expect(screen.getByTestId('grip-icon')).toBeInTheDocument();
    });

    it('drag handle is visually present when props provided', () => {
      const task = createMockTask();
      render(<Task task={task} dragHandleProps={{} as any} />);

      const gripIcon = screen.getByTestId('grip-icon');
      expect(gripIcon).toBeInTheDocument();
      expect(gripIcon.textContent).toBe('GripIcon');
    });
  });

  describe('TaskFields enum usage', () => {
    it('updates correct field for title', async () => {
      const task = createMockTask();
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));
      const titleInput = screen.getByTestId('input-title');
      fireEvent.change(titleInput, { target: { value: 'new value' } });

      expect(mockUpdateTaskField).toHaveBeenCalledWith(expect.objectContaining({
        field: TaskFields.Title,
      }));
    });

    it('updates correct field for details', async () => {
      const task = createMockTask();
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));
      const detailsTextarea = screen.getByTestId('textarea-details');
      fireEvent.change(detailsTextarea, { target: { value: 'new details' } });

      expect(mockUpdateTaskField).toHaveBeenCalledWith(expect.objectContaining({
        field: TaskFields.Details,
      }));
    });

    it('updates correct field for priority', async () => {
      const task = createMockTask({ priority: 1 });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));
      const priorityInput = screen.getByTestId('input-priority');
      fireEvent.change(priorityInput, { target: { value: '5' } });

      expect(mockUpdateTaskField).toHaveBeenCalledWith(expect.objectContaining({
        field: TaskFields.Priority,
      }));
    });

    it('updates correct field for notes', async () => {
      const task = createMockTask();
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));
      const notesTextarea = screen.getByTestId('textarea-notes');
      fireEvent.change(notesTextarea, { target: { value: 'new notes' } });

      expect(mockUpdateTaskField).toHaveBeenCalledWith(expect.objectContaining({
        field: TaskFields.Notes,
      }));
    });

    it('includes task id in update payload', async () => {
      const task = createMockTask({ id: 'specific-task-id' });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));
      const titleInput = screen.getByTestId('input-title');
      fireEvent.change(titleInput, { target: { value: 'test' } });

      expect(mockUpdateTaskField).toHaveBeenCalledWith(expect.objectContaining({
        taskId: 'specific-task-id',
      }));
    });

    it('includes new value in update payload', async () => {
      const task = createMockTask({ title: 'Original' });
      render(<Task task={task} />);

      await userEvent.click(screen.getByText('Edit'));
      const titleInput = screen.getByTestId('input-title');
      fireEvent.change(titleInput, { target: { value: 'NewValue' } });

      expect(mockUpdateTaskField).toHaveBeenCalledWith(expect.objectContaining({
        newValue: 'NewValue',
      }));
    });
  });

  describe('Component ID attribute', () => {
    it('generates work-item id from task id', () => {
      const task = createMockTask({ id: 'task-123' });
      render(<Task task={task} />);

      expect(document.getElementById('work-item-task-123')).toBeInTheDocument();
    });

    it('handles special characters in task id for work-item id', () => {
      const task = createMockTask({ id: 'task_123-abc' });
      render(<Task task={task} />);

      expect(document.getElementById('work-item-task_123-abc')).toBeInTheDocument();
    });
  });

  describe('Details and Priority Labels', () => {
    it('renders Details label in view mode', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      // The Details label is in the accordion content
      const labels = screen.getAllByText('Details');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('renders Priority label in view mode', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      // The Priority label is in the accordion content
      const labels = screen.getAllByText('Priority');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('renders Notes label when notes exist', () => {
      const task = createMockTask({ notes: 'Some notes' });
      render(<Task task={task} />);

      expect(screen.getByText('Notes')).toBeInTheDocument();
    });
  });

  describe('Badge Component', () => {
    it('renders badge with outline variant', () => {
      const task = createMockTask();
      render(<Task task={task} />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'outline');
    });

    it('badge contains priority text', () => {
      const task = createMockTask({ priority: 7 });
      render(<Task task={task} />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('Priority: 7');
    });
  });
});
