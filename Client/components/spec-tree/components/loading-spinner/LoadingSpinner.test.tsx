import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders loading spinner', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />);

    const loaderIcon = container.querySelector('.animate-spin');
    expect(loaderIcon).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = render(<LoadingSpinner size={48} />);

    const loaderIcon = container.querySelector('.animate-spin');
    expect(loaderIcon).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);

    const innerDiv = container.querySelector('.custom-class');
    expect(innerDiv).toBeInTheDocument();
  });

  it('renders with fixed overlay', () => {
    const { container } = render(<LoadingSpinner />);

    const overlay = container.querySelector('.fixed');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('inset-0');
    expect(overlay).toHaveClass('flex');
    expect(overlay).toHaveClass('items-center');
    expect(overlay).toHaveClass('justify-center');
    expect(overlay).toHaveClass('z-50');
  });

  it('has backdrop styling', () => {
    const { container } = render(<LoadingSpinner />);

    const overlay = container.querySelector('.fixed');
    expect(overlay).toHaveClass('bg-black/50');
  });

  it('renders loader icon with animation', () => {
    const { container } = render(<LoadingSpinner />);

    const loaderIcon = container.querySelector('.animate-spin');
    expect(loaderIcon).toHaveClass('text-primary');
  });

  it('renders card-like container', () => {
    const { container } = render(<LoadingSpinner />);

    const card = container.querySelector('.bg-white');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('shadow-lg');
  });
});
