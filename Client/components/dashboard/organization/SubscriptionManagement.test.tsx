import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { SubscriptionManagement } from './SubscriptionManagement';

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() =>
    Promise.resolve({
      createPaymentMethod: vi.fn().mockResolvedValue({
        paymentMethod: { id: 'pm_123' },
      }),
    })
  ),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stripe-elements">{children}</div>
  ),
  useStripe: vi.fn(() => ({
    createPaymentMethod: vi.fn().mockResolvedValue({
      paymentMethod: { id: 'pm_123' },
    }),
  })),
  useElements: vi.fn(() => ({
    getElement: vi.fn(() => ({})),
  })),
  CardElement: () => <div data-testid="stripe-card-element">Card Element</div>,
}));

// Mock Redux
vi.mock('@/lib/hooks/use-store', () => ({
  useAppDispatch: vi.fn(() => vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue({}),
  }))),
  useAppSelector: vi.fn((selector) => {
    const mockState = {
      organization: {
        subscription: {
          id: 'sub_123',
          organizationId: 'org_123',
          plan: 'pro',
          status: 'active',
          billingCycle: 'monthly',
          seats: 10,
          usedSeats: 5,
          pricePerSeat: 10,
          currentPeriodEnd: '2024-04-01',
        },
      },
    };
    return selector(mockState);
  }),
}));

// Mock organization-slice
vi.mock('@/lib/store/organization-slice', () => ({
  fetchOrganizationData: vi.fn((id) => ({
    type: 'organization/fetchOrganizationData',
    payload: id,
  })),
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
    check: ({ className }: { className?: string }) => (
      <span data-testid="icon-check" className={className}>
        Check
      </span>
    ),
  },
}));

// Mock BillingHistory
vi.mock('./BillingHistory', () => ({
  BillingHistory: () => (
    <div data-testid="billing-history">BillingHistory Component</div>
  ),
}));

describe('SubscriptionManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: 'https://stripe.com/portal' }),
      })
    ));
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await act(async () => {
      cleanup();
    });
  });

  describe('Exports', () => {
    it('exports SubscriptionManagement as named export', () => {
      expect(SubscriptionManagement).toBeDefined();
      expect(typeof SubscriptionManagement).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', async () => {
      await act(async () => {
        expect(() => {
          render(<SubscriptionManagement />);
        }).not.toThrow();
      });
    });
  });

  describe('Rendering', () => {
    it('wraps content in Stripe Elements', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(screen.getByTestId('stripe-elements')).toBeInTheDocument();
    });

    it('renders Current Plan card', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(screen.getByText('Current Plan')).toBeInTheDocument();
    });

    it('renders card description', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(
        screen.getByText('Manage your subscription and billing')
      ).toBeInTheDocument();
    });

    it('renders plan badge', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(screen.getByText('PRO')).toBeInTheDocument();
    });
  });

  describe('Subscription Details', () => {
    it('renders status', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('renders billing cycle', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(screen.getByText('Billing Cycle')).toBeInTheDocument();
      expect(screen.getByText('Monthly')).toBeInTheDocument();
    });

    it('renders next payment date', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(screen.getByText('Next Payment')).toBeInTheDocument();
    });

    it('renders amount', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('$100/month')).toBeInTheDocument();
    });

    it('renders seat usage', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(screen.getByText('Seat Usage')).toBeInTheDocument();
      expect(screen.getByText('5 of 10 seats')).toBeInTheDocument();
    });

    it('renders progress bar', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders Manage Billing button', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(
        screen.getByRole('button', { name: /Manage Billing/i })
      ).toBeInTheDocument();
    });

    it('renders Change Plan button', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(
        screen.getByRole('button', { name: /Change Plan/i })
      ).toBeInTheDocument();
    });
  });

  describe('Plan Features', () => {
    it('renders plan features card', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(screen.getByText('Current Plan Features')).toBeInTheDocument();
    });

    it('shows features description', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(
        screen.getByText('Features included in your pro plan')
      ).toBeInTheDocument();
    });
  });

  describe('BillingHistory Component', () => {
    it('renders BillingHistory component', async () => {
      await act(async () => {
        render(<SubscriptionManagement />);
      });

      expect(screen.getByTestId('billing-history')).toBeInTheDocument();
    });
  });
});
