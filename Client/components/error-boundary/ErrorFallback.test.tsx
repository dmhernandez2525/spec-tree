/**
 * Error Fallback Tests
 *
 * F1.1.6 - Error Boundary Implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ErrorFallback,
  MinimalErrorFallback,
  InlineErrorFallback,
} from './ErrorFallback';

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  const mockResetBoundary = vi.fn();
  const mockReportError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.open
    vi.spyOn(window, 'open').mockImplementation(() => null);
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn(), href: 'http://localhost' },
      writable: true,
    });
  });

  it('renders error message', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetBoundary}
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/Test error message/)).toBeInTheDocument();
  });

  it('renders section name when provided', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetBoundary}
        sectionName="Dashboard"
      />
    );

    expect(screen.getByText(/Dashboard section/i)).toBeInTheDocument();
  });

  it('calls resetErrorBoundary when "Try again" is clicked', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetBoundary}
      />
    );

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(mockResetBoundary).toHaveBeenCalled();
  });

  it('reloads page when "Reload page" is clicked', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetBoundary}
      />
    );

    const reloadButton = screen.getByRole('button', { name: /reload page/i });
    fireEvent.click(reloadButton);

    expect(window.location.reload).toHaveBeenCalled();
  });

  it('renders report button when enableReporting is true', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetBoundary}
        enableReporting={true}
      />
    );

    expect(screen.getByRole('button', { name: /report issue/i })).toBeInTheDocument();
  });

  it('hides report button when enableReporting is false', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetBoundary}
        enableReporting={false}
      />
    );

    expect(screen.queryByRole('button', { name: /report issue/i })).not.toBeInTheDocument();
  });

  it('calls custom onReportError when report is clicked', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetBoundary}
        enableReporting={true}
        onReportError={mockReportError}
      />
    );

    const reportButton = screen.getByRole('button', { name: /report issue/i });
    fireEvent.click(reportButton);

    expect(mockReportError).toHaveBeenCalled();
  });

  it('opens GitHub issue when report is clicked and no custom handler', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetBoundary}
        enableReporting={true}
      />
    );

    const reportButton = screen.getByRole('button', { name: /report issue/i });
    fireEvent.click(reportButton);

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('github.com'),
      '_blank'
    );
  });

  it('disables report button after reporting', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetBoundary}
        enableReporting={true}
        onReportError={mockReportError}
      />
    );

    const reportButton = screen.getByRole('button', { name: /report issue/i });
    fireEvent.click(reportButton);

    expect(screen.getByRole('button', { name: /reported/i })).toBeDisabled();
  });

  it('shows stack trace toggle when showStackTrace is true', () => {
    const errorWithStack = new Error('Test error');
    errorWithStack.stack = 'Error: Test error\n    at TestComponent';

    render(
      <ErrorFallback
        error={errorWithStack}
        resetErrorBoundary={mockResetBoundary}
        showStackTrace={true}
      />
    );

    expect(screen.getByRole('button', { name: /show technical details/i })).toBeInTheDocument();
  });

  it('hides stack trace toggle when showStackTrace is false', () => {
    const errorWithStack = new Error('Test error');
    errorWithStack.stack = 'Error: Test error\n    at TestComponent';

    render(
      <ErrorFallback
        error={errorWithStack}
        resetErrorBoundary={mockResetBoundary}
        showStackTrace={false}
      />
    );

    expect(screen.queryByRole('button', { name: /show technical details/i })).not.toBeInTheDocument();
  });

  it('toggles stack trace visibility', () => {
    const errorWithStack = new Error('Test error');
    errorWithStack.stack = 'Error: Test error\n    at TestComponent';

    render(
      <ErrorFallback
        error={errorWithStack}
        resetErrorBoundary={mockResetBoundary}
        showStackTrace={true}
      />
    );

    // Initially stack trace should be hidden
    expect(screen.queryByText(/at TestComponent/)).not.toBeInTheDocument();

    // Click to show
    const toggleButton = screen.getByRole('button', { name: /show technical details/i });
    fireEvent.click(toggleButton);

    // Stack trace should now be visible
    expect(screen.getByText(/at TestComponent/)).toBeInTheDocument();

    // Click to hide
    fireEvent.click(screen.getByRole('button', { name: /hide technical details/i }));

    // Stack trace should be hidden again
    expect(screen.queryByText(/at TestComponent/)).not.toBeInTheDocument();
  });

  it('handles error without message', () => {
    const emptyError = new Error();

    render(
      <ErrorFallback
        error={emptyError}
        resetErrorBoundary={mockResetBoundary}
      />
    );

    expect(screen.getByText(/Unknown error/)).toBeInTheDocument();
  });
});

describe('MinimalErrorFallback', () => {
  const mockError = new Error('Test error');
  const mockResetBoundary = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders minimal fallback', () => {
    render(
      <MinimalErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetBoundary}
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders section name when provided', () => {
    render(
      <MinimalErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetBoundary}
        sectionName="Sidebar"
      />
    );

    expect(screen.getByText(/Failed to load Sidebar/i)).toBeInTheDocument();
  });

  it('calls resetErrorBoundary when button is clicked', () => {
    render(
      <MinimalErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetBoundary}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(mockResetBoundary).toHaveBeenCalled();
  });
});

describe('InlineErrorFallback', () => {
  const mockResetBoundary = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders inline error with retry link', () => {
    render(<InlineErrorFallback resetErrorBoundary={mockResetBoundary} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls resetErrorBoundary when retry is clicked', () => {
    render(<InlineErrorFallback resetErrorBoundary={mockResetBoundary} />);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(mockResetBoundary).toHaveBeenCalled();
  });
});
