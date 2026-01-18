import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskSummary } from './TaskSummary';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock the Select component directly
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, defaultValue }: { children: React.ReactNode; onValueChange?: (value: string) => void; defaultValue?: string }) => {
    return (
      <div data-testid="select-root" data-default={defaultValue}>
        {children}
        {onValueChange && (
          <select
            data-testid="hidden-select"
            onChange={(e) => onValueChange(e.target.value)}
            defaultValue={defaultValue}
            style={{ display: 'none' }}
          >
            <option value="all">All Tasks</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        )}
      </div>
    );
  },
  SelectTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button type="button" className={className} data-testid="select-trigger">
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">{placeholder || 'All Tasks'}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`select-item-${value}`} data-value={value}>
      {children}
    </div>
  ),
}));

// Mock the scroll-area component directly
vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="scroll-area">
      {children}
    </div>
  ),
  ScrollBar: () => <div />,
}));

// Mock the Checkbox component directly
vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
    className,
  }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    className?: string;
  }) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={className}
      onClick={() => onCheckedChange?.(!checked)}
      data-testid="checkbox"
    >
      {checked && <span>Checked</span>}
    </button>
  ),
}));

describe('TaskSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component', () => {
    render(<TaskSummary />);

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('displays task remaining count', () => {
    render(<TaskSummary />);

    // The component shows "X remaining" where X is the count of incomplete tasks
    // Initial tasks have 4 incomplete: Update user interface, Implement auth, Review PRs, Write API docs
    expect(screen.getByText('4 remaining')).toBeInTheDocument();
  });

  it('renders all initial tasks', () => {
    render(<TaskSummary />);

    expect(screen.getByText('Update user interface design')).toBeInTheDocument();
    expect(
      screen.getByText('Implement authentication system')
    ).toBeInTheDocument();
    expect(screen.getByText('Create social media content')).toBeInTheDocument();
    expect(screen.getByText('Review pull requests')).toBeInTheDocument();
    expect(screen.getByText('Write API documentation')).toBeInTheDocument();
  });

  it('renders project names for tasks', () => {
    render(<TaskSummary />);

    const websiteRedesigns = screen.getAllByText('Website Redesign');
    expect(websiteRedesigns.length).toBeGreaterThan(0);

    const mobileAppDevs = screen.getAllByText('Mobile App Development');
    expect(mobileAppDevs.length).toBeGreaterThan(0);

    expect(screen.getByText('Marketing Campaign')).toBeInTheDocument();
  });

  it('renders priority badges', () => {
    render(<TaskSummary />);

    const highBadges = screen.getAllByText('high');
    expect(highBadges.length).toBe(2);

    const mediumBadges = screen.getAllByText('medium');
    expect(mediumBadges.length).toBe(2);

    const lowBadges = screen.getAllByText('low');
    expect(lowBadges.length).toBe(1);
  });

  it('renders checkboxes for each task', () => {
    render(<TaskSummary />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(5);
  });

  it('renders the filter select', () => {
    render(<TaskSummary />);

    expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
  });

  it('toggles task completion when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskSummary />);

    // Find the first task's checkbox and click it
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];

    // Check initial state - first task should be uncompleted
    expect(firstCheckbox).toHaveAttribute('aria-checked', 'false');

    // Click to complete
    await user.click(firstCheckbox);

    // Should now be completed
    expect(firstCheckbox).toHaveAttribute('aria-checked', 'true');
  });

  it('shows completed task with strikethrough style', async () => {
    render(<TaskSummary />);

    // Find the completed task (Create social media content - starts as completed)
    const completedTaskText = screen.getByText('Create social media content');
    expect(completedTaskText).toHaveClass('line-through');
  });

  it('applies correct priority colors to badges', () => {
    render(<TaskSummary />);

    const highBadges = screen.getAllByText('high');
    highBadges.forEach((badge) => {
      expect(badge).toHaveClass('text-red-500');
      expect(badge).toHaveClass('border-red-500');
    });

    const mediumBadges = screen.getAllByText('medium');
    mediumBadges.forEach((badge) => {
      expect(badge).toHaveClass('text-yellow-500');
      expect(badge).toHaveClass('border-yellow-500');
    });

    const lowBadges = screen.getAllByText('low');
    lowBadges.forEach((badge) => {
      expect(badge).toHaveClass('text-blue-500');
      expect(badge).toHaveClass('border-blue-500');
    });
  });

  it('renders scroll area for task list', () => {
    render(<TaskSummary />);

    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });

  it('renders tasks in a list structure', () => {
    render(<TaskSummary />);

    // Each task should have a border and rounded styling
    const taskItems = screen.getAllByText(/Website Redesign|Mobile App Development|Marketing Campaign/);
    expect(taskItems.length).toBeGreaterThan(0);
  });
});
