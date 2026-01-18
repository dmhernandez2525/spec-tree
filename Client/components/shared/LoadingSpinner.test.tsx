import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders the loading spinner container', () => {
    render(<LoadingSpinner data-testid="spinner-container" />);

    const container = screen.getByTestId('spinner-container');
    expect(container).toBeInTheDocument();
  });

  it('applies default container styles', () => {
    render(<LoadingSpinner data-testid="spinner-container" />);

    const container = screen.getByTestId('spinner-container');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('h-[70vh]');
    expect(container).toHaveClass('w-full');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('justify-center');
  });

  it('renders the spinner element', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('applies spinner styles', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-8');
    expect(spinner).toHaveClass('w-8');
    expect(spinner).toHaveClass('rounded-full');
    expect(spinner).toHaveClass('border-4');
    expect(spinner).toHaveClass('border-primary');
    expect(spinner).toHaveClass('border-t-transparent');
  });

  it('accepts custom className', () => {
    render(<LoadingSpinner data-testid="spinner-container" className="custom-class" />);

    const container = screen.getByTestId('spinner-container');
    expect(container).toHaveClass('custom-class');
  });

  it('forwards additional HTML attributes', () => {
    render(<LoadingSpinner data-testid="spinner-container" id="my-spinner" aria-label="Loading" />);

    const container = screen.getByTestId('spinner-container');
    expect(container).toHaveAttribute('id', 'my-spinner');
    expect(container).toHaveAttribute('aria-label', 'Loading');
  });

  it('merges custom className with default styles', () => {
    render(<LoadingSpinner data-testid="spinner-container" className="mt-10" />);

    const container = screen.getByTestId('spinner-container');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('mt-10');
  });
});

describe('LoadingSpinner exports', () => {
  it('exports LoadingSpinner as a named export', () => {
    expect(LoadingSpinner).toBeDefined();
    expect(typeof LoadingSpinner).toBe('function');
  });
});
