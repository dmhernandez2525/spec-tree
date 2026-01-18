import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { AppearanceSettings } from './AppearanceSettings';

// Mock FontManager
vi.mock('@/components/FontManager', () => ({
  useFonts: vi.fn(() => ({
    currentStyle: 'modern',
    setCurrentStyle: vi.fn(),
  })),
  styleFonts: {
    modern: { name: 'Modern' },
    classic: { name: 'Classic' },
    minimal: { name: 'Minimal' },
  },
}));

// Mock Theme component
vi.mock('@/components/dashboard/theme', () => ({
  default: () => <div data-testid="theme-component">Theme Configurator</div>,
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AppearanceSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => {
      cleanup();
    });
  });

  describe('Exports', () => {
    it('exports AppearanceSettings as named export', () => {
      expect(AppearanceSettings).toBeDefined();
      expect(typeof AppearanceSettings).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', async () => {
      await act(async () => {
        expect(() => {
          render(<AppearanceSettings />);
        }).not.toThrow();
      });
    });
  });

  describe('Rendering', () => {
    it('renders card title', async () => {
      await act(async () => {
        render(<AppearanceSettings />);
      });

      expect(screen.getByText('Appearance')).toBeInTheDocument();
    });

    it('renders card description', async () => {
      await act(async () => {
        render(<AppearanceSettings />);
      });

      expect(
        screen.getByText('Customize how Spec Tree looks on your device')
      ).toBeInTheDocument();
    });

    it('renders Theme component', async () => {
      await act(async () => {
        render(<AppearanceSettings />);
      });

      expect(screen.getByTestId('theme-component')).toBeInTheDocument();
    });

    it('renders submit button', async () => {
      await act(async () => {
        render(<AppearanceSettings />);
      });

      expect(
        screen.getByRole('button', { name: /Save Preferences/i })
      ).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('shows success toast on form submission', async () => {
      // Import the mocked module at top level
      const sonner = await vi.importMock<typeof import('sonner')>('sonner');

      await act(async () => {
        render(<AppearanceSettings />);
      });

      const submitButton = screen.getByRole('button', { name: /Save Preferences/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(sonner.toast.success).toHaveBeenCalledWith('Appearance settings updated');
      });
    });
  });

  describe('Form Integration', () => {
    it('uses useFonts hook for current style', async () => {
      // Import the mocked module
      const FontManager = await vi.importMock<typeof import('@/components/FontManager')>('@/components/FontManager');

      await act(async () => {
        render(<AppearanceSettings />);
      });

      expect(FontManager.useFonts).toHaveBeenCalled();
    });
  });

  describe('Layout', () => {
    it('renders form element', async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(<AppearanceSettings />);
        container = result.container;
      });

      const form = container!.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('has proper form spacing', async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(<AppearanceSettings />);
        container = result.container;
      });

      const spacedForm = container!.querySelector('.space-y-8');
      expect(spacedForm).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('renders Card title text', async () => {
      await act(async () => {
        render(<AppearanceSettings />);
      });

      // Check that the card title text exists
      expect(screen.getByText('Appearance')).toBeInTheDocument();
    });

    it('renders Card description text', async () => {
      await act(async () => {
        render(<AppearanceSettings />);
      });

      // Check that the card description text exists
      expect(screen.getByText('Customize how Spec Tree looks on your device')).toBeInTheDocument();
    });
  });
});
