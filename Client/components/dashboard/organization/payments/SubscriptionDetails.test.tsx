import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubscriptionDetails } from './SubscriptionDetails';
import { OrganizationSubscription } from '@/types/organization';

// Mock Icons component
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    spinner: ({ className }: { className?: string }) => (
      <span data-testid="icon-spinner" className={className}>
        Spinner
      </span>
    ),
    shield: ({ className }: { className?: string }) => (
      <span data-testid="icon-shield" className={className}>
        Shield
      </span>
    ),
    check: ({ className }: { className?: string }) => (
      <span data-testid="icon-check" className={className}>
        Check
      </span>
    ),
  },
}));

describe('SubscriptionDetails', () => {
  const mockSubscription: OrganizationSubscription = {
    id: 'sub_123',
    organizationId: 'org_123',
    plan: 'pro',
    status: 'active',
    billingCycle: 'monthly',
    seats: 10,
    usedSeats: 7,
    pricePerSeat: 10,
    currentPeriodStart: new Date('2024-03-01').toISOString(),
    currentPeriodEnd: new Date('2024-04-01').toISOString(),
    cancelAtPeriodEnd: false,
  };

  const defaultProps = {
    subscription: mockSubscription,
    onManageSubscription: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Exports', () => {
    it('exports SubscriptionDetails as named export', () => {
      expect(SubscriptionDetails).toBeDefined();
      expect(typeof SubscriptionDetails).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', () => {
      expect(() => {
        render(<SubscriptionDetails {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('Rendering with Subscription', () => {
    it('renders current plan card title', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      expect(screen.getByText('Current Plan')).toBeInTheDocument();
    });

    it('renders plan name with capitalization', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
    });

    it('renders subscription status badge', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('renders billing cycle', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      expect(screen.getByText('Billing Cycle')).toBeInTheDocument();
      expect(screen.getByText('Monthly')).toBeInTheDocument();
    });

    it('renders next payment date', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      expect(screen.getByText('Next Payment')).toBeInTheDocument();
      // Date format depends on locale
      const dateElement = screen.getByText(/2024/);
      expect(dateElement).toBeInTheDocument();
    });

    it('renders billing amount', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument(); // 10 seats * $10
    });

    it('renders seat usage', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      expect(screen.getByText('Seat Usage')).toBeInTheDocument();
      expect(screen.getByText('7 of 10 seats')).toBeInTheDocument();
    });

    it('renders progress bar for seat utilization', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('renders Stripe security badge', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      expect(screen.getByTestId('icon-shield')).toBeInTheDocument();
      expect(screen.getByText('Secured by Stripe')).toBeInTheDocument();
    });

    it('renders manage subscription button', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /Manage Subscription/i })
      ).toBeInTheDocument();
    });
  });

  describe('Rendering without Subscription', () => {
    it('renders no subscription message', () => {
      render(
        <SubscriptionDetails
          {...defaultProps}
          subscription={null}
        />
      );

      expect(screen.getByText('No active subscription found')).toBeInTheDocument();
    });

    it('renders start subscription button', () => {
      render(
        <SubscriptionDetails
          {...defaultProps}
          subscription={null}
        />
      );

      expect(
        screen.getByRole('button', { name: /Start Subscription/i })
      ).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onManageSubscription when button is clicked', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      const manageButton = screen.getByRole('button', {
        name: /Manage Subscription/i,
      });
      fireEvent.click(manageButton);

      expect(defaultProps.onManageSubscription).toHaveBeenCalledTimes(1);
    });

    it('calls onManageSubscription when start button is clicked (no subscription)', () => {
      render(
        <SubscriptionDetails
          {...defaultProps}
          subscription={null}
        />
      );

      const startButton = screen.getByRole('button', {
        name: /Start Subscription/i,
      });
      fireEvent.click(startButton);

      expect(defaultProps.onManageSubscription).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('shows loading state on button when isLoading is true', () => {
      render(<SubscriptionDetails {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByTestId('icon-spinner')).toBeInTheDocument();
    });

    it('disables button when isLoading is true', () => {
      render(<SubscriptionDetails {...defaultProps} isLoading={true} />);

      const manageButton = screen.getByRole('button', {
        name: /Loading.../i,
      });
      expect(manageButton).toBeDisabled();
    });
  });

  describe('Plan Features', () => {
    it('renders plan features section', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      expect(screen.getByText('Plan Features')).toBeInTheDocument();
    });

    it('renders seat limit feature', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      expect(screen.getByText('Up to 10 team members')).toBeInTheDocument();
    });

    it('renders pro plan features for pro subscription', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      expect(screen.getByText('Advanced project management')).toBeInTheDocument();
      expect(screen.getByText('Priority support')).toBeInTheDocument();
    });

    it('renders enterprise features for enterprise subscription', () => {
      const enterpriseSubscription = {
        ...mockSubscription,
        plan: 'enterprise',
      };
      render(
        <SubscriptionDetails
          {...defaultProps}
          subscription={enterpriseSubscription}
        />
      );

      expect(screen.getByText('Custom integrations')).toBeInTheDocument();
      expect(screen.getByText('Dedicated support')).toBeInTheDocument();
      expect(screen.getByText('Advanced security features')).toBeInTheDocument();
    });
  });

  describe('Warning Messages', () => {
    it('shows warning when seat utilization is 80% or higher', () => {
      const highUtilizationSubscription = {
        ...mockSubscription,
        usedSeats: 8, // 80% of 10
      };
      render(
        <SubscriptionDetails
          {...defaultProps}
          subscription={highUtilizationSubscription}
        />
      );

      expect(
        screen.getByText('Consider adding more seats to accommodate growth')
      ).toBeInTheDocument();
    });

    it('does not show warning when utilization is below 80%', () => {
      const lowUtilizationSubscription = {
        ...mockSubscription,
        usedSeats: 5, // 50% of 10
      };
      render(
        <SubscriptionDetails
          {...defaultProps}
          subscription={lowUtilizationSubscription}
        />
      );

      expect(
        screen.queryByText('Consider adding more seats to accommodate growth')
      ).not.toBeInTheDocument();
    });
  });

  describe('Status Badge Variants', () => {
    it('uses default variant for active status', () => {
      render(<SubscriptionDetails {...defaultProps} />);

      const badge = screen.getByText('active');
      expect(badge.className).not.toContain('destructive');
    });

    it('uses destructive variant for non-active status', () => {
      const cancelledSubscription = {
        ...mockSubscription,
        status: 'cancelled' as const,
      };
      render(
        <SubscriptionDetails
          {...defaultProps}
          subscription={cancelledSubscription}
        />
      );

      const badge = screen.getByText('cancelled');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Billing Cycle Display', () => {
    it('displays Yearly for yearly billing cycle', () => {
      const yearlySubscription = {
        ...mockSubscription,
        billingCycle: 'yearly' as const,
      };
      render(
        <SubscriptionDetails
          {...defaultProps}
          subscription={yearlySubscription}
        />
      );

      expect(screen.getByText('Yearly')).toBeInTheDocument();
    });
  });
});
