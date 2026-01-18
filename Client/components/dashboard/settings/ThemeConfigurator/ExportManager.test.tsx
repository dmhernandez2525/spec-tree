import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import ExportManager from './ExportManager';
import type { ColorTokens, TypographyTokens } from './ThemeConfigurator';

// Mock sonner
const mockToastSuccess = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (message: string) => mockToastSuccess(message),
    error: vi.fn(),
  },
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Download: () => React.createElement('svg', { 'data-testid': 'download-icon' }),
}));

// Mock UI components
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'dropdown-menu' }, children),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'dropdown-menu-content' }, children),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) =>
    React.createElement(
      'button',
      { 'data-testid': 'dropdown-menu-item', onClick },
      children
    ),
  DropdownMenuTrigger: ({
    children,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) =>
    React.createElement('div', { 'data-testid': 'dropdown-menu-trigger' }, children),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    variant,
    size,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
  }) =>
    React.createElement(
      'button',
      {
        'data-testid': 'button',
        'data-variant': variant,
        'data-size': size,
      },
      children
    ),
}));

describe('ExportManager', () => {
  // Sample test data
  const mockColorTokens: ColorTokens = {
    base: {
      deviation: false,
      items: [
        {
          name: 'primary',
          light: '#3b82f6',
          dark: '#60a5fa',
        },
        {
          name: 'secondary',
          light: '#64748b',
          dark: '#94a3b8',
        },
        {
          name: 'background',
          light: '#ffffff',
          dark: '#0f172a',
        },
      ],
    },
    alpha: {
      deviation: false,
      items: [
        {
          name: '50',
          light: 'FFFFFF',
          dark: '090909',
          opacity: '50%',
        },
      ],
    },
  };

  const mockTypographyTokens: TypographyTokens = {
    fontFamily: {
      sans: { value: 'Inter', weights: ['400', '500', '600', '700'] },
      serif: { value: 'Merriweather', weights: ['400', '700'] },
      mono: { value: 'JetBrains Mono', weights: ['400', '500', '700'] },
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      normal: '1.5',
      loose: '2',
    },
  };

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
        render(
          <ExportManager
            colorTokens={mockColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });

    it('renders export button with correct text', async () => {
      await act(async () => {
        render(
          <ExportManager
            colorTokens={mockColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      expect(screen.getByText('Export Theme')).toBeInTheDocument();
    });

    it('renders download icon', async () => {
      await act(async () => {
        render(
          <ExportManager
            colorTokens={mockColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });

    it('renders dropdown menu items', async () => {
      await act(async () => {
        render(
          <ExportManager
            colorTokens={mockColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      expect(screen.getByText('Export for Figma')).toBeInTheDocument();
      expect(screen.getByText('Export for Local Development')).toBeInTheDocument();
    });

    it('renders button with outline variant and sm size', async () => {
      await act(async () => {
        render(
          <ExportManager
            colorTokens={mockColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('data-variant', 'outline');
      expect(button).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('Export for Figma', () => {
    it('shows success toast after Figma export', async () => {
      await act(async () => {
        render(
          <ExportManager
            colorTokens={mockColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      const figmaButton = screen.getByText('Export for Figma');

      await act(async () => {
        fireEvent.click(figmaButton);
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Downloaded figma-theme.json');
    });
  });

  describe('Export for Local Development', () => {
    it('shows success toast after local export', async () => {
      await act(async () => {
        render(
          <ExportManager
            colorTokens={mockColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      const localButton = screen.getByText('Export for Local Development');

      await act(async () => {
        fireEvent.click(localButton);
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Downloaded theme.css');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty color tokens', async () => {
      const emptyColorTokens: ColorTokens = {};

      await act(async () => {
        render(
          <ExportManager
            colorTokens={emptyColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      const figmaButton = screen.getByText('Export for Figma');

      await act(async () => {
        fireEvent.click(figmaButton);
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Downloaded figma-theme.json');
    });

    it('handles empty typography tokens', async () => {
      const emptyTypographyTokens: TypographyTokens = {
        fontFamily: {},
        fontSize: {},
        fontWeight: {},
        lineHeight: {},
      };

      await act(async () => {
        render(
          <ExportManager
            colorTokens={mockColorTokens}
            typographyTokens={emptyTypographyTokens}
          />
        );
      });

      const localButton = screen.getByText('Export for Local Development');

      await act(async () => {
        fireEvent.click(localButton);
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Downloaded theme.css');
    });

    it('handles tokens with special characters in values', async () => {
      const specialColorTokens: ColorTokens = {
        special: {
          deviation: false,
          items: [
            {
              name: 'special-color',
              light: 'rgba(0, 0, 0, 0.5)',
              dark: 'rgba(255, 255, 255, 0.5)',
            },
          ],
        },
      };

      await act(async () => {
        render(
          <ExportManager
            colorTokens={specialColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      const localButton = screen.getByText('Export for Local Development');

      await act(async () => {
        fireEvent.click(localButton);
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Downloaded theme.css');
    });
  });

  describe('Component Props', () => {
    it('accepts colorTokens and typographyTokens props', async () => {
      await act(async () => {
        render(
          <ExportManager
            colorTokens={mockColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      // If we get here without errors, props were accepted
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });
  });

  describe('Dropdown Menu Structure', () => {
    it('renders dropdown menu trigger', async () => {
      await act(async () => {
        render(
          <ExportManager
            colorTokens={mockColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument();
    });

    it('renders dropdown menu content', async () => {
      await act(async () => {
        render(
          <ExportManager
            colorTokens={mockColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument();
    });

    it('renders two dropdown menu items', async () => {
      await act(async () => {
        render(
          <ExportManager
            colorTokens={mockColorTokens}
            typographyTokens={mockTypographyTokens}
          />
        );
      });

      const menuItems = screen.getAllByTestId('dropdown-menu-item');
      expect(menuItems).toHaveLength(2);
    });
  });
});
