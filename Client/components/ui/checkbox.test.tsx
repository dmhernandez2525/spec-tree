import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('renders a checkbox element', () => {
    render(<Checkbox data-testid="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveRole('checkbox');
  });

  it('applies default styles', () => {
    render(<Checkbox data-testid="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveClass('peer');
    expect(checkbox).toHaveClass('h-4');
    expect(checkbox).toHaveClass('w-4');
    expect(checkbox).toHaveClass('shrink-0');
    expect(checkbox).toHaveClass('rounded-sm');
    expect(checkbox).toHaveClass('border');
    expect(checkbox).toHaveClass('border-primary');
    expect(checkbox).toHaveClass('shadow');
  });

  it('accepts custom className', () => {
    render(<Checkbox data-testid="checkbox" className="custom-class" />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveClass('custom-class');
  });

  it('is unchecked by default', () => {
    render(<Checkbox data-testid="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  });

  it('can be checked by default', () => {
    render(<Checkbox data-testid="checkbox" defaultChecked />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('can be controlled', () => {
    render(<Checkbox data-testid="checkbox" checked={true} />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('handles check change', () => {
    const handleChange = vi.fn();
    render(<Checkbox data-testid="checkbox" onCheckedChange={handleChange} />);

    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('can be disabled', () => {
    render(<Checkbox data-testid="checkbox" disabled />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Checkbox ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(Checkbox.displayName).toBe('Checkbox');
  });

  it('passes through other props', () => {
    render(<Checkbox data-testid="checkbox" id="terms-checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('id', 'terms-checkbox');
  });

  it('can be used with a label', () => {
    render(
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" data-testid="checkbox" />
        <label htmlFor="terms">Accept terms</label>
      </div>
    );

    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });
});
