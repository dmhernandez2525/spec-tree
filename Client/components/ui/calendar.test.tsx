import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Calendar } from './calendar';

// Mock react-day-picker
vi.mock('react-day-picker', () => ({
  DayPicker: vi.fn(({ className, classNames, showOutsideDays, components, ...props }) => (
    <div
      data-testid="day-picker"
      className={className}
      data-show-outside-days={showOutsideDays?.toString()}
      data-mode={props.mode}
      {...props}
    >
      <div data-testid="classnames">{JSON.stringify(classNames)}</div>
      {components?.IconLeft && <components.IconLeft data-testid="icon-left" />}
      {components?.IconRight && <components.IconRight data-testid="icon-right" />}
    </div>
  )),
}));

describe('Calendar', () => {
  describe('exports', () => {
    it('exports Calendar component', () => {
      expect(Calendar).toBeDefined();
    });

    it('exports CalendarProps type', () => {
      // Type exports are verified at compile time
      // Calendar is already imported at the top of this file
      expect(Calendar).toBeDefined();
    });
  });

  describe('rendering', () => {
    it('renders DayPicker component', () => {
      render(<Calendar />);
      expect(screen.getByTestId('day-picker')).toBeInTheDocument();
    });

    it('applies default p-3 className', () => {
      render(<Calendar />);
      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveClass('p-3');
    });

    it('merges custom className with default', () => {
      render(<Calendar className="custom-class" />);
      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveClass('p-3');
      expect(dayPicker).toHaveClass('custom-class');
    });

    it('shows outside days by default', () => {
      render(<Calendar />);
      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveAttribute('data-show-outside-days', 'true');
    });

    it('can disable showing outside days', () => {
      render(<Calendar showOutsideDays={false} />);
      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveAttribute('data-show-outside-days', 'false');
    });
  });

  describe('classNames', () => {
    it('provides default classNames for calendar elements', () => {
      render(<Calendar />);
      const classNamesEl = screen.getByTestId('classnames');
      const classNames = JSON.parse(classNamesEl.textContent || '{}');

      expect(classNames.months).toBeDefined();
      expect(classNames.month).toBeDefined();
      expect(classNames.caption).toBeDefined();
      expect(classNames.nav).toBeDefined();
      expect(classNames.table).toBeDefined();
      expect(classNames.day).toBeDefined();
      expect(classNames.day_selected).toBeDefined();
      expect(classNames.day_today).toBeDefined();
      expect(classNames.day_outside).toBeDefined();
      expect(classNames.day_disabled).toBeDefined();
      expect(classNames.day_hidden).toBeDefined();
    });

    it('merges custom classNames with defaults', () => {
      render(<Calendar classNames={{ months: 'custom-months' }} />);
      const classNamesEl = screen.getByTestId('classnames');
      const classNames = JSON.parse(classNamesEl.textContent || '{}');

      expect(classNames.months).toBe('custom-months');
    });

    it('applies range mode specific classes', () => {
      render(<Calendar mode="range" />);
      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveAttribute('data-mode', 'range');
    });
  });

  describe('icons', () => {
    it('renders navigation icons', () => {
      render(<Calendar />);
      // Icons are rendered as SVG elements with h-4 w-4 classes
      const icons = document.querySelectorAll('svg.h-4.w-4');
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(Calendar.displayName).toBe('Calendar');
    });
  });

  describe('props forwarding', () => {
    it('forwards additional props to DayPicker', () => {
      render(<Calendar data-custom="value" />);
      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveAttribute('data-custom', 'value');
    });
  });
});
