/**
 * Tests for TreeControls component
 *
 * F1.2.1 - Collapsible tree view
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreeControls } from './TreeControls';

describe('TreeControls', () => {
  const defaultProps = {
    onExpandAll: vi.fn(),
    onCollapseAll: vi.fn(),
  };

  describe('basic rendering', () => {
    it('renders expand and collapse buttons', () => {
      render(<TreeControls {...defaultProps} />);

      expect(screen.getByText('Expand All')).toBeInTheDocument();
      expect(screen.getByText('Collapse All')).toBeInTheDocument();
    });

    it('calls onExpandAll when expand button clicked', () => {
      const onExpandAll = vi.fn();
      render(<TreeControls {...defaultProps} onExpandAll={onExpandAll} />);

      fireEvent.click(screen.getByText('Expand All'));

      expect(onExpandAll).toHaveBeenCalledTimes(1);
    });

    it('calls onCollapseAll when collapse button clicked', () => {
      const onCollapseAll = vi.fn();
      // Need to set allCollapsed=false to enable the button
      render(<TreeControls {...defaultProps} onCollapseAll={onCollapseAll} allCollapsed={false} />);

      fireEvent.click(screen.getByText('Collapse All'));

      expect(onCollapseAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('disabled states', () => {
    it('disables expand button when all expanded', () => {
      render(<TreeControls {...defaultProps} allExpanded />);

      const expandButton = screen.getByText('Expand All').closest('button');
      expect(expandButton).toBeDisabled();
    });

    it('disables collapse button when all collapsed', () => {
      render(<TreeControls {...defaultProps} allCollapsed />);

      const collapseButton = screen.getByText('Collapse All').closest('button');
      expect(collapseButton).toBeDisabled();
    });
  });

  describe('count display', () => {
    it('shows expanded count when provided', () => {
      render(
        <TreeControls
          {...defaultProps}
          expandedCount={5}
          totalCount={10}
        />
      );

      expect(screen.getByText('5 of 10 expanded')).toBeInTheDocument();
    });

    it('hides count when total is 0', () => {
      render(
        <TreeControls
          {...defaultProps}
          expandedCount={0}
          totalCount={0}
        />
      );

      expect(screen.queryByText(/expanded/)).not.toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('renders compact version with icons only', () => {
      render(
        <TreeControls
          {...defaultProps}
          compact
          expandedCount={3}
          totalCount={5}
        />
      );

      // Should not show full text in compact mode
      expect(screen.queryByText('Expand All')).not.toBeInTheDocument();
      expect(screen.queryByText('Collapse All')).not.toBeInTheDocument();

      // Should show compact count
      expect(screen.getByText('3/5')).toBeInTheDocument();
    });
  });

  describe('level controls', () => {
    it('shows level dropdown when level callbacks provided', () => {
      render(
        <TreeControls
          {...defaultProps}
          onExpandLevel={vi.fn()}
          onCollapseLevel={vi.fn()}
        />
      );

      expect(screen.getByText('By Level')).toBeInTheDocument();
    });

    it('hides level dropdown when level callbacks not provided', () => {
      render(<TreeControls {...defaultProps} />);

      expect(screen.queryByText('By Level')).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies className to container', () => {
      const { container } = render(
        <TreeControls {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
