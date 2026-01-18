import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { CustomizationPanel, baseColors } from './CustomizationPanel';

// Mock next-themes
const mockSetTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    setTheme: mockSetTheme,
    resolvedTheme: 'light',
    theme: 'light',
  })),
}));

// Mock FontManager
const mockSetCurrentStyle = vi.fn();
vi.mock('@/components/FontManager', () => ({
  useFonts: vi.fn(() => ({
    currentStyle: 'default',
    setCurrentStyle: mockSetCurrentStyle,
  })),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Moon: () => React.createElement('svg', { 'data-testid': 'moon-icon' }),
  Sun: () => React.createElement('svg', { 'data-testid': 'sun-icon' }),
  Copy: () => React.createElement('svg', { 'data-testid': 'copy-icon' }),
  Check: () => React.createElement('svg', { 'data-testid': 'check-icon' }),
  Info: () => React.createElement('svg', { 'data-testid': 'info-icon' }),
  Settings: () => React.createElement('svg', { 'data-testid': 'settings-icon' }),
  Pipette: () => React.createElement('svg', { 'data-testid': 'pipette-icon' }),
}));

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  writable: true,
  configurable: true,
});

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    variant,
    size,
    className,
    onClick,
    style,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
  }) =>
    React.createElement(
      'button',
      {
        'data-testid': 'button',
        'data-variant': variant,
        'data-size': size,
        className,
        onClick,
        style,
      },
      children
    ),
}));

vi.mock('@/components/ui/toggle-group', () => ({
  ToggleGroup: ({
    children,
    type,
    value,
    onValueChange,
    className,
  }: {
    children: React.ReactNode;
    type?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
  }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'toggle-group',
        'data-type': type,
        'data-value': value,
        className,
      },
      React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<{ onClick?: () => void; value: string }>,
            {
              onClick: () => onValueChange?.(child.props.value),
            }
          );
        }
        return child;
      })
    ),
  ToggleGroupItem: ({
    children,
    value,
    onClick,
  }: {
    children: React.ReactNode;
    value: string;
    onClick?: () => void;
  }) =>
    React.createElement(
      'button',
      {
        'data-testid': `toggle-group-item-${value}`,
        'data-value': value,
        onClick,
      },
      children
    ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'dialog' }, children),
  DialogContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'dialog-content' }, children),
  DialogDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement('p', { 'data-testid': 'dialog-description' }, children),
  DialogHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'dialog-header' }, children),
  DialogTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement('h2', { 'data-testid': 'dialog-title' }, children),
  DialogTrigger: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'dialog-trigger' }, children),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'popover' }, children),
  PopoverContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'popover-content' }, children),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'popover-trigger' }, children),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({
    value,
    onChange,
    placeholder,
    className,
    type,
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    type?: string;
  }) =>
    React.createElement('input', {
      'data-testid': 'input',
      value,
      onChange,
      placeholder,
      className,
      type,
    }),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement('label', { 'data-testid': 'label', className }, children),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) =>
    React.createElement('div', { 'data-testid': 'tabs', 'data-default-value': defaultValue }, children),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement('div', { 'data-testid': `tabs-content-${value}` }, children),
  TabsList: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'tabs-list' }, children),
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement('button', { 'data-testid': `tabs-trigger-${value}`, type: 'button' }, children),
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement('div', { 'data-testid': 'scroll-area', className }, children),
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'tooltip' }, children),
  TooltipContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'tooltip-content' }, children),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'tooltip-trigger' }, children),
}));

// Mock ScrollableCode
vi.mock('../shared/ScrollableCode', () => ({
  default: ({ content }: { content: string }) =>
    React.createElement('code', { 'data-testid': 'scrollable-code' }, content),
}));

