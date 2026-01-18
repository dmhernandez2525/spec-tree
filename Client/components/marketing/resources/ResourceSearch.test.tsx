import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResourceSearch } from './ResourceSearch';

describe('ResourceSearch', () => {
  it('renders the search input', () => {
    render(<ResourceSearch value="" onChange={() => {}} />);

    const input = screen.getByRole('searchbox');
    expect(input).toBeInTheDocument();
  });

  it('displays the placeholder text', () => {
    render(<ResourceSearch value="" onChange={() => {}} />);

    const input = screen.getByPlaceholderText('Search resources...');
    expect(input).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<ResourceSearch value="test query" onChange={() => {}} />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('test query');
  });

  it('calls onChange when input value changes', () => {
    const handleChange = vi.fn();
    render(<ResourceSearch value="" onChange={handleChange} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'new search' } });

    expect(handleChange).toHaveBeenCalledWith('new search');
  });

  it('renders with search icon', () => {
    const { container } = render(<ResourceSearch value="" onChange={() => {}} />);

    // Search icon should be rendered as SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies correct input styling', () => {
    render(<ResourceSearch value="" onChange={() => {}} />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveClass('pl-10');
  });

  it('renders search icon with correct positioning', () => {
    const { container } = render(<ResourceSearch value="" onChange={() => {}} />);

    const iconContainer = container.querySelector('.absolute');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('left-3');
    expect(iconContainer).toHaveClass('top-1/2');
    expect(iconContainer).toHaveClass('-translate-y-1/2');
  });

  it('renders search icon with muted foreground color', () => {
    const { container } = render(<ResourceSearch value="" onChange={() => {}} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-muted-foreground');
  });

  it('has type="search" on the input', () => {
    render(<ResourceSearch value="" onChange={() => {}} />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('type', 'search');
  });

  it('handles empty string input', () => {
    const handleChange = vi.fn();
    render(<ResourceSearch value="existing" onChange={handleChange} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: '' } });

    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('handles special characters in search', () => {
    const handleChange = vi.fn();
    render(<ResourceSearch value="" onChange={handleChange} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'search & filter <test>' } });

    expect(handleChange).toHaveBeenCalledWith('search & filter <test>');
  });
});

describe('ResourceSearch exports', () => {
  it('exports ResourceSearch as a named export', () => {
    expect(ResourceSearch).toBeDefined();
    expect(typeof ResourceSearch).toBe('function');
  });
});
