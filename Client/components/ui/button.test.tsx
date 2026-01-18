import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, buttonVariants } from './button';

describe('Button', () => {
  it('renders a button element by default', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<Button>Default</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('applies destructive variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('applies outline variant styles', () => {
    render(<Button variant="outline">Outline</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('bg-background');
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });

  it('applies ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('applies link variant styles', () => {
    render(<Button variant="link">Link</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('underline-offset-4');
  });

  it('applies small size styles', () => {
    render(<Button size="sm">Small</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8');
    expect(button).toHaveClass('text-xs');
  });

  it('applies large size styles', () => {
    render(<Button size="lg">Large</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('px-8');
  });

  it('applies icon size styles', () => {
    render(<Button size="icon">Icon</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-9');
    expect(button).toHaveClass('w-9');
  });

  it('renders as child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('accepts custom className', () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref to button element', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref Button</Button>);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(Button.displayName).toBe('Button');
  });

  it('buttonVariants function returns correct classes', () => {
    const defaultClasses = buttonVariants();
    expect(defaultClasses).toContain('bg-primary');
    expect(defaultClasses).toContain('h-9');

    const destructiveClasses = buttonVariants({ variant: 'destructive', size: 'lg' });
    expect(destructiveClasses).toContain('bg-destructive');
    expect(destructiveClasses).toContain('h-10');
  });
});
