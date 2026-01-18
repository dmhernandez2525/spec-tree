import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoiCalculator } from './RoiCalculator';

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
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    type,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button data-testid="button" type={type} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({
    type,
    onChange,
    value,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      data-testid="input"
      type={type}
      onChange={onChange}
      value={value}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/slider', () => ({
  Slider: ({
    value,
    onValueChange,
    min,
    max,
    step,
  }: {
    value: number[];
    onValueChange: (value: number[]) => void;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <div
      data-testid={`slider-${min}-${max}`}
      data-value={value[0]}
      data-min={min}
      data-max={max}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseInt(e.target.value)])}
        data-testid={`slider-input-${min}-${max}`}
      />
    </div>
  ),
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table data-testid="table">{children}</table>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody data-testid="table-body">{children}</tbody>
  ),
  TableCell: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <td data-testid="table-cell" className={className}>
      {children}
    </td>
  ),
  TableHead: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <th data-testid="table-head" className={className}>
      {children}
    </th>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead data-testid="table-header">{children}</thead>
  ),
  TableRow: ({ children }: { children: React.ReactNode }) => (
    <tr data-testid="table-row">{children}</tr>
  ),
}));

vi.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="form-provider" {...props}>
      {children}
    </div>
  ),
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-control">{children}</div>
  ),
  FormDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="form-description">{children}</p>
  ),
  FormField: ({
    render,
    name,
  }: {
    render: (props: {
      field: { value: number; onChange: (v: number) => void };
    }) => React.ReactNode;
    name: string;
    control: unknown;
  }) => {
    // Provide default values based on field name
    const defaultValues: Record<string, number> = {
      teamSize: 5,
      avgSalary: 75000,
      projectsPerYear: 12,
      currentPlanningTime: 20,
    };
    return (
      <div data-testid={`form-field-${name}`}>
        {render({
          field: { value: defaultValues[name] || 0, onChange: vi.fn() },
        })}
      </div>
    );
  },
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children }: { children: React.ReactNode }) => (
    <label data-testid="form-label">{children}</label>
  ),
  FormMessage: () => <div data-testid="form-message" />,
}));

