import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CostTrackingPanel } from './CostTrackingPanel';

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardDescription: ({ children, className }: any) => (
    <div data-testid="card-description" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <div data-testid="tabs-trigger" data-value={value}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <div data-testid="badge" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div data-testid="progress" data-value={value} className={className} />
  ),
}));

// Mock recharts
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ children }: any) => <div data-testid="bar">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: any) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }: any) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
}));

describe('CostTrackingPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports CostTrackingPanel component', () => {
    expect(CostTrackingPanel).toBeDefined();
    expect(typeof CostTrackingPanel).toBe('function');
  });

  it('exports CostTrackingPanel as named export', () => {
    expect(CostTrackingPanel).toBeDefined();
    expect(typeof CostTrackingPanel).toBe('function');
  });

  it('renders AI Cost Tracking header', () => {
    render(<CostTrackingPanel />);

    expect(screen.getByText('AI Cost Tracking')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<CostTrackingPanel />);

    expect(
      screen.getByText('Monitor your AI usage and costs across providers')
    ).toBeInTheDocument();
  });

  it('renders time range tabs', () => {
    render(<CostTrackingPanel />);

    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
  });

  it('renders total spend card', () => {
    render(<CostTrackingPanel />);

    expect(screen.getByText('Total Spend')).toBeInTheDocument();
    expect(screen.getByText(/\$127\.45/)).toBeInTheDocument();
  });

  it('renders budget usage card', () => {
    render(<CostTrackingPanel />);

    expect(screen.getByText('Budget Usage')).toBeInTheDocument();
  });

  it('renders input tokens card', () => {
    render(<CostTrackingPanel />);

    const inputTokensElements = screen.getAllByText('Input Tokens');
    expect(inputTokensElements.length).toBeGreaterThan(0);
  });

  it('renders output tokens card', () => {
    render(<CostTrackingPanel />);

    const outputTokensElements = screen.getAllByText('Output Tokens');
    expect(outputTokensElements.length).toBeGreaterThan(0);
  });

  it('renders cost by provider chart', () => {
    render(<CostTrackingPanel />);

    expect(screen.getByText('Cost by Provider')).toBeInTheDocument();
    expect(
      screen.getByText('Breakdown of spending across AI providers')
    ).toBeInTheDocument();
  });

  it('renders cost by model chart', () => {
    render(<CostTrackingPanel />);

    expect(screen.getByText('Cost by Model')).toBeInTheDocument();
    expect(screen.getByText('Detailed breakdown by AI model')).toBeInTheDocument();
  });

  it('renders daily cost trend chart', () => {
    render(<CostTrackingPanel />);

    expect(screen.getByText('Daily Cost Trend')).toBeInTheDocument();
    expect(
      screen.getByText('Daily spending breakdown by provider')
    ).toBeInTheDocument();
  });

  it('renders monthly cost trend chart', () => {
    render(<CostTrackingPanel />);

    expect(screen.getByText('Monthly Cost Trend')).toBeInTheDocument();
    expect(screen.getByText('Cost trends over the past months')).toBeInTheDocument();
  });

  it('renders token usage by provider', () => {
    render(<CostTrackingPanel />);

    expect(screen.getByText('Token Usage by Provider')).toBeInTheDocument();
    expect(
      screen.getByText('Input and output token breakdown')
    ).toBeInTheDocument();
  });

  it('renders model pricing reference', () => {
    render(<CostTrackingPanel />);

    expect(screen.getByText('Model Pricing Reference')).toBeInTheDocument();
    expect(
      screen.getByText('Current pricing per 1K tokens')
    ).toBeInTheDocument();
  });

  it('renders provider names', () => {
    render(<CostTrackingPanel />);

    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });

  it('renders multiple cards', () => {
    render(<CostTrackingPanel />);

    const cards = screen.getAllByTestId('card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('renders pie chart for provider breakdown', () => {
    render(<CostTrackingPanel />);

    const pieCharts = screen.getAllByTestId('pie-chart');
    expect(pieCharts.length).toBeGreaterThan(0);
  });

  it('renders bar charts', () => {
    render(<CostTrackingPanel />);

    const barCharts = screen.getAllByTestId('bar-chart');
    expect(barCharts.length).toBeGreaterThan(0);
  });

  it('renders line chart for monthly trend', () => {
    render(<CostTrackingPanel />);

    const lineCharts = screen.getAllByTestId('line-chart');
    expect(lineCharts.length).toBeGreaterThan(0);
  });

  it('renders progress component', () => {
    render(<CostTrackingPanel />);

    const progress = screen.getAllByTestId('progress');
    expect(progress.length).toBeGreaterThan(0);
  });

  it('renders badge components', () => {
    render(<CostTrackingPanel />);

    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('renders responsive containers for charts', () => {
    render(<CostTrackingPanel />);

    const containers = screen.getAllByTestId('responsive-container');
    expect(containers.length).toBeGreaterThan(0);
  });
});
