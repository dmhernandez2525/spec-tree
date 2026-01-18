import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BillingHistory } from './BillingHistory';

// Mock Icons component
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    download: ({ className }: { className?: string }) => (
      <span data-testid="icon-download" className={className}>
        Download
      </span>
    ),
  },
}));

describe('BillingHistory', () => {
  describe('Exports', () => {
    it('exports BillingHistory as named export', () => {
      expect(BillingHistory).toBeDefined();
      expect(typeof BillingHistory).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', () => {
      expect(() => {
        render(<BillingHistory />);
      }).not.toThrow();
    });
  });

  describe('Rendering', () => {
    it('renders card with title', () => {
      render(<BillingHistory />);

      expect(screen.getByText('Billing History')).toBeInTheDocument();
    });

    it('renders card description', () => {
      render(<BillingHistory />);

      expect(
        screen.getByText('View your past invoices and payments')
      ).toBeInTheDocument();
    });

    it('renders table headers', () => {
      render(<BillingHistory />);

      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Invoice')).toBeInTheDocument();
    });
  });

  describe('Mock Data Display', () => {
    it('renders billing history items', () => {
      render(<BillingHistory />);

      const proPlans = screen.getAllByText('Professional Plan - Monthly');
      expect(proPlans.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Starter Plan - Monthly')).toBeInTheDocument();
    });

    it('displays formatted amounts', () => {
      render(<BillingHistory />);

      expect(screen.getAllByText('$49.99').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('$29.99')).toBeInTheDocument();
    });

    it('displays formatted dates', () => {
      render(<BillingHistory />);

      // Dates are formatted using toLocaleDateString()
      const dateElements = screen.getAllByRole('cell');
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('displays status badges', () => {
      render(<BillingHistory />);

      const paidBadges = screen.getAllByText('paid');
      expect(paidBadges.length).toBe(3); // All mock items are paid
    });
  });

  describe('Download Buttons', () => {
    it('renders download buttons for each invoice', () => {
      render(<BillingHistory />);

      const downloadIcons = screen.getAllByTestId('icon-download');
      expect(downloadIcons.length).toBe(3); // One for each mock item
    });

    it('renders download links', () => {
      render(<BillingHistory />);

      const downloadLinks = screen.getAllByRole('link');
      downloadLinks.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('includes screen reader text for download buttons', () => {
      render(<BillingHistory />);

      const srOnlyTexts = screen.getAllByText('Download invoice');
      expect(srOnlyTexts.length).toBe(3);
    });
  });

  describe('Table Structure', () => {
    it('renders table element', () => {
      render(<BillingHistory />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      render(<BillingHistory />);

      const rows = screen.getAllByRole('row');
      // 1 header row + 3 data rows
      expect(rows.length).toBe(4);
    });

    it('renders correct number of columns', () => {
      render(<BillingHistory />);

      const headerCells = screen.getAllByRole('columnheader');
      expect(headerCells.length).toBe(5);
    });
  });

  describe('Badge Variants', () => {
    it('uses default variant for paid status', () => {
      render(<BillingHistory />);

      const paidBadges = screen.getAllByText('paid');
      paidBadges.forEach((badge) => {
        // Badge with paid status should not have destructive class
        expect(badge.className).not.toContain('destructive');
      });
    });
  });
});
