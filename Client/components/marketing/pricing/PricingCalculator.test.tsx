import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingCalculator } from './PricingCalculator';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
}));

let sliderCallbacks: { teamSize?: (value: number[]) => void; projectCount?: (value: number[]) => void } = {};

vi.mock('@/components/ui/slider', () => ({
  Slider: ({
    value,
    onValueChange,
    min,
    max,
    step,
    className,
  }: {
    value: number[];
    onValueChange: (value: number[]) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
  }) => {
    // Store the callback based on the min/max values
    if (max === 50) {
      sliderCallbacks.teamSize = onValueChange;
    } else if (max === 20) {
      sliderCallbacks.projectCount = onValueChange;
    }
    return (
      <div
        data-testid={max === 50 ? 'slider-team-size' : 'slider-project-count'}
        data-value={value[0]}
        data-min={min}
        data-max={max}
        data-step={step}
        className={className}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onValueChange([parseInt(e.target.value)])}
          data-testid={max === 50 ? 'slider-input-team' : 'slider-input-project'}
        />
      </div>
    );
  },
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => (
    <label data-testid="label">{children}</label>
  ),
}));

describe('PricingCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sliderCallbacks = {};
  });

  it('can be imported', () => {
    expect(PricingCalculator).toBeDefined();
    expect(typeof PricingCalculator).toBe('function');
  });

  it('renders the component', () => {
    render(<PricingCalculator />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<PricingCalculator />);

    expect(screen.getByText('Calculate Your Price')).toBeInTheDocument();
  });

  it('renders team size label', () => {
    render(<PricingCalculator />);

    expect(screen.getByText('Team Size')).toBeInTheDocument();
  });

  it('renders active projects label', () => {
    render(<PricingCalculator />);

    expect(screen.getByText('Active Projects')).toBeInTheDocument();
  });

  it('renders the team size slider', () => {
    render(<PricingCalculator />);

    expect(screen.getByTestId('slider-team-size')).toBeInTheDocument();
  });

  it('renders the project count slider', () => {
    render(<PricingCalculator />);

    expect(screen.getByTestId('slider-project-count')).toBeInTheDocument();
  });

  it('displays default team size of 5', () => {
    render(<PricingCalculator />);

    expect(screen.getByText('Current team size: 5 members')).toBeInTheDocument();
  });

  it('displays default project count of 3', () => {
    render(<PricingCalculator />);

    expect(screen.getByText('Active projects: 3')).toBeInTheDocument();
  });

  it('displays monthly price section', () => {
    render(<PricingCalculator />);

    expect(screen.getByText('Monthly Price')).toBeInTheDocument();
  });

  it('displays annual price section', () => {
    render(<PricingCalculator />);

    expect(screen.getByText('Annual Price')).toBeInTheDocument();
  });

  it('displays annual savings section', () => {
    render(<PricingCalculator />);

    expect(screen.getByText('Annual Savings')).toBeInTheDocument();
  });

  it('displays per month text for monthly price', () => {
    render(<PricingCalculator />);

    const perMonthTexts = screen.getAllByText('per month');
    expect(perMonthTexts.length).toBe(2);
  });

  it('displays per year text for savings', () => {
    render(<PricingCalculator />);

    expect(screen.getByText('per year')).toBeInTheDocument();
  });

  it('renders team size slider with correct min/max', () => {
    render(<PricingCalculator />);

    const slider = screen.getByTestId('slider-team-size');
    expect(slider).toHaveAttribute('data-min', '1');
    expect(slider).toHaveAttribute('data-max', '50');
  });

  it('renders project count slider with correct min/max', () => {
    render(<PricingCalculator />);

    const slider = screen.getByTestId('slider-project-count');
    expect(slider).toHaveAttribute('data-min', '1');
    expect(slider).toHaveAttribute('data-max', '20');
  });

  it('calculates base price of $29 for team size <= 5', () => {
    render(<PricingCalculator />);

    // Default team size is 5, base price is $29
    expect(screen.getByText('$29')).toBeInTheDocument();
  });

  it('updates team size when slider changes', () => {
    render(<PricingCalculator />);

    const sliderInput = screen.getByTestId('slider-input-team');
    fireEvent.change(sliderInput, { target: { value: '10' } });

    expect(screen.getByText('Current team size: 10 members')).toBeInTheDocument();
  });

  it('calculates base price of $79 for team size between 6 and 20', () => {
    render(<PricingCalculator />);

    const sliderInput = screen.getByTestId('slider-input-team');
    fireEvent.change(sliderInput, { target: { value: '10' } });

    expect(screen.getByText('$79')).toBeInTheDocument();
  });

  it('calculates base price of $199 for team size > 20', () => {
    render(<PricingCalculator />);

    const sliderInput = screen.getByTestId('slider-input-team');
    fireEvent.change(sliderInput, { target: { value: '25' } });

    expect(screen.getByText('$199')).toBeInTheDocument();
  });

  it('updates project count when slider changes', () => {
    render(<PricingCalculator />);

    const sliderInput = screen.getByTestId('slider-input-project');
    fireEvent.change(sliderInput, { target: { value: '15' } });

    expect(screen.getByText('Active projects: 15')).toBeInTheDocument();
  });

  it('adds project cost for projects > 10', () => {
    render(<PricingCalculator />);

    // Change projects to 15 (5 extra projects at $5 each = $25)
    const sliderInput = screen.getByTestId('slider-input-project');
    fireEvent.change(sliderInput, { target: { value: '15' } });

    // Base is $29 + $25 project cost = $54
    expect(screen.getByText('$54')).toBeInTheDocument();
  });

  it('calculates annual price with 20% discount', () => {
    render(<PricingCalculator />);

    // Default: $29 monthly, annual = $29 * 0.8 = $23.20
    expect(screen.getByText('$23.20')).toBeInTheDocument();
  });

  it('calculates annual savings correctly', () => {
    render(<PricingCalculator />);

    // Default: Monthly $29 * 12 = $348
    // Annual: $29 * 0.8 * 12 = $278.40
    // Savings: $348 - $278.40 = $69.60
    expect(screen.getByText('$69.60')).toBeInTheDocument();
  });

  it('renders labels correctly', () => {
    render(<PricingCalculator />);

    const labels = screen.getAllByTestId('label');
    expect(labels.length).toBe(2);
  });

  it('handles edge case of team size = 1', () => {
    render(<PricingCalculator />);

    const sliderInput = screen.getByTestId('slider-input-team');
    fireEvent.change(sliderInput, { target: { value: '1' } });

    expect(screen.getByText('Current team size: 1 members')).toBeInTheDocument();
    expect(screen.getByText('$29')).toBeInTheDocument();
  });

  it('handles edge case of maximum team size = 50', () => {
    render(<PricingCalculator />);

    const sliderInput = screen.getByTestId('slider-input-team');
    fireEvent.change(sliderInput, { target: { value: '50' } });

    expect(screen.getByText('Current team size: 50 members')).toBeInTheDocument();
    expect(screen.getByText('$199')).toBeInTheDocument();
  });

  it('handles edge case of minimum projects = 1', () => {
    render(<PricingCalculator />);

    const sliderInput = screen.getByTestId('slider-input-project');
    fireEvent.change(sliderInput, { target: { value: '1' } });

    expect(screen.getByText('Active projects: 1')).toBeInTheDocument();
  });

  it('handles edge case of maximum projects = 20', () => {
    render(<PricingCalculator />);

    const sliderInput = screen.getByTestId('slider-input-project');
    fireEvent.change(sliderInput, { target: { value: '20' } });

    // 10 extra projects at $5 each = $50
    // Base $29 + $50 = $79
    expect(screen.getByText('Active projects: 20')).toBeInTheDocument();
    expect(screen.getByText('$79')).toBeInTheDocument();
  });

  it('correctly calculates combined team size and project cost', () => {
    render(<PricingCalculator />);

    // Set team size to 25 (base $199)
    const teamSlider = screen.getByTestId('slider-input-team');
    fireEvent.change(teamSlider, { target: { value: '25' } });

    // Set projects to 15 (+$25 for 5 extra projects)
    const projectSlider = screen.getByTestId('slider-input-project');
    fireEvent.change(projectSlider, { target: { value: '15' } });

    // Total: $199 + $25 = $224
    expect(screen.getByText('$224')).toBeInTheDocument();
  });

  it('no extra project cost for projects <= 10', () => {
    render(<PricingCalculator />);

    const sliderInput = screen.getByTestId('slider-input-project');
    fireEvent.change(sliderInput, { target: { value: '10' } });

    // Should still be base price of $29
    expect(screen.getByText('$29')).toBeInTheDocument();
  });

  it('renders card structure correctly', () => {
    render(<PricingCalculator />);

    const card = screen.getByTestId('card');
    expect(card).toContainElement(screen.getByTestId('card-header'));
    expect(card).toContainElement(screen.getByTestId('card-content'));
  });

  it('slider has correct step of 1', () => {
    render(<PricingCalculator />);

    const teamSlider = screen.getByTestId('slider-team-size');
    const projectSlider = screen.getByTestId('slider-project-count');

    expect(teamSlider).toHaveAttribute('data-step', '1');
    expect(projectSlider).toHaveAttribute('data-step', '1');
  });

  it('displays price formatting correctly', () => {
    render(<PricingCalculator />);

    // Check that dollar sign is displayed correctly
    const priceTexts = screen.getAllByText(/\$/);
    expect(priceTexts.length).toBeGreaterThan(0);
  });
});
