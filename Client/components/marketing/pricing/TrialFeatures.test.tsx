import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrialFeatures } from './TrialFeatures';

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
    users: ({ className }: { className?: string }) => (
      <span data-testid="icon-users" className={className}>
        Users
      </span>
    ),
    sparkles: ({ className }: { className?: string }) => (
      <span data-testid="icon-sparkles" className={className}>
        Sparkles
      </span>
    ),
  },
}));

describe('TrialFeatures', () => {
  describe('Exports', () => {
    it('exports TrialFeatures as named export', () => {
      expect(TrialFeatures).toBeDefined();
      expect(typeof TrialFeatures).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', () => {
      expect(() => {
        render(<TrialFeatures />);
      }).not.toThrow();
    });
  });

  describe('Rendering', () => {
    it('renders the main heading', () => {
      render(<TrialFeatures />);

      expect(screen.getByText('Start Your Free Trial Today')).toBeInTheDocument();
    });

    it('renders the subtitle', () => {
      render(<TrialFeatures />);

      expect(
        screen.getByText('Experience the full power of Spec Tree for 14 days')
      ).toBeInTheDocument();
    });

    it('renders all feature cards', () => {
      render(<TrialFeatures />);

      expect(screen.getByText('Full Feature Access')).toBeInTheDocument();
      expect(screen.getByText('No Credit Card Required')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive Support')).toBeInTheDocument();
      expect(screen.getByText('Easy Setup Process')).toBeInTheDocument();
      expect(screen.getByText('Data Security')).toBeInTheDocument();
      expect(screen.getByText('Free Training Resources')).toBeInTheDocument();
    });

    it('renders feature descriptions', () => {
      render(<TrialFeatures />);

      expect(
        screen.getByText('Try every feature of your selected plan without limitations')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Start your trial instantly - no payment details needed')
      ).toBeInTheDocument();
    });

    it('renders feature details', () => {
      render(<TrialFeatures />);

      // From Full Feature Access
      expect(screen.getByText('AI-powered context gathering')).toBeInTheDocument();
      expect(screen.getByText('Custom templates')).toBeInTheDocument();

      // From No Credit Card Required
      expect(screen.getByText('Instant access')).toBeInTheDocument();
      expect(screen.getByText('No automatic billing')).toBeInTheDocument();

      // From Comprehensive Support
      expect(screen.getByText('Dedicated onboarding')).toBeInTheDocument();
      expect(screen.getByText('Live chat support')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('uses responsive grid for feature cards', () => {
      const { container } = render(<TrialFeatures />);

      const grid = container.querySelector('.grid.gap-6');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('centers heading content', () => {
      const { container } = render(<TrialFeatures />);

      const textCenter = container.querySelector('.text-center');
      expect(textCenter).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders check icons for feature details', () => {
      render(<TrialFeatures />);

      const checkIcons = screen.getAllByTestId('icon-check');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('renders feature icons', () => {
      render(<TrialFeatures />);

      // The first feature uses the 'check' icon
      expect(screen.getAllByTestId('icon-check').length).toBeGreaterThan(0);
    });
  });

  describe('Card Structure', () => {
    it('renders cards with full height class', () => {
      const { container } = render(<TrialFeatures />);

      const cards = container.querySelectorAll('[class*="h-full"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('renders separators between description and details', () => {
      const { container } = render(<TrialFeatures />);

      const separators = container.querySelectorAll('[data-orientation]');
      expect(separators.length).toBeGreaterThan(0);
    });
  });
});
