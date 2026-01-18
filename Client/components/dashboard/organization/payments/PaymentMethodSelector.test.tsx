import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentMethodSelector } from './PaymentMethodSelector';

// Mock Stripe
vi.mock('@stripe/react-stripe-js', () => ({
  CardElement: ({ options }: { options?: unknown }) => (
    <div data-testid="stripe-card-element" data-options={JSON.stringify(options)}>
      Mock Card Element
    </div>
  ),
}));

// Mock Icons component
vi.mock('@/components/shared/icons', () => ({
  Icons: {
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
    spinner: ({ className }: { className?: string }) => (
      <span data-testid="icon-spinner" className={className}>
        Spinner
      </span>
    ),
  },
}));

describe('PaymentMethodSelector', () => {
  const defaultProps = {
    onUpdatePaymentMethod: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Exports', () => {
    it('exports PaymentMethodSelector as named export', () => {
      expect(PaymentMethodSelector).toBeDefined();
      expect(typeof PaymentMethodSelector).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', () => {
      expect(() => {
        render(<PaymentMethodSelector {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('Rendering', () => {
    it('renders existing payment method card', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      expect(screen.getByText('•••• 4242')).toBeInTheDocument();
      expect(screen.getByText('Expires 12/24')).toBeInTheDocument();
    });

    it('renders add new payment method option', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      expect(screen.getByText('Add new payment method')).toBeInTheDocument();
    });

    it('renders credit card icon', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      expect(screen.getByTestId('icon-credit-card')).toBeInTheDocument();
    });

    it('renders plus icon for new method', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      expect(screen.getByTestId('icon-plus')).toBeInTheDocument();
    });

    it('renders update button', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /Update Payment Method/i })
      ).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('selects existing payment method when clicked', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      const existingCardLabel = screen.getByText('•••• 4242').closest('label');
      if (existingCardLabel) {
        fireEvent.click(existingCardLabel);
      }

      const existingRadio = document.getElementById('existing-card') as HTMLInputElement;
      expect(existingRadio.checked).toBe(true);
    });

    it('selects new payment method when clicked', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      const newCardLabel = screen.getByText('Add new payment method').closest('label');
      if (newCardLabel) {
        fireEvent.click(newCardLabel);
      }

      const newRadio = document.getElementById('new-card') as HTMLInputElement;
      expect(newRadio.checked).toBe(true);
    });

    it('shows Stripe CardElement when new payment method is selected', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      const newCardLabel = screen.getByText('Add new payment method').closest('label');
      if (newCardLabel) {
        fireEvent.click(newCardLabel);
      }

      expect(screen.getByTestId('stripe-card-element')).toBeInTheDocument();
    });

    it('hides Stripe CardElement when existing payment method is selected', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      // First select new card
      const newCardLabel = screen.getByText('Add new payment method').closest('label');
      if (newCardLabel) {
        fireEvent.click(newCardLabel);
      }
      expect(screen.getByTestId('stripe-card-element')).toBeInTheDocument();

      // Then select existing card
      const existingCardLabel = screen.getByText('•••• 4242').closest('label');
      if (existingCardLabel) {
        fireEvent.click(existingCardLabel);
      }
      expect(screen.queryByTestId('stripe-card-element')).not.toBeInTheDocument();
    });

    it('calls onUpdatePaymentMethod when button is clicked', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      // Select a payment method first
      const existingCardLabel = screen.getByText('•••• 4242').closest('label');
      if (existingCardLabel) {
        fireEvent.click(existingCardLabel);
      }

      const updateButton = screen.getByRole('button', {
        name: /Update Payment Method/i,
      });
      fireEvent.click(updateButton);

      expect(defaultProps.onUpdatePaymentMethod).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button States', () => {
    it('disables button when no payment method is selected', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      const updateButton = screen.getByRole('button', {
        name: /Update Payment Method/i,
      });
      expect(updateButton).toBeDisabled();
    });

    it('enables button when payment method is selected', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      const existingCardLabel = screen.getByText('•••• 4242').closest('label');
      if (existingCardLabel) {
        fireEvent.click(existingCardLabel);
      }

      const updateButton = screen.getByRole('button', {
        name: /Update Payment Method/i,
      });
      expect(updateButton).not.toBeDisabled();
    });

    it('disables button when isLoading is true', () => {
      render(<PaymentMethodSelector {...defaultProps} isLoading={true} />);

      const updateButton = screen.getByRole('button');
      expect(updateButton).toBeDisabled();
    });

    it('shows loading state when isLoading is true', () => {
      render(<PaymentMethodSelector {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Updating...')).toBeInTheDocument();
      expect(screen.getByTestId('icon-spinner')).toBeInTheDocument();
    });
  });

  describe('Radio Inputs', () => {
    it('renders hidden radio inputs', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      const radios = screen.getAllByRole('radio', { hidden: true });
      expect(radios.length).toBe(2);
    });

    it('groups radio inputs by name', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      const radios = screen.getAllByRole('radio', { hidden: true });
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('name', 'payment-method');
      });
    });
  });
});
