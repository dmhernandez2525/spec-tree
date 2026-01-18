import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renders a div element', () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.tagName.toLowerCase()).toBe('div');
  });

  it('applies default animation styles', () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveClass('bg-primary/10');
  });

  it('accepts custom className', () => {
    render(<Skeleton data-testid="skeleton" className="custom-class h-4 w-full" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-class');
    expect(skeleton).toHaveClass('h-4');
    expect(skeleton).toHaveClass('w-full');
  });

  it('passes through other HTML attributes', () => {
    render(
      <Skeleton
        data-testid="skeleton"
        id="my-skeleton"
        title="Loading..."
        aria-label="Loading content"
      />
    );

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('id', 'my-skeleton');
    expect(skeleton).toHaveAttribute('title', 'Loading...');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
  });

  it('can be styled for different sizes', () => {
    const { rerender } = render(<Skeleton data-testid="skeleton" className="h-4 w-[200px]" />);

    let skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-4');
    expect(skeleton).toHaveClass('w-[200px]');

    rerender(<Skeleton data-testid="skeleton" className="h-12 w-12 rounded-full" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-12');
    expect(skeleton).toHaveClass('w-12');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders as a loading placeholder for text', () => {
    render(
      <div>
        <Skeleton data-testid="text-skeleton" className="h-4 w-[250px]" />
      </div>
    );

    expect(screen.getByTestId('text-skeleton')).toBeInTheDocument();
  });

  it('renders as a loading placeholder for avatar', () => {
    render(
      <Skeleton data-testid="avatar-skeleton" className="h-12 w-12 rounded-full" />
    );

    const skeleton = screen.getByTestId('avatar-skeleton');
    expect(skeleton).toHaveClass('rounded-full');
  });
});