describe('RoiCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('can be imported', () => {
    expect(RoiCalculator).toBeDefined();
    expect(typeof RoiCalculator).toBe('function');
  });

  it('renders the component', () => {
    render(<RoiCalculator />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<RoiCalculator />);

    expect(screen.getByText('ROI Calculator')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<RoiCalculator />);

    expect(
      screen.getByText('Calculate your potential savings with Spec Tree')
    ).toBeInTheDocument();
  });

  it('renders team size form field', () => {
    render(<RoiCalculator />);

    expect(screen.getByTestId('form-field-teamSize')).toBeInTheDocument();
    expect(screen.getByText('Team Size')).toBeInTheDocument();
  });

  it('renders average salary form field', () => {
    render(<RoiCalculator />);

    expect(screen.getByTestId('form-field-avgSalary')).toBeInTheDocument();
    expect(screen.getByText('Average Team Member Salary')).toBeInTheDocument();
  });

  it('renders projects per year form field', () => {
    render(<RoiCalculator />);

    expect(screen.getByTestId('form-field-projectsPerYear')).toBeInTheDocument();
    expect(screen.getByText('Projects Per Year')).toBeInTheDocument();
  });

  it('renders current planning time form field', () => {
    render(<RoiCalculator />);

    expect(screen.getByTestId('form-field-currentPlanningTime')).toBeInTheDocument();
    expect(screen.getByText('Average Planning Hours per Project')).toBeInTheDocument();
  });

  it('renders the calculate ROI button', () => {
    render(<RoiCalculator />);

    expect(screen.getByText('Calculate ROI')).toBeInTheDocument();
  });

  it('renders the submit button with correct type', () => {
    render(<RoiCalculator />);

    const button = screen.getByText('Calculate ROI');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('renders form provider', () => {
    render(<RoiCalculator />);

    expect(screen.getByTestId('form-provider')).toBeInTheDocument();
  });

  it('renders form items', () => {
    render(<RoiCalculator />);

    const formItems = screen.getAllByTestId('form-item');
    expect(formItems.length).toBeGreaterThan(0);
  });

  it('renders form labels', () => {
    render(<RoiCalculator />);

    const formLabels = screen.getAllByTestId('form-label');
    expect(formLabels.length).toBeGreaterThan(0);
  });

  it('renders form controls', () => {
    render(<RoiCalculator />);

    const formControls = screen.getAllByTestId('form-control');
    expect(formControls.length).toBeGreaterThan(0);
  });

  it('renders form descriptions for slider fields', () => {
    render(<RoiCalculator />);

    // Check for form descriptions that show current values
    expect(screen.getByText(/team members/i)).toBeInTheDocument();
    expect(screen.getByText(/projects$/i)).toBeInTheDocument();
    expect(screen.getByText(/hours$/i)).toBeInTheDocument();
  });

  it('displays default team size value', () => {
    render(<RoiCalculator />);

    expect(screen.getByText('Current value: 5 team members')).toBeInTheDocument();
  });

  it('displays default projects per year value', () => {
    render(<RoiCalculator />);

    expect(screen.getByText('Current value: 12 projects')).toBeInTheDocument();
  });

  it('displays default planning time value', () => {
    render(<RoiCalculator />);

    expect(screen.getByText('Current value: 20 hours')).toBeInTheDocument();
  });

  it('renders sliders for team size', () => {
    render(<RoiCalculator />);

    // Use getAllByTestId since there are multiple sliders with 1-100 range
    const sliders = screen.getAllByTestId('slider-1-100');
    expect(sliders.length).toBeGreaterThan(0);
  });

  it('renders sliders for projects per year', () => {
    render(<RoiCalculator />);

    expect(screen.getByTestId('slider-1-50')).toBeInTheDocument();
  });

  it('renders sliders for planning time', () => {
    render(<RoiCalculator />);

    // There are two sliders with 1-100 range (team size and planning time)
    const sliders = screen.getAllByTestId('slider-1-100');
    expect(sliders.length).toBe(2);
  });

  it('renders input for average salary', () => {
    render(<RoiCalculator />);

    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('does not show results initially', () => {
    render(<RoiCalculator />);

    // Results section should not be visible until form is submitted
    expect(screen.queryByText('Your Potential Savings')).not.toBeInTheDocument();
    expect(screen.queryByText('Time Saved per Project')).not.toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<RoiCalculator />);

    const formFields = screen.getAllByTestId(/^form-field-/);
    expect(formFields.length).toBe(4);
  });

  it('renders card structure correctly', () => {
    render(<RoiCalculator />);

    const cards = screen.getAllByTestId('card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('has correct card header structure', () => {
    render(<RoiCalculator />);

    const cardHeader = screen.getByTestId('card-header');
    expect(cardHeader).toContainElement(screen.getByTestId('card-title'));
    expect(cardHeader).toContainElement(screen.getByTestId('card-description'));
  });

  it('team size slider has correct min value of 1', () => {
    render(<RoiCalculator />);

    const sliders = screen.getAllByTestId('slider-1-100');
    expect(sliders[0]).toHaveAttribute('data-min', '1');
  });

  it('team size slider has correct max value of 100', () => {
    render(<RoiCalculator />);

    const sliders = screen.getAllByTestId('slider-1-100');
    expect(sliders[0]).toHaveAttribute('data-max', '100');
  });

  it('projects per year slider has correct min value of 1', () => {
    render(<RoiCalculator />);

    const slider = screen.getByTestId('slider-1-50');
    expect(slider).toHaveAttribute('data-min', '1');
  });

  it('projects per year slider has correct max value of 50', () => {
    render(<RoiCalculator />);

    const slider = screen.getByTestId('slider-1-50');
    expect(slider).toHaveAttribute('data-max', '50');
  });

  it('renders form messages for validation', () => {
    render(<RoiCalculator />);

    const formMessages = screen.getAllByTestId('form-message');
    expect(formMessages.length).toBeGreaterThan(0);
  });

  it('renders correct number of sliders', () => {
    render(<RoiCalculator />);

    // 3 sliders: teamSize (1-100), projectsPerYear (1-50), currentPlanningTime (1-100)
    const allSliders = screen.getAllByTestId(/^slider-\d+-\d+$/);
    expect(allSliders.length).toBe(3);
  });

  it('has input with type number for salary', () => {
    render(<RoiCalculator />);

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('renders all form descriptions', () => {
    render(<RoiCalculator />);

    const descriptions = screen.getAllByTestId('form-description');
    // Should have 3 descriptions for the slider fields
    expect(descriptions.length).toBe(3);
  });
});
