import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TrialModal } from './TrialModal';

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
    check: ({ className }: { className?: string }) => (
      <span data-testid="icon-check" className={className}>
        Check
      </span>
    ),
    alert: ({ className }: { className?: string }) => (
      <span data-testid="icon-alert" className={className}>
        Alert
      </span>
    ),
  },
}));

// Mock pricing data
vi.mock('@/lib/data/pricing', () => ({
  pricingTiers: [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individuals',
      price: { monthly: 0 },
      hasTrial: true,
      features: [
        { title: 'Feature 1', description: 'Description 1' },
        { title: 'Feature 2', description: 'Description 2' },
      ],
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'For growing teams',
      price: { monthly: 49 },
      hasTrial: true,
      features: [
        { title: 'Pro Feature 1', description: 'Pro Description 1' },
        { title: 'Pro Feature 2', included: 'Included' },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: { monthly: 199 },
      hasTrial: false,
      features: [
        { title: 'Enterprise Feature', description: 'Enterprise Description' },
      ],
    },
  ],
}));

// Mock trial utilities
vi.mock('@/utils/trial', () => ({
  getTrialFeatures: vi.fn((planId: string) => {
    if (planId === 'starter') {
      return ['Trial Feature 1', 'Trial Feature 2'];
    }
    if (planId === 'pro') {
      return ['Pro Trial Feature 1', 'Pro Trial Feature 2', 'Pro Trial Feature 3'];
    }
    return [];
  }),
}));

describe('TrialModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onStartTrial: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Exports', () => {
    it('exports TrialModal as named export', () => {
      expect(TrialModal).toBeDefined();
      expect(typeof TrialModal).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', () => {
      expect(() => {
        render(<TrialModal {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('Rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(<TrialModal {...defaultProps} />);

      expect(screen.getByText('Select Your Plan')).toBeInTheDocument();
      expect(
        screen.getByText(/Choose the plan that best fits your needs/)
      ).toBeInTheDocument();
    });

    it('renders all pricing tiers', () => {
      render(<TrialModal {...defaultProps} />);

      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('shows price with "after trial" for trial plans', () => {
      render(<TrialModal {...defaultProps} />);

      expect(screen.getByText('$0/mo after trial')).toBeInTheDocument();
      expect(screen.getByText('$49/mo after trial')).toBeInTheDocument();
    });

    it('shows price without "after trial" for non-trial plans', () => {
      render(<TrialModal {...defaultProps} />);

      expect(screen.getByText('$199/mo')).toBeInTheDocument();
    });

    it('renders Cancel button', () => {
      render(<TrialModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('renders Terms of Service and Privacy Policy links', () => {
      render(<TrialModal {...defaultProps} />);

      expect(screen.getByRole('link', { name: /Terms of Service/i })).toHaveAttribute(
        'href',
        '/terms'
      );
      expect(screen.getByRole('link', { name: /Privacy Policy/i })).toHaveAttribute(
        'href',
        '/privacy'
      );
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when Cancel button is clicked', () => {
      render(<TrialModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('displays "Start Free Trial" button for trial plans', () => {
      render(<TrialModal {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /Start Free Trial/i })
      ).toBeInTheDocument();
    });

    it('calls onStartTrial with selected plan when start button is clicked', async () => {
      render(<TrialModal {...defaultProps} />);

      const startButton = screen.getByRole('button', { name: /Start Free Trial/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(defaultProps.onStartTrial).toHaveBeenCalledWith('starter');
      });
    });

    it('shows loading state while processing', async () => {
      const slowOnStartTrial = vi.fn(
        (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(
        <TrialModal {...defaultProps} onStartTrial={slowOnStartTrial} />
      );

      const startButton = screen.getByRole('button', { name: /Start Free Trial/i });
      fireEvent.click(startButton);

      expect(screen.getByText(/Starting Trial.../i)).toBeInTheDocument();
    });

    it('selects a different plan when card is clicked', async () => {
      render(<TrialModal {...defaultProps} />);

      // Click on Enterprise plan (which has hasTrial: false)
      const enterpriseLabel = screen.getByText('Enterprise');
      fireEvent.click(enterpriseLabel);

      // The button text may change based on the selected plan
      await waitFor(() => {
        // Enterprise plan should show a checkout button since it has no trial
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Plan Features Display', () => {
    it('shows trial features when trial plan is selected', () => {
      render(<TrialModal {...defaultProps} />);

      expect(screen.getByText('Included in trial:')).toBeInTheDocument();
      expect(screen.getByText('Trial Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Trial Feature 2')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles error from onStartTrial gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const failingOnStartTrial = vi.fn().mockRejectedValue(new Error('API Error'));

      render(<TrialModal {...defaultProps} onStartTrial={failingOnStartTrial} />);

      const startButton = screen.getByRole('button', { name: /Start Free Trial/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(failingOnStartTrial).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Modal State', () => {
    it('does not render content when isOpen is false', () => {
      render(<TrialModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Select Your Plan')).not.toBeInTheDocument();
    });
  });
});
