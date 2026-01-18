import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColorHeader } from './ColorHeader';

describe('ColorHeader', () => {
  it('renders the header text', () => {
    render(<ColorHeader header="Test Header" />);

    expect(screen.getByText('Test Header')).toBeInTheDocument();
  });

  it('applies default text color when not specified', () => {
    render(<ColorHeader header="Default Color" />);

    const span = screen.getByText('Default Color');
    expect(span).toHaveStyle({ color: 'black' });
  });

  it('applies custom text color when specified', () => {
    render(<ColorHeader header="Custom Color" textColor="red" />);

    const span = screen.getByText('Custom Color');
    expect(span).toHaveStyle({ color: 'red' });
  });

  it('applies custom style when provided', () => {
    render(<ColorHeader header="Styled Header" style={{ marginTop: '20px' }} />);

    const container = screen.getByText('Styled Header').parentElement;
    expect(container).toHaveStyle({ marginTop: '20px' });
  });

  it('applies dark mode class when dark prop is true', () => {
    render(<ColorHeader header="Dark Mode" dark />);

    const span = screen.getByText('Dark Mode');
    expect(span).toHaveClass('text-white');
  });

  it('does not apply dark mode class when dark prop is false', () => {
    render(<ColorHeader header="Light Mode" dark={false} />);

    const span = screen.getByText('Light Mode');
    expect(span).not.toHaveClass('text-white');
  });

  it('applies base styles to the header', () => {
    render(<ColorHeader header="Base Styles" />);

    const span = screen.getByText('Base Styles');
    expect(span).toHaveClass('text-2xl');
    expect(span).toHaveClass('font-bold');
  });

  it('renders container with correct flex layout', () => {
    render(<ColorHeader header="Flex Layout" />);

    const container = screen.getByText('Flex Layout').parentElement;
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('items-baseline');
    expect(container).toHaveClass('gap-2');
  });
});

describe('ColorHeader exports', () => {
  it('exports ColorHeader as a named export', () => {
    expect(ColorHeader).toBeDefined();
    expect(typeof ColorHeader).toBe('function');
  });
});
