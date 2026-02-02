import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  LoadingSkeleton,
  LoadingSkeletonCard,
  LoadingSkeletonTable,
  LoadingSkeletonList,
} from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<LoadingSkeleton />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders with custom aria-label', () => {
      render(<LoadingSkeleton aria-label="Loading content" />);

      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Loading content'
      );
    });

    it('applies custom className', () => {
      render(<LoadingSkeleton className="custom-class" />);

      expect(screen.getByRole('status')).toHaveClass('custom-class');
    });

    it('includes screen reader text', () => {
      render(<LoadingSkeleton aria-label="Loading content" />);

      expect(screen.getByText('Loading content')).toHaveClass('sr-only');
    });
  });

  describe('variants', () => {
    it('applies text variant (default)', () => {
      render(<LoadingSkeleton variant="text" />);

      expect(screen.getByRole('status')).toHaveClass('rounded-md');
    });

    it('applies circular variant', () => {
      render(<LoadingSkeleton variant="circular" />);

      expect(screen.getByRole('status')).toHaveClass('rounded-full');
    });

    it('applies rectangular variant', () => {
      render(<LoadingSkeleton variant="rectangular" />);

      expect(screen.getByRole('status')).toHaveClass('rounded-none');
    });

    it('applies rounded variant', () => {
      render(<LoadingSkeleton variant="rounded" />);

      expect(screen.getByRole('status')).toHaveClass('rounded-lg');
    });
  });

  describe('dimensions', () => {
    it('applies width as string', () => {
      render(<LoadingSkeleton width="200px" />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '200px' });
    });

    it('applies width as number', () => {
      render(<LoadingSkeleton width={150} />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '150px' });
    });

    it('applies height as string', () => {
      render(<LoadingSkeleton height="50px" />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ height: '50px' });
    });

    it('applies height as number', () => {
      render(<LoadingSkeleton height={48} />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ height: '48px' });
    });
  });

  describe('sizes', () => {
    it('applies xs size', () => {
      render(<LoadingSkeleton size="xs" />);

      expect(screen.getByRole('status')).toHaveClass('h-2');
    });

    it('applies sm size', () => {
      render(<LoadingSkeleton size="sm" />);

      expect(screen.getByRole('status')).toHaveClass('h-3');
    });

    it('applies md size (default)', () => {
      render(<LoadingSkeleton />);

      expect(screen.getByRole('status')).toHaveClass('h-4');
    });

    it('applies lg size', () => {
      render(<LoadingSkeleton size="lg" />);

      expect(screen.getByRole('status')).toHaveClass('h-6');
    });

    it('applies xl size', () => {
      render(<LoadingSkeleton size="xl" />);

      expect(screen.getByRole('status')).toHaveClass('h-8');
    });
  });

  describe('multiple lines', () => {
    it('renders multiple lines', () => {
      const { container } = render(<LoadingSkeleton lines={3} />);

      const skeletons = container.querySelectorAll('.bg-muted');
      expect(skeletons).toHaveLength(3);
    });

    it('renders last line shorter', () => {
      const { container } = render(<LoadingSkeleton lines={3} />);

      const skeletons = container.querySelectorAll('.bg-muted');
      expect(skeletons[2]).toHaveClass('w-3/4');
    });
  });

  describe('animation', () => {
    it('has animate-pulse class by default', () => {
      render(<LoadingSkeleton />);

      expect(screen.getByRole('status')).toHaveClass('animate-pulse');
    });

    it('does not animate when animate is false', () => {
      render(<LoadingSkeleton animate={false} />);

      expect(screen.getByRole('status')).not.toHaveClass('animate-pulse');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref', () => {
      const ref = vi.fn();
      render(<LoadingSkeleton ref={ref} />);

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(LoadingSkeleton.displayName).toBe('LoadingSkeleton');
    });
  });
});

describe('LoadingSkeletonCard', () => {
  it('renders with avatar by default', () => {
    const { container } = render(<LoadingSkeletonCard />);

    // Avatar is circular skeleton
    const circularSkeleton = container.querySelector('.rounded-full');
    expect(circularSkeleton).toBeInTheDocument();
  });

  it('renders without avatar when showAvatar is false', () => {
    const { container } = render(<LoadingSkeletonCard showAvatar={false} />);

    const circularSkeleton = container.querySelector('.rounded-full');
    expect(circularSkeleton).not.toBeInTheDocument();
  });

  it('renders default 3 lines', () => {
    render(<LoadingSkeletonCard />);

    // Title + content lines
    expect(screen.getByLabelText('Loading card')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSkeletonCard className="custom-class" />);

    expect(screen.getByLabelText('Loading card')).toHaveClass('custom-class');
  });

  it('has correct displayName', () => {
    expect(LoadingSkeletonCard.displayName).toBe('LoadingSkeletonCard');
  });
});

describe('LoadingSkeletonTable', () => {
  it('renders default 5 rows', () => {
    const { container } = render(<LoadingSkeletonTable />);

    // Header + 5 rows = 6 flex containers with gap-4
    const rows = container.querySelectorAll('.flex.gap-4');
    expect(rows).toHaveLength(6);
  });

  it('renders custom number of rows', () => {
    const { container } = render(<LoadingSkeletonTable rows={3} />);

    // Header + 3 rows
    const rows = container.querySelectorAll('.flex.gap-4');
    expect(rows).toHaveLength(4);
  });

  it('renders default 4 columns', () => {
    const { container } = render(<LoadingSkeletonTable />);

    // First row should have 4 skeleton cells
    const headerCells = container
      .querySelector('.border-b')
      ?.querySelectorAll('[role="status"]');
    expect(headerCells).toHaveLength(4);
  });

  it('renders custom number of columns', () => {
    const { container } = render(<LoadingSkeletonTable columns={6} />);

    const headerCells = container
      .querySelector('.border-b')
      ?.querySelectorAll('[role="status"]');
    expect(headerCells).toHaveLength(6);
  });

  it('has correct displayName', () => {
    expect(LoadingSkeletonTable.displayName).toBe('LoadingSkeletonTable');
  });
});

describe('LoadingSkeletonList', () => {
  it('renders default 5 items', () => {
    const { container } = render(<LoadingSkeletonList />);

    const items = container.querySelectorAll('.flex.items-center.gap-3');
    expect(items).toHaveLength(5);
  });

  it('renders custom number of items', () => {
    const { container } = render(<LoadingSkeletonList items={3} />);

    const items = container.querySelectorAll('.flex.items-center.gap-3');
    expect(items).toHaveLength(3);
  });

  it('renders with icons by default', () => {
    const { container } = render(<LoadingSkeletonList />);

    const icons = container.querySelectorAll('.rounded-full');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('renders without icons when showIcon is false', () => {
    const { container } = render(<LoadingSkeletonList showIcon={false} />);

    // Should not have circular skeletons (icons)
    const icons = container.querySelectorAll('.rounded-full');
    expect(icons).toHaveLength(0);
  });

  it('has correct displayName', () => {
    expect(LoadingSkeletonList.displayName).toBe('LoadingSkeletonList');
  });
});
