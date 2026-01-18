import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetOverlay,
  SheetPortal,
} from './sheet';

describe('Sheet exports', () => {
  it('exports Sheet component', () => {
    expect(Sheet).toBeDefined();
  });

  it('exports SheetTrigger component', () => {
    expect(SheetTrigger).toBeDefined();
  });

  it('exports SheetClose component', () => {
    expect(SheetClose).toBeDefined();
  });

  it('exports SheetPortal component', () => {
    expect(SheetPortal).toBeDefined();
  });

  it('exports SheetOverlay with displayName', () => {
    expect(SheetOverlay).toBeDefined();
    expect(SheetOverlay.displayName).toBe('DialogOverlay');
  });

  it('exports SheetContent with displayName', () => {
    expect(SheetContent).toBeDefined();
    expect(SheetContent.displayName).toBe('DialogContent');
  });

  it('exports SheetTitle with displayName', () => {
    expect(SheetTitle).toBeDefined();
    expect(SheetTitle.displayName).toBe('DialogTitle');
  });

  it('exports SheetDescription with displayName', () => {
    expect(SheetDescription).toBeDefined();
    expect(SheetDescription.displayName).toBe('DialogDescription');
  });
});

describe('SheetHeader', () => {
  it('renders with children', () => {
    render(
      <SheetHeader data-testid="header">
        <span>Header Content</span>
      </SheetHeader>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <SheetHeader className="custom-class" data-testid="header">
        Content
      </SheetHeader>
    );

    expect(screen.getByTestId('header')).toHaveClass('custom-class');
  });

  it('has correct displayName', () => {
    expect(SheetHeader.displayName).toBe('SheetHeader');
  });
});

describe('SheetFooter', () => {
  it('renders with children', () => {
    render(
      <SheetFooter data-testid="footer">
        <span>Footer Content</span>
      </SheetFooter>
    );

    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <SheetFooter className="custom-class" data-testid="footer">
        Content
      </SheetFooter>
    );

    expect(screen.getByTestId('footer')).toHaveClass('custom-class');
  });

  it('has correct displayName', () => {
    expect(SheetFooter.displayName).toBe('SheetFooter');
  });
});
