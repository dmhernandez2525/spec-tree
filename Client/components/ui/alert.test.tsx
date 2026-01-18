import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert', () => {
  it('renders an alert element', () => {
    render(<Alert data-testid="alert">Alert content</Alert>);

    const alert = screen.getByTestId('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveRole('alert');
  });

  it('applies default variant styles', () => {
    render(<Alert data-testid="alert">Content</Alert>);

    const alert = screen.getByTestId('alert');
    expect(alert).toHaveClass('bg-background');
    expect(alert).toHaveClass('text-foreground');
  });

  it('applies destructive variant styles', () => {
    render(<Alert data-testid="alert" variant="destructive">Error content</Alert>);

    const alert = screen.getByTestId('alert');
    expect(alert).toHaveClass('border-destructive/50');
    expect(alert).toHaveClass('text-destructive');
  });

  it('applies base styles', () => {
    render(<Alert data-testid="alert">Content</Alert>);

    const alert = screen.getByTestId('alert');
    expect(alert).toHaveClass('relative');
    expect(alert).toHaveClass('w-full');
    expect(alert).toHaveClass('rounded-lg');
    expect(alert).toHaveClass('border');
    expect(alert).toHaveClass('px-4');
    expect(alert).toHaveClass('py-3');
    expect(alert).toHaveClass('text-sm');
  });

  it('accepts custom className', () => {
    render(<Alert data-testid="alert" className="custom-class">Content</Alert>);

    const alert = screen.getByTestId('alert');
    expect(alert).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Alert ref={ref}>Content</Alert>);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(Alert.displayName).toBe('Alert');
  });
});

describe('AlertTitle', () => {
  it('renders a title element', () => {
    render(<AlertTitle>Title</AlertTitle>);

    const title = screen.getByText('Title');
    expect(title).toBeInTheDocument();
    expect(title.tagName.toLowerCase()).toBe('h5');
  });

  it('applies default styles', () => {
    render(<AlertTitle data-testid="title">Title</AlertTitle>);

    const title = screen.getByTestId('title');
    expect(title).toHaveClass('mb-1');
    expect(title).toHaveClass('font-medium');
    expect(title).toHaveClass('leading-none');
    expect(title).toHaveClass('tracking-tight');
  });

  it('accepts custom className', () => {
    render(<AlertTitle data-testid="title" className="custom-class">Title</AlertTitle>);

    const title = screen.getByTestId('title');
    expect(title).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<AlertTitle ref={ref}>Title</AlertTitle>);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(AlertTitle.displayName).toBe('AlertTitle');
  });
});

describe('AlertDescription', () => {
  it('renders a description element', () => {
    render(<AlertDescription>Description text</AlertDescription>);

    const desc = screen.getByText('Description text');
    expect(desc).toBeInTheDocument();
    expect(desc.tagName.toLowerCase()).toBe('div');
  });

  it('applies default styles', () => {
    render(<AlertDescription data-testid="desc">Description</AlertDescription>);

    const desc = screen.getByTestId('desc');
    expect(desc).toHaveClass('text-sm');
  });

  it('accepts custom className', () => {
    render(<AlertDescription data-testid="desc" className="custom-class">Description</AlertDescription>);

    const desc = screen.getByTestId('desc');
    expect(desc).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<AlertDescription ref={ref}>Description</AlertDescription>);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(AlertDescription.displayName).toBe('AlertDescription');
  });
});

describe('Alert composition', () => {
  it('renders a complete alert with title and description', () => {
    render(
      <Alert data-testid="alert">
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the cli.
        </AlertDescription>
      </Alert>
    );

    expect(screen.getByTestId('alert')).toBeInTheDocument();
    expect(screen.getByText('Heads up!')).toBeInTheDocument();
    expect(screen.getByText(/You can add components/)).toBeInTheDocument();
  });

  it('renders a destructive alert', () => {
    render(
      <Alert data-testid="alert" variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again.
        </AlertDescription>
      </Alert>
    );

    const alert = screen.getByTestId('alert');
    expect(alert).toHaveClass('text-destructive');
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
