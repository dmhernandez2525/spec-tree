import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from './drawer';

describe('Drawer', () => {
  describe('exports', () => {
    it('exports Drawer component', () => {
      expect(Drawer).toBeDefined();
    });

    it('exports DrawerPortal component', () => {
      expect(DrawerPortal).toBeDefined();
    });

    it('exports DrawerOverlay component', () => {
      expect(DrawerOverlay).toBeDefined();
    });

    it('exports DrawerTrigger component', () => {
      expect(DrawerTrigger).toBeDefined();
    });

    it('exports DrawerClose component', () => {
      expect(DrawerClose).toBeDefined();
    });

    it('exports DrawerContent component', () => {
      expect(DrawerContent).toBeDefined();
    });

    it('exports DrawerHeader component', () => {
      expect(DrawerHeader).toBeDefined();
    });

    it('exports DrawerFooter component', () => {
      expect(DrawerFooter).toBeDefined();
    });

    it('exports DrawerTitle component', () => {
      expect(DrawerTitle).toBeDefined();
    });

    it('exports DrawerDescription component', () => {
      expect(DrawerDescription).toBeDefined();
    });
  });

  describe('displayNames', () => {
    it('Drawer has correct displayName', () => {
      expect(Drawer.displayName).toBe('Drawer');
    });

    it('DrawerContent has correct displayName', () => {
      expect(DrawerContent.displayName).toBe('DrawerContent');
    });

    it('DrawerHeader has correct displayName', () => {
      expect(DrawerHeader.displayName).toBe('DrawerHeader');
    });

    it('DrawerFooter has correct displayName', () => {
      expect(DrawerFooter.displayName).toBe('DrawerFooter');
    });

    it('DrawerOverlay has displayName from vaul', () => {
      expect(DrawerOverlay.displayName).toBeDefined();
    });

    it('DrawerTitle has displayName from vaul', () => {
      expect(DrawerTitle.displayName).toBeDefined();
    });

    it('DrawerDescription has displayName from vaul', () => {
      expect(DrawerDescription.displayName).toBeDefined();
    });
  });

  describe('Drawer', () => {
    it('renders with children', () => {
      render(
        <Drawer>
          <DrawerTrigger data-testid="trigger">Open</DrawerTrigger>
        </Drawer>
      );
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });
  });

  describe('DrawerTrigger', () => {
    it('renders a button', () => {
      render(
        <Drawer>
          <DrawerTrigger data-testid="trigger">Open Drawer</DrawerTrigger>
        </Drawer>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName.toLowerCase()).toBe('button');
    });
  });

  describe('DrawerHeader', () => {
    it('renders with children', () => {
      render(
        <DrawerHeader data-testid="header">
          <span>Header Content</span>
        </DrawerHeader>
      );
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('applies default className', () => {
      render(
        <DrawerHeader data-testid="header">
          Content
        </DrawerHeader>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('grid');
      expect(header).toHaveClass('gap-1.5');
      expect(header).toHaveClass('p-4');
      expect(header).toHaveClass('text-center');
    });

    it('merges custom className', () => {
      render(
        <DrawerHeader className="custom-header" data-testid="header">
          Content
        </DrawerHeader>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-header');
      expect(header).toHaveClass('grid');
    });

    it('renders as div element', () => {
      render(
        <DrawerHeader data-testid="header">
          Content
        </DrawerHeader>
      );
      const header = screen.getByTestId('header');
      expect(header.tagName.toLowerCase()).toBe('div');
    });
  });

  describe('DrawerFooter', () => {
    it('renders with children', () => {
      render(
        <DrawerFooter data-testid="footer">
          <span>Footer Content</span>
        </DrawerFooter>
      );
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('applies default className', () => {
      render(
        <DrawerFooter data-testid="footer">
          Content
        </DrawerFooter>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('mt-auto');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('flex-col');
      expect(footer).toHaveClass('gap-2');
      expect(footer).toHaveClass('p-4');
    });

    it('merges custom className', () => {
      render(
        <DrawerFooter className="custom-footer" data-testid="footer">
          Content
        </DrawerFooter>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('custom-footer');
      expect(footer).toHaveClass('flex');
    });

    it('renders as div element', () => {
      render(
        <DrawerFooter data-testid="footer">
          Content
        </DrawerFooter>
      );
      const footer = screen.getByTestId('footer');
      expect(footer.tagName.toLowerCase()).toBe('div');
    });
  });

  describe('component types', () => {
    it('Drawer is a function component', () => {
      expect(typeof Drawer).toBe('function');
    });

    it('DrawerContent is a forwardRef component', () => {
      expect(typeof DrawerContent).toBe('object');
      expect(DrawerContent.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('DrawerOverlay is a forwardRef component', () => {
      expect(typeof DrawerOverlay).toBe('object');
      expect(DrawerOverlay.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('DrawerTitle is a forwardRef component', () => {
      expect(typeof DrawerTitle).toBe('object');
      expect(DrawerTitle.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('DrawerDescription is a forwardRef component', () => {
      expect(typeof DrawerDescription).toBe('object');
      expect(DrawerDescription.$$typeof?.toString()).toContain('react.forward_ref');
    });

    it('DrawerHeader is a function component', () => {
      expect(typeof DrawerHeader).toBe('function');
    });

    it('DrawerFooter is a function component', () => {
      expect(typeof DrawerFooter).toBe('function');
    });
  });
});
