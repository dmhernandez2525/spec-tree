import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AcceptanceCriteriaList from './acceptance-criteria-list';

describe('AcceptanceCriteriaList', () => {
  const mockCriteria = [
    { text: 'First criteria' },
    { text: 'Second criteria' },
  ];
  const mockAdd = vi.fn();
  const mockRemove = vi.fn();
  const mockUpdate = vi.fn();

  const defaultProps = {
    acceptanceCriteria: mockCriteria,
    add: mockAdd,
    remove: mockRemove,
    update: mockUpdate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component', () => {
    render(<AcceptanceCriteriaList {...defaultProps} />);

    expect(screen.getByText('Acceptance Criteria')).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<AcceptanceCriteriaList {...defaultProps} />);

    expect(screen.getByText('Add Criteria')).toBeInTheDocument();
  });

  it('calls add when add button is clicked', () => {
    render(<AcceptanceCriteriaList {...defaultProps} />);

    fireEvent.click(screen.getByText('Add Criteria'));
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });

  it('renders all criteria items', () => {
    render(<AcceptanceCriteriaList {...defaultProps} />);

    expect(screen.getByDisplayValue('First criteria')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Second criteria')).toBeInTheDocument();
  });

  it('calls update when criteria text changes', () => {
    render(<AcceptanceCriteriaList {...defaultProps} />);

    const textarea = screen.getByDisplayValue('First criteria');
    fireEvent.change(textarea, { target: { value: 'Updated criteria' } });

    expect(mockUpdate).toHaveBeenCalledWith(0, 'Updated criteria');
  });

  it('calls remove when remove button is clicked', () => {
    render(<AcceptanceCriteriaList {...defaultProps} />);

    // There should be 2 remove buttons (one for each criteria)
    const removeButtons = screen.getAllByRole('button').filter((btn) =>
      btn.querySelector('.lucide-x')
    );
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[0]);
    expect(mockRemove).toHaveBeenCalledWith(0);
  });

  it('renders empty state when no criteria', () => {
    render(
      <AcceptanceCriteriaList
        {...defaultProps}
        acceptanceCriteria={[]}
      />
    );

    expect(screen.getByText('Acceptance Criteria')).toBeInTheDocument();
    expect(screen.getByText('Add Criteria')).toBeInTheDocument();
    // No textareas should be present
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders placeholder text for textareas', () => {
    render(
      <AcceptanceCriteriaList
        {...defaultProps}
        acceptanceCriteria={[{ text: '' }]}
      />
    );

    expect(screen.getByPlaceholderText('Enter acceptance criteria...')).toBeInTheDocument();
  });

  it('handles null/undefined acceptanceCriteria gracefully', () => {
    render(
      <AcceptanceCriteriaList
        {...defaultProps}
        acceptanceCriteria={undefined as any}
      />
    );

    // Should not crash, just render the header
    expect(screen.getByText('Acceptance Criteria')).toBeInTheDocument();
  });

  it('renders with correct layout structure', () => {
    const { container } = render(<AcceptanceCriteriaList {...defaultProps} />);

    // Main container has space-y-4
    const mainContainer = container.querySelector('.space-y-4');
    expect(mainContainer).toBeInTheDocument();

    // Header has flex layout
    const header = container.querySelector('.flex.items-center.justify-between');
    expect(header).toBeInTheDocument();
  });

  it('updates correct criteria based on index', () => {
    render(<AcceptanceCriteriaList {...defaultProps} />);

    const secondTextarea = screen.getByDisplayValue('Second criteria');
    fireEvent.change(secondTextarea, { target: { value: 'New second' } });

    expect(mockUpdate).toHaveBeenCalledWith(1, 'New second');
  });

  it('removes correct criteria based on index', () => {
    render(<AcceptanceCriteriaList {...defaultProps} />);

    const removeButtons = screen.getAllByRole('button').filter((btn) =>
      btn.querySelector('.lucide-x')
    );

    fireEvent.click(removeButtons[1]);
    expect(mockRemove).toHaveBeenCalledWith(1);
  });
});
