import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricDisplay } from './MetricDisplay';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('MetricDisplay', () => {
  const mockMetrics = [
    { value: '100+', label: 'Projects' },
    { value: '50%', label: 'Time Saved' },
    { value: '99%', label: 'Satisfaction' },
  ];

  it('renders all metrics', () => {
    render(<MetricDisplay metrics={mockMetrics} />);

    expect(screen.getByText('100+')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('99%')).toBeInTheDocument();
  });

  it('renders all metric labels', () => {
    render(<MetricDisplay metrics={mockMetrics} />);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Time Saved')).toBeInTheDocument();
    expect(screen.getByText('Satisfaction')).toBeInTheDocument();
  });

  it('renders correct number of metric cards', () => {
    const { container } = render(<MetricDisplay metrics={mockMetrics} />);

    // Should have 3 cards (one for each metric)
    const cards = container.querySelectorAll('[class*="rounded-xl"]');
    expect(cards.length).toBe(3);
  });

  it('renders with empty metrics array', () => {
    const { container } = render(<MetricDisplay metrics={[]} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid).toBeInTheDocument();
    expect(grid.children.length).toBe(0);
  });

  it('renders single metric correctly', () => {
    const singleMetric = [{ value: '42', label: 'Answer' }];
    render(<MetricDisplay metrics={singleMetric} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Answer')).toBeInTheDocument();
  });

  it('renders metric values with primary text color', () => {
    render(<MetricDisplay metrics={mockMetrics} />);

    const value = screen.getByText('100+');
    expect(value).toHaveClass('text-primary');
    expect(value).toHaveClass('text-3xl');
    expect(value).toHaveClass('font-bold');
  });

  it('renders metric labels with muted foreground', () => {
    render(<MetricDisplay metrics={mockMetrics} />);

    const label = screen.getByText('Projects');
    expect(label).toHaveClass('text-muted-foreground');
    expect(label).toHaveClass('text-sm');
  });

  it('renders grid with responsive columns', () => {
    const { container } = render(<MetricDisplay metrics={mockMetrics} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-6');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-3');
  });

  it('renders metrics with special characters', () => {
    const specialMetrics = [
      { value: '$1M+', label: 'Revenue Saved' },
      { value: '24/7', label: 'Support' },
    ];
    render(<MetricDisplay metrics={specialMetrics} />);

    expect(screen.getByText('$1M+')).toBeInTheDocument();
    expect(screen.getByText('24/7')).toBeInTheDocument();
  });
});

describe('MetricDisplay exports', () => {
  it('exports MetricDisplay as a named export', () => {
    expect(MetricDisplay).toBeDefined();
    expect(typeof MetricDisplay).toBe('function');
  });
});
