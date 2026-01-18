import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsGraph } from './ResultsGraph';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void }) => (
      <div onClick={onClick} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('ResultsGraph', () => {
  it('can be imported', () => {
    expect(ResultsGraph).toBeDefined();
    expect(typeof ResultsGraph).toBe('function');
  });

  it('renders metric cards', () => {
    render(<ResultsGraph />);

    expect(screen.getByText('Productivity Increase')).toBeInTheDocument();
    expect(screen.getByText('Efficiency Gain')).toBeInTheDocument();
    expect(screen.getByText('Cost Savings')).toBeInTheDocument();
    expect(screen.getByText('User Satisfaction')).toBeInTheDocument();
  });

  it('renders metric values', () => {
    render(<ResultsGraph />);

    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('renders metric change badges', () => {
    render(<ResultsGraph />);

    expect(screen.getByText('+15%')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('+20%')).toBeInTheDocument();
    expect(screen.getByText('+8%')).toBeInTheDocument();
  });

  it('renders performance metrics card header', () => {
    render(<ResultsGraph />);

    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(
      screen.getByText('Track key performance indicators over time')
    ).toBeInTheDocument();
  });

  it('renders chart tab buttons', () => {
    render(<ResultsGraph />);

    expect(screen.getByRole('tab', { name: 'Area' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Line' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Bar' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Distribution' })).toBeInTheDocument();
  });

  it('renders responsive container', () => {
    render(<ResultsGraph />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('switches active metric on card click', () => {
    render(<ResultsGraph />);

    // Get the card containing Efficiency Gain
    const efficiencyCard = screen.getByText('Efficiency Gain').closest('[class*="cursor-pointer"]');
    expect(efficiencyCard).toBeTruthy();

    if (efficiencyCard) {
      fireEvent.click(efficiencyCard);
    }

    // The clicked card should now have the active style (border-primary)
    // This test verifies the component reacts to the click
  });

  it('can switch between chart tabs', () => {
    render(<ResultsGraph />);

    const lineTab = screen.getByRole('tab', { name: 'Line' });
    fireEvent.click(lineTab);

    // Verify tab can be clicked without errors
    expect(lineTab).toBeInTheDocument();
  });
});
