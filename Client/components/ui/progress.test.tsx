import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './progress';

describe('Progress', () => {
  it('renders a progress element', () => {
    render(<Progress data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
  });

  it('applies default styles', () => {
    render(<Progress data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveClass('relative');
    expect(progress).toHaveClass('h-2');
    expect(progress).toHaveClass('w-full');
    expect(progress).toHaveClass('overflow-hidden');
    expect(progress).toHaveClass('rounded-full');
    expect(progress).toHaveClass('bg-primary/20');
  });

  it('accepts custom className', () => {
    render(<Progress data-testid="progress" className="custom-class h-4" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveClass('custom-class');
    expect(progress).toHaveClass('h-4');
  });

  it('renders with value of 0 by default', () => {
    render(<Progress data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveRole('progressbar');
  });

  it('renders with specified value', () => {
    render(<Progress data-testid="progress" value={50} />);

    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveRole('progressbar');
  });

  it('displays progress at 0%', () => {
    render(<Progress data-testid="progress" value={0} />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveRole('progressbar');
  });

  it('displays progress at 100%', () => {
    render(<Progress data-testid="progress" value={100} />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveRole('progressbar');
  });

  it('displays progress at intermediate value', () => {
    render(<Progress data-testid="progress" value={75} />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveRole('progressbar');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Progress ref={ref} value={50} />);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(Progress.displayName).toBe('Progress');
  });

  it('passes through other props', () => {
    render(
      <Progress
        data-testid="progress"
        id="loading-progress"
        aria-label="Loading progress"
        value={30}
      />
    );

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveAttribute('id', 'loading-progress');
    expect(progress).toHaveAttribute('aria-label', 'Loading progress');
  });

  it('has an indicator child element', () => {
    const { container } = render(<Progress data-testid="progress" value={50} />);

    const indicator = container.querySelector('[class*="bg-primary"]');
    expect(indicator).toBeInTheDocument();
  });
});
