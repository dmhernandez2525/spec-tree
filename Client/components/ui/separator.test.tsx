import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from './separator';

describe('Separator', () => {
  it('renders a separator element', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
  });

  it('applies horizontal orientation by default', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('h-[1px]');
    expect(separator).toHaveClass('w-full');
  });

  it('applies vertical orientation when specified', () => {
    render(<Separator data-testid="separator" orientation="vertical" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('h-full');
    expect(separator).toHaveClass('w-[1px]');
  });

  it('applies default styles', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('shrink-0');
    expect(separator).toHaveClass('bg-border');
  });

  it('accepts custom className', () => {
    render(<Separator data-testid="separator" className="my-4 custom-class" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('my-4');
    expect(separator).toHaveClass('custom-class');
  });

  it('is decorative by default', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Separator ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('can be used as a horizontal divider', () => {
    render(
      <div>
        <p>Content above</p>
        <Separator data-testid="separator" />
        <p>Content below</p>
      </div>
    );

    expect(screen.getByTestId('separator')).toBeInTheDocument();
    expect(screen.getByText('Content above')).toBeInTheDocument();
    expect(screen.getByText('Content below')).toBeInTheDocument();
  });

  it('can be used as a vertical divider', () => {
    render(
      <div className="flex">
        <span>Left</span>
        <Separator data-testid="separator" orientation="vertical" />
        <span>Right</span>
      </div>
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });
});
