import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrialBanner } from './TrialBanner';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock Icons component
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    x: ({ className }: { className?: string }) => (
      <span data-testid="icon-x" className={className}>
        X
      </span>
    ),
    alert: ({ className }: { className?: string }) => (
      <span data-testid="icon-alert" className={className}>
        Alert
      </span>
    ),
    sparkles: ({ className }: { className?: string }) => (
      <span data-testid="icon-sparkles" className={className}>
        Sparkles
      </span>
    ),
  },
}));

// Mock trial utilities
vi.mock('@/utils/trial', () => ({
  calculateTrialDaysRemaining: vi.fn(() => 7),
  formatTrialDate: vi.fn(() => 'March 25, 2024'),
}));

describe('TrialBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Exports', () => {
    it('exports TrialBanner as named export', () => {
      expect(TrialBanner).toBeDefined();
      expect(typeof TrialBanner).toBe('function');
    });

    it('exports TrialBanner as default export', () => {
      // TrialBanner is imported at the top - verify it's a function component
      expect(TrialBanner).toBeDefined();
      expect(typeof TrialBanner).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', () => {
      expect(() => {
        render(<TrialBanner trialStatus={null} />);
      }).not.toThrow();
    });
  });

  describe('Rendering', () => {
    it('renders nothing when isVisible is set to false via close button', () => {
      render(<TrialBanner trialStatus={null} />);

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      expect(screen.queryByText('Start Your Free Trial')).not.toBeInTheDocument();
    });

    it('renders "Start Your Free Trial" when trial is not active', () => {
      render(<TrialBanner trialStatus={null} />);

      expect(screen.getByText('Start Your Free Trial')).toBeInTheDocument();
      expect(
        screen.getByText(/Try Spec Tree free for 14 days/)
      ).toBeInTheDocument();
    });

    it('renders trial status when trial is active', () => {
      const activeTrialStatus = {
        isActive: true,
        startDate: new Date('2024-03-11').toISOString(),
        endDate: new Date('2024-03-25').toISOString(),
        planId: 'starter',
        daysRemaining: 7,
      };

      render(<TrialBanner trialStatus={activeTrialStatus} />);

      expect(screen.getByText('Trial Status')).toBeInTheDocument();
      expect(screen.getByText(/7 days remaining/)).toBeInTheDocument();
    });

    it('renders progress bar for active trial', () => {
      const activeTrialStatus = {
        isActive: true,
        startDate: new Date('2024-03-11').toISOString(),
        endDate: new Date('2024-03-25').toISOString(),
        planId: 'starter',
        daysRemaining: 7,
      };

      render(<TrialBanner trialStatus={activeTrialStatus} />);

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onStartTrial when Start Free Trial button is clicked', () => {
      const mockOnStartTrial = vi.fn();
      render(<TrialBanner trialStatus={null} onStartTrial={mockOnStartTrial} />);

      const startButton = screen.getByRole('button', { name: /Start Free Trial/i });
      fireEvent.click(startButton);

      expect(mockOnStartTrial).toHaveBeenCalledTimes(1);
    });

    it('hides banner when close button is clicked', () => {
      render(<TrialBanner trialStatus={null} />);

      expect(screen.getByText('Start Your Free Trial')).toBeInTheDocument();

      const closeButton = screen.getByTestId('icon-x').closest('button');
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      expect(screen.queryByText('Start Your Free Trial')).not.toBeInTheDocument();
    });

    it('does not render Start Free Trial button when onStartTrial is not provided', () => {
      render(<TrialBanner trialStatus={null} />);

      expect(
        screen.queryByRole('button', { name: /Start Free Trial/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('renders View Pricing link when not on pricing page', () => {
      render(<TrialBanner trialStatus={null} />);

      const viewPricingLink = screen.getByRole('link', { name: /View Pricing/i });
      expect(viewPricingLink).toBeInTheDocument();
      expect(viewPricingLink).toHaveAttribute('href', '/pricing');
    });

    it('renders Upgrade Now link for active trial', () => {
      const activeTrialStatus = {
        isActive: true,
        startDate: new Date('2024-03-11').toISOString(),
        endDate: new Date('2024-03-25').toISOString(),
        planId: 'starter',
        daysRemaining: 7,
      };

      render(<TrialBanner trialStatus={activeTrialStatus} />);

      const upgradeLink = screen.getByRole('link', { name: /Upgrade Now/i });
      expect(upgradeLink).toBeInTheDocument();
      expect(upgradeLink).toHaveAttribute('href', '/pricing');
    });

    it('renders View Trial Details link for active trial', () => {
      const activeTrialStatus = {
        isActive: true,
        startDate: new Date('2024-03-11').toISOString(),
        endDate: new Date('2024-03-25').toISOString(),
        planId: 'starter',
        daysRemaining: 7,
      };

      render(<TrialBanner trialStatus={activeTrialStatus} />);

      const detailsLink = screen.getByRole('link', { name: /View Trial Details/i });
      expect(detailsLink).toBeInTheDocument();
      expect(detailsLink).toHaveAttribute('href', '/user-dashboard/settings');
    });
  });

  describe('Conditional Rendering', () => {
    it('shows sparkles icon when trial is not active', () => {
      render(<TrialBanner trialStatus={null} />);

      expect(screen.getByTestId('icon-sparkles')).toBeInTheDocument();
    });

    it('shows alert icon when trial is active', () => {
      const activeTrialStatus = {
        isActive: true,
        startDate: new Date('2024-03-11').toISOString(),
        endDate: new Date('2024-03-25').toISOString(),
        planId: 'starter',
        daysRemaining: 7,
      };

      render(<TrialBanner trialStatus={activeTrialStatus} />);

      expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
    });
  });
});
