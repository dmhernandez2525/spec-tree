import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';

describe('DropdownMenu exports', () => {
  it('exports DropdownMenu component', () => {
    expect(DropdownMenu).toBeDefined();
  });

  it('exports DropdownMenuTrigger component', () => {
    expect(DropdownMenuTrigger).toBeDefined();
  });

  it('exports DropdownMenuGroup component', () => {
    expect(DropdownMenuGroup).toBeDefined();
  });

  it('exports DropdownMenuPortal component', () => {
    expect(DropdownMenuPortal).toBeDefined();
  });

  it('exports DropdownMenuSub component', () => {
    expect(DropdownMenuSub).toBeDefined();
  });

  it('exports DropdownMenuRadioGroup component', () => {
    expect(DropdownMenuRadioGroup).toBeDefined();
  });

  it('exports DropdownMenuSubTrigger with displayName', () => {
    expect(DropdownMenuSubTrigger).toBeDefined();
    expect(DropdownMenuSubTrigger.displayName).toBe('DropdownMenuSubTrigger');
  });

  it('exports DropdownMenuSubContent with displayName', () => {
    expect(DropdownMenuSubContent).toBeDefined();
    expect(DropdownMenuSubContent.displayName).toBe('DropdownMenuSubContent');
  });

  it('exports DropdownMenuContent with displayName', () => {
    expect(DropdownMenuContent).toBeDefined();
    expect(DropdownMenuContent.displayName).toBe('DropdownMenuContent');
  });

  it('exports DropdownMenuItem with displayName', () => {
    expect(DropdownMenuItem).toBeDefined();
    expect(DropdownMenuItem.displayName).toBe('DropdownMenuItem');
  });

  it('exports DropdownMenuCheckboxItem with displayName', () => {
    expect(DropdownMenuCheckboxItem).toBeDefined();
    expect(DropdownMenuCheckboxItem.displayName).toBe('DropdownMenuCheckboxItem');
  });

  it('exports DropdownMenuRadioItem with displayName', () => {
    expect(DropdownMenuRadioItem).toBeDefined();
    expect(DropdownMenuRadioItem.displayName).toBe('DropdownMenuRadioItem');
  });

  it('exports DropdownMenuLabel with displayName', () => {
    expect(DropdownMenuLabel).toBeDefined();
    expect(DropdownMenuLabel.displayName).toBe('DropdownMenuLabel');
  });

  it('exports DropdownMenuSeparator with displayName', () => {
    expect(DropdownMenuSeparator).toBeDefined();
    expect(DropdownMenuSeparator.displayName).toBe('DropdownMenuSeparator');
  });
});

describe('DropdownMenuShortcut', () => {
  it('renders shortcut text', () => {
    render(<DropdownMenuShortcut data-testid="shortcut">⌘S</DropdownMenuShortcut>);

    expect(screen.getByTestId('shortcut')).toBeInTheDocument();
    expect(screen.getByText('⌘S')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <DropdownMenuShortcut className="custom-shortcut" data-testid="shortcut">
        ⌘K
      </DropdownMenuShortcut>
    );

    expect(screen.getByTestId('shortcut')).toHaveClass('custom-shortcut');
  });

  it('has correct displayName', () => {
    expect(DropdownMenuShortcut.displayName).toBe('DropdownMenuShortcut');
  });
});
