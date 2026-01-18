import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';

describe('AlertDialog exports', () => {
  it('exports AlertDialog component', () => {
    expect(AlertDialog).toBeDefined();
  });

  it('exports AlertDialogPortal component', () => {
    expect(AlertDialogPortal).toBeDefined();
  });

  it('exports AlertDialogTrigger component', () => {
    expect(AlertDialogTrigger).toBeDefined();
  });

  it('exports AlertDialogOverlay with displayName', () => {
    expect(AlertDialogOverlay).toBeDefined();
    expect(AlertDialogOverlay.displayName).toBe('AlertDialogOverlay');
  });

  it('exports AlertDialogContent with displayName', () => {
    expect(AlertDialogContent).toBeDefined();
    expect(AlertDialogContent.displayName).toBe('AlertDialogContent');
  });

  it('exports AlertDialogTitle with displayName', () => {
    expect(AlertDialogTitle).toBeDefined();
    expect(AlertDialogTitle.displayName).toBe('AlertDialogTitle');
  });

  it('exports AlertDialogDescription with displayName', () => {
    expect(AlertDialogDescription).toBeDefined();
    expect(AlertDialogDescription.displayName).toBe('AlertDialogDescription');
  });

  it('exports AlertDialogAction with displayName', () => {
    expect(AlertDialogAction).toBeDefined();
    expect(AlertDialogAction.displayName).toBe('AlertDialogAction');
  });

  it('exports AlertDialogCancel with displayName', () => {
    expect(AlertDialogCancel).toBeDefined();
    expect(AlertDialogCancel.displayName).toBe('AlertDialogCancel');
  });
});

describe('AlertDialogHeader', () => {
  it('renders with children', () => {
    render(
      <AlertDialogHeader data-testid="header">
        <span>Header Content</span>
      </AlertDialogHeader>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AlertDialogHeader className="custom-class" data-testid="header">
        Content
      </AlertDialogHeader>
    );

    expect(screen.getByTestId('header')).toHaveClass('custom-class');
  });

  it('has correct displayName', () => {
    expect(AlertDialogHeader.displayName).toBe('AlertDialogHeader');
  });
});

describe('AlertDialogFooter', () => {
  it('renders with children', () => {
    render(
      <AlertDialogFooter data-testid="footer">
        <span>Footer Content</span>
      </AlertDialogFooter>
    );

    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AlertDialogFooter className="custom-class" data-testid="footer">
        Content
      </AlertDialogFooter>
    );

    expect(screen.getByTestId('footer')).toHaveClass('custom-class');
  });

  it('has correct displayName', () => {
    expect(AlertDialogFooter.displayName).toBe('AlertDialogFooter');
  });
});
