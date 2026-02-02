/**
 * Tests for FilterPanel component
 *
 * F1.1.20 - Search and filter
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel, FilterConfig } from './FilterPanel';

// Default filter config
const defaultFilters: FilterConfig = {
  types: ['epic', 'feature', 'userStory', 'task'],
  caseSensitive: false,
  titlesOnly: false,
};

describe('FilterPanel', () => {
  describe('rendering', () => {
    it('renders filter button', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
        />
      );

      // Should have a button with filter icon
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows active filter count when provided', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          activeFilterCount={3}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('opens sheet when button is clicked', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      // Sheet should open with title
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  describe('type filters', () => {
    it('shows all type options', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByText('Epics')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('User Stories')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    it('calls onFiltersChange when type is toggled', () => {
      const onFiltersChange = vi.fn();
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={onFiltersChange}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      // Click on Epics checkbox
      const epicCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(epicCheckbox);

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          types: expect.not.arrayContaining(['epic']),
        })
      );
    });
  });

  describe('search options', () => {
    it('shows case sensitive option', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByText('Case Sensitive')).toBeInTheDocument();
    });

    it('shows titles only option', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByText('Titles Only')).toBeInTheDocument();
    });
  });

  describe('reset', () => {
    it('has reset button', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByText('Reset Filters')).toBeInTheDocument();
    });

    it('calls onFiltersChange with default values when reset', () => {
      const onFiltersChange = vi.fn();
      render(
        <FilterPanel
          filters={{
            types: ['epic'],
            caseSensitive: true,
            titlesOnly: true,
          }}
          onFiltersChange={onFiltersChange}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Reset Filters'));

      expect(onFiltersChange).toHaveBeenCalledWith({
        types: ['epic', 'feature', 'userStory', 'task'],
        caseSensitive: false,
        titlesOnly: false,
      });
    });
  });

  describe('select all / clear', () => {
    it('has Select All button', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('has Clear button', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });
});
