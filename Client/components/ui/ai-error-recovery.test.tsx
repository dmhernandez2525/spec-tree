import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIErrorRecovery, AIErrorIndicator } from './ai-error-recovery';
import type { GenerationState } from '@/lib/hooks/useAIGenerationRecovery';
import type { AIError, RecoveryAction } from '@/lib/utils/ai-error-recovery';

describe('AIErrorRecovery', () => {
  const mockError: AIError = {
    category: 'network',
    message: 'Network error',
    userMessage: 'Unable to connect to the AI service.',
    recoveryActions: ['retry', 'check_connection'],
    originalError: new Error(),
    retryable: true,
  };

  const mockRecoveryOptions = [
    {
      action: 'retry' as RecoveryAction,
      label: 'Try Again',
      description: 'Attempt the generation again',
      isPrimary: true,
    },
    {
      action: 'check_connection' as RecoveryAction,
      label: 'Check Connection',
      description: 'Verify your internet connection',
      isPrimary: false,
    },
  ];

  const errorState: GenerationState = {
    status: 'error',
    error: mockError,
    recoveryOptions: mockRecoveryOptions,
    attemptCount: 1,
  };

  it('renders nothing when status is not error', () => {
    const state: GenerationState = {
      status: 'idle',
      error: null,
      recoveryOptions: [],
      attemptCount: 0,
    };

    const { container } = render(
      <AIErrorRecovery state={state} onRecover={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders error message when in error state', () => {
    render(<AIErrorRecovery state={errorState} onRecover={vi.fn()} />);

    expect(screen.getByText('Generation Failed')).toBeInTheDocument();
    expect(
      screen.getByText('Unable to connect to the AI service.')
    ).toBeInTheDocument();
  });

  it('renders recovery buttons', () => {
    render(<AIErrorRecovery state={errorState} onRecover={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Check Connection/i })
    ).toBeInTheDocument();
  });

  it('calls onRecover with correct action when button clicked', () => {
    const onRecover = vi.fn();
    render(<AIErrorRecovery state={errorState} onRecover={onRecover} />);

    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));

    expect(onRecover).toHaveBeenCalledWith('retry');
  });

  it('shows attempt count when greater than 1', () => {
    const stateWithAttempts: GenerationState = {
      ...errorState,
      attemptCount: 3,
    };

    render(<AIErrorRecovery state={stateWithAttempts} onRecover={vi.fn()} />);

    expect(screen.getByText(/Attempt 3/i)).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button clicked', () => {
    const onDismiss = vi.fn();
    render(
      <AIErrorRecovery
        state={errorState}
        onRecover={vi.fn()}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Dismiss/i }));

    expect(onDismiss).toHaveBeenCalled();
  });

  it('has correct ARIA attributes', () => {
    render(<AIErrorRecovery state={errorState} onRecover={vi.fn()} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('applies custom className', () => {
    render(
      <AIErrorRecovery
        state={errorState}
        onRecover={vi.fn()}
        className="custom-class"
      />
    );

    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });
});

describe('AIErrorIndicator', () => {
  const mockError: AIError = {
    category: 'timeout',
    message: 'Timeout',
    userMessage: 'Request timed out',
    recoveryActions: ['retry'],
    originalError: new Error(),
    retryable: true,
  };

  it('renders nothing when error is null', () => {
    const { container } = render(<AIErrorIndicator error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error message', () => {
    render(<AIErrorIndicator error={mockError} />);
    expect(screen.getByText('Request timed out')).toBeInTheDocument();
  });

  it('shows retry button for retryable errors', () => {
    const onRetry = vi.fn();
    render(<AIErrorIndicator error={mockError} onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /Retry/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('does not show retry button when onRetry not provided', () => {
    render(<AIErrorIndicator error={mockError} />);
    expect(screen.queryByRole('button', { name: /Retry/i })).not.toBeInTheDocument();
  });

  it('does not show retry button for non-retryable errors', () => {
    const nonRetryableError: AIError = {
      ...mockError,
      retryable: false,
    };
    const onRetry = vi.fn();

    render(<AIErrorIndicator error={nonRetryableError} onRetry={onRetry} />);

    expect(screen.queryByRole('button', { name: /Retry/i })).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AIErrorIndicator error={mockError} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
