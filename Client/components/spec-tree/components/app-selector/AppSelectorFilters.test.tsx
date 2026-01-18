import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }),
}));

vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon">CalendarIcon</span>,
  Tag: () => <span data-testid="tag-icon">TagIcon</span>,
  Filter: () => <span data-testid="filter-icon">FilterIcon</span>,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: React.PropsWithChildren<{ value?: string; onValueChange?: (value: string) => void }>) => (
    <div data-testid="select" data-value={value}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: React.PropsWithChildren) => <div data-testid="select-content">{children}</div>,
  SelectGroup: ({ children }: React.PropsWithChildren) => <div data-testid="select-group">{children}</div>,
  SelectItem: ({ children, value }: React.PropsWithChildren<{ value: string }>) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
  SelectLabel: ({ children }: React.PropsWithChildren) => <div data-testid="select-label">{children}</div>,
  SelectTrigger: ({ children }: React.PropsWithChildren) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span data-testid="select-value">{placeholder}</span>,
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: React.PropsWithChildren) => <div data-testid="popover">{children}</div>,
  PopoverContent: ({ children }: React.PropsWithChildren) => <div data-testid="popover-content">{children}</div>,
  PopoverTrigger: ({ children, asChild }: React.PropsWithChildren<{ asChild?: boolean }>) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: React.PropsWithChildren<{ onClick?: () => void; variant?: string }>) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ mode, selected, onSelect }: { mode: string; selected?: Date; onSelect?: (date: Date | undefined) => void }) => (
    <div data-testid="calendar" data-mode={mode}>
      <button data-testid="select-date" onClick={() => onSelect?.(new Date('2024-01-15'))}>
        Select Date
      </button>
    </div>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, style }: React.PropsWithChildren<{ variant?: string; style?: React.CSSProperties }>) => (
    <span data-testid="badge" data-variant={variant} style={style}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ id, checked, onCheckedChange }: { id?: string; checked?: boolean; onCheckedChange?: () => void }) => (
    <input
      type="checkbox"
      data-testid={`checkbox-${id}`}
      checked={checked}
      onChange={onCheckedChange}
    />
  ),
}));

// Import after mocks
import AppSelectorFilters from './AppSelectorFilters';
import { SearchFilters, AppTag, AppStatus } from '@/types/app';

// Create mock data
const createMockFilters = (overrides?: Partial<SearchFilters>): SearchFilters => ({
  searchQuery: '',
  ...overrides,
});

const mockTags: AppTag[] = [
  { id: 'tag-1', name: 'Frontend', color: '#ff0000' },
  { id: 'tag-2', name: 'Backend', color: '#00ff00' },
  { id: 'tag-3', name: 'DevOps', color: '#0000ff' },
];

const mockCategories = ['Web Apps', 'Mobile Apps', 'APIs'];

