import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScrollableCode from './ScrollableCode';

describe('ScrollableCode', () => {
  it('renders the code content', () => {
    render(<ScrollableCode content="const x = 1;" />);

    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('renders with pre and code elements', () => {
    const { container } = render(<ScrollableCode content="test code" />);

    const pre = container.querySelector('pre');
    const code = container.querySelector('code');

    expect(pre).toBeInTheDocument();
    expect(code).toBeInTheDocument();
  });

  it('applies container styles', () => {
    const { container } = render(<ScrollableCode content="test" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('relative');
  });

  it('applies pre element styles', () => {
    const { container } = render(<ScrollableCode content="test" />);

    const pre = container.querySelector('pre');
    expect(pre).toHaveClass('max-h-[300px]');
    expect(pre).toHaveClass('overflow-auto');
    expect(pre).toHaveClass('rounded-lg');
    expect(pre).toHaveClass('bg-muted');
    expect(pre).toHaveClass('p-4');
    expect(pre).toHaveClass('font-mono');
    expect(pre).toHaveClass('text-sm');
  });

  it('applies code element styles', () => {
    const { container } = render(<ScrollableCode content="test" />);

    const code = container.querySelector('code');
    expect(code).toHaveClass('block');
    expect(code).toHaveClass('whitespace-pre');
    expect(code).toHaveClass('overflow-x-auto');
    expect(code).toHaveClass('text-muted-foreground');
  });

  it('renders multiline code content', () => {
    const multilineCode = `function hello() {
  console.log('Hello');
  return true;
}`;
    render(<ScrollableCode content={multilineCode} />);

    expect(screen.getByText(/function hello/)).toBeInTheDocument();
  });

  it('renders empty content without error', () => {
    const { container } = render(<ScrollableCode content="" />);

    const code = container.querySelector('code');
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toBe('');
  });

  it('renders special characters in code', () => {
    const codeWithSpecialChars = '<div className="test">{"value"}</div>';
    render(<ScrollableCode content={codeWithSpecialChars} />);

    expect(screen.getByText(codeWithSpecialChars)).toBeInTheDocument();
  });
});

describe('ScrollableCode exports', () => {
  it('exports ScrollableCode as default export', () => {
    expect(ScrollableCode).toBeDefined();
    expect(typeof ScrollableCode).toBe('function');
  });
});
