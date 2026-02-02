/**
 * Error Boundary Tests
 *
 * F1.1.6 - Error Boundary Implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';

// Component that throws an error
function BrokenComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Working component</div>;
}


describe('ErrorBoundary', () => {
  // Suppress console.error during tests
  const originalError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders fallback UI when error is thrown', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('calls fallbackRender when provided', () => {
    const fallbackRender = vi.fn(() => <div>Custom render fallback</div>);

    render(
      <ErrorBoundary fallbackRender={fallbackRender}>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(fallbackRender).toHaveBeenCalled();
    expect(screen.getByText('Custom render fallback')).toBeInTheDocument();
  });

  it('passes error info to fallbackRender', () => {
    const fallbackRender = vi.fn(({ error }) => (
      <div>Error: {error.message}</div>
    ));

    render(
      <ErrorBoundary fallbackRender={fallbackRender}>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(fallbackRender).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(Error),
        resetErrorBoundary: expect.any(Function),
      })
    );
  });

  it('calls onError callback when error is caught', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('resets error state when reset is triggered', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click "Try again" button
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });

    // Update the component to not throw
    rerender(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    fireEvent.click(tryAgainButton);
  });

  it('calls onReset callback when reset is triggered', () => {
    const onReset = vi.fn();

    render(
      <ErrorBoundary onReset={onReset}>
        <BrokenComponent />
      </ErrorBoundary>
    );

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(onReset).toHaveBeenCalled();
  });

  it('includes section name in error message when provided', () => {
    render(
      <ErrorBoundary sectionName="Dashboard">
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Dashboard section/i)).toBeInTheDocument();
  });

  it('logs error when caught', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    // Console.error is called when error is caught
    expect(console.error).toHaveBeenCalled();
  });

  it('renders multiple children correctly', () => {
    render(
      <ErrorBoundary>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('isolates errors to the specific boundary', () => {
    render(
      <div>
        <ErrorBoundary sectionName="Section 1">
          <div>Working section 1</div>
        </ErrorBoundary>
        <ErrorBoundary sectionName="Section 2">
          <BrokenComponent />
        </ErrorBoundary>
        <ErrorBoundary sectionName="Section 3">
          <div>Working section 3</div>
        </ErrorBoundary>
      </div>
    );

    // Working sections should still render
    expect(screen.getByText('Working section 1')).toBeInTheDocument();
    expect(screen.getByText('Working section 3')).toBeInTheDocument();

    // Broken section should show error
    expect(screen.getByText(/Section 2 section/i)).toBeInTheDocument();
  });
});

describe('withErrorBoundary', () => {
  const originalError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('wraps component with error boundary', () => {
    const WorkingComponent = () => <div>Working</div>;
    const WrappedComponent = withErrorBoundary(WorkingComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Working')).toBeInTheDocument();
  });

  it('catches errors in wrapped component', () => {
    const WrappedBroken = withErrorBoundary(BrokenComponent);

    render(<WrappedBroken />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('passes props to wrapped component', () => {
    const PropsComponent = ({ message }: { message: string }) => (
      <div>{message}</div>
    );
    const WrappedComponent = withErrorBoundary(PropsComponent);

    render(<WrappedComponent message="Hello" />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('accepts error boundary props', () => {
    const onError = vi.fn();
    const WrappedBroken = withErrorBoundary(BrokenComponent, {
      onError,
      sectionName: 'Test Section',
    });

    render(<WrappedBroken />);

    expect(onError).toHaveBeenCalled();
    expect(screen.getByText(/Test Section section/i)).toBeInTheDocument();
  });

  it('sets displayName correctly', () => {
    const NamedComponent = () => <div>Named</div>;
    NamedComponent.displayName = 'MyComponent';

    const WrappedComponent = withErrorBoundary(NamedComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(MyComponent)');
  });
});
