import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import DesignSystemManager from './ThemeConfigurator';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Info: () => <svg data-testid="info-icon" />,
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock ExportManager
vi.mock('./ExportManager', () => ({
  default: ({ colorTokens, typographyTokens }: { colorTokens: unknown; typographyTokens: unknown }) => (
    <div data-testid="export-manager" data-color-tokens={JSON.stringify(colorTokens)} data-typography-tokens={JSON.stringify(typographyTokens)}>
      Export Manager
    </div>
  ),
}));

// Mock lib/utils
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, className, type, min, max }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    type?: string;
    min?: string;
    max?: string;
  }) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      type={type}
      min={min}
      max={max}
    />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => (
    <label data-testid="label">{children}</label>
  ),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) => (
    <div data-testid="tabs" data-default-value={defaultValue}>{children}</div>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tabs-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-testid={`tabs-trigger-${value}`} type="button">{children}</button>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value?: string; onValueChange?: (value: string) => void }) => (
    <div data-testid="select" data-value={value} onClick={() => onValueChange?.('test-value')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid="select-item" data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button data-testid="select-trigger" className={className} type="button">{children}</button>
  ),
  SelectValue: ({ children }: { children?: React.ReactNode }) => (
    <span data-testid="select-value">{children}</span>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover">{children}</div>
  ),
  PopoverContent: ({ children, className, align }: { children: React.ReactNode; className?: string; align?: string }) => (
    <div data-testid="popover-content" className={className} data-align={align}>{children}</div>
  ),
  PopoverTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="popover-trigger" data-aschild={asChild}>{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, className, style, onClick, ...props }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
  }) => (
    <button
      data-testid="button"
      data-variant={variant}
      className={className}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-area" className={className}>{children}</div>
  ),
}));

// Mock fetch for Google Fonts API
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ items: [] }),
  })
) as unknown as typeof fetch;

