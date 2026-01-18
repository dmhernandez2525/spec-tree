import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, badgeVariants } from './badge';

describe('Badge', () => {
  it('renders a badge with text', () => {
    render(<Badge>Test Badge</Badge>);

    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<Badge>Default</Badge>);

    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-primary');
    expect(badge).toHaveClass('text-primary-foreground');
  });

  it('applies secondary variant styles', () => {
    render(<Badge variant="secondary">Secondary</Badge>);

    const badge = screen.getByText('Secondary');
    expect(badge).toHaveClass('bg-secondary');
    expect(badge).toHaveClass('text-secondary-foreground');
  });

  it('applies destructive variant styles', () => {
    render(<Badge variant="destructive">Destructive</Badge>);

    const badge = screen.getByText('Destructive');
    expect(badge).toHaveClass('bg-destructive');
    expect(badge).toHaveClass('text-destructive-foreground');
  });

  it('applies outline variant styles', () => {
    render(<Badge variant="outline">Outline</Badge>);

    const badge = screen.getByText('Outline');
    expect(badge).toHaveClass('text-foreground');
  });

  it('accepts custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);

    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-class');
  });

  it('renders as a div element', () => {
    render(<Badge data-testid="badge">Badge</Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge.tagName.toLowerCase()).toBe('div');
  });

  it('passes through other HTML attributes', () => {
    render(
      <Badge data-testid="test-badge" role="status">
        Status Badge
      </Badge>
    );

    const badge = screen.getByTestId('test-badge');
    expect(badge).toHaveAttribute('role', 'status');
  });

  it('has base styles', () => {
    render(<Badge>Base</Badge>);

    const badge = screen.getByText('Base');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('rounded-md');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-semibold');
  });

  it('badgeVariants function returns correct classes', () => {
    const defaultClasses = badgeVariants();
    expect(defaultClasses).toContain('bg-primary');

    const destructiveClasses = badgeVariants({ variant: 'destructive' });
    expect(destructiveClasses).toContain('bg-destructive');
  });
});
