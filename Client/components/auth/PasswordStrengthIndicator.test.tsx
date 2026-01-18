import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordStrengthIndicator, evaluatePasswordStrength } from './PasswordStrengthIndicator';

// Mock the password-strength utilities
vi.mock('@/utils/password-strength', () => ({
  evaluatePasswordStrength: vi.fn((password: string) => {
    if (!password || password.length < 8) return 'very-weak';
    if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[@$!%*?&]/.test(password)) {
      return 'strong';
    }
    if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)) {
      return 'medium';
    }
    return 'weak';
  }),
  getStrengthColor: vi.fn((strength: string) => {
    switch (strength) {
      case 'very-weak': return 'bg-red-500';
      case 'weak': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }),
  getStrengthText: vi.fn((strength: string) => {
    switch (strength) {
      case 'very-weak': return 'Very Weak';
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  }),
  getStrengthPercentage: vi.fn((strength: string) => {
    switch (strength) {
      case 'very-weak': return 25;
      case 'weak': return 50;
      case 'medium': return 75;
      case 'strong': return 100;
      default: return 0;
    }
  }),
}));

describe('PasswordStrengthIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when password is empty', () => {
    const { container } = render(<PasswordStrengthIndicator password="" />);

    expect(container.firstChild).toBeNull();
  });

  it('renders when password is provided', () => {
    render(<PasswordStrengthIndicator password="testpassword" />);

    // Should display some strength text
    expect(screen.getByText(/password/i)).toBeInTheDocument();
  });

  it('renders the progress bar', () => {
    const { container } = render(
      <PasswordStrengthIndicator password="TestPass123!" />
    );

    // Check for the progress bar container
    const progressBar = container.querySelector('.h-2');
    expect(progressBar).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PasswordStrengthIndicator
        password="testpassword"
        className="custom-class"
      />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('applies default mt-1 class', () => {
    const { container } = render(
      <PasswordStrengthIndicator password="testpassword" />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('mt-1');
  });

  it('displays strength text for weak password', () => {
    render(<PasswordStrengthIndicator password="weakpass" />);

    expect(screen.getByText(/password/i)).toBeInTheDocument();
  });

  it('displays strength text for medium password', () => {
    render(<PasswordStrengthIndicator password="TestPass123" />);

    expect(screen.getByText(/password/i)).toBeInTheDocument();
  });

  it('displays strength text for strong password', () => {
    render(<PasswordStrengthIndicator password="TestPass123!" />);

    expect(screen.getByText(/password/i)).toBeInTheDocument();
  });

  it('renders progress bar with rounded-full class', () => {
    const { container } = render(
      <PasswordStrengthIndicator password="password" />
    );

    const progressBarContainer = container.querySelector('.rounded-full');
    expect(progressBarContainer).toBeInTheDocument();
  });

  it('renders inner progress bar with transition styles', () => {
    const { container } = render(
      <PasswordStrengthIndicator password="password" />
    );

    const innerBar = container.querySelector('.transition-all');
    expect(innerBar).toBeInTheDocument();
  });

  it('exports evaluatePasswordStrength function', () => {
    expect(evaluatePasswordStrength).toBeDefined();
    expect(typeof evaluatePasswordStrength).toBe('function');
  });
});