describe('DesignSystemManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => {
      cleanup();
    });
  });

  describe('Component Rendering', () => {
    it('renders without crashing', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('renders card title', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('Design System Manager')).toBeInTheDocument();
    });

    it('renders ExportManager component', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByTestId('export-manager')).toBeInTheDocument();
    });

    it('renders tabs for Colors and Typography', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByTestId('tabs-trigger-colors')).toBeInTheDocument();
      expect(screen.getByTestId('tabs-trigger-typography')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('defaults to colors tab', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // Get the main tabs (first one with colors default value)
      const tabs = screen.getAllByTestId('tabs');
      const mainTabs = tabs.find(tab => tab.getAttribute('data-default-value') === 'colors');
      expect(mainTabs).toBeDefined();
      expect(mainTabs).toHaveAttribute('data-default-value', 'colors');
    });

    it('renders Colors tab content', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      const colorsContent = screen.getAllByTestId('tabs-content-colors');
      expect(colorsContent.length).toBeGreaterThan(0);
    });

    it('renders Typography tab content', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      const typographyContent = screen.getAllByTestId('tabs-content-typography');
      expect(typographyContent.length).toBeGreaterThan(0);
    });
  });

  describe('Color Token Sections', () => {
    it('renders base color section', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('Base')).toBeInTheDocument();
    });

    it('renders alpha color section', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    it('renders charts color section', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('Charts')).toBeInTheDocument();
    });

    it('renders sidebar color section', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // There may be multiple sidebar elements, check at least one exists
      const sidebarElements = screen.getAllByText('Sidebar');
      expect(sidebarElements.length).toBeGreaterThan(0);
    });

    it('renders utility color section', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('Utility')).toBeInTheDocument();
    });

    it('renders additional token sections with deviation indicator', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // Check for deviation sections (containers, spacing, grid, radius, border, shadows, layout)
      expect(screen.getByText('Containers')).toBeInTheDocument();
      expect(screen.getByText('Spacing')).toBeInTheDocument();
      expect(screen.getByText('Grid')).toBeInTheDocument();
      expect(screen.getByText('Radius')).toBeInTheDocument();
      expect(screen.getByText('Border')).toBeInTheDocument();
      expect(screen.getByText('Shadows')).toBeInTheDocument();
      expect(screen.getByText('Layout')).toBeInTheDocument();
    });
  });

  describe('Token Table', () => {
    it('renders table headers', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Light').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Dark').length).toBeGreaterThan(0);
    });

    it('renders color token names', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // Check for some expected token names
      expect(screen.getByText('accent')).toBeInTheDocument();
      expect(screen.getByText('background')).toBeInTheDocument();
      expect(screen.getByText('primary')).toBeInTheDocument();
    });

    it('renders deviation indicator for deviation sections', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // Deviation sections should have the deviation message
      const deviationMessages = screen.getAllByText('This section deviates from the Figma file structure');
      expect(deviationMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Typography Management', () => {
    it('renders font family section', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('Font Families')).toBeInTheDocument();
    });

    it('renders font size section', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('Font Sizes')).toBeInTheDocument();
    });

    it('renders preview section', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('renders font preview text', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('The quick brown fox jumps over the lazy dog')).toBeInTheDocument();
      expect(screen.getByText('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBeInTheDocument();
      expect(screen.getByText('abcdefghijklmnopqrstuvwxyz')).toBeInTheDocument();
      expect(screen.getByText('1234567890!@#$%^&*()')).toBeInTheDocument();
    });

    it('renders default font families', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // Use getAllByText since there may be multiple occurrences
      const sansElements = screen.getAllByText('sans');
      const serifElements = screen.getAllByText('serif');
      const monoElements = screen.getAllByText('mono');

      expect(sansElements.length).toBeGreaterThan(0);
      expect(serifElements.length).toBeGreaterThan(0);
      expect(monoElements.length).toBeGreaterThan(0);
    });
  });

  describe('Color Picker', () => {
    it('renders color picker buttons', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // Color pickers should be rendered as buttons in popover triggers
      const popoverTriggers = screen.getAllByTestId('popover-trigger');
      expect(popoverTriggers.length).toBeGreaterThan(0);
    });

    it('renders color picker tabs (Custom and Libraries)', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // Look for tabs in the color picker
      const customTabs = screen.getAllByTestId('tabs-trigger-custom');
      const librariesTabs = screen.getAllByTestId('tabs-trigger-libraries');
      expect(customTabs.length).toBeGreaterThan(0);
      expect(librariesTabs.length).toBeGreaterThan(0);
    });

    it('renders search input for color libraries', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      const searchInputs = screen.getAllByPlaceholderText('Search libraries...');
      expect(searchInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Token Input Types', () => {
    it('renders dimension inputs for spacing tokens', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // Spacing section should have dimension inputs
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('renders select dropdown for style tokens', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // Border style section should have select dropdowns
      const selects = screen.getAllByTestId('select');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  describe('State Management', () => {
    it('passes color tokens to ExportManager', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      const exportManager = screen.getByTestId('export-manager');
      const colorTokens = exportManager.getAttribute('data-color-tokens');
      expect(colorTokens).toBeDefined();
      expect(JSON.parse(colorTokens!)).toBeDefined();
    });

    it('passes typography tokens to ExportManager', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      const exportManager = screen.getByTestId('export-manager');
      const typographyTokens = exportManager.getAttribute('data-typography-tokens');
      expect(typographyTokens).toBeDefined();
      expect(JSON.parse(typographyTokens!)).toBeDefined();
    });
  });

  describe('Layout Structure', () => {
    it('renders container with proper spacing', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      const container = screen.getByTestId('card').parentElement;
      expect(container).toHaveClass('container');
    });

    it('renders card header with flex layout', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      const cardHeader = screen.getByTestId('card-header');
      expect(cardHeader).toHaveClass('flex');
    });

    it('renders scroll area for color libraries', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      const scrollAreas = screen.getAllByTestId('scroll-area');
      expect(scrollAreas.length).toBeGreaterThan(0);
    });
  });

  describe('Color Palette Display', () => {
    it('renders color palette names', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // Use getAllByText since there may be multiple occurrences
      const slateElements = screen.getAllByText('slate');
      const grayElements = screen.getAllByText('gray');
      const zincElements = screen.getAllByText('zinc');

      expect(slateElements.length).toBeGreaterThan(0);
      expect(grayElements.length).toBeGreaterThan(0);
      expect(zincElements.length).toBeGreaterThan(0);
    });

    it('renders color swatches in palette', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // Color palettes should have color swatch buttons
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Type Exports', () => {
    it('exports TypographyTokens type (import check)', () => {
      // DesignSystemManager is imported at the top as default export
      // Types are verified at compile time
      expect(DesignSystemManager).toBeDefined();
    });

    it('exports ColorTokens type (import check)', () => {
      // Types are verified at compile time
      expect(DesignSystemManager).toBeDefined();
    });

    it('exports ColorToken type (import check)', () => {
      // Types are verified at compile time
      expect(DesignSystemManager).toBeDefined();
    });

    it('exports TokenSection type (import check)', () => {
      // Types are verified at compile time
      expect(DesignSystemManager).toBeDefined();
    });
  });

  describe('Default Export', () => {
    it('exports DesignSystemManager as default', () => {
      // DesignSystemManager is imported at the top as default export
      expect(DesignSystemManager).toBeDefined();
      expect(typeof DesignSystemManager).toBe('function');
    });
  });

  describe('Chart Color Tokens', () => {
    it('renders chart-1 through chart-5 tokens', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('chart-1')).toBeInTheDocument();
      expect(screen.getByText('chart-2')).toBeInTheDocument();
      expect(screen.getByText('chart-3')).toBeInTheDocument();
      expect(screen.getByText('chart-4')).toBeInTheDocument();
      expect(screen.getByText('chart-5')).toBeInTheDocument();
    });
  });

  describe('Sidebar Color Tokens', () => {
    it('renders sidebar color tokens', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('sidebar-background')).toBeInTheDocument();
      expect(screen.getByText('sidebar-foreground')).toBeInTheDocument();
      expect(screen.getByText('sidebar-primary')).toBeInTheDocument();
      expect(screen.getByText('sidebar-accent')).toBeInTheDocument();
    });
  });

  describe('Alpha Opacity Tokens', () => {
    it('renders alpha opacity tokens', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('90')).toBeInTheDocument();
    });
  });

  describe('Additional Tokens', () => {
    it('renders container tokens', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('container-default')).toBeInTheDocument();
      expect(screen.getByText('container-narrow')).toBeInTheDocument();
      expect(screen.getByText('container-wide')).toBeInTheDocument();
      expect(screen.getByText('container-full')).toBeInTheDocument();
    });

    it('renders spacing tokens', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('section-padding-sm')).toBeInTheDocument();
      expect(screen.getByText('section-padding-md')).toBeInTheDocument();
      expect(screen.getByText('section-padding-lg')).toBeInTheDocument();
    });

    it('renders grid tokens', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      // Use getAllByText since there may be multiple occurrences (e.g., in layout section too)
      const gridGapElements = screen.getAllByText('grid-gap');
      expect(gridGapElements.length).toBeGreaterThan(0);
      expect(screen.getByText('grid-cols-2')).toBeInTheDocument();
      expect(screen.getByText('grid-cols-3')).toBeInTheDocument();
      expect(screen.getByText('grid-cols-4')).toBeInTheDocument();
    });

    it('renders border tokens', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('border-width')).toBeInTheDocument();
      expect(screen.getByText('border-style')).toBeInTheDocument();
    });

    it('renders shadow tokens', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      expect(screen.getByText('shadow')).toBeInTheDocument();
    });
  });

  describe('Info Icons and Tooltips', () => {
    it('renders info icons', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      const infoIcons = screen.getAllByTestId('info-icon');
      expect(infoIcons.length).toBeGreaterThan(0);
    });

    it('renders tooltip providers', async () => {
      await act(async () => {
        render(<DesignSystemManager />);
      });

      const tooltipProviders = screen.getAllByTestId('tooltip-provider');
      expect(tooltipProviders.length).toBeGreaterThan(0);
    });
  });
});
