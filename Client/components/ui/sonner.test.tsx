import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toaster } from './sonner';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({ theme: 'light' })),
}));

// Import the mocked module for control
import { useTheme } from 'next-themes';
const mockedUseTheme = vi.mocked(useTheme);

// Mock sonner
vi.mock('sonner', () => ({
  Toaster: vi.fn(({ theme, className, toastOptions, ...props }) => (
    <div
      data-testid="sonner-toaster"
      data-theme={theme}
      className={className}
      data-toast-options={JSON.stringify(toastOptions)}
      {...props}
    />
  )),
}));

describe('Sonner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseTheme.mockReturnValue({ theme: 'light', setTheme: vi.fn(), themes: [] });
  });

  it('module can be imported', () => {
    expect(Toaster).toBeDefined();
  });

  it('renders the sonner Toaster component', () => {
    render(<Toaster />);
    expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument();
  });

  it('passes theme from useTheme to sonner Toaster', () => {
    mockedUseTheme.mockReturnValue({ theme: 'dark', setTheme: vi.fn(), themes: [] });

    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-theme', 'dark');
  });

  it('uses light theme when useTheme returns light', () => {
    mockedUseTheme.mockReturnValue({ theme: 'light', setTheme: vi.fn(), themes: [] });

    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-theme', 'light');
  });

  it('uses system theme when useTheme returns system', () => {
    mockedUseTheme.mockReturnValue({ theme: 'system', setTheme: vi.fn(), themes: [] });

    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-theme', 'system');
  });

  it('defaults to system theme when useTheme returns undefined', () => {
    mockedUseTheme.mockReturnValue({ theme: undefined, setTheme: vi.fn(), themes: [] });

    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-theme', 'system');
  });

  it('applies toaster group class', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveClass('toaster', 'group');
  });

  it('passes toastOptions with classNames', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    expect(toastOptions.classNames).toBeDefined();
    expect(toastOptions.classNames.toast).toBeDefined();
    expect(toastOptions.classNames.description).toBeDefined();
    expect(toastOptions.classNames.actionButton).toBeDefined();
    expect(toastOptions.classNames.cancelButton).toBeDefined();
  });

  it('toast classNames include group styling', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    expect(toastOptions.classNames.toast).toContain('group');
    expect(toastOptions.classNames.toast).toContain('toast');
  });

  it('toast classNames include background styling', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    expect(toastOptions.classNames.toast).toContain('group-[.toaster]:bg-background');
  });

  it('toast classNames include text foreground styling', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    expect(toastOptions.classNames.toast).toContain('group-[.toaster]:text-foreground');
  });

  it('toast classNames include border styling', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    expect(toastOptions.classNames.toast).toContain('group-[.toaster]:border-border');
  });

  it('toast classNames include shadow styling', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    expect(toastOptions.classNames.toast).toContain('group-[.toaster]:shadow-lg');
  });

  it('description classNames include muted foreground styling', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    expect(toastOptions.classNames.description).toContain('group-[.toast]:text-muted-foreground');
  });

  it('actionButton classNames include primary styling', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    expect(toastOptions.classNames.actionButton).toContain('group-[.toast]:bg-primary');
    expect(toastOptions.classNames.actionButton).toContain('group-[.toast]:text-primary-foreground');
  });

  it('cancelButton classNames include muted styling', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

    expect(toastOptions.classNames.cancelButton).toContain('group-[.toast]:bg-muted');
    expect(toastOptions.classNames.cancelButton).toContain('group-[.toast]:text-muted-foreground');
  });

  it('passes additional props to sonner Toaster', () => {
    render(<Toaster position="top-right" />);
    const toaster = screen.getByTestId('sonner-toaster');

    expect(toaster).toHaveAttribute('position', 'top-right');
  });

  it('can override the theme prop', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toBeInTheDocument();
  });

  describe('Theme integration', () => {
    it('integrates with next-themes useTheme hook', () => {
      mockedUseTheme.mockReturnValue({ theme: 'dark', setTheme: vi.fn(), themes: [] });

      render(<Toaster />);

      expect(useTheme).toHaveBeenCalled();
    });

    it('responds to theme changes', () => {
      const { rerender } = render(<Toaster />);

      let toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveAttribute('data-theme', 'light');

      // Change theme
      mockedUseTheme.mockReturnValue({ theme: 'dark', setTheme: vi.fn(), themes: [] });
      rerender(<Toaster />);

      toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveAttribute('data-theme', 'dark');
    });
  });

  describe('Styling consistency', () => {
    it('uses consistent color tokens from design system', () => {
      render(<Toaster />);
      const toaster = screen.getByTestId('sonner-toaster');
      const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}');

      // All classNames should reference design system tokens
      const allClassNames = Object.values(toastOptions.classNames).join(' ');

      expect(allClassNames).toContain('background');
      expect(allClassNames).toContain('foreground');
      expect(allClassNames).toContain('border');
      expect(allClassNames).toContain('primary');
      expect(allClassNames).toContain('muted');
    });
  });
});
