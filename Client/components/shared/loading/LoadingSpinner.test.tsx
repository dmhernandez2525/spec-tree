import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  LoadingSpinner,
  PageLoadingSpinner,
  InlineLoadingSpinner,
} from './LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<LoadingSpinner />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading')).toBeInTheDocument(); // sr-only
    });

    it('renders with custom aria-label', () => {
      render(<LoadingSpinner aria-label="Please wait" />);

      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Please wait'
      );
    });

    it('applies custom className', () => {
      render(<LoadingSpinner className="custom-class" />);

      expect(screen.getByRole('status')).toHaveClass('custom-class');
    });
  });

  describe('variants', () => {
    it('applies default variant styles', () => {
      render(<LoadingSpinner variant="default" />);

      const spinner = screen.getByRole('status').querySelector('svg');
      expect(spinner).toHaveClass('text-foreground');
    });

    it('applies primary variant styles', () => {
      render(<LoadingSpinner variant="primary" />);

      const spinner = screen.getByRole('status').querySelector('svg');
      expect(spinner).toHaveClass('text-primary');
    });

    it('applies secondary variant styles', () => {
      render(<LoadingSpinner variant="secondary" />);

      const spinner = screen.getByRole('status').querySelector('svg');
      expect(spinner).toHaveClass('text-secondary');
    });

    it('applies muted variant styles', () => {
      render(<LoadingSpinner variant="muted" />);

      const spinner = screen.getByRole('status').querySelector('svg');
      expect(spinner).toHaveClass('text-muted-foreground');
    });
  });

  describe('sizes', () => {
    it('renders xs size', () => {
      render(<LoadingSpinner size="xs" />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toHaveAttribute('width', '12');
    });

    it('renders sm size', () => {
      render(<LoadingSpinner size="sm" />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toHaveAttribute('width', '16');
    });

    it('renders md size (default)', () => {
      render(<LoadingSpinner />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
    });

    it('renders lg size', () => {
      render(<LoadingSpinner size="lg" />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
    });

    it('renders xl size', () => {
      render(<LoadingSpinner size="xl" />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toHaveAttribute('width', '48');
    });
  });

  describe('animation', () => {
    it('has animate-spin class', () => {
      render(<LoadingSpinner />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toHaveClass('animate-spin');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to container element', () => {
      const ref = vi.fn();
      render(<LoadingSpinner ref={ref} />);

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(LoadingSpinner.displayName).toBe('LoadingSpinner');
    });
  });
});

describe('PageLoadingSpinner', () => {
  it('renders with default message', () => {
    render(<PageLoadingSpinner />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<PageLoadingSpinner message="Fetching data..." />);

    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('renders without message when empty string', () => {
    render(<PageLoadingSpinner message="" />);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('applies default height class', () => {
    const { container } = render(<PageLoadingSpinner />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('h-[70vh]');
  });

  it('has correct displayName', () => {
    expect(PageLoadingSpinner.displayName).toBe('PageLoadingSpinner');
  });
});

describe('InlineLoadingSpinner', () => {
  it('renders as inline element', () => {
    render(<InlineLoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner.tagName.toLowerCase()).toBe('span');
  });

  it('renders with default sm size', () => {
    render(<InlineLoadingSpinner />);

    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
  });

  it('accepts custom size', () => {
    render(<InlineLoadingSpinner size="md" />);

    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
  });

  it('has correct displayName', () => {
    expect(InlineLoadingSpinner.displayName).toBe('InlineLoadingSpinner');
  });
});
