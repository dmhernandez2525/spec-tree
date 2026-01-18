import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock the input-otp library
vi.mock('input-otp', () => {
  const MockOTPInput = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'> & { containerClassName?: string }>(
    ({ className, containerClassName, children, ...props }, ref) => (
      <div ref={ref} data-testid="otp-input" className={containerClassName} {...props}>
        <input className={className} />
        {children}
      </div>
    )
  );
  MockOTPInput.displayName = 'OTPInput';

  return {
    OTPInput: MockOTPInput,
    OTPInputContext: React.createContext({
      slots: Array(6).fill(null).map((_, i) => ({
        char: i < 3 ? String(i + 1) : '',
        hasFakeCaret: i === 3,
        isActive: i === 3,
      })),
    }),
  };
});

// Mock DashIcon
vi.mock('@radix-ui/react-icons', () => ({
  DashIcon: () => <span data-testid="dash-icon">-</span>,
}));

import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './input-otp';

describe('InputOTP', () => {
  describe('exports', () => {
    it('exports InputOTP component', () => {
      expect(InputOTP).toBeDefined();
    });

    it('exports InputOTPGroup component', () => {
      expect(InputOTPGroup).toBeDefined();
    });

    it('exports InputOTPSlot component', () => {
      expect(InputOTPSlot).toBeDefined();
    });

    it('exports InputOTPSeparator component', () => {
      expect(InputOTPSeparator).toBeDefined();
    });
  });

  describe('InputOTP component', () => {
    it('renders OTPInput', () => {
      render(<InputOTP maxLength={6} />);
      expect(screen.getByTestId('otp-input')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<InputOTP maxLength={6} className="custom-class" />);
      const input = screen.getByTestId('otp-input').querySelector('input');
      expect(input).toHaveClass('custom-class');
    });

    it('applies containerClassName', () => {
      render(<InputOTP maxLength={6} containerClassName="container-class" />);
      expect(screen.getByTestId('otp-input')).toHaveClass('container-class');
    });

    it('has correct displayName', () => {
      expect(InputOTP.displayName).toBe('InputOTP');
    });
  });

  describe('InputOTPGroup component', () => {
    it('renders a div element', () => {
      render(<InputOTPGroup data-testid="otp-group" />);
      expect(screen.getByTestId('otp-group')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<InputOTPGroup data-testid="otp-group" className="group-class" />);
      expect(screen.getByTestId('otp-group')).toHaveClass('group-class');
    });

    it('renders children', () => {
      render(
        <InputOTPGroup>
          <span data-testid="child">Child</span>
        </InputOTPGroup>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('has correct displayName', () => {
      expect(InputOTPGroup.displayName).toBe('InputOTPGroup');
    });
  });

  describe('InputOTPSlot component', () => {
    it('renders slot with character', () => {
      render(<InputOTPSlot index={0} data-testid="otp-slot" />);
      expect(screen.getByTestId('otp-slot')).toHaveTextContent('1');
    });

    it('renders empty slot', () => {
      render(<InputOTPSlot index={4} data-testid="otp-slot" />);
      expect(screen.getByTestId('otp-slot')).toBeInTheDocument();
    });

    it('shows fake caret when active', () => {
      render(<InputOTPSlot index={3} data-testid="otp-slot" />);
      const slot = screen.getByTestId('otp-slot');
      // The fake caret div should be present for index 3 (hasFakeCaret is true)
      expect(slot.querySelector('.animate-caret-blink')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<InputOTPSlot index={0} data-testid="otp-slot" className="slot-class" />);
      expect(screen.getByTestId('otp-slot')).toHaveClass('slot-class');
    });

    it('has correct displayName', () => {
      expect(InputOTPSlot.displayName).toBe('InputOTPSlot');
    });
  });

  describe('InputOTPSeparator component', () => {
    it('renders separator with role', () => {
      render(<InputOTPSeparator data-testid="otp-separator" />);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('renders DashIcon', () => {
      render(<InputOTPSeparator />);
      expect(screen.getByTestId('dash-icon')).toBeInTheDocument();
    });

    it('has correct displayName', () => {
      expect(InputOTPSeparator.displayName).toBe('InputOTPSeparator');
    });
  });
});
