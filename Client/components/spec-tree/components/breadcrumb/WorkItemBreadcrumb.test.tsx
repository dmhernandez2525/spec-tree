/**
 * Tests for WorkItemBreadcrumb component
 *
 * F1.2.2 - Breadcrumb navigation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkItemBreadcrumb } from './WorkItemBreadcrumb';
import { BreadcrumbItem } from '../../lib/hooks/useBreadcrumb';

// Sample breadcrumb items
const sampleItems: BreadcrumbItem[] = [
  { id: 'epic-1', type: 'epic', title: 'Epic 1', typeLabel: 'Epic', isCurrent: false },
  { id: 'feature-1', type: 'feature', title: 'Feature 1', typeLabel: 'Feature', isCurrent: false },
  { id: 'story-1', type: 'userStory', title: 'User Story 1', typeLabel: 'User Story', isCurrent: true },
];

describe('WorkItemBreadcrumb', () => {
  describe('basic rendering', () => {
    it('renders all breadcrumb items', () => {
      render(<WorkItemBreadcrumb items={sampleItems} />);

      expect(screen.getByText('Epic 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('User Story 1')).toBeInTheDocument();
    });

    it('renders empty when no items', () => {
      const { container } = render(<WorkItemBreadcrumb items={[]} />);

      // Should render nav but with empty list
      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('renders single item as current', () => {
      const singleItem: BreadcrumbItem[] = [
        { id: 'epic-1', type: 'epic', title: 'Epic 1', typeLabel: 'Epic', isCurrent: true },
      ];

      render(<WorkItemBreadcrumb items={singleItem} />);

      expect(screen.getByText('Epic 1')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('calls onNavigate when non-current item is clicked', () => {
      const onNavigate = vi.fn();
      render(<WorkItemBreadcrumb items={sampleItems} onNavigate={onNavigate} />);

      // Click on Epic 1 (not current)
      fireEvent.click(screen.getByText('Epic 1'));

      expect(onNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'epic-1' })
      );
    });

    it('does not call onNavigate when current item is clicked', () => {
      const onNavigate = vi.fn();
      render(<WorkItemBreadcrumb items={sampleItems} onNavigate={onNavigate} />);

      // Click on User Story 1 (current)
      fireEvent.click(screen.getByText('User Story 1'));

      expect(onNavigate).not.toHaveBeenCalled();
    });
  });

  describe('home link', () => {
    it('shows home link when showHome is true', () => {
      render(<WorkItemBreadcrumb items={sampleItems} showHome />);

      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('hides home link by default', () => {
      render(<WorkItemBreadcrumb items={sampleItems} />);

      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('calls onHomeClick when home is clicked', () => {
      const onHomeClick = vi.fn();
      render(
        <WorkItemBreadcrumb
          items={sampleItems}
          showHome
          onHomeClick={onHomeClick}
        />
      );

      fireEvent.click(screen.getByText('Home'));

      expect(onHomeClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('collapsing', () => {
    const manyItems: BreadcrumbItem[] = [
      { id: 'epic-1', type: 'epic', title: 'Epic 1', typeLabel: 'Epic', isCurrent: false },
      { id: 'feature-1', type: 'feature', title: 'Feature 1', typeLabel: 'Feature', isCurrent: false },
      { id: 'story-1', type: 'userStory', title: 'User Story 1', typeLabel: 'User Story', isCurrent: false },
      { id: 'task-1', type: 'task', title: 'Task 1', typeLabel: 'Task', isCurrent: false },
      { id: 'task-2', type: 'task', title: 'Task 2', typeLabel: 'Task', isCurrent: true },
    ];

    it('shows ellipsis when items exceed maxItems', () => {
      render(<WorkItemBreadcrumb items={manyItems} maxItems={3} />);

      // Should have ellipsis button with "More" text (hidden for screen readers)
      expect(screen.getByText('More')).toBeInTheDocument();
    });

    it('shows all items when within maxItems', () => {
      render(<WorkItemBreadcrumb items={sampleItems} maxItems={4} />);

      // All items should be visible
      expect(screen.getByText('Epic 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('User Story 1')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies className to container', () => {
      const { container } = render(
        <WorkItemBreadcrumb items={sampleItems} className="custom-class" />
      );

      expect(container.querySelector('nav')).toHaveClass('custom-class');
    });

    it('hides icons when showIcons is false', () => {
      const { container } = render(
        <WorkItemBreadcrumb items={sampleItems} showIcons={false} />
      );

      // SVG icons for item types should not be present
      const icons = container.querySelectorAll('svg.h-4.w-4');
      // Only separator chevrons should exist
      expect(icons.length).toBeLessThanOrEqual(sampleItems.length - 1);
    });
  });

  describe('title truncation', () => {
    it('truncates long titles', () => {
      const longTitleItems: BreadcrumbItem[] = [
        {
          id: 'epic-1',
          type: 'epic',
          title: 'This is a very long epic title that should be truncated',
          typeLabel: 'Epic',
          isCurrent: true,
        },
      ];

      render(<WorkItemBreadcrumb items={longTitleItems} />);

      // Title should be truncated (27 chars + "...") since maxLength defaults to 30
      // "This is a very long epic ti..."
      expect(screen.getByText(/This is a very long epic ti\.\.\./)).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('hides Home text in compact mode', () => {
      render(<WorkItemBreadcrumb items={sampleItems} showHome compact />);

      // Home icon should exist but not the text
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });
  });
});
