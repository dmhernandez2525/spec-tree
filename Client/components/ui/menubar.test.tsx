import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
} from './menubar';

describe('Menubar exports', () => {
  it('exports Menubar with displayName', () => {
    expect(Menubar).toBeDefined();
    expect(Menubar.displayName).toBe('Menubar');
  });

  it('exports MenubarMenu component', () => {
    expect(MenubarMenu).toBeDefined();
  });

  it('exports MenubarTrigger with displayName', () => {
    expect(MenubarTrigger).toBeDefined();
    expect(MenubarTrigger.displayName).toBe('MenubarTrigger');
  });

  it('exports MenubarContent with displayName', () => {
    expect(MenubarContent).toBeDefined();
    expect(MenubarContent.displayName).toBe('MenubarContent');
  });

  it('exports MenubarItem with displayName', () => {
    expect(MenubarItem).toBeDefined();
    expect(MenubarItem.displayName).toBe('MenubarItem');
  });

  it('exports MenubarSeparator with displayName', () => {
    expect(MenubarSeparator).toBeDefined();
    expect(MenubarSeparator.displayName).toBe('MenubarSeparator');
  });

  it('exports MenubarLabel with displayName', () => {
    expect(MenubarLabel).toBeDefined();
    expect(MenubarLabel.displayName).toBe('MenubarLabel');
  });

  it('exports MenubarCheckboxItem with displayName', () => {
    expect(MenubarCheckboxItem).toBeDefined();
    expect(MenubarCheckboxItem.displayName).toBe('MenubarCheckboxItem');
  });

  it('exports MenubarRadioGroup component', () => {
    expect(MenubarRadioGroup).toBeDefined();
  });

  it('exports MenubarRadioItem with displayName', () => {
    expect(MenubarRadioItem).toBeDefined();
    expect(MenubarRadioItem.displayName).toBe('MenubarRadioItem');
  });

  it('exports MenubarPortal component', () => {
    expect(MenubarPortal).toBeDefined();
  });

  it('exports MenubarSubContent with displayName', () => {
    expect(MenubarSubContent).toBeDefined();
    expect(MenubarSubContent.displayName).toBe('MenubarSubContent');
  });

  it('exports MenubarSubTrigger with displayName', () => {
    expect(MenubarSubTrigger).toBeDefined();
    expect(MenubarSubTrigger.displayName).toBe('MenubarSubTrigger');
  });

  it('exports MenubarGroup component', () => {
    expect(MenubarGroup).toBeDefined();
  });

  it('exports MenubarSub component', () => {
    expect(MenubarSub).toBeDefined();
  });
});

describe('MenubarShortcut', () => {
  it('renders shortcut text', () => {
    render(<MenubarShortcut data-testid="shortcut">⌘N</MenubarShortcut>);

    expect(screen.getByTestId('shortcut')).toBeInTheDocument();
    expect(screen.getByText('⌘N')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <MenubarShortcut className="custom-shortcut" data-testid="shortcut">
        ⌘O
      </MenubarShortcut>
    );

    expect(screen.getByTestId('shortcut')).toHaveClass('custom-shortcut');
  });
});
