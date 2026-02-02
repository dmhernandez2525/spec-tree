import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RateLimitIndicator } from './rate-limit-indicator';
import type { RateLimitStatus } from '@/lib/hooks/useRateLimitStatus';

describe('RateLimitIndicator', () => {
  const baseStatus: RateLimitStatus = {
    isRateLimited: false,
    retryAttempt: 0,
    retryDelayMs: 0,
    message: null,
    remainingDelayMs: 0,
  };

  it('renders nothing when not rate limited', () => {
    const { container } = render(<RateLimitIndicator status={baseStatus} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders countdown when rate limited with remaining delay', () => {
    const status: RateLimitStatus = {
      isRateLimited: true,
      retryAttempt: 1,
      retryDelayMs: 5000,
      message: 'Rate limited',
      remainingDelayMs: 3000,
    };

    render(<RateLimitIndicator status={status} />);

    expect(screen.getByText(/Rate limited/i)).toBeInTheDocument();
    expect(screen.getByText(/Retrying in 3s/i)).toBeInTheDocument();
  });

  it('shows retry attempt number when greater than 1', () => {
    const status: RateLimitStatus = {
      isRateLimited: true,
      retryAttempt: 2,
      retryDelayMs: 5000,
      message: 'Rate limited',
      remainingDelayMs: 3000,
    };

    render(<RateLimitIndicator status={status} />);

    expect(screen.getByText(/attempt 2/i)).toBeInTheDocument();
  });

  it('shows retrying message when delay is complete', () => {
    const status: RateLimitStatus = {
      isRateLimited: true,
      retryAttempt: 1,
      retryDelayMs: 5000,
      message: 'Retrying...',
      remainingDelayMs: 0,
    };

    render(<RateLimitIndicator status={status} />);

    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    const status: RateLimitStatus = {
      isRateLimited: true,
      retryAttempt: 1,
      retryDelayMs: 5000,
      message: 'Rate limited',
      remainingDelayMs: 3000,
    };

    render(<RateLimitIndicator status={status} />);

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('applies custom className', () => {
    const status: RateLimitStatus = {
      isRateLimited: true,
      retryAttempt: 1,
      retryDelayMs: 5000,
      message: 'Rate limited',
      remainingDelayMs: 3000,
    };

    render(<RateLimitIndicator status={status} className="custom-class" />);

    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('rounds seconds up correctly', () => {
    const status: RateLimitStatus = {
      isRateLimited: true,
      retryAttempt: 1,
      retryDelayMs: 5000,
      message: 'Rate limited',
      remainingDelayMs: 2100, // 2.1 seconds should display as 3s
    };

    render(<RateLimitIndicator status={status} />);

    expect(screen.getByText(/Retrying in 3s/i)).toBeInTheDocument();
  });
});