describe('AppSelectorFilters Component', () => {
  const defaultProps = {
    filters: createMockFilters(),
    onFiltersChange: vi.fn(),
    availableTags: mockTags,
    availableCategories: mockCategories,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Module Exports', () => {
    it('module can be imported', () => {
      // AppSelectorFilters is imported at the top of the file
      expect(AppSelectorFilters).toBeDefined();
    });

    it('exports a default component', () => {
      // AppSelectorFilters is imported at the top as default export
      expect(typeof AppSelectorFilters).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('renders filter buttons', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Date Range')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('renders status filter icon', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.getByTestId('filter-icon')).toBeInTheDocument();
    });

    it('renders calendar icon for date range', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('renders tag icon for tags filter', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.getByTestId('tag-icon')).toBeInTheDocument();
    });

    it('renders category select', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.getByTestId('select')).toBeInTheDocument();
    });
  });

  describe('Status Filter', () => {
    it('renders status options', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.getByTestId('checkbox-draft')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-live')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-archived')).toBeInTheDocument();
    });

    it('shows checked status when filter is active', () => {
      const filtersWithStatus = createMockFilters({ status: ['draft', 'live'] });
      render(<AppSelectorFilters {...defaultProps} filters={filtersWithStatus} />);

      expect(screen.getByTestId('checkbox-draft')).toBeChecked();
      expect(screen.getByTestId('checkbox-live')).toBeChecked();
      expect(screen.getByTestId('checkbox-archived')).not.toBeChecked();
    });

    it('calls onFiltersChange when status is toggled', async () => {
      render(<AppSelectorFilters {...defaultProps} />);

      const draftCheckbox = screen.getByTestId('checkbox-draft');
      await userEvent.click(draftCheckbox);

      expect(defaultProps.onFiltersChange).toHaveBeenCalled();
    });

    it('adds status to filter when clicked', async () => {
      render(<AppSelectorFilters {...defaultProps} />);

      const draftCheckbox = screen.getByTestId('checkbox-draft');
      await userEvent.click(draftCheckbox);

      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['draft'],
        })
      );
    });

    it('removes status from filter when unchecked', async () => {
      const filtersWithStatus = createMockFilters({ status: ['draft'] });
      render(<AppSelectorFilters {...defaultProps} filters={filtersWithStatus} />);

      const draftCheckbox = screen.getByTestId('checkbox-draft');
      await userEvent.click(draftCheckbox);

      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          status: [],
        })
      );
    });
  });

  describe('Tags Filter', () => {
    it('renders available tags', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.getByTestId('checkbox-tag-1')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-tag-2')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-tag-3')).toBeInTheDocument();
    });

    it('shows checked tags when filter is active', () => {
      const filtersWithTags = createMockFilters({ tags: ['tag-1', 'tag-3'] });
      render(<AppSelectorFilters {...defaultProps} filters={filtersWithTags} />);

      expect(screen.getByTestId('checkbox-tag-1')).toBeChecked();
      expect(screen.getByTestId('checkbox-tag-2')).not.toBeChecked();
      expect(screen.getByTestId('checkbox-tag-3')).toBeChecked();
    });

    it('calls onFiltersChange when tag is toggled', async () => {
      render(<AppSelectorFilters {...defaultProps} />);

      const tagCheckbox = screen.getByTestId('checkbox-tag-1');
      await userEvent.click(tagCheckbox);

      expect(defaultProps.onFiltersChange).toHaveBeenCalled();
    });
  });

  describe('Date Range Filter', () => {
    it('renders date range popovers', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });

    it('renders calendars for date selection', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      const calendars = screen.getAllByTestId('calendar');
      expect(calendars.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Category Filter', () => {
    it('renders category select with placeholder', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.getByTestId('select-value')).toHaveTextContent('Category');
    });

    it('renders category options', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.getByTestId('select-item-Web Apps')).toBeInTheDocument();
      expect(screen.getByTestId('select-item-Mobile Apps')).toBeInTheDocument();
      expect(screen.getByTestId('select-item-APIs')).toBeInTheDocument();
    });
  });

  describe('Clear Filters Button', () => {
    it('does not show clear button when no filters active', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
    });

    it('shows clear button when status filter is active', () => {
      const filtersWithStatus = createMockFilters({ status: ['draft'] });
      render(<AppSelectorFilters {...defaultProps} filters={filtersWithStatus} />);

      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('shows clear button when tags filter is active', () => {
      const filtersWithTags = createMockFilters({ tags: ['tag-1'] });
      render(<AppSelectorFilters {...defaultProps} filters={filtersWithTags} />);

      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('shows clear button when category filter is active', () => {
      const filtersWithCategory = createMockFilters({ category: 'Web Apps' });
      render(<AppSelectorFilters {...defaultProps} filters={filtersWithCategory} />);

      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('shows clear button when date range filter is active', () => {
      const filtersWithDateRange = createMockFilters({
        dateRange: { start: new Date(), end: new Date() },
      });
      render(<AppSelectorFilters {...defaultProps} filters={filtersWithDateRange} />);

      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('calls onFiltersChange with cleared filters when clicked', async () => {
      const filtersWithStatus = createMockFilters({ status: ['draft'] });
      render(<AppSelectorFilters {...defaultProps} filters={filtersWithStatus} />);

      const clearButton = screen.getByText('Clear Filters');
      await userEvent.click(clearButton);

      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          status: undefined,
          tags: undefined,
          category: undefined,
          dateRange: undefined,
        })
      );
    });
  });

  describe('Active Filter Badges', () => {
    it('shows status badges when status filter is active', () => {
      const filtersWithStatus = createMockFilters({ status: ['draft', 'live'] });
      render(<AppSelectorFilters {...defaultProps} filters={filtersWithStatus} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });

    it('shows tag badges when tags filter is active', () => {
      const filtersWithTags = createMockFilters({ tags: ['tag-1'] });
      render(<AppSelectorFilters {...defaultProps} filters={filtersWithTags} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it('shows category badge when category filter is active', () => {
      const filtersWithCategory = createMockFilters({ category: 'Web Apps' });
      render(<AppSelectorFilters {...defaultProps} filters={filtersWithCategory} />);

      expect(screen.getByText(/Category: Web Apps/)).toBeInTheDocument();
    });

    it('shows date range badge when date range filter is active', () => {
      const filtersWithDateRange = createMockFilters({
        dateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
      });
      render(<AppSelectorFilters {...defaultProps} filters={filtersWithDateRange} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Empty States', () => {
    it('renders without tags when availableTags is empty', () => {
      render(<AppSelectorFilters {...defaultProps} availableTags={[]} />);

      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('renders without categories when availableCategories is empty', () => {
      render(<AppSelectorFilters {...defaultProps} availableCategories={[]} />);

      expect(screen.getByTestId('select')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible filter buttons', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Date Range')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('has accessible checkboxes with labels', () => {
      render(<AppSelectorFilters {...defaultProps} />);

      expect(screen.getByTestId('checkbox-draft')).toBeInTheDocument();
    });
  });
});
