import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrialStats } from './TrialStats';

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

describe('TrialStats', () => {
  describe('Exports', () => {
    it('exports TrialStats as named export', () => {
      expect(TrialStats).toBeDefined();
      expect(typeof TrialStats).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', () => {
      expect(() => {
        render(<TrialStats />);
      }).not.toThrow();
    });
  });

  describe('Rendering', () => {
    it('renders all stats', () => {
      render(<TrialStats />);

      expect(screen.getByText('10,000+')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();

      expect(screen.getByText('94%')).toBeInTheDocument();
      expect(screen.getByText('Trial Satisfaction')).toBeInTheDocument();

      expect(screen.getByText('40%')).toBeInTheDocument();
      expect(screen.getByText('Average Time Saved')).toBeInTheDocument();

      expect(screen.getByText('98%')).toBeInTheDocument();
      expect(screen.getByText('Support Response Rate')).toBeInTheDocument();
    });

    it('renders stats in a grid layout', () => {
      const { container } = render(<TrialStats />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('gap-6');
    });

    it('renders four stat cards', () => {
      const { container } = render(<TrialStats />);

      // Each stat is in a card-like structure
      const gridItems = container.querySelectorAll('.grid > div');
      expect(gridItems.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Stat Values', () => {
    it('displays stat values with correct styling', () => {
      render(<TrialStats />);

      const values = ['10,000+', '94%', '40%', '98%'];
      values.forEach((value) => {
        const element = screen.getByText(value);
        expect(element).toHaveClass('text-3xl', 'font-bold', 'text-primary');
      });
    });

    it('displays stat labels with muted styling', () => {
      render(<TrialStats />);

      const labels = [
        'Active Users',
        'Trial Satisfaction',
        'Average Time Saved',
        'Support Response Rate',
      ];
      labels.forEach((label) => {
        const element = screen.getByText(label);
        expect(element).toHaveClass('text-sm', 'text-muted-foreground');
      });
    });
  });

  describe('Layout', () => {
    it('uses responsive grid classes', () => {
      const { container } = render(<TrialStats />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });

    it('centers card content', () => {
      const { container } = render(<TrialStats />);

      const cardContents = container.querySelectorAll('[class*="CardContent"]');
      cardContents.forEach((content) => {
        expect(content).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
      });
    });
  });
});
