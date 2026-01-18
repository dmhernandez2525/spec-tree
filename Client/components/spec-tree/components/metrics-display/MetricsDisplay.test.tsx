import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricsDisplay from './MetricsDisplay';

describe('MetricsDisplay', () => {
  const mockMetrics = [
    { label: 'Total Items', value: 42 },
    { label: 'Completed', value: '75%' },
    { label: 'In Progress', value: 10 },
  ];

  it('renders all metrics', () => {
    render(<MetricsDisplay metrics={mockMetrics} />);

    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders empty when no metrics', () => {
    const { container } = render(<MetricsDisplay metrics={[]} />);

    const cards = container.querySelectorAll('.border');
    expect(cards).toHaveLength(0);
  });

  it('renders metric with description', () => {
    const metricsWithDesc = [
      { label: 'Total', value: 100, description: 'Total count of all items' },
    ];

    render(<MetricsDisplay metrics={metricsWithDesc} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Total count of all items')).toBeInTheDocument();
  });

  it('renders without description', () => {
    const metricsWithoutDesc = [{ label: 'Simple', value: 5 }];

    render(<MetricsDisplay metrics={metricsWithoutDesc} />);

    expect(screen.getByText('Simple')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('applies custom className to container', () => {
    const { container } = render(
      <MetricsDisplay metrics={mockMetrics} className="custom-class" />
    );

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toHaveClass('custom-class');
  });

  it('applies cardClassName to each card', () => {
    const { container } = render(
      <MetricsDisplay metrics={mockMetrics} cardClassName="card-custom" />
    );

    const cards = container.querySelectorAll('.card-custom');
    expect(cards).toHaveLength(3);
  });

  it('uses grid layout', () => {
    const { container } = render(<MetricsDisplay metrics={mockMetrics} />);

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('sm:grid-cols-2');
    expect(gridContainer).toHaveClass('lg:grid-cols-5');
    expect(gridContainer).toHaveClass('gap-4');
  });

  it('renders string values correctly', () => {
    const metricsWithStrings = [
      { label: 'Status', value: 'Active' },
      { label: 'Percentage', value: '85.5%' },
    ];

    render(<MetricsDisplay metrics={metricsWithStrings} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('85.5%')).toBeInTheDocument();
  });

  it('renders numeric values correctly', () => {
    const metricsWithNumbers = [
      { label: 'Count', value: 0 },
      { label: 'Large', value: 1000000 },
    ];

    render(<MetricsDisplay metrics={metricsWithNumbers} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('1000000')).toBeInTheDocument();
  });

  it('displays values with font styling', () => {
    render(<MetricsDisplay metrics={[{ label: 'Test', value: 42 }]} />);

    const valueElement = screen.getByText('42');
    expect(valueElement).toHaveClass('text-2xl');
    expect(valueElement).toHaveClass('font-bold');
  });
});