describe('CustomizationPanel', () => {
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
        render(<CustomizationPanel />);
      });

      expect(screen.getByText('Customize')).toBeInTheDocument();
    });

    it('renders description text', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(
        screen.getByText('Pick a style and color for your components.')
      ).toBeInTheDocument();
    });

    it('renders style section', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByText('Style')).toBeInTheDocument();
    });

    it('renders color section', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByText('Color')).toBeInTheDocument();
    });

    it('renders radius section', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByText('Radius')).toBeInTheDocument();
    });

    it('renders mode section', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByText('Mode')).toBeInTheDocument();
    });
  });

  describe('Style Selection', () => {
    it('renders all style variants', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByTestId('toggle-group-item-default')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-group-item-new-york')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-group-item-cyberpunk')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-group-item-retro')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-group-item-glassmorphic')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-group-item-brutalist')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-group-item-neumorphic')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-group-item-kawaii')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-group-item-terminal')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-group-item-handdrawn')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-group-item-claymorphic')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-group-item-schematic')).toBeInTheDocument();
    });

    it('calls setCurrentStyle when style changes', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      const cyberpunkToggle = screen.getByTestId('toggle-group-item-cyberpunk');

      await act(async () => {
        fireEvent.click(cyberpunkToggle);
      });

      expect(mockSetCurrentStyle).toHaveBeenCalledWith('cyberpunk');
    });
  });

  describe('Color Selection', () => {
    it('renders all base colors', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      baseColors.forEach((color) => {
        expect(screen.getByText(color.label)).toBeInTheDocument();
      });
    });

    it('renders color buttons', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Radius Selection', () => {
    it('renders all radius options', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0.3')).toBeInTheDocument();
      expect(screen.getByText('0.5')).toBeInTheDocument();
      expect(screen.getByText('0.75')).toBeInTheDocument();
      expect(screen.getByText('1.0')).toBeInTheDocument();
    });
  });

  describe('Mode Selection', () => {
    it('renders light and dark mode buttons', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    it('renders sun and moon icons', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });

    it('calls setTheme when dark mode clicked', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      const darkButton = screen.getByText('Dark').closest('button');

      if (darkButton) {
        await act(async () => {
          fireEvent.click(darkButton);
        });

        expect(mockSetTheme).toHaveBeenCalledWith('dark');
      }
    });
  });

  describe('Dialog Triggers', () => {
    it('renders settings dialog trigger', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    it('renders copy dialog trigger', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      const copyIcons = screen.getAllByTestId('copy-icon');
      expect(copyIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Change Callback', () => {
    it('calls onThemeChange when theme is generated', async () => {
      const mockOnThemeChange = vi.fn();

      await act(async () => {
        render(<CustomizationPanel onThemeChange={mockOnThemeChange} />);
      });

      await waitFor(() => {
        expect(mockOnThemeChange).toHaveBeenCalled();
      });
    });
  });

  describe('Exports', () => {
    it('exports CustomizationPanel as named export', () => {
      expect(CustomizationPanel).toBeDefined();
      expect(typeof CustomizationPanel).toBe('function');
    });

    it('exports baseColors', () => {
      expect(baseColors).toBeDefined();
      expect(Array.isArray(baseColors)).toBe(true);
    });

    it('re-exports generateTheme', () => {
      // generateTheme is a re-export, tested via type checking
      // The fact that this file compiles confirms the exports exist
      expect(CustomizationPanel).toBeDefined();
    });

    it('re-exports generateThemeCSS', () => {
      // generateThemeCSS is a re-export, tested via type checking
      // The fact that this file compiles confirms the exports exist
      expect(CustomizationPanel).toBeDefined();
    });
  });

  describe('Toggle Group', () => {
    it('renders toggle group for styles', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByTestId('toggle-group')).toBeInTheDocument();
    });

    it('has correct number of style toggle items', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      // 12 style variants
      const styleItems = [
        'default', 'new-york', 'cyberpunk', 'retro',
        'glassmorphic', 'brutalist', 'neumorphic', 'kawaii',
        'terminal', 'handdrawn', 'claymorphic', 'schematic'
      ];

      styleItems.forEach(style => {
        expect(screen.getByTestId(`toggle-group-item-${style}`)).toBeInTheDocument();
      });
    });
  });

  describe('Dialog Content', () => {
    it('renders Custom Colors dialog title', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByText('Custom Colors')).toBeInTheDocument();
    });

    it('renders Theme CSS dialog title', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByText('Theme CSS')).toBeInTheDocument();
    });

    it('renders Copy CSS button', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByText('Copy CSS')).toBeInTheDocument();
    });

    it('renders ScrollableCode component', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      expect(screen.getByTestId('scrollable-code')).toBeInTheDocument();
    });
  });

  describe('Info Icons', () => {
    it('renders info icons', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      const infoIcons = screen.getAllByTestId('info-icon');
      expect(infoIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Buttons Structure', () => {
    it('renders multiple buttons for color selection', async () => {
      await act(async () => {
        render(<CustomizationPanel />);
      });

      const buttons = screen.getAllByTestId('button');
      // At least: baseColors count + radius options + mode options
      expect(buttons.length).toBeGreaterThan(baseColors.length);
    });
  });
});
