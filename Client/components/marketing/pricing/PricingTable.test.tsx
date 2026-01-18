import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureComparisonTable } from './PricingTable';
import { ComparisonFeature } from '@/types/pricing';

// Mock UI components
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

let selectCallback: ((value: string) => void) | null = null;

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    onValueChange,
    value,
  }: {
    children: React.ReactNode;
    onValueChange: (value: string) => void;
    value: string;
  }) => {
    selectCallback = onValueChange;
    return (
      <div data-testid="select" data-value={value}>
        {children}
      </div>
    );
  },
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
    <div
      data-testid={`select-item-${value}`}
      data-value={value}
      onClick={() => selectCallback?.(value)}
    >
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <button data-testid="select-trigger" className={className}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
}));

vi.mock('@/components/shared/icons', () => ({
  Icons: {
    check: ({ className }: { className?: string }) => (
      <svg data-testid="icon-check" className={className} />
    ),
    x: ({ className }: { className?: string }) => (
      <svg data-testid="icon-x" className={className} />
    ),
  },
}));

vi.mock('@/lib/data/pricing', () => ({
  featureComparison: [
    {
      name: 'Team Members',
      description: 'Maximum number of team members',
      plans: {
        starter: 'Up to 5',
        professional: 'Up to 20',
        enterprise: 'Unlimited',
      },
      category: 'Basics',
    },
    {
      name: 'Active Projects',
      description: 'Number of concurrent projects',
      plans: {
        starter: '10',
        professional: 'Unlimited',
        enterprise: 'Unlimited',
      },
      category: 'Basics',
    },
    {
      name: 'Analytics Dashboard',
      description: 'Project and team performance analytics',
      plans: {
        starter: false,
        professional: true,
        enterprise: 'Advanced',
      },
      category: 'Features',
    },
    {
      name: 'SLA Guarantee',
      description: 'Service level agreement',
      plans: {
        starter: false,
        professional: false,
        enterprise: true,
      },
      category: 'Enterprise',
    },
  ],
}));

