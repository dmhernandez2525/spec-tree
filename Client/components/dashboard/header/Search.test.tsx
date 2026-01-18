import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Search } from './Search';

export const searchTests = () => {
  it('renders search input with default placeholder', () => {
    render(<Search />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders search input with custom placeholder', () => {
    render(<Search placeholder="Search projects..." />);

    expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument();
  });

  it('renders search icon', () => {
    render(<Search />);

    const searchbox = screen.getByRole('searchbox');
    expect(searchbox.parentElement).toContainHTML('svg');
  });

  it('calls onSearch when input value changes', () => {
    const onSearch = vi.fn();
    render(<Search onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('updates input value when typing', () => {
    render(<Search />);

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(input.value).toBe('new value');
  });

  it('shows clear button when input has value', () => {
    render(<Search />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('does not show clear button when input is empty', () => {
    render(<Search />);

    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    const onSearch = vi.fn();
    render(<Search onSearch={onSearch} />);

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(input.value).toBe('');
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('has correct aria-label', () => {
    render(<Search />);

    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('handles multiple onSearch calls', () => {
    const onSearch = vi.fn();
    render(<Search onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'first' } });
    fireEvent.change(input, { target: { value: 'second' } });

    expect(onSearch).toHaveBeenCalledTimes(2);
    expect(onSearch).toHaveBeenNthCalledWith(1, 'first');
    expect(onSearch).toHaveBeenNthCalledWith(2, 'second');
  });

  it('works without onSearch callback', () => {
    render(<Search />);

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });

    expect(input.value).toBe('test');
  });
};

searchTests();
