import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input data-testid="input" />);

    expect(screen.getByTestId('input').tagName.toLowerCase()).toBe('input');
  });

  it('applies default styles', () => {
    render(<Input data-testid="input" />);

    const input = screen.getByTestId('input');
    expect(input).toHaveClass('flex');
    expect(input).toHaveClass('h-9');
    expect(input).toHaveClass('w-full');
    expect(input).toHaveClass('rounded-md');
    expect(input).toHaveClass('border');
  });

  it('accepts custom className', () => {
    render(<Input data-testid="input" className="custom-class" />);

    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-class');
  });

  it('forwards ref to input element', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(Input.displayName).toBe('Input');
  });

  it('accepts type prop', () => {
    render(<Input data-testid="input" type="email" />);

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('accepts placeholder prop', () => {
    render(<Input placeholder="Enter text..." />);

    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input data-testid="input" onChange={handleChange} />);

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<Input data-testid="input" disabled />);

    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
    expect(input).toHaveClass('disabled:cursor-not-allowed');
  });

  it('handles controlled value', () => {
    render(<Input data-testid="input" value="controlled value" readOnly />);

    const input = screen.getByTestId('input');
    expect(input).toHaveValue('controlled value');
  });

  it('supports password type', () => {
    render(<Input data-testid="input" type="password" />);

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('supports number type', () => {
    render(<Input data-testid="input" type="number" />);

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('passes through other HTML attributes', () => {
    render(
      <Input
        data-testid="input"
        name="test-input"
        autoComplete="off"
        maxLength={50}
      />
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('name', 'test-input');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('maxlength', '50');
  });
});
