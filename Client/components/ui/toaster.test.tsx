import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toaster } from './toaster';
import { useToast } from '@/lib/hooks/use-toast';

// Mock the useToast hook
vi.mock('@/lib/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toasts: [],
    toast: vi.fn(),
    dismiss: vi.fn(),
  })),
  toast: vi.fn(),
}));

const mockedUseToast = vi.mocked(useToast);

describe('Toaster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseToast.mockReturnValue({
      toasts: [],
      toast: vi.fn(),
      dismiss: vi.fn(),
    });
  });

  it('exports Toaster component', () => {
    expect(Toaster).toBeDefined();
  });

  it('renders without crashing', () => {
    render(<Toaster />);
    // ToastProvider and ToastViewport should be rendered
    expect(document.body).toBeInTheDocument();
  });

  it('renders empty when no toasts exist', () => {
    const { container } = render(<Toaster />);
    // Should have the ToastViewport present
    const viewport = container.querySelector('[class*="fixed"]');
    expect(viewport).toBeInTheDocument();
  });

  it('renders a single toast', () => {
    mockedUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Test Toast',
          description: 'Test description',
          open: true,
          onOpenChange: vi.fn(),
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<Toaster />);
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders a toast with only title', () => {
    mockedUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Only Title',
          open: true,
          onOpenChange: vi.fn(),
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<Toaster />);
    expect(screen.getByText('Only Title')).toBeInTheDocument();
  });

  it('renders a toast with only description', () => {
    mockedUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          description: 'Only Description',
          open: true,
          onOpenChange: vi.fn(),
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<Toaster />);
    expect(screen.getByText('Only Description')).toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    mockedUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Toast 1',
          open: true,
          onOpenChange: vi.fn(),
        },
        {
          id: '2',
          title: 'Toast 2',
          open: true,
          onOpenChange: vi.fn(),
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<Toaster />);
    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
  });

  it('renders toast with action', () => {
    const ActionElement = <button data-testid="action-btn">Undo</button>;
    mockedUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Action Toast',
          action: ActionElement,
          open: true,
          onOpenChange: vi.fn(),
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<Toaster />);
    expect(screen.getByText('Action Toast')).toBeInTheDocument();
    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
  });

  it('renders toast with destructive variant', () => {
    mockedUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Error',
          variant: 'destructive' as const,
          open: true,
          onOpenChange: vi.fn(),
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<Toaster />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders ToastClose button for each toast', () => {
    mockedUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Toast with close',
          open: true,
          onOpenChange: vi.fn(),
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<Toaster />);
    // ToastClose has toast-close attribute
    const closeButton = document.querySelector('[toast-close]');
    expect(closeButton).toBeInTheDocument();
  });

  it('passes props to Toast component', () => {
    mockedUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Custom Props Toast',
          className: 'custom-toast-class',
          open: true,
          onOpenChange: vi.fn(),
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<Toaster />);
    expect(screen.getByText('Custom Props Toast')).toBeInTheDocument();
  });

  it('uses unique keys for each toast', () => {
    mockedUseToast.mockReturnValue({
      toasts: [
        { id: 'unique-1', title: 'Toast A', open: true, onOpenChange: vi.fn() },
        { id: 'unique-2', title: 'Toast B', open: true, onOpenChange: vi.fn() },
        { id: 'unique-3', title: 'Toast C', open: true, onOpenChange: vi.fn() },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<Toaster />);
    expect(screen.getByText('Toast A')).toBeInTheDocument();
    expect(screen.getByText('Toast B')).toBeInTheDocument();
    expect(screen.getByText('Toast C')).toBeInTheDocument();
  });

  it('renders without title and description when both are undefined', () => {
    mockedUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          open: true,
          onOpenChange: vi.fn(),
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<Toaster />);
    // Toast should still render even without title/description
    const toastElement = document.querySelector('[data-state]');
    expect(toastElement).toBeInTheDocument();
  });

  it('renders ToastViewport', () => {
    render(<Toaster />);
    // ToastViewport has specific positioning classes
    const viewport = document.querySelector('.fixed.top-0');
    expect(viewport).toBeInTheDocument();
  });

  describe('Toast content structure', () => {
    it('wraps title and description in a grid container', () => {
      mockedUseToast.mockReturnValue({
        toasts: [
          {
            id: '1',
            title: 'Grid Title',
            description: 'Grid Description',
            open: true,
            onOpenChange: vi.fn(),
          },
        ],
        toast: vi.fn(),
        dismiss: vi.fn(),
      });

      render(<Toaster />);
      const title = screen.getByText('Grid Title');
      const description = screen.getByText('Grid Description');

      // Both should have the same parent (the grid div)
      expect(title.parentElement).toBe(description.parentElement);
      expect(title.parentElement).toHaveClass('grid', 'gap-1');
    });
  });

  describe('Toast variants', () => {
    it('applies default variant styling', () => {
      mockedUseToast.mockReturnValue({
        toasts: [
          {
            id: '1',
            title: 'Default Toast',
            variant: 'default' as const,
            open: true,
            onOpenChange: vi.fn(),
          },
        ],
        toast: vi.fn(),
        dismiss: vi.fn(),
      });

      render(<Toaster />);
      const toast = screen.getByText('Default Toast').closest('[class*="border"]');
      expect(toast).toHaveClass('bg-background');
    });

    it('applies destructive variant styling', () => {
      mockedUseToast.mockReturnValue({
        toasts: [
          {
            id: '1',
            title: 'Destructive Toast',
            variant: 'destructive' as const,
            open: true,
            onOpenChange: vi.fn(),
          },
        ],
        toast: vi.fn(),
        dismiss: vi.fn(),
      });

      render(<Toaster />);
      const toast = screen.getByText('Destructive Toast').closest('[class*="border"]');
      expect(toast).toHaveClass('destructive');
    });
  });

  describe('Toast lifecycle', () => {
    it('handles toast with open state', () => {
      mockedUseToast.mockReturnValue({
        toasts: [
          {
            id: '1',
            title: 'Open Toast',
            open: true,
            onOpenChange: vi.fn(),
          },
        ],
        toast: vi.fn(),
        dismiss: vi.fn(),
      });

      render(<Toaster />);
      expect(screen.getByText('Open Toast')).toBeInTheDocument();
    });

    it('can update toasts when hook state changes', () => {
      const { rerender } = render(<Toaster />);

      // Initially no toasts
      expect(screen.queryByText('New Toast')).not.toBeInTheDocument();

      // Update mock to return a toast
      mockedUseToast.mockReturnValue({
        toasts: [
          {
            id: '1',
            title: 'New Toast',
            open: true,
            onOpenChange: vi.fn(),
          },
        ],
        toast: vi.fn(),
        dismiss: vi.fn(),
      });

      rerender(<Toaster />);
      expect(screen.getByText('New Toast')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders with proper structure for screen readers', () => {
      mockedUseToast.mockReturnValue({
        toasts: [
          {
            id: '1',
            title: 'Accessible Toast',
            description: 'Accessible description',
            open: true,
            onOpenChange: vi.fn(),
          },
        ],
        toast: vi.fn(),
        dismiss: vi.fn(),
      });

      render(<Toaster />);

      // Title should be in a semantic element
      const title = screen.getByText('Accessible Toast');
      expect(title).toBeInTheDocument();

      // Description should be present
      const description = screen.getByText('Accessible description');
      expect(description).toBeInTheDocument();
    });
  });
});
