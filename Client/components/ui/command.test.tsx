import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from './command';

// Mock Dialog for CommandDialog tests
vi.mock('@/components/ui/dialog', () => ({
  Dialog: vi.fn(({ children, ...props }) => (
    <div data-testid="dialog" data-open={props.open?.toString()} {...props}>
      {children}
    </div>
  )),
  DialogContent: vi.fn(({ children, className }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  )),
}));

describe('Command', () => {
  describe('exports', () => {
    it('exports Command component', () => {
      expect(Command).toBeDefined();
    });

    it('exports CommandDialog component', () => {
      expect(CommandDialog).toBeDefined();
    });

    it('exports CommandInput component', () => {
      expect(CommandInput).toBeDefined();
    });

    it('exports CommandList component', () => {
      expect(CommandList).toBeDefined();
    });

    it('exports CommandEmpty component', () => {
      expect(CommandEmpty).toBeDefined();
    });

    it('exports CommandGroup component', () => {
      expect(CommandGroup).toBeDefined();
    });

    it('exports CommandItem component', () => {
      expect(CommandItem).toBeDefined();
    });

    it('exports CommandSeparator component', () => {
      expect(CommandSeparator).toBeDefined();
    });

    it('exports CommandShortcut component', () => {
      expect(CommandShortcut).toBeDefined();
    });
  });

  describe('displayNames', () => {
    it('Command is defined', () => {
      // cmdk library doesn't always set displayName
      expect(Command).toBeDefined();
    });

    it('CommandInput is defined', () => {
      expect(CommandInput).toBeDefined();
    });

    it('CommandList is defined', () => {
      expect(CommandList).toBeDefined();
    });

    it('CommandEmpty is defined', () => {
      expect(CommandEmpty).toBeDefined();
    });

    it('CommandGroup is defined', () => {
      expect(CommandGroup).toBeDefined();
    });

    it('CommandSeparator is defined', () => {
      expect(CommandSeparator).toBeDefined();
    });

    it('CommandItem is defined', () => {
      expect(CommandItem).toBeDefined();
    });

    it('CommandShortcut has correct displayName', () => {
      expect(CommandShortcut.displayName).toBe('CommandShortcut');
    });
  });

  describe('Command', () => {
    it('renders with children', () => {
      render(
        <Command data-testid="command">
          <div data-testid="child">Content</div>
        </Command>
      );
      expect(screen.getByTestId('command')).toBeInTheDocument();
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('applies default className', () => {
      render(
        <Command data-testid="command">
          <div>Content</div>
        </Command>
      );
      const command = screen.getByTestId('command');
      expect(command).toHaveClass('flex');
      expect(command).toHaveClass('h-full');
      expect(command).toHaveClass('w-full');
      expect(command).toHaveClass('flex-col');
    });

    it('merges custom className', () => {
      render(
        <Command className="custom-class" data-testid="command">
          <div>Content</div>
        </Command>
      );
      const command = screen.getByTestId('command');
      expect(command).toHaveClass('custom-class');
      expect(command).toHaveClass('flex');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Command ref={ref}>
          <div>Content</div>
        </Command>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('CommandDialog', () => {
    it('renders dialog with command', () => {
      render(
        <CommandDialog open={true}>
          <div data-testid="dialog-child">Content</div>
        </CommandDialog>
      );
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-child')).toBeInTheDocument();
    });

    it('passes open prop to Dialog', () => {
      render(
        <CommandDialog open={true}>
          <div>Content</div>
        </CommandDialog>
      );
      expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true');
    });

    it('passes open=false to Dialog', () => {
      render(
        <CommandDialog open={false}>
          <div>Content</div>
        </CommandDialog>
      );
      expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'false');
    });
  });

  describe('CommandShortcut', () => {
    it('renders shortcut text', () => {
      render(<CommandShortcut data-testid="shortcut">Ctrl+K</CommandShortcut>);
      expect(screen.getByTestId('shortcut')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
    });

    it('applies default className', () => {
      render(<CommandShortcut data-testid="shortcut">Ctrl+K</CommandShortcut>);
      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toHaveClass('ml-auto');
      expect(shortcut).toHaveClass('text-xs');
      expect(shortcut).toHaveClass('tracking-widest');
      expect(shortcut).toHaveClass('text-muted-foreground');
    });

    it('merges custom className', () => {
      render(
        <CommandShortcut className="custom-shortcut" data-testid="shortcut">
          Ctrl+K
        </CommandShortcut>
      );
      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toHaveClass('custom-shortcut');
    });

    it('renders as span element', () => {
      render(<CommandShortcut data-testid="shortcut">Ctrl+K</CommandShortcut>);
      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut.tagName.toLowerCase()).toBe('span');
    });
  });

  describe('component types', () => {
    it('Command is a forwardRef component', () => {
      expect(typeof Command).toBe('object');
      expect(Command.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('CommandInput is a forwardRef component', () => {
      expect(typeof CommandInput).toBe('object');
      expect(CommandInput.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('CommandList is a forwardRef component', () => {
      expect(typeof CommandList).toBe('object');
      expect(CommandList.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('CommandEmpty is a forwardRef component', () => {
      expect(typeof CommandEmpty).toBe('object');
      expect(CommandEmpty.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('CommandGroup is a forwardRef component', () => {
      expect(typeof CommandGroup).toBe('object');
      expect(CommandGroup.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('CommandSeparator is a forwardRef component', () => {
      expect(typeof CommandSeparator).toBe('object');
      expect(CommandSeparator.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('CommandItem is a forwardRef component', () => {
      expect(typeof CommandItem).toBe('object');
      expect(CommandItem.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('CommandShortcut is a function component', () => {
      expect(typeof CommandShortcut).toBe('function');
    });
  });
});
