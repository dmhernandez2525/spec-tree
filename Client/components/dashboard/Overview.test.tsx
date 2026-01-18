import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Overview } from './Overview';

// Mock recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({
    children,
    width,
    height,
  }: {
    children: React.ReactNode;
    width: string;
    height: number;
  }) => (
    <div
      data-testid="responsive-container"
      style={{ width, height: `${height}px` }}
    >
      {children}
    </div>
  ),
  LineChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: unknown[];
  }) => (
    <div data-testid="line-chart" data-data-length={data.length}>
      {children}
    </div>
  ),
  Line: ({
    dataKey,
    stroke,
    strokeWidth,
    type,
  }: {
    dataKey: string;
    stroke: string;
    strokeWidth: number;
    type: string;
  }) => (
    <div
      data-testid="line"
      data-datakey={dataKey}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-type={type}
    />
  ),
  XAxis: ({
    dataKey,
    stroke,
    fontSize,
  }: {
    dataKey: string;
    stroke: string;
    fontSize: number;
  }) => (
    <div
      data-testid="x-axis"
      data-datakey={dataKey}
      data-stroke={stroke}
      data-fontsize={fontSize}
    />
  ),
  YAxis: ({
    stroke,
    fontSize,
  }: {
    stroke: string;
    fontSize: number;
    tickFormatter?: (value: number) => string;
  }) => (
    <div data-testid="y-axis" data-stroke={stroke} data-fontsize={fontSize} />
  ),
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe('Overview', () => {
  it('renders the ResponsiveContainer', () => {
    render(<Overview />);

    const container = screen.getByTestId('responsive-container');
    expect(container).toBeInTheDocument();
  });

  it('renders the LineChart', () => {
    render(<Overview />);

    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toBeInTheDocument();
  });

  it('renders data for 12 months', () => {
    render(<Overview />);

    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-data-length', '12');
  });

  it('renders XAxis with correct dataKey', () => {
    render(<Overview />);

    const xAxis = screen.getByTestId('x-axis');
    expect(xAxis).toBeInTheDocument();
    expect(xAxis).toHaveAttribute('data-datakey', 'name');
  });

  it('renders YAxis', () => {
    render(<Overview />);

    const yAxis = screen.getByTestId('y-axis');
    expect(yAxis).toBeInTheDocument();
  });

  it('renders Tooltip component', () => {
    render(<Overview />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toBeInTheDocument();
  });

  it('renders Line with correct configuration', () => {
    render(<Overview />);

    const line = screen.getByTestId('line');
    expect(line).toBeInTheDocument();
    expect(line).toHaveAttribute('data-datakey', 'total');
    expect(line).toHaveAttribute('data-stroke', '#8884d8');
    expect(line).toHaveAttribute('data-stroke-width', '2');
    expect(line).toHaveAttribute('data-type', 'monotone');
  });

  it('sets correct height for the chart', () => {
    render(<Overview />);

    const container = screen.getByTestId('responsive-container');
    expect(container.style.height).toBe('350px');
  });

  it('sets full width for ResponsiveContainer', () => {
    render(<Overview />);

    const container = screen.getByTestId('responsive-container');
    expect(container.style.width).toBe('100%');
  });

  it('renders axis with grey stroke color', () => {
    render(<Overview />);

    const xAxis = screen.getByTestId('x-axis');
    const yAxis = screen.getByTestId('y-axis');

    expect(xAxis).toHaveAttribute('data-stroke', '#888888');
    expect(yAxis).toHaveAttribute('data-stroke', '#888888');
  });

  it('renders axis with font size 12', () => {
    render(<Overview />);

    const xAxis = screen.getByTestId('x-axis');
    const yAxis = screen.getByTestId('y-axis');

    expect(xAxis).toHaveAttribute('data-fontsize', '12');
    expect(yAxis).toHaveAttribute('data-fontsize', '12');
  });
});
