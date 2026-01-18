import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SuccessMetrics } from './SuccessMetrics';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe('SuccessMetrics', () => {
  it('can be imported', () => {
    expect(SuccessMetrics).toBeDefined();
    expect(typeof SuccessMetrics).toBe('function');
  });

  it('renders metric titles', () => {
    render(<SuccessMetrics />);

    expect(screen.getByText('Average Project Completion Time')).toBeInTheDocument();
    expect(screen.getByText('Team Productivity')).toBeInTheDocument();
    expect(screen.getByText('Requirements Coverage')).toBeInTheDocument();
    expect(screen.getByText('Project Cost Reduction')).toBeInTheDocument();
  });

  it('renders metric values', () => {
    render(<SuccessMetrics />);

    expect(screen.getByText('-40%')).toBeInTheDocument();
    expect(screen.getByText('+35%')).toBeInTheDocument();
    expect(screen.getByText('+60%')).toBeInTheDocument();
    expect(screen.getByText('-25%')).toBeInTheDocument();
  });

  it('renders metric change descriptions', () => {
    render(<SuccessMetrics />);

    expect(screen.getByText('Faster project delivery')).toBeInTheDocument();
    expect(screen.getByText('Increased efficiency')).toBeInTheDocument();
    expect(screen.getByText('More comprehensive planning')).toBeInTheDocument();
    expect(screen.getByText('Lower operational costs')).toBeInTheDocument();
  });

  it('renders chart section', () => {
    render(<SuccessMetrics />);

    expect(screen.getByText('Implementation Success Rate')).toBeInTheDocument();
  });

  it('renders responsive container', () => {
    render(<SuccessMetrics />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders bar chart', () => {
    render(<SuccessMetrics />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders 4 metric cards', () => {
    const { container } = render(<SuccessMetrics />);

    // Grid should have 4 metric cards
    const grid = container.querySelector('.grid.gap-6.sm\\:grid-cols-2.lg\\:grid-cols-4');
    expect(grid).toBeInTheDocument();
  });

  it('positive metrics have green color', () => {
    render(<SuccessMetrics />);

    const positiveMetric = screen.getByText('+35%');
    expect(positiveMetric).toHaveClass('text-green-600');
  });
});
