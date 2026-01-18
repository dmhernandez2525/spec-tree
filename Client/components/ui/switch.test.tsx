import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './switch';

describe('Switch', () => {
  it('renders a switch element', () => {
    render(<Switch data-testid="switch" />);

    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveRole('switch');
  });

  it('applies default styles', () => {
    render(<Switch data-testid="switch" />);

    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveClass('peer');
    expect(switchEl).toHaveClass('inline-flex');
    expect(switchEl).toHaveClass('h-5');
    expect(switchEl).toHaveClass('w-9');
    expect(switchEl).toHaveClass('shrink-0');
    expect(switchEl).toHaveClass('cursor-pointer');
    expect(switchEl).toHaveClass('rounded-full');
  });

  it('accepts custom className', () => {
    render(<Switch data-testid="switch" className="custom-class" />);

    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveClass('custom-class');
  });

  it('is unchecked by default', () => {
    render(<Switch data-testid="switch" />);

    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    expect(switchEl).toHaveAttribute('aria-checked', 'false');
  });

  it('can be checked by default', () => {
    render(<Switch data-testid="switch" defaultChecked />);

    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveAttribute('data-state', 'checked');
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
  });

  it('can be controlled', () => {
    render(<Switch data-testid="switch" checked={true} />);

    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveAttribute('data-state', 'checked');
  });

  it('handles check change', () => {
    const handleChange = vi.fn();
    render(<Switch data-testid="switch" onCheckedChange={handleChange} />);

    const switchEl = screen.getByTestId('switch');
    fireEvent.click(switchEl);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('can be disabled', () => {
    render(<Switch data-testid="switch" disabled />);

    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Switch ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(Switch.displayName).toBe('Switch');
  });

  it('passes through other props', () => {
    render(<Switch data-testid="switch" id="notifications-switch" />);

    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveAttribute('id', 'notifications-switch');
  });

  it('has a thumb element', () => {
    const { container } = render(<Switch data-testid="switch" />);

    const thumb = container.querySelector('[class*="rounded-full"][class*="bg-background"]');
    expect(thumb).toBeInTheDocument();
  });

  it('can be used with a label', () => {
    render(
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" data-testid="switch" />
        <label htmlFor="airplane-mode">Airplane Mode</label>
      </div>
    );

    expect(screen.getByTestId('switch')).toBeInTheDocument();
    expect(screen.getByText('Airplane Mode')).toBeInTheDocument();
  });

  it('toggles state on click', () => {
    render(<Switch data-testid="switch" />);

    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveAttribute('data-state', 'unchecked');

    fireEvent.click(switchEl);
    expect(switchEl).toHaveAttribute('data-state', 'checked');

    fireEvent.click(switchEl);
    expect(switchEl).toHaveAttribute('data-state', 'unchecked');
  });
});
