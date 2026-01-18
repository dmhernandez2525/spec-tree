import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StripeIntegration } from './StripeIntegration';

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    confirmCardSetup: vi.fn().mockResolvedValue({ setupIntent: {} }),
  })),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stripe-elements">{children}</div>
  ),
  useElements: vi.fn(() => ({
    getElement: vi.fn(() => ({
      on: vi.fn(),
      mount: vi.fn(),
      destroy: vi.fn(),
      update: vi.fn(),
    })),
  })),
  CardElement: () => <div data-testid="stripe-card-element">Card Element</div>,
}));

// Mock Redux
vi.mock('@/lib/hooks/use-store', () => ({
  useAppSelector: vi.fn((selector) => {
    const mockState = {
      user: {
        user: {
          id: 'user_123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      },
      organization: {
        subscription: {
          id: 'sub_123',
          plan: 'pro',
          status: 'active',
          seats: 10,
          usedSeats: 5,
          pricePerSeat: 10,
          billingCycle: 'monthly',
          currentPeriodEnd: '2024-04-01',
        },
      },
    };
    return selector(mockState);
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    spinner: ({ className }: { className?: string }) => (
      <span data-testid="icon-spinner" className={className}>
        Spinner
      </span>
    ),
    creditCard: ({ className }: { className?: string }) => (
      <span data-testid="icon-credit-card" className={className}>
        CreditCard
      </span>
    ),
    plus: ({ className }: { className?: string }) => (
      <span data-testid="icon-plus" className={className}>
        Plus
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

describe('StripeIntegration', () => {
  const defaultProps = {
    onSubscriptionUpdated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ clientSecret: 'test_secret', url: 'http://stripe.com' }),
      })
    ));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Exports', () => {
    it('exports StripeIntegration as named export', () => {
      expect(StripeIntegration).toBeDefined();
      expect(typeof StripeIntegration).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', () => {
      expect(() => {
        render(<StripeIntegration {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('Rendering', () => {
    it('wraps content in Stripe Elements', () => {
      render(<StripeIntegration {...defaultProps} />);

      expect(screen.getByTestId('stripe-elements')).toBeInTheDocument();
    });

    it('renders Payment Methods card', () => {
      render(<StripeIntegration {...defaultProps} />);

      expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    });

    it('renders Payment Methods description', () => {
      render(<StripeIntegration {...defaultProps} />);

      expect(
        screen.getByText('Manage your payment methods and billing information')
      ).toBeInTheDocument();
    });

    it('renders Subscription Details card', () => {
      render(<StripeIntegration {...defaultProps} />);

      expect(screen.getByText('Subscription Details')).toBeInTheDocument();
    });

    it('renders Subscription Details description', () => {
      render(<StripeIntegration {...defaultProps} />);

      expect(
        screen.getByText('View and manage your current subscription')
      ).toBeInTheDocument();
    });
  });

  describe('Child Components', () => {
    it('renders PaymentMethodSelector', () => {
      render(<StripeIntegration {...defaultProps} />);

      // PaymentMethodSelector should render its content
      expect(screen.getByText('•••• 4242')).toBeInTheDocument();
    });

    it('renders SubscriptionDetails', () => {
      render(<StripeIntegration {...defaultProps} />);

      // SubscriptionDetails should render current plan info
      expect(screen.getByText('Current Plan')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('has access to subscription data from Redux', () => {
      render(<StripeIntegration {...defaultProps} />);

      // The subscription details component should display plan info
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('renders cards in a vertical stack', () => {
      const { container } = render(<StripeIntegration {...defaultProps} />);

      const spaceY = container.querySelector('.space-y-6');
      expect(spaceY).toBeInTheDocument();
    });
  });
});
