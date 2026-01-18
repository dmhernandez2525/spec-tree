import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from './context-menu';

describe('ContextMenu exports', () => {
  it('exports ContextMenu component', () => {
    expect(ContextMenu).toBeDefined();
  });

  it('exports ContextMenuTrigger component', () => {
    expect(ContextMenuTrigger).toBeDefined();
  });

  it('exports ContextMenuGroup component', () => {
    expect(ContextMenuGroup).toBeDefined();
  });

  it('exports ContextMenuPortal component', () => {
    expect(ContextMenuPortal).toBeDefined();
  });

  it('exports ContextMenuSub component', () => {
    expect(ContextMenuSub).toBeDefined();
  });

  it('exports ContextMenuRadioGroup component', () => {
    expect(ContextMenuRadioGroup).toBeDefined();
  });

  it('exports ContextMenuSubTrigger with displayName', () => {
    expect(ContextMenuSubTrigger).toBeDefined();
    expect(ContextMenuSubTrigger.displayName).toBe('ContextMenuSubTrigger');
  });

  it('exports ContextMenuSubContent with displayName', () => {
    expect(ContextMenuSubContent).toBeDefined();
    expect(ContextMenuSubContent.displayName).toBe('ContextMenuSubContent');
  });

  it('exports ContextMenuContent with displayName', () => {
    expect(ContextMenuContent).toBeDefined();
    expect(ContextMenuContent.displayName).toBe('ContextMenuContent');
  });

  it('exports ContextMenuItem with displayName', () => {
    expect(ContextMenuItem).toBeDefined();
    expect(ContextMenuItem.displayName).toBe('ContextMenuItem');
  });

  it('exports ContextMenuCheckboxItem with displayName', () => {
    expect(ContextMenuCheckboxItem).toBeDefined();
    expect(ContextMenuCheckboxItem.displayName).toBe('ContextMenuCheckboxItem');
  });

  it('exports ContextMenuRadioItem with displayName', () => {
    expect(ContextMenuRadioItem).toBeDefined();
    expect(ContextMenuRadioItem.displayName).toBe('ContextMenuRadioItem');
  });

  it('exports ContextMenuLabel with displayName', () => {
    expect(ContextMenuLabel).toBeDefined();
    expect(ContextMenuLabel.displayName).toBe('ContextMenuLabel');
  });

  it('exports ContextMenuSeparator with displayName', () => {
    expect(ContextMenuSeparator).toBeDefined();
    expect(ContextMenuSeparator.displayName).toBe('ContextMenuSeparator');
  });
});

describe('ContextMenuShortcut', () => {
  it('renders shortcut text', () => {
    render(<ContextMenuShortcut data-testid="shortcut">⌘C</ContextMenuShortcut>);

    expect(screen.getByTestId('shortcut')).toBeInTheDocument();
    expect(screen.getByText('⌘C')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ContextMenuShortcut className="custom-shortcut" data-testid="shortcut">
        ⌘V
      </ContextMenuShortcut>
    );

    expect(screen.getByTestId('shortcut')).toHaveClass('custom-shortcut');
  });

  it('has correct displayName', () => {
    expect(ContextMenuShortcut.displayName).toBe('ContextMenuShortcut');
  });
});
