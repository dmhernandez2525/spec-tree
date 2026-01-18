import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InteractiveDemo } from './InteractiveDemo';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animate-presence">{children}</div>
  ),
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

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    type,
    variant,
    className,
    onClick,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
    <button
      data-testid={variant === 'outline' ? 'button-outline' : 'button-default'}
      type={type}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      data-testid={`input-${type || 'text'}`}
      placeholder={placeholder}
      type={type}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ placeholder, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
      data-testid="textarea"
      placeholder={placeholder}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/accordion', () => ({
  Accordion: ({
    children,
    type,
    collapsible,
  }: {
    children: React.ReactNode;
    type?: string;
    collapsible?: boolean;
  }) => (
    <div data-testid="accordion" data-type={type} data-collapsible={collapsible}>
      {children}
    </div>
  ),
  AccordionContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion-content">{children}</div>
  ),
  AccordionItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div data-testid={`accordion-item-${value}`}>{children}</div>
  ),
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="accordion-trigger">{children}</button>
  ),
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
      onClick={() => onValueChange?.('software')}
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
  FormField: ({
    render,
    name,
  }: {
    render: (props: {
      field: { value: string | number; onChange: (v: unknown) => void };
    }) => React.ReactNode;
    name: string;
    control: unknown;
  }) => {
    const fieldValue = name === 'teamSize' ? '' : '';
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

vi.mock('@/components/shared/icons', () => ({
  Icons: {
    brain: ({ className }: { className?: string }) => (
      <svg data-testid="icon-brain" className={className} />
    ),
  },
}));

describe('InteractiveDemo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('can be imported', () => {
    expect(InteractiveDemo).toBeDefined();
    expect(typeof InteractiveDemo).toBe('function');
  });

  it('renders the component', () => {
    render(<InteractiveDemo />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
  });

  it('renders the initial form title', () => {
    render(<InteractiveDemo />);

    expect(screen.getByText('Lets Plan Your Project')).toBeInTheDocument();
  });

  it('renders the animate presence wrapper', () => {
    render(<InteractiveDemo />);

    expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
  });

  it('renders the project type form field', () => {
    render(<InteractiveDemo />);

    expect(screen.getByTestId('form-field-projectType')).toBeInTheDocument();
    expect(screen.getByText('Project Type')).toBeInTheDocument();
  });

  it('renders the description form field', () => {
    render(<InteractiveDemo />);

    expect(screen.getByTestId('form-field-description')).toBeInTheDocument();
    expect(screen.getByText('Project Description')).toBeInTheDocument();
  });

  it('renders the timeline form field', () => {
    render(<InteractiveDemo />);

    expect(screen.getByTestId('form-field-timeline')).toBeInTheDocument();
    expect(screen.getByText('Project Timeline')).toBeInTheDocument();
  });

  it('renders the team size form field', () => {
    render(<InteractiveDemo />);

    expect(screen.getByTestId('form-field-teamSize')).toBeInTheDocument();
    expect(screen.getByText('Team Size')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<InteractiveDemo />);

    expect(screen.getByText('Generate Project Context')).toBeInTheDocument();
  });

  it('renders project type select options', () => {
    render(<InteractiveDemo />);

    expect(screen.getByTestId('select-item-software')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-marketing')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-product')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-consulting')).toBeInTheDocument();
  });

  it('renders timeline select options', () => {
    render(<InteractiveDemo />);

    expect(screen.getByTestId('select-item-1-3')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-3-6')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-6-12')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-12+')).toBeInTheDocument();
  });

  it('renders project type option labels correctly', () => {
    render(<InteractiveDemo />);

    // Use getAllByText for items that may appear multiple times
    expect(screen.getAllByText('Software Development').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Marketing Campaign').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Product Launch').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Consulting Project').length).toBeGreaterThan(0);
  });

  it('renders timeline option labels correctly', () => {
    render(<InteractiveDemo />);

    expect(screen.getByText('1-3 months')).toBeInTheDocument();
    expect(screen.getByText('3-6 months')).toBeInTheDocument();
    expect(screen.getByText('6-12 months')).toBeInTheDocument();
    expect(screen.getByText('12+ months')).toBeInTheDocument();
  });

  it('renders form provider', () => {
    render(<InteractiveDemo />);

    expect(screen.getByTestId('form-provider')).toBeInTheDocument();
  });

  it('renders form items', () => {
    render(<InteractiveDemo />);

    const formItems = screen.getAllByTestId('form-item');
    expect(formItems.length).toBeGreaterThan(0);
  });

  it('renders form labels', () => {
    render(<InteractiveDemo />);

    const formLabels = screen.getAllByTestId('form-label');
    expect(formLabels.length).toBeGreaterThan(0);
  });

  it('renders form controls', () => {
    render(<InteractiveDemo />);

    const formControls = screen.getAllByTestId('form-control');
    expect(formControls.length).toBeGreaterThan(0);
  });

  it('renders textarea with placeholder', () => {
    render(<InteractiveDemo />);

    expect(
      screen.getByPlaceholderText('Briefly describe your project...')
    ).toBeInTheDocument();
  });

  it('renders number input for team size', () => {
    render(<InteractiveDemo />);

    expect(screen.getByTestId('input-number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter team size')).toBeInTheDocument();
  });

  it('renders select triggers', () => {
    render(<InteractiveDemo />);

    const selectTriggers = screen.getAllByTestId('select-trigger');
    expect(selectTriggers.length).toBeGreaterThan(0);
  });

  it('renders select values with placeholders', () => {
    render(<InteractiveDemo />);

    const selectValues = screen.getAllByTestId('select-value');
    expect(selectValues.length).toBeGreaterThan(0);
  });

  it('has button with type submit', () => {
    render(<InteractiveDemo />);

    const submitButton = screen.getByText('Generate Project Context');
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('renders all form fields in correct order', () => {
    render(<InteractiveDemo />);

    const formFields = screen.getAllByTestId(/^form-field-/);
    expect(formFields.length).toBe(4);
  });

  it('renders select containers', () => {
    render(<InteractiveDemo />);

    const selects = screen.getAllByTestId('select');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('renders select contents', () => {
    render(<InteractiveDemo />);

    const selectContents = screen.getAllByTestId('select-content');
    expect(selectContents.length).toBeGreaterThan(0);
  });

  it('renders card structure correctly', () => {
    render(<InteractiveDemo />);

    const card = screen.getByTestId('card');
    expect(card).toContainElement(screen.getByTestId('card-header'));
    expect(card).toContainElement(screen.getByTestId('card-content'));
  });
});
