import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from './dialog';

describe('Dialog', () => {
  it('renders dialog trigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>
    );

    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Title</DialogTitle>
          <DialogDescription>Test Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByText('Open Dialog'));
    expect(await screen.findByText('Test Title')).toBeInTheDocument();
  });
});

describe('DialogHeader', () => {
  it('renders with children', () => {
    render(
      <DialogHeader data-testid="header">
        <span>Header Content</span>
      </DialogHeader>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <DialogHeader className="custom-class" data-testid="header">
        Content
      </DialogHeader>
    );

    expect(screen.getByTestId('header')).toHaveClass('custom-class');
  });

  it('has correct displayName', () => {
    expect(DialogHeader.displayName).toBe('DialogHeader');
  });
});

describe('DialogFooter', () => {
  it('renders with children', () => {
    render(
      <DialogFooter data-testid="footer">
        <span>Footer Content</span>
      </DialogFooter>
    );

    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <DialogFooter className="custom-class" data-testid="footer">
        Content
      </DialogFooter>
    );

    expect(screen.getByTestId('footer')).toHaveClass('custom-class');
  });

  it('has correct displayName', () => {
    expect(DialogFooter.displayName).toBe('DialogFooter');
  });
});

describe('DialogTitle', () => {
  it('has correct displayName', () => {
    expect(DialogTitle.displayName).toBe('DialogTitle');
  });
});

describe('DialogDescription', () => {
  it('has correct displayName', () => {
    expect(DialogDescription.displayName).toBe('DialogDescription');
  });
});

describe('DialogContent', () => {
  it('has correct displayName', () => {
    expect(DialogContent.displayName).toBe('DialogContent');
  });
});

describe('DialogOverlay', () => {
  it('has correct displayName', () => {
    expect(DialogOverlay.displayName).toBe('DialogOverlay');
  });
});

describe('Dialog exports', () => {
  it('exports all components', () => {
    expect(Dialog).toBeDefined();
    expect(DialogTrigger).toBeDefined();
    expect(DialogContent).toBeDefined();
    expect(DialogHeader).toBeDefined();
    expect(DialogFooter).toBeDefined();
    expect(DialogTitle).toBeDefined();
    expect(DialogDescription).toBeDefined();
    expect(DialogClose).toBeDefined();
    expect(DialogOverlay).toBeDefined();
    expect(DialogPortal).toBeDefined();
  });
});
