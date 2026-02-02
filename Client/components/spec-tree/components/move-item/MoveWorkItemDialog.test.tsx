/**
 * Tests for MoveWorkItemDialog component
 *
 * F1.2.3 - Move items between parents
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MoveWorkItemDialog } from './MoveWorkItemDialog';
import { MoveableItem, PotentialParent } from '../../lib/hooks/useMoveWorkItem';

// Sample test data
const testItem: MoveableItem = {
  id: 'feature-1',
  type: 'feature',
  title: 'Login Feature',
  currentParentId: 'epic-1',
};

const testParents: PotentialParent[] = [
  { id: 'epic-1', title: 'User Management', type: 'epic', isCurrent: true },
  { id: 'epic-2', title: 'Reporting', type: 'epic', isCurrent: false },
  { id: 'epic-3', title: 'Analytics', type: 'epic', isCurrent: false },
];

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  item: testItem,
  potentialParents: testParents,
  selectedParent: null,
  onSelectParent: vi.fn(),
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('MoveWorkItemDialog', () => {
  describe('rendering', () => {
    it('renders dialog when open', () => {
      render(<MoveWorkItemDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows item title in description', () => {
      render(<MoveWorkItemDialog {...defaultProps} />);

      expect(screen.getByText('"Login Feature"')).toBeInTheDocument();
    });

    it('shows correct title based on item type', () => {
      render(<MoveWorkItemDialog {...defaultProps} />);

      expect(screen.getByText('Move Feature')).toBeInTheDocument();
    });

    it('renders all potential parents', () => {
      render(<MoveWorkItemDialog {...defaultProps} />);

      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Reporting')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('marks current parent with badge', () => {
      render(<MoveWorkItemDialog {...defaultProps} />);

      expect(screen.getByText('Current')).toBeInTheDocument();
    });
  });

  describe('parent selection', () => {
    it('calls onSelectParent when parent is clicked', () => {
      const onSelectParent = vi.fn();
      render(
        <MoveWorkItemDialog
          {...defaultProps}
          onSelectParent={onSelectParent}
        />
      );

      fireEvent.click(screen.getByText('Reporting'));

      expect(onSelectParent).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'epic-2' })
      );
    });

    it('shows selected state', () => {
      render(
        <MoveWorkItemDialog
          {...defaultProps}
          selectedParent={testParents[1]}
        />
      );

      // The selected parent should have different styling
      const reportingButton = screen.getByText('Reporting').closest('button');
      expect(reportingButton).toHaveClass('border-primary');
    });
  });

  describe('confirmation', () => {
    it('disables confirm when no parent selected', () => {
      render(<MoveWorkItemDialog {...defaultProps} />);

      const moveButton = screen.getByRole('button', { name: 'Move' });
      expect(moveButton).toBeDisabled();
    });

    it('disables confirm when current parent selected', () => {
      render(
        <MoveWorkItemDialog
          {...defaultProps}
          selectedParent={testParents[0]} // Current parent
        />
      );

      const moveButton = screen.getByRole('button', { name: 'Move' });
      expect(moveButton).toBeDisabled();
    });

    it('enables confirm when different parent selected', () => {
      render(
        <MoveWorkItemDialog
          {...defaultProps}
          selectedParent={testParents[1]} // Not current parent
        />
      );

      const moveButton = screen.getByRole('button', { name: 'Move' });
      expect(moveButton).not.toBeDisabled();
    });

    it('calls onConfirm and closes dialog on confirm', () => {
      const onConfirm = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <MoveWorkItemDialog
          {...defaultProps}
          selectedParent={testParents[1]}
          onConfirm={onConfirm}
          onOpenChange={onOpenChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Move' }));

      expect(onConfirm).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('cancellation', () => {
    it('calls onCancel and closes dialog on cancel', () => {
      const onCancel = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <MoveWorkItemDialog
          {...defaultProps}
          onCancel={onCancel}
          onOpenChange={onOpenChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onCancel).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('warning message', () => {
    it('shows warning when current parent is selected', () => {
      render(
        <MoveWorkItemDialog
          {...defaultProps}
          selectedParent={testParents[0]} // Current parent
        />
      );

      expect(
        screen.getByText(/This is the current parent/)
      ).toBeInTheDocument();
    });

    it('does not show warning when different parent selected', () => {
      render(
        <MoveWorkItemDialog
          {...defaultProps}
          selectedParent={testParents[1]}
        />
      );

      expect(
        screen.queryByText(/This is the current parent/)
      ).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows message when no parents available', () => {
      render(
        <MoveWorkItemDialog
          {...defaultProps}
          potentialParents={[]}
        />
      );

      expect(screen.getByText('No other parents available')).toBeInTheDocument();
    });
  });

  describe('parent path display', () => {
    it('shows parent path when available', () => {
      const parentsWithPath: PotentialParent[] = [
        {
          id: 'story-1',
          title: 'User can login',
          type: 'userStory',
          isCurrent: false,
          path: 'User Management > Login Feature',
        },
      ];

      render(
        <MoveWorkItemDialog
          {...defaultProps}
          item={{ ...testItem, type: 'task' }}
          potentialParents={parentsWithPath}
        />
      );

      expect(screen.getByText('User Management > Login Feature')).toBeInTheDocument();
    });
  });

  describe('different item types', () => {
    it('shows correct title for user story', () => {
      render(
        <MoveWorkItemDialog
          {...defaultProps}
          item={{ ...testItem, type: 'userStory' }}
        />
      );

      expect(screen.getByText('Move User Story')).toBeInTheDocument();
    });

    it('shows correct title for task', () => {
      render(
        <MoveWorkItemDialog
          {...defaultProps}
          item={{ ...testItem, type: 'task' }}
        />
      );

      expect(screen.getByText('Move Task')).toBeInTheDocument();
    });
  });
});
