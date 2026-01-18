import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewMode, SortOption } from '@/types/app';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Search: ({ className }: any) => <svg data-testid="search-icon" className={className} />,
  LayoutGrid: ({ className }: any) => <svg data-testid="grid-icon" className={className} />,
  List: ({ className }: any) => <svg data-testid="list-icon" className={className} />,
  ArrowUpDown: ({ className }: any) => <svg data-testid="sort-icon" className={className} />,
  Clock: ({ className }: any) => <svg data-testid="clock-icon" className={className} />,
  Activity: ({ className }: any) => <svg data-testid="activity-icon" className={className} />,
  Hash: ({ className }: any) => <svg data-testid="hash-icon" className={className} />,
}));

// Mock UI components
vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, className, ...props }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid="input"
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children, align, className }: any) => (
    <div data-testid="dropdown-content" data-align={align} className={className}>{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <div onClick={onClick} data-testid="dropdown-item" className={className}>{children}</div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-trigger" data-as-child={asChild}>{children}</div>
  ),
}));

// Import after mocks
import AppToolbar from './AppToolbar';

describe('AppToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    viewMode: 'grid' as ViewMode,
    onViewModeChange: vi.fn(),
    searchQuery: '',
    onSearchChange: vi.fn(),
    onSort: vi.fn(),
    currentSort: { label: 'Name', value: 'name', direction: 'asc' } as SortOption,
  };

  it('module can be imported', () => {
    // AppToolbar is imported at the top of the file
    expect(AppToolbar).toBeDefined();
  });

  it('exports AppToolbar as default export', () => {
    // AppToolbar is imported at the top as default export
    expect(typeof AppToolbar).toBe('function');
  });

  it('renders search input', () => {
    render(<AppToolbar {...defaultProps} />);
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search apps, tags, or descriptions...');
  });

  it('renders search icon', () => {
    render(<AppToolbar {...defaultProps} />);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('calls onSearchChange when search input changes', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<AppToolbar {...defaultProps} onSearchChange={onSearchChange} />);

    const input = screen.getByTestId('input');
    await user.type(input, 'test');

    expect(onSearchChange).toHaveBeenCalled();
  });

  it('displays current sort option', () => {
    render(<AppToolbar {...defaultProps} />);
    // The current sort label should be rendered somewhere in the UI
    const sortLabels = screen.getAllByText('Name');
    expect(sortLabels.length).toBeGreaterThan(0);
  });

  it('renders sort dropdown', () => {
    render(<AppToolbar {...defaultProps} />);
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('renders sort icon', () => {
    render(<AppToolbar {...defaultProps} />);
    expect(screen.getByTestId('sort-icon')).toBeInTheDocument();
  });

  it('renders view mode buttons', () => {
    render(<AppToolbar {...defaultProps} />);
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders grid view button', () => {
    render(<AppToolbar {...defaultProps} />);
    expect(screen.getByTestId('grid-icon')).toBeInTheDocument();
  });

  it('renders list view button', () => {
    render(<AppToolbar {...defaultProps} />);
    expect(screen.getByTestId('list-icon')).toBeInTheDocument();
  });

  it('calls onViewModeChange when grid button is clicked', async () => {
    const user = userEvent.setup();
    const onViewModeChange = vi.fn();
    render(<AppToolbar {...defaultProps} viewMode="list" onViewModeChange={onViewModeChange} />);

    const buttons = screen.getAllByTestId('button');
    const gridButton = buttons.find(btn => btn.querySelector('[data-testid="grid-icon"]'));

    if (gridButton) {
      await user.click(gridButton);
      expect(onViewModeChange).toHaveBeenCalledWith('grid');
    }
  });

  it('calls onViewModeChange when list button is clicked', async () => {
    const user = userEvent.setup();
    const onViewModeChange = vi.fn();
    render(<AppToolbar {...defaultProps} viewMode="grid" onViewModeChange={onViewModeChange} />);

    const buttons = screen.getAllByTestId('button');
    const listButton = buttons.find(btn => btn.querySelector('[data-testid="list-icon"]'));

    if (listButton) {
      await user.click(listButton);
      expect(onViewModeChange).toHaveBeenCalledWith('list');
    }
  });

  it('applies active style to grid button when in grid mode', () => {
    const { container } = render(<AppToolbar {...defaultProps} viewMode="grid" />);
    const buttons = container.querySelectorAll('[data-testid="button"]');
    const gridButton = Array.from(buttons).find(btn =>
      btn.querySelector('[data-testid="grid-icon"]')
    );
    expect(gridButton?.getAttribute('data-variant')).toBe('default');
  });

  it('applies active style to list button when in list mode', () => {
    const { container } = render(<AppToolbar {...defaultProps} viewMode="list" />);
    const buttons = container.querySelectorAll('[data-testid="button"]');
    const listButton = Array.from(buttons).find(btn =>
      btn.querySelector('[data-testid="list-icon"]')
    );
    expect(listButton?.getAttribute('data-variant')).toBe('default');
  });

  it('displays search query value', () => {
    render(<AppToolbar {...defaultProps} searchQuery="test query" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveValue('test query');
  });

  it('renders sort options in dropdown', () => {
    render(<AppToolbar {...defaultProps} />);
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });

  it('calls onSort when sort option is clicked', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<AppToolbar {...defaultProps} onSort={onSort} />);

    const dropdownItems = screen.getAllByTestId('dropdown-item');
    if (dropdownItems.length > 0) {
      await user.click(dropdownItems[0]);
      expect(onSort).toHaveBeenCalled();
    }
  });

  it('renders Last Modified sort option with icon', () => {
    render(<AppToolbar {...defaultProps} />);
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });

  it('renders Most Accessed sort option with icon', () => {
    render(<AppToolbar {...defaultProps} />);
    expect(screen.getByTestId('hash-icon')).toBeInTheDocument();
  });

  it('renders Health Status sort option with icon', () => {
    render(<AppToolbar {...defaultProps} />);
    expect(screen.getByTestId('activity-icon')).toBeInTheDocument();
  });

  it('displays all sort options', () => {
    render(<AppToolbar {...defaultProps} />);
    expect(screen.getByText('Last Modified')).toBeInTheDocument();
    expect(screen.getByText('Created Date')).toBeInTheDocument();
    expect(screen.getByText('Most Accessed')).toBeInTheDocument();
    expect(screen.getByText('Health Status')).toBeInTheDocument();
  });

  it('has proper toolbar structure with border', () => {
    const { container } = render(<AppToolbar {...defaultProps} />);
    const toolbar = container.querySelector('.border-b');
    expect(toolbar).toBeInTheDocument();
  });

  it('positions search input correctly', () => {
    const { container } = render(<AppToolbar {...defaultProps} />);
    const searchContainer = container.querySelector('.relative');
    expect(searchContainer).toBeInTheDocument();
  });

  it('renders view mode buttons in a group', () => {
    const { container } = render(<AppToolbar {...defaultProps} />);
    const buttonGroup = container.querySelector('.border.rounded-md');
    expect(buttonGroup).toBeInTheDocument();
  });

  it('handles different current sort options', () => {
    const customSort: SortOption = {
      label: 'Last Modified',
      value: 'modified',
      direction: 'desc',
    };
    render(<AppToolbar {...defaultProps} currentSort={customSort} />);
    // There should be at least one 'Last Modified' text
    const elements = screen.getAllByText('Last Modified');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('applies small size to buttons', () => {
    const { container } = render(<AppToolbar {...defaultProps} />);
    const buttons = container.querySelectorAll('[data-testid="button"]');
    buttons.forEach(button => {
      expect(button.getAttribute('data-size')).toBe('sm');
    });
  });

  it('renders dropdown trigger as child', () => {
    render(<AppToolbar {...defaultProps} />);
    const trigger = screen.getByTestId('dropdown-trigger');
    expect(trigger.getAttribute('data-as-child')).toBe('true');
  });
});