describe('FeatureComparisonTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectCallback = null;
  });

  const mockFeatures: ComparisonFeature[] = [
    {
      name: 'Team Members',
      description: 'Maximum number of team members',
      plans: {
        starter: 'Up to 5',
        professional: 'Up to 20',
        enterprise: 'Unlimited',
      },
      category: 'Basics',
    },
    {
      name: 'Active Projects',
      description: 'Number of concurrent projects',
      plans: {
        starter: '10',
        professional: 'Unlimited',
        enterprise: 'Unlimited',
      },
      category: 'Basics',
    },
    {
      name: 'Analytics Dashboard',
      description: 'Project and team performance analytics',
      plans: {
        starter: false,
        professional: true,
        enterprise: 'Advanced',
      },
      category: 'Features',
    },
    {
      name: 'SLA Guarantee',
      description: 'Service level agreement',
      plans: {
        starter: false,
        professional: false,
        enterprise: true,
      },
      category: 'Enterprise',
    },
  ];

  it('can be imported', () => {
    expect(FeatureComparisonTable).toBeDefined();
    expect(typeof FeatureComparisonTable).toBe('function');
  });

  it('renders the component', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('renders table header', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByTestId('table-header')).toBeInTheDocument();
  });

  it('renders table body', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByTestId('table-body')).toBeInTheDocument();
  });

  it('renders feature column header', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByText('Feature')).toBeInTheDocument();
  });

  it('renders plan column headers', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    // Use getAllByText since 'Enterprise' appears as both a column header and a category
    expect(screen.getAllByText('Starter').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Professional').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Enterprise').length).toBeGreaterThan(0);
  });

  it('renders feature names', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByText('Team Members')).toBeInTheDocument();
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('SLA Guarantee')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByText('Maximum number of team members')).toBeInTheDocument();
    expect(screen.getByText('Number of concurrent projects')).toBeInTheDocument();
    expect(screen.getByText('Project and team performance analytics')).toBeInTheDocument();
    expect(screen.getByText('Service level agreement')).toBeInTheDocument();
  });

  it('renders string values for plans', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByText('Up to 5')).toBeInTheDocument();
    expect(screen.getByText('Up to 20')).toBeInTheDocument();
  });

  it('renders check icons for true boolean values', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    const checkIcons = screen.getAllByTestId('icon-check');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('renders x icons for false boolean values', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    const xIcons = screen.getAllByTestId('icon-x');
    expect(xIcons.length).toBeGreaterThan(0);
  });

  it('renders unlimited text for unlimited plans', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    const unlimitedElements = screen.getAllByText('Unlimited');
    expect(unlimitedElements.length).toBeGreaterThan(0);
  });

  it('renders the category filter select', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('renders select trigger', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
  });

  it('renders all features option in select', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByTestId('select-item-all')).toBeInTheDocument();
  });

  it('renders category options in select', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByTestId('select-item-Basics')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-Features')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-Enterprise')).toBeInTheDocument();
  });

  it('renders "All Features" label for all option', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByText('All Features')).toBeInTheDocument();
  });

  it('filters features by category when Basics is selected', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    // Click on Basics category
    fireEvent.click(screen.getByTestId('select-item-Basics'));

    // Should show only Basics features
    expect(screen.getByText('Team Members')).toBeInTheDocument();
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
  });

  it('filters features by category when Features is selected', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    // Click on Features category
    fireEvent.click(screen.getByTestId('select-item-Features'));

    // Should show only Features category features
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('filters features by category when Enterprise is selected', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    // Click on Enterprise category
    fireEvent.click(screen.getByTestId('select-item-Enterprise'));

    // Should show only Enterprise features
    expect(screen.getByText('SLA Guarantee')).toBeInTheDocument();
  });

  it('shows all features when "all" is selected', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    // First filter to a category
    fireEvent.click(screen.getByTestId('select-item-Basics'));

    // Then select all
    fireEvent.click(screen.getByTestId('select-item-all'));

    // Should show all features
    expect(screen.getByText('Team Members')).toBeInTheDocument();
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('SLA Guarantee')).toBeInTheDocument();
  });

  it('renders table rows for each feature', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    const rows = screen.getAllByTestId('table-row');
    // One header row + 4 feature rows
    expect(rows.length).toBe(5);
  });

  it('renders table cells for each plan value', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    const cells = screen.getAllByTestId('table-cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('renders table heads in header row', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    const heads = screen.getAllByTestId('table-head');
    // 4 headers: Feature, Starter, Professional, Enterprise
    expect(heads.length).toBe(4);
  });

  it('uses default features when none provided', () => {
    render(<FeatureComparisonTable />);

    // Should render with mocked default features
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('renders Advanced text for advanced string value', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('renders 10 as string value', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('select has correct width class', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    const selectTrigger = screen.getByTestId('select-trigger');
    expect(selectTrigger).toHaveClass('w-[200px]');
  });

  it('renders select content', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByTestId('select-content')).toBeInTheDocument();
  });

  it('renders select value placeholder', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    expect(screen.getByTestId('select-value')).toBeInTheDocument();
  });

  it('renders category labels in select items', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    // Use getAllByText since 'Enterprise' appears both in select and as a table header
    expect(screen.getAllByText('Basics').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Features').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Enterprise').length).toBeGreaterThan(0);
  });

  it('select initially shows all category', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('data-value', 'all');
  });

  it('correctly handles empty features array', () => {
    render(<FeatureComparisonTable features={[]} />);

    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(screen.getByTestId('table-header')).toBeInTheDocument();
  });

  it('renders correct number of category options', () => {
    render(<FeatureComparisonTable features={mockFeatures} />);

    // Should have: all + Basics + Features + Enterprise = 4 options
    const selectItems = screen.getAllByTestId(/^select-item-/);
    expect(selectItems.length).toBe(4);
  });
});
