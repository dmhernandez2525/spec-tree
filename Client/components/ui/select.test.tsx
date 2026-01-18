import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';

describe('Select', () => {
  describe('exports', () => {
    it('exports Select component', () => {
      expect(Select).toBeDefined();
    });

    it('exports SelectTrigger component', () => {
      expect(SelectTrigger).toBeDefined();
    });

    it('exports SelectContent component', () => {
      expect(SelectContent).toBeDefined();
    });

    it('exports SelectItem component', () => {
      expect(SelectItem).toBeDefined();
    });

    it('exports SelectValue component', () => {
      expect(SelectValue).toBeDefined();
    });

    it('exports SelectGroup component', () => {
      expect(SelectGroup).toBeDefined();
    });

    it('exports SelectLabel component', () => {
      expect(SelectLabel).toBeDefined();
    });

    it('exports SelectSeparator component', () => {
      expect(SelectSeparator).toBeDefined();
    });

    it('exports SelectScrollUpButton component', () => {
      expect(SelectScrollUpButton).toBeDefined();
    });

    it('exports SelectScrollDownButton component', () => {
      expect(SelectScrollDownButton).toBeDefined();
    });
  });

  describe('displayNames', () => {
    it('SelectTrigger has correct displayName', () => {
      expect(SelectTrigger.displayName).toBe('SelectTrigger');
    });

    it('SelectContent has correct displayName', () => {
      expect(SelectContent.displayName).toBe('SelectContent');
    });

    it('SelectItem has correct displayName', () => {
      expect(SelectItem.displayName).toBe('SelectItem');
    });

    it('SelectLabel has correct displayName', () => {
      expect(SelectLabel.displayName).toBe('SelectLabel');
    });

    it('SelectSeparator has correct displayName', () => {
      expect(SelectSeparator.displayName).toBe('SelectSeparator');
    });

    it('SelectScrollUpButton has correct displayName', () => {
      expect(SelectScrollUpButton.displayName).toBe('SelectScrollUpButton');
    });

    it('SelectScrollDownButton has correct displayName', () => {
      expect(SelectScrollDownButton.displayName).toBe('SelectScrollDownButton');
    });
  });

  describe('SelectTrigger', () => {
    it('renders a button', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName.toLowerCase()).toBe('button');
    });

    it('displays placeholder text', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('applies default className', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('flex');
      expect(trigger).toHaveClass('h-9');
      expect(trigger).toHaveClass('w-full');
      expect(trigger).toHaveClass('items-center');
      expect(trigger).toHaveClass('justify-between');
    });

    it('merges custom className', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger" data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('custom-trigger');
      expect(trigger).toHaveClass('flex');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Select>
          <SelectTrigger ref={ref}>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('can be disabled', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeDisabled();
    });
  });

  describe('component types', () => {
    it('Select is a function component', () => {
      expect(typeof Select).toBe('function');
    });

    it('SelectTrigger is a forwardRef component', () => {
      expect(typeof SelectTrigger).toBe('object');
      expect(SelectTrigger.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('SelectContent is a forwardRef component', () => {
      expect(typeof SelectContent).toBe('object');
      expect(SelectContent.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('SelectItem is a forwardRef component', () => {
      expect(typeof SelectItem).toBe('object');
      expect(SelectItem.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('SelectLabel is a forwardRef component', () => {
      expect(typeof SelectLabel).toBe('object');
      expect(SelectLabel.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('SelectSeparator is a forwardRef component', () => {
      expect(typeof SelectSeparator).toBe('object');
      expect(SelectSeparator.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('SelectScrollUpButton is a forwardRef component', () => {
      expect(typeof SelectScrollUpButton).toBe('object');
      expect(SelectScrollUpButton.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('SelectScrollDownButton is a forwardRef component', () => {
      expect(typeof SelectScrollDownButton).toBe('object');
      expect(SelectScrollDownButton.$$typeof?.toString()).toContain('react.forward_ref');
    });
  });
});
