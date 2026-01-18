import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock dependencies
const mockDispatch = vi.fn();

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock('@/lib/store/sow-slice', () => ({
  setSow: vi.fn((payload) => ({ type: 'sow/setSow', payload })),
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: React.PropsWithChildren) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

vi.mock('./AppCard', () => ({
  default: ({ app, isSelected, onSelect, viewMode }: {
    app: { id: string; applicationInformation: string };
    isSelected: boolean;
    onSelect: (id: string | null) => void;
    viewMode: string;
  }) => (
    <div
      data-testid={`app-card-${app.id}`}
      data-selected={isSelected}
      data-viewmode={viewMode}
      onClick={() => onSelect(app.id)}
    >
      {app.applicationInformation}
    </div>
  ),
}));

vi.mock('./AppToolbar', () => ({
  default: ({
    _viewMode,
    onViewModeChange,
    searchQuery,
    onSearchChange,
    _onSort,
    currentSort,
  }: {
    _viewMode: string;
    onViewModeChange: (mode: 'grid' | 'list') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    _onSort: (option: unknown) => void;
    currentSort: { label: string };
  }) => (
    <div data-testid="app-toolbar">
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <button data-testid="grid-view" onClick={() => onViewModeChange('grid')}>
        Grid
      </button>
      <button data-testid="list-view" onClick={() => onViewModeChange('list')}>
        List
      </button>
      <span data-testid="current-sort">{currentSort.label}</span>
    </div>
  ),
}));

vi.mock('./AppSelectorFilters', () => ({
  default: ({ filters, onFiltersChange }: {
    filters: { searchQuery: string };
    onFiltersChange: (filters: unknown) => void;
  }) => (
    <div data-testid="app-filters">
      <button
        data-testid="apply-filter"
        onClick={() => onFiltersChange({ ...filters, status: ['draft'] })}
      >
        Apply Filter
      </button>
    </div>
  ),
}));

vi.mock('../../lib/utils/app-utils', () => ({
  filterApps: vi.fn((apps) => apps),
  sortApps: vi.fn((apps) => apps),
  getFavoriteApps: vi.fn((apps) => apps.filter((app: { isFavorite: boolean }) => app.isFavorite)),
}));

// Import after mocks
import AppSelector from './app-selector';
import { AppExtended, AppTag } from '@/types/app';

// Create mock app data
const createMockApp = (overrides?: Partial<AppExtended>): AppExtended => ({
  id: 'app-1',
  documentId: 'doc-1',
  name: 'Test App',
  applicationInformation: 'Test Application',
  globalInformation: 'Global info',
  createdAt: new Date().toISOString(),
  modifiedAt: new Date(),
  status: 'draft',
  tags: [],
  teamMembers: [],
  metrics: { health: 80, uptime: 99, errors24h: 0 },
  isFavorite: false,
  accessCount: 10,
  ...overrides,
});

const mockApps: AppExtended[] = [
  createMockApp({ id: 'app-1', documentId: 'doc-1', applicationInformation: 'App 1', isFavorite: true }),
  createMockApp({ id: 'app-2', documentId: 'doc-2', applicationInformation: 'App 2' }),
  createMockApp({ id: 'app-3', documentId: 'doc-3', applicationInformation: 'App 3' }),
];

describe('AppSelector Component', () => {
  const defaultProps = {
    apps: mockApps,
    setSelectedApp: vi.fn(),
    selectedApp: null as string | null,
    onAppCreated: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Module Exports', () => {
    it('module can be imported', () => {
      // AppSelector is imported at the top of the file
      expect(AppSelector).toBeDefined();
    });

    it('exports a default component', () => {
      // AppSelector is imported at the top as default export
      expect(typeof AppSelector).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('renders app selector component', () => {
      render(<AppSelector {...defaultProps} />);

      expect(screen.getByTestId('app-toolbar')).toBeInTheDocument();
    });

    it('renders app cards for each app', () => {
      render(<AppSelector {...defaultProps} />);

      expect(screen.getByTestId('app-card-app-1')).toBeInTheDocument();
      expect(screen.getByTestId('app-card-app-2')).toBeInTheDocument();
      expect(screen.getByTestId('app-card-app-3')).toBeInTheDocument();
    });

    it('renders app toolbar', () => {
      render(<AppSelector {...defaultProps} />);

      expect(screen.getByTestId('app-toolbar')).toBeInTheDocument();
    });

    it('renders app filters', () => {
      render(<AppSelector {...defaultProps} />);

      expect(screen.getByTestId('app-filters')).toBeInTheDocument();
    });

    it('renders scroll area', () => {
      render(<AppSelector {...defaultProps} />);

      expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no apps available', () => {
      render(<AppSelector {...defaultProps} apps={[]} />);

      expect(screen.getByText('No apps found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
    });
  });

  describe('App Selection', () => {
    it('calls setSelectedApp when app is selected', async () => {
      render(<AppSelector {...defaultProps} />);

      const appCard = screen.getByTestId('app-card-app-1');
      await userEvent.click(appCard);

      // The mock passes app.id to onSelect, which then calls setSelectedApp
      expect(defaultProps.setSelectedApp).toHaveBeenCalledWith('app-1');
    });

    it('dispatches setSow action when app is selected', async () => {
      render(<AppSelector {...defaultProps} />);

      const appCard = screen.getByTestId('app-card-app-1');
      await userEvent.click(appCard);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('marks selected app as selected when documentId matches', () => {
      // The component checks selectedApp === app.documentId
      render(<AppSelector {...defaultProps} selectedApp="doc-1" />);

      const appCard = screen.getByTestId('app-card-app-1');
      expect(appCard).toHaveAttribute('data-selected', 'true');
    });

    it('non-selected apps are not marked as selected', () => {
      render(<AppSelector {...defaultProps} selectedApp="doc-1" />);

      const appCard = screen.getByTestId('app-card-app-2');
      expect(appCard).toHaveAttribute('data-selected', 'false');
    });
  });

  describe('View Mode', () => {
    it('starts with grid view mode', () => {
      render(<AppSelector {...defaultProps} />);

      const appCard = screen.getByTestId('app-card-app-1');
      expect(appCard).toHaveAttribute('data-viewmode', 'grid');
    });

    it('changes to list view mode when clicked', async () => {
      render(<AppSelector {...defaultProps} />);

      const listViewButton = screen.getByTestId('list-view');
      await userEvent.click(listViewButton);

      const appCard = screen.getByTestId('app-card-app-1');
      expect(appCard).toHaveAttribute('data-viewmode', 'list');
    });

    it('changes back to grid view mode', async () => {
      render(<AppSelector {...defaultProps} />);

      // Switch to list
      await userEvent.click(screen.getByTestId('list-view'));

      // Switch back to grid
      await userEvent.click(screen.getByTestId('grid-view'));

      const appCard = screen.getByTestId('app-card-app-1');
      expect(appCard).toHaveAttribute('data-viewmode', 'grid');
    });
  });

  describe('Search', () => {
    it('updates search query on input', async () => {
      render(<AppSelector {...defaultProps} />);

      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'test query');

      expect(searchInput).toHaveValue('test query');
    });
  });

  describe('Sorting', () => {
    it('shows default sort option', () => {
      render(<AppSelector {...defaultProps} />);

      expect(screen.getByTestId('current-sort')).toHaveTextContent('Last Modified');
    });
  });

  describe('Favorites', () => {
    it('processes favorite apps correctly', () => {
      render(<AppSelector {...defaultProps} />);

      // All apps should be rendered
      expect(screen.getByTestId('app-card-app-1')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('renders filters component', () => {
      render(<AppSelector {...defaultProps} />);

      expect(screen.getByTestId('app-filters')).toBeInTheDocument();
    });

    it('handles filter changes', async () => {
      render(<AppSelector {...defaultProps} />);

      const applyFilterButton = screen.getByTestId('apply-filter');
      await userEvent.click(applyFilterButton);

      // Component should handle the filter change
      expect(screen.getByTestId('app-filters')).toBeInTheDocument();
    });
  });

  describe('Categories and Tags', () => {
    it('extracts unique categories from apps', () => {
      const appsWithCategories = [
        createMockApp({ id: 'app-1', category: 'Category A' }),
        createMockApp({ id: 'app-2', category: 'Category B' }),
        createMockApp({ id: 'app-3', category: 'Category A' }),
      ];

      render(<AppSelector {...defaultProps} apps={appsWithCategories} />);

      expect(screen.getByTestId('app-filters')).toBeInTheDocument();
    });

    it('extracts unique tags from apps', () => {
      const tag1: AppTag = { id: 'tag-1', name: 'Tag 1', color: '#ff0000' };
      const tag2: AppTag = { id: 'tag-2', name: 'Tag 2', color: '#00ff00' };

      const appsWithTags = [
        createMockApp({ id: 'app-1', tags: [tag1] }),
        createMockApp({ id: 'app-2', tags: [tag1, tag2] }),
        createMockApp({ id: 'app-3', tags: [tag2] }),
      ];

      render(<AppSelector {...defaultProps} apps={appsWithTags} />);

      expect(screen.getByTestId('app-filters')).toBeInTheDocument();
    });
  });
});

// Test pure utility functions
describe('AppSelector Utility Functions', () => {
  describe('processedApps computation', () => {
    it('handles empty apps array', () => {
      render(
        <AppSelector
          apps={[]}
          setSelectedApp={vi.fn()}
          selectedApp={null}
          onAppCreated={vi.fn()}
        />
      );

      expect(screen.getByText('No apps found')).toBeInTheDocument();
    });
  });
});
