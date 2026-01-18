import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DemoForm } from './DemoForm';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  CalendarIcon: ({ className }: { className?: string }) => (
    <svg data-testid="calendar-icon" className={className} />
  ),
}));

// Mock date-fns format
vi.mock('date-fns', () => ({
  format: (date: Date, _formatStr: string) => date.toLocaleDateString(),
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

vi.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      data-testid={`input-${placeholder?.toString().toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      placeholder={placeholder}
      type={type}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    type,
    disabled,
    variant,
    className,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
    <button
      data-testid={variant === 'outline' ? 'button-outline' : 'button-default'}
      type={type}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({
    onSelect,
    selected,
  }: {
    onSelect: (date: Date) => void;
    selected: Date | undefined;
    mode?: string;
    initialFocus?: boolean;
  }) => (
    <div data-testid="calendar">
      <span data-testid="calendar-selected">
        {selected ? selected.toLocaleDateString() : 'No date selected'}
      </span>
      <button
        data-testid="select-date-btn"
        onClick={() => onSelect(new Date('2024-06-15'))}
        type="button"
      >
        Select Date
      </button>
    </div>
  ),
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
    id,
  }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    id?: string;
  }) => (
    <input
      type="checkbox"
      data-testid={`checkbox-${id || 'default'}`}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover">{children}</div>
  ),
  PopoverTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({
    children,
  }: {
    children: React.ReactNode;
    className?: string;
    align?: string;
  }) => <div data-testid="popover-content">{children}</div>,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    onValueChange,
    defaultValue,
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
  }) => (
    <div
      data-testid="select"
      data-default-value={defaultValue}
      onClick={() => onValueChange?.('1-10')}
    >
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div data-testid={`select-item-${value}`} data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">{placeholder}</span>
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
      field: { value: string | string[] | Date | undefined; onChange: (v: unknown) => void };
    }) => React.ReactNode;
    name: string;
    control: unknown;
  }) => {
    const fieldValue =
      name === 'interests' ? [] : name === 'preferredDate' ? undefined : '';
    return (
      <div data-testid={`form-field-${name}`}>
        {render({ field: { value: fieldValue, onChange: vi.fn() } })}
      </div>
    );
  },
  FormItem: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="form-item" className={className}>
      {children}
    </div>
  ),
  FormLabel: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <label data-testid="form-label" className={className}>
      {children}
    </label>
  ),
  FormMessage: () => <div data-testid="form-message" />,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) =>
    classes.filter(Boolean).join(' '),
}));

describe('DemoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('can be imported', () => {
    expect(DemoForm).toBeDefined();
    expect(typeof DemoForm).toBe('function');
  });

  it('renders the component', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<DemoForm />);

    expect(screen.getByText('Schedule a Guided Demo')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<DemoForm />);

    expect(
      screen.getByText(
        'Get a personalized walkthrough of Spec Tree tailored to your needs'
      )
    ).toBeInTheDocument();
  });

  it('renders first name form field', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('form-field-firstName')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
  });

  it('renders last name form field', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('form-field-lastName')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
  });

  it('renders email form field', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('form-field-email')).toBeInTheDocument();
    expect(screen.getByText('Work Email')).toBeInTheDocument();
  });

  it('renders company name form field', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('form-field-companyName')).toBeInTheDocument();
    expect(screen.getByText('Company Name')).toBeInTheDocument();
  });

  it('renders team size form field', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('form-field-teamSize')).toBeInTheDocument();
    expect(screen.getByText('Team Size')).toBeInTheDocument();
  });

  it('renders industry form field', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('form-field-industry')).toBeInTheDocument();
    expect(screen.getByText('Industry')).toBeInTheDocument();
  });

  it('renders preferred date form field', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('form-field-preferredDate')).toBeInTheDocument();
    expect(screen.getByText('Preferred Demo Date')).toBeInTheDocument();
  });

  it('renders interests form field', () => {
    render(<DemoForm />);

    // Use getAllByTestId since interests field may appear multiple times (once per checkbox)
    expect(screen.getAllByTestId('form-field-interests').length).toBeGreaterThan(0);
    expect(screen.getByText('Areas of Interest')).toBeInTheDocument();
  });

  it('renders team size select options', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('select-item-1-10')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-11-50')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-51-200')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-201-500')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-500+')).toBeInTheDocument();
  });

  it('renders industry select options', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('select-item-software')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-finance')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-healthcare')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-retail')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-manufacturing')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-consulting')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-other')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<DemoForm />);

    expect(screen.getByText('Schedule Demo')).toBeInTheDocument();
  });

  it('renders the calendar picker', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('renders the popover for date selection', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('popover')).toBeInTheDocument();
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
  });

  it('renders the calendar icon', () => {
    render(<DemoForm />);

    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('displays "Pick a date" placeholder when no date is selected', () => {
    render(<DemoForm />);

    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('renders interest area checkboxes', () => {
    render(<DemoForm />);

    // The interest areas should render their labels
    expect(screen.getByText('AI-Powered Context Gathering')).toBeInTheDocument();
    expect(screen.getByText('Work Item Generation')).toBeInTheDocument();
    expect(screen.getByText('Template System')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('Analytics & Reporting')).toBeInTheDocument();
  });

  it('renders all form items', () => {
    render(<DemoForm />);

    const formItems = screen.getAllByTestId('form-item');
    expect(formItems.length).toBeGreaterThan(0);
  });

  it('renders all form labels', () => {
    render(<DemoForm />);

    const formLabels = screen.getAllByTestId('form-label');
    expect(formLabels.length).toBeGreaterThan(0);
  });

  it('renders all form controls', () => {
    render(<DemoForm />);

    const formControls = screen.getAllByTestId('form-control');
    expect(formControls.length).toBeGreaterThan(0);
  });

  it('has the correct structure with motion containers', () => {
    render(<DemoForm />);

    // Should have card, header, content
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
  });

  it('renders input placeholders correctly', () => {
    render(<DemoForm />);

    expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john.doe@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Company Inc.')).toBeInTheDocument();
  });

  it('renders the email input with type email', () => {
    render(<DemoForm />);

    const emailInput = screen.getByPlaceholderText('john.doe@company.com');
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('renders select placeholders correctly', () => {
    render(<DemoForm />);

    const selectValues = screen.getAllByTestId('select-value');
    expect(selectValues.length).toBeGreaterThan(0);
  });

  it('renders team size option labels correctly', () => {
    render(<DemoForm />);

    expect(screen.getByText('1-10 employees')).toBeInTheDocument();
    expect(screen.getByText('11-50 employees')).toBeInTheDocument();
    expect(screen.getByText('51-200 employees')).toBeInTheDocument();
    expect(screen.getByText('201-500 employees')).toBeInTheDocument();
    expect(screen.getByText('More than 500 employees')).toBeInTheDocument();
  });

  it('renders industry option labels correctly', () => {
    render(<DemoForm />);

    // Use getAllByText since some labels may appear multiple times
    expect(screen.getAllByText('Software Development').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Finance & Banking').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Healthcare').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Retail & E-commerce').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Manufacturing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Consulting').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Other').length).toBeGreaterThan(0);
  });
});
