import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingToggle } from './PricingToggle';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: { children: React.ReactNode }) => <span {...props}>{children}</span>,
  },
}));

describe('PricingToggle', () => {
  it('can be imported', () => {
    expect(PricingToggle).toBeDefined();
    expect(typeof PricingToggle).toBe('function');
  });

  it('renders Monthly label', () => {
    render(<PricingToggle isAnnual={false} onToggle={vi.fn()} />);

    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });

  it('renders Annual label', () => {
    render(<PricingToggle isAnnual={false} onToggle={vi.fn()} />);

    expect(screen.getByText('Annual')).toBeInTheDocument();
  });

  it('renders savings badge', () => {
    render(<PricingToggle isAnnual={false} onToggle={vi.fn()} />);

    expect(screen.getByText('Save up to 20%')).toBeInTheDocument();
  });

  it('renders switch element', () => {
    render(<PricingToggle isAnnual={false} onToggle={vi.fn()} />);

    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('switch is not checked when isAnnual is false', () => {
    render(<PricingToggle isAnnual={false} onToggle={vi.fn()} />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('switch is checked when isAnnual is true', () => {
    render(<PricingToggle isAnnual={true} onToggle={vi.fn()} />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onToggle when switch is clicked', () => {
    const onToggle = vi.fn();
    render(<PricingToggle isAnnual={false} onToggle={onToggle} />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('Monthly label has muted style when isAnnual is true', () => {
    render(<PricingToggle isAnnual={true} onToggle={vi.fn()} />);

    const labels = screen.getAllByText('Monthly');
    const monthlyLabel = labels[0];
    expect(monthlyLabel).toHaveClass('text-muted-foreground');
  });

  it('Annual label has muted style when isAnnual is false', () => {
    render(<PricingToggle isAnnual={false} onToggle={vi.fn()} />);

    const labels = screen.getAllByText('Annual');
    const annualLabel = labels[0];
    expect(annualLabel).toHaveClass('text-muted-foreground');
  });
});
