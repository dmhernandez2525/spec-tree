import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('renders a label element', () => {
    render(<Label>Test Label</Label>);

    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label.tagName.toLowerCase()).toBe('label');
  });

  it('applies default styles', () => {
    render(<Label data-testid="label">Test</Label>);

    const label = screen.getByTestId('label');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
    expect(label).toHaveClass('leading-none');
  });

  it('accepts custom className', () => {
    render(<Label data-testid="label" className="custom-class">Test</Label>);

    const label = screen.getByTestId('label');
    expect(label).toHaveClass('custom-class');
  });

  it('accepts htmlFor prop', () => {
    render(<Label htmlFor="input-id">Test</Label>);

    const label = screen.getByText('Test');
    expect(label).toHaveAttribute('for', 'input-id');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Label ref={ref}>Test</Label>);

    expect(ref).toHaveBeenCalled();
  });

  it('passes through other HTML attributes', () => {
    render(
      <Label data-testid="label" id="my-label" title="Label title">
        Test
      </Label>
    );

    const label = screen.getByTestId('label');
    expect(label).toHaveAttribute('id', 'my-label');
    expect(label).toHaveAttribute('title', 'Label title');
  });

  it('can associate with an input element', () => {
    render(
      <div>
        <Label htmlFor="test-input">Input Label</Label>
        <input id="test-input" type="text" />
      </div>
    );

    const label = screen.getByText('Input Label');
    const input = screen.getByRole('textbox');

    expect(label).toHaveAttribute('for', 'test-input');
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('has peer-disabled styles for associated disabled inputs', () => {
    render(<Label data-testid="label">Test</Label>);

    const label = screen.getByTestId('label');
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed');
    expect(label).toHaveClass('peer-disabled:opacity-70');
  });

  it('renders children correctly', () => {
    render(
      <Label>
        <span>Child element</span>
      </Label>
    );

    expect(screen.getByText('Child element')).toBeInTheDocument();
  });
});
