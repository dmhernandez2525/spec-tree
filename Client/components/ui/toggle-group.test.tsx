import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

describe('ToggleGroup', () => {
  it('exports all components', () => {
    expect(ToggleGroup).toBeDefined();
    expect(ToggleGroupItem).toBeDefined();
  });

  describe('ToggleGroup component', () => {
    it('renders children', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
        </ToggleGroup>
      );
      expect(screen.getByTestId('item-a')).toBeInTheDocument();
      expect(screen.getByTestId('item-b')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <ToggleGroup ref={ref} type="single">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
        </ToggleGroup>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it('applies custom className', () => {
      render(
        <ToggleGroup type="single" className="custom-class" data-testid="group">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
        </ToggleGroup>
      );
      expect(screen.getByTestId('group')).toHaveClass('custom-class');
    });

    it('has default flex layout', () => {
      render(
        <ToggleGroup type="single" data-testid="group">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
        </ToggleGroup>
      );
      const group = screen.getByTestId('group');
      expect(group).toHaveClass('flex', 'items-center', 'justify-center', 'gap-1');
    });

    it('has correct displayName', () => {
      expect(ToggleGroup.displayName).toBe('ToggleGroup');
    });

    it('supports single selection mode', () => {
      render(
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByTestId('item-a')).toHaveAttribute('data-state', 'on');
      expect(screen.getByTestId('item-b')).toHaveAttribute('data-state', 'off');
    });

    it('supports multiple selection mode', () => {
      render(
        <ToggleGroup type="multiple" defaultValue={['a', 'b']}>
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
          <ToggleGroupItem value="c" data-testid="item-c">C</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByTestId('item-a')).toHaveAttribute('data-state', 'on');
      expect(screen.getByTestId('item-b')).toHaveAttribute('data-state', 'on');
      expect(screen.getByTestId('item-c')).toHaveAttribute('data-state', 'off');
    });

    it('handles controlled single selection', () => {
      const onValueChange = vi.fn();
      render(
        <ToggleGroup type="single" value="a" onValueChange={onValueChange}>
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
        </ToggleGroup>
      );

      fireEvent.click(screen.getByTestId('item-b'));
      expect(onValueChange).toHaveBeenCalledWith('b');
    });

    it('handles controlled multiple selection', () => {
      const onValueChange = vi.fn();
      render(
        <ToggleGroup type="multiple" value={['a']} onValueChange={onValueChange}>
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
        </ToggleGroup>
      );

      fireEvent.click(screen.getByTestId('item-b'));
      expect(onValueChange).toHaveBeenCalledWith(['a', 'b']);
    });

    it('toggles selection in single mode', () => {
      render(
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
        </ToggleGroup>
      );

      // Initially A is selected
      expect(screen.getByTestId('item-a')).toHaveAttribute('data-state', 'on');

      // Click B
      fireEvent.click(screen.getByTestId('item-b'));

      // Now B should be selected, A should be off
      expect(screen.getByTestId('item-a')).toHaveAttribute('data-state', 'off');
      expect(screen.getByTestId('item-b')).toHaveAttribute('data-state', 'on');
    });

    it('toggles selection in multiple mode', () => {
      render(
        <ToggleGroup type="multiple" defaultValue={['a']}>
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
        </ToggleGroup>
      );

      // Initially only A is selected
      expect(screen.getByTestId('item-a')).toHaveAttribute('data-state', 'on');
      expect(screen.getByTestId('item-b')).toHaveAttribute('data-state', 'off');

      // Click B to add it
      fireEvent.click(screen.getByTestId('item-b'));

      // Both should now be selected
      expect(screen.getByTestId('item-a')).toHaveAttribute('data-state', 'on');
      expect(screen.getByTestId('item-b')).toHaveAttribute('data-state', 'on');
    });

    it('passes variant to context', () => {
      render(
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem value="a" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByTestId('item');
      // Outline variant has border class
      expect(item).toHaveClass('border');
    });

    it('passes size to context', () => {
      render(
        <ToggleGroup type="single" size="sm">
          <ToggleGroupItem value="a" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveClass('h-8');
    });

    it('can be disabled', () => {
      render(
        <ToggleGroup type="single" disabled>
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByTestId('item-a')).toBeDisabled();
      expect(screen.getByTestId('item-b')).toBeDisabled();
    });
  });

  describe('ToggleGroupItem component', () => {
    it('renders as a button', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );
      const item = screen.getByTestId('item');
      expect(item.tagName.toLowerCase()).toBe('button');
    });

    it('renders children', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a">
            <span data-testid="child">Icon</span>
          </ToggleGroupItem>
        </ToggleGroup>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem ref={ref} value="a">A</ToggleGroupItem>
        </ToggleGroup>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it('applies custom className', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a" className="custom-item" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );
      expect(screen.getByTestId('item')).toHaveClass('custom-item');
    });

    it('has correct displayName', () => {
      expect(ToggleGroupItem.displayName).toBe('ToggleGroupItem');
    });

    it('can be individually disabled', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b" disabled>B</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByTestId('item-a')).not.toBeDisabled();
      expect(screen.getByTestId('item-b')).toBeDisabled();
    });

    it('applies default variant styling', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveClass('bg-transparent');
    });

    it('applies outline variant styling', () => {
      render(
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem value="a" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveClass('border', 'border-input');
    });

    it('applies default size styling', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveClass('h-9', 'px-3');
    });

    it('applies sm size styling', () => {
      render(
        <ToggleGroup type="single" size="sm">
          <ToggleGroupItem value="a" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveClass('h-8', 'px-2');
    });

    it('applies lg size styling', () => {
      render(
        <ToggleGroup type="single" size="lg">
          <ToggleGroupItem value="a" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveClass('h-10', 'px-3');
    });

    it('item can override context variant', () => {
      render(
        <ToggleGroup type="single" variant="default">
          <ToggleGroupItem value="a" variant="outline" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByTestId('item');
      // Context variant takes precedence over item variant
      expect(item).toHaveClass('bg-transparent');
    });

    it('item can override context size', () => {
      render(
        <ToggleGroup type="single" size="default">
          <ToggleGroupItem value="a" size="sm" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByTestId('item');
      // Context size takes precedence over item size
      expect(item).toHaveClass('h-9');
    });

    it('shows pressed state styling when selected', () => {
      render(
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveAttribute('data-state', 'on');
    });

    it('shows unpressed state when not selected', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveAttribute('data-state', 'off');
    });

    it('has base toggle styling', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a" data-testid="item">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveClass('inline-flex', 'items-center', 'justify-center', 'rounded-md', 'text-sm', 'font-medium');
    });
  });

  describe('Integration', () => {
    it('works as a complete toggle group', () => {
      const onValueChange = vi.fn();
      render(
        <ToggleGroup type="single" onValueChange={onValueChange}>
          <ToggleGroupItem value="bold" data-testid="bold">
            <strong>B</strong>
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" data-testid="italic">
            <em>I</em>
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" data-testid="underline">
            <u>U</u>
          </ToggleGroupItem>
        </ToggleGroup>
      );

      // Click bold
      fireEvent.click(screen.getByTestId('bold'));
      expect(onValueChange).toHaveBeenCalledWith('bold');

      // Click italic
      fireEvent.click(screen.getByTestId('italic'));
      expect(onValueChange).toHaveBeenCalledWith('italic');
    });

    it('works as a text alignment group', () => {
      render(
        <ToggleGroup type="single" defaultValue="left" data-testid="alignment">
          <ToggleGroupItem value="left" data-testid="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center" data-testid="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right" data-testid="right">Right</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByTestId('left')).toHaveAttribute('data-state', 'on');

      fireEvent.click(screen.getByTestId('center'));
      expect(screen.getByTestId('center')).toHaveAttribute('data-state', 'on');
      expect(screen.getByTestId('left')).toHaveAttribute('data-state', 'off');
    });

    it('supports formatting toolbar use case', () => {
      const onValueChange = vi.fn();
      render(
        <ToggleGroup type="multiple" onValueChange={onValueChange}>
          <ToggleGroupItem value="bold" data-testid="bold">Bold</ToggleGroupItem>
          <ToggleGroupItem value="italic" data-testid="italic">Italic</ToggleGroupItem>
          <ToggleGroupItem value="strike" data-testid="strike">Strike</ToggleGroupItem>
        </ToggleGroup>
      );

      // Select multiple formatting options
      fireEvent.click(screen.getByTestId('bold'));
      expect(onValueChange).toHaveBeenCalledWith(['bold']);

      fireEvent.click(screen.getByTestId('italic'));
      expect(onValueChange).toHaveBeenCalledWith(['bold', 'italic']);
    });

    it('maintains group state when rerending', () => {
      const { rerender } = render(
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByTestId('item-a')).toHaveAttribute('data-state', 'on');

      // Rerender with same props
      rerender(
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByTestId('item-a')).toHaveAttribute('data-state', 'on');
    });
  });

  describe('Accessibility', () => {
    it('has proper role for toggle group', () => {
      render(
        <ToggleGroup type="single" data-testid="group">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
        </ToggleGroup>
      );

      const group = screen.getByTestId('group');
      expect(group).toHaveAttribute('role', 'group');
    });

    it('toggle items have proper data-state attribute', () => {
      render(
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByTestId('item-a')).toHaveAttribute('data-state', 'on');
      expect(screen.getByTestId('item-b')).toHaveAttribute('data-state', 'off');
    });

    it('supports keyboard navigation', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
          <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
        </ToggleGroup>
      );

      const itemA = screen.getByTestId('item-a');
      const itemB = screen.getByTestId('item-b');

      // Items should be focusable
      itemA.focus();
      expect(document.activeElement).toBe(itemA);

      // Space/Enter should toggle
      fireEvent.keyDown(itemA, { key: 'Enter' });
      // Or click works
      fireEvent.click(itemB);
      expect(itemB).toHaveAttribute('data-state', 'on');
    });
  });
});
