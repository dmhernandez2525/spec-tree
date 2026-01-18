import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName.toLowerCase()).toBe('textarea');
  });

  it('applies default styles', () => {
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('flex');
    expect(textarea).toHaveClass('min-h-[60px]');
    expect(textarea).toHaveClass('w-full');
    expect(textarea).toHaveClass('rounded-md');
    expect(textarea).toHaveClass('border');
  });

  it('accepts custom className', () => {
    render(<Textarea data-testid="textarea" className="custom-class" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Textarea ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(Textarea.displayName).toBe('Textarea');
  });

  it('accepts placeholder prop', () => {
    render(<Textarea placeholder="Enter text here..." />);

    expect(screen.getByPlaceholderText('Enter text here...')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Textarea data-testid="textarea" onChange={handleChange} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'test content' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<Textarea data-testid="textarea" disabled />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:opacity-50');
    expect(textarea).toHaveClass('disabled:cursor-not-allowed');
  });

  it('handles controlled value', () => {
    render(<Textarea data-testid="textarea" value="controlled content" readOnly />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveValue('controlled content');
  });

  it('passes through other HTML attributes', () => {
    render(
      <Textarea
        data-testid="textarea"
        name="message"
        rows={5}
        maxLength={500}
      />
    );

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('name', 'message');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('maxlength', '500');
  });

  it('supports multiline text', () => {
    const multilineText = 'Line 1\nLine 2\nLine 3';
    render(<Textarea data-testid="textarea" value={multilineText} readOnly />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveValue(multilineText);
  });
});
