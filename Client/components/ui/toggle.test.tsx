import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from './toggle';

describe('Toggle', () => {
  it('renders a toggle button', () => {
    render(<Toggle data-testid="toggle">Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    expect(toggle).toBeInTheDocument();
    expect(toggle.tagName.toLowerCase()).toBe('button');
  });

  it('applies default variant styles', () => {
    render(<Toggle data-testid="toggle">Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveClass('bg-transparent');
    expect(toggle).toHaveClass('inline-flex');
    expect(toggle).toHaveClass('items-center');
    expect(toggle).toHaveClass('justify-center');
    expect(toggle).toHaveClass('rounded-md');
  });

  it('applies outline variant styles', () => {
    render(<Toggle data-testid="toggle" variant="outline">Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveClass('border');
    expect(toggle).toHaveClass('border-input');
    expect(toggle).toHaveClass('shadow-sm');
  });

  it('applies default size styles', () => {
    render(<Toggle data-testid="toggle">Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveClass('h-9');
    expect(toggle).toHaveClass('px-3');
  });

  it('applies sm size styles', () => {
    render(<Toggle data-testid="toggle" size="sm">Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveClass('h-8');
    expect(toggle).toHaveClass('px-2');
  });

  it('applies lg size styles', () => {
    render(<Toggle data-testid="toggle" size="lg">Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveClass('h-10');
    expect(toggle).toHaveClass('px-3');
  });

  it('accepts custom className', () => {
    render(<Toggle data-testid="toggle" className="custom-class">Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveClass('custom-class');
  });

  it('is not pressed by default', () => {
    render(<Toggle data-testid="toggle">Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveAttribute('data-state', 'off');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('can be pressed by default', () => {
    render(<Toggle data-testid="toggle" defaultPressed>Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveAttribute('data-state', 'on');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('can be controlled', () => {
    render(<Toggle data-testid="toggle" pressed={true}>Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveAttribute('data-state', 'on');
  });

  it('handles press change', () => {
    const handleChange = vi.fn();
    render(<Toggle data-testid="toggle" onPressedChange={handleChange}>Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    fireEvent.click(toggle);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('can be disabled', () => {
    render(<Toggle data-testid="toggle" disabled>Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    expect(toggle).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Toggle ref={ref}>Toggle</Toggle>);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(Toggle.displayName).toBe('Toggle');
  });

  it('toggles state on click', () => {
    render(<Toggle data-testid="toggle">Toggle</Toggle>);

    const toggle = screen.getByTestId('toggle');
    expect(toggle).toHaveAttribute('data-state', 'off');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('data-state', 'on');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('data-state', 'off');
  });

  it('renders children correctly', () => {
    render(
      <Toggle data-testid="toggle">
        <span>Icon</span>
        Bold
      </Toggle>
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Bold')).toBeInTheDocument();
  });
});
