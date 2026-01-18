import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthLayout } from './AuthLayout';

// Mock the useAppDispatch hook
vi.mock('../../lib/hooks/use-store', () => ({
  useAppDispatch: vi.fn(() => vi.fn()),
}));

// Mock the refreshUser action
vi.mock('../../lib/store/user-slice', () => ({
  refreshUser: vi.fn(),
}));

describe('AuthLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <AuthLayout>
        <div data-testid="child-content">Child Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <AuthLayout>
        <div data-testid="first-child">First</div>
        <div data-testid="second-child">Second</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('first-child')).toBeInTheDocument();
    expect(screen.getByTestId('second-child')).toBeInTheDocument();
  });

  it('wraps children in a div container', () => {
    render(
      <AuthLayout>
        <span>Test Content</span>
      </AuthLayout>
    );

    const content = screen.getByText('Test Content');
    expect(content.parentElement?.tagName).toBe('DIV');
  });

  it('renders text children', () => {
    render(<AuthLayout>Plain text content</AuthLayout>);

    expect(screen.getByText('Plain text content')).toBeInTheDocument();
  });
});
